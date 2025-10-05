import csv from "csv-parser";
import { Readable } from "stream";
import { v4 as uuidv4 } from "uuid";

export const handleUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const fileBuffer = req.file.buffer;
  const fileType = req.file.mimetype;
  const uploadId = uuidv4();

  const MAX_ROWS = 200;
  const PREVIEW_ROWS = 20;
  const results = [];

  const processData = (data) => {
    const fullData = data.slice(0, MAX_ROWS);
    const previewData = fullData.slice(0, PREVIEW_ROWS);

    res.status(200).json({
      uploadId,
      fileName: req.file.originalname,
      fullData,
      previewData,
    });
  };

  if (fileType === "application/json") {
    try {
      const jsonData = JSON.parse(fileBuffer.toString("utf8"));
      if (!Array.isArray(jsonData)) {
        return res
          .status(400)
          .json({ error: "JSON file must contain an array of invoices." });
      }
      processData(jsonData);
    } catch (error) {
      return res.status(400).json({ error: "Invalid JSON file." });
    }
  } else if (
    fileType === "text/csv" ||
    fileType === "application/vnd.ms-excel"
  ) {
    const stream = Readable.from(fileBuffer.toString("utf8"));
    stream
      .pipe(csv())
      .on("data", (data) => {
        if (results.length < MAX_ROWS) {
          results.push(data);
        }
      })
      .on("end", () => {
        processData(results);
      })
      .on("error", (error) => {
        return res.status(400).json({ error: "Error parsing CSV file." });
      });
  } else {
    return res
      .status(400)
      .json({ error: "Unsupported file type. Please upload CSV or JSON." });
  }
};
