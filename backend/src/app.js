import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadRoutes from "./routes/upload.js";
import analyzeRoutes from "./routes/analyze.js";
import reportRoutes from "./routes/report.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/", (req, res) => {
  res.send("E-Invoicing Readiness & Gap Analyzer API is running.");
});

// Mount routes
app.use("/upload", uploadRoutes);
app.use("/analyze", analyzeRoutes);
app.use("/report", reportRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
