import { supabase } from "../services/db.js";
import { mapSchema } from "../services/schemaMapping.js";
import { runAllRules } from "../services/rules.js";
import { calculateScores } from "../services/scoring.js";

// Define the rules list here to be accessible within the controller for report generation
const RULES = [
  { id: "TOTALS_BALANCE" },
  { id: "LINE_MATH" },
  { id: "DATE_ISO" },
  { id: "CURRENCY_ALLOWED" },
  { id: "TRN_PRESENT" },
];

export const handleAnalysis = async (req, res) => {
  try {
    // --- AUTHENTICATION CHECK ---
    // Extract the JWT from the Authorization header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ error: "Authentication required. No token provided." });
    }

    // Verify the token with Supabase to get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res
        .status(401)
        .json({ error: userError?.message || "Invalid or expired token." });
    }
    // --- END AUTHENTICATION CHECK ---

    const { uploadId, fileData, context } = req.body;
    if (!uploadId || !fileData || !context) {
      return res.status(400).json({ error: "Missing required analysis data." });
    }

    // 1. Schema Mapping
    const mappingResult = mapSchema(fileData);

    // 2. Run Rules, passing the new reverseMap for better alias handling
    const rulesResult = runAllRules(
      fileData,
      mappingResult.fieldMap,
      mappingResult.reverseMap
    );

    // 3. Get Posture Score from the context provided by the frontend
    const postureScore = context.posture || 50;

    // 4. Calculate Scores
    const scores = calculateScores(
      mappingResult,
      rulesResult,
      postureScore,
      fileData.length
    );

    // 5. Construct the PRD-aligned Report JSON
    const uniqueRuleFindings = rulesResult.findings;
    // Add 'ok: true' for any rules that had no failing findings to ensure all rules appear in the report
    RULES.forEach((rule) => {
      if (!uniqueRuleFindings.some((f) => f.rule === rule.id)) {
        uniqueRuleFindings.push({ rule: rule.id, ok: true });
      }
    });

    const reportJson = {
      // The reportId will be overridden by the DB UUID, but we use this as a placeholder
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

    // 6. Save the report to Supabase, linking it to the authenticated user
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 7); // Report expires in 7 days as per PRD

    const { data, error } = await supabase
      .from("reports")
      .insert({
        upload_id: uploadId,
        report_json: reportJson,
        scores_overall: scores.overall,
        expires_at: expires_at.toISOString(),
        user_id: user.id, // Link the report to the authenticated user
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      throw new Error(`Supabase error: ${error.message}`);
    }

    // Override the temporary reportId with the permanent one from the database for the response
    reportJson.reportId = data.id;

    // 7. Send the final report back to the client
    res.status(200).json({
      reportId: data.id,
      report: reportJson,
    });
  } catch (error) {
    console.error("Analysis failed:", error);
    res.status(500).json({ error: "An error occurred during analysis." });
  }
};
