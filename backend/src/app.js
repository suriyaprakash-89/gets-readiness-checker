import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadRoutes from "./routes/upload.js";
import analyzeRoutes from "./routes/analyze.js";
import reportRoutes from "./routes/report.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// --- CORS CONFIGURATION UPDATE ---
const allowedOrigins = [
  "http://localhost:5173", // Your local dev frontend
  // Add your future Vercel URL here once you have it.
  // For now, we can use a placeholder or add it later.
  // It's better to add it *after* deploying the frontend.
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
};

// In production, we'll want a more secure, specific list.
// For now, let's make it more open and then lock it down.
// A simpler setup for now:
app.use(cors()); // This is open for now. We will secure it after deploying the frontend.
// --- END CORS UPDATE ---

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
