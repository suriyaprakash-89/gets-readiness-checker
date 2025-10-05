import { supabase } from "../services/db.js";
import { mapSchema } from "../services/schemaMapping.js";
import { runAllRules } from "../services/rules.js";
import { calculateScores } from "../services/scoring.js";

const RULES = [
  { id: "TOTALS_BALANCE" },
  { id: "LINE_MATH" },
  { id: "DATE_ISO" },
  { id: "CURRENCY_ALLOWED" },
  { id: "TRN_PRESENT" },
];

export const handleAnalysis = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ error: "Authentication required. No token provided." });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res
        .status(401)
        .json({ error: userError?.message || "Invalid or expired token." });
    }

    const { uploadId, fileData, context } = req.body;
    if (!uploadId || !fileData || !context) {
      return res.status(400).json({ error: "Missing required analysis data." });
    }

    const mappingResult = mapSchema(fileData);

    const rulesResult = runAllRules(
      fileData,
      mappingResult.fieldMap,
      mappingResult.reverseMap
    );

    const postureScore = context.posture || 50;

    const scores = calculateScores(
      mappingResult,
      rulesResult,
      postureScore,
      fileData.length
    );

    const uniqueRuleFindings = rulesResult.findings;

    RULES.forEach((rule) => {
      if (!uniqueRuleFindings.some((f) => f.rule === rule.id)) {
        uniqueRuleFindings.push({ rule: rule.id, ok: true });
      }
    });

    const reportJson = {
      reportId: `temp_${uploadId}`,
      scores,
      coverage: {
        matched: mappingResult.matched,
        close: mappingResult.closeMatch,
        missing: mappingResult.missing,
      },
      ruleFindings: uniqueRuleFindings.sort((a, b) =>
        a.rule.localeCompare(b.rule)
      ),
      gaps: uniqueRuleFindings
        .filter((f) => !f.ok)
        .map((f) => f.message || `Failed rule: ${f.rule}`),
      meta: {
        rowsParsed: fileData.length,
        country: context.country,
        erp: context.erp,
        db: "supabase",
      },
    };

    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 7);

    const { data, error } = await supabase
      .from("reports")
      .insert({
        upload_id: uploadId,
        report_json: reportJson,
        scores_overall: scores.overall,
        expires_at: expires_at.toISOString(),
        user_id: user.id,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      throw new Error(`Supabase error: ${error.message}`);
    }

    reportJson.reportId = data.id;

    res.status(200).json({
      reportId: data.id,
      report: reportJson,
    });
  } catch (error) {
    console.error("Analysis failed:", error);
    res.status(500).json({ error: "An error occurred during analysis." });
  }
};
