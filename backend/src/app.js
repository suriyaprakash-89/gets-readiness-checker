import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadRoutes from "./routes/upload.js";
import analyzeRoutes from "./routes/analyze.js";
import reportRoutes from "./routes/report.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// --- FINAL CORS CONFIGURATION ---
// This is the live URL of your frontend application on Vercel.
const vercelFrontendUrl = "https://gets-readiness-checker.vercel.app";

// We create a list of origins that are allowed to make requests to this API.
const allowedOrigins = [
  "http://localhost:5173", // For your local development
  vercelFrontendUrl, // For your live application
];

const corsOptions = {
  origin: function (origin, callback) {
    // The 'origin' is the URL of the site making the request (e.g., your Vercel URL).
    // This function checks if the incoming origin is in our allowed list.
    if (!origin || allowedOrigins.includes(origin)) {
      // If it's in the list (or if there's no origin, like a server-to-server request), allow it.
      callback(null, true);
    } else {
      // If the origin is not in our list, reject the request.
      callback(new Error("This origin is not allowed by CORS policy."));
    }
  },
};

// Use the configured CORS options.
app.use(cors(corsOptions));
// --- END CORS CONFIGURATION ---

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
