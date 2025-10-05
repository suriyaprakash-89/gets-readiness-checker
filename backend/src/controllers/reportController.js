import { supabase } from "../services/db.js";

export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Report ID is required." });
    }

    const { data, error } = await supabase
      .from("reports")
      .select("report_json")
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({ error: "Report not found." });
    }

    if (data) {
      res.status(200).json(data.report_json);
    } else {
      res.status(404).json({ error: "Report not found." });
    }
  } catch (error) {
    console.error("Failed to fetch report:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the report." });
  }
};
