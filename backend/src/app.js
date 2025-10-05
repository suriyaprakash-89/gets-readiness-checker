import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadRoutes from "./routes/upload.js";
import analyzeRoutes from "./routes/analyze.js";
import reportRoutes from "./routes/report.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const vercelFrontendUrl = "https://gets-readiness-checker.vercel.app";

const allowedOrigins = ["http://localhost:5173", vercelFrontendUrl];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("This origin is not allowed by CORS policy."));
    }
  },
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/", (req, res) => {
  res.send("E-Invoicing Readiness & Gap Analyzer API is running.");
});

app.use("/upload", uploadRoutes);
app.use("/analyze", analyzeRoutes);
app.use("/report", reportRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
