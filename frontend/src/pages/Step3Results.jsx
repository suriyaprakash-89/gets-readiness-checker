import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";
import ScoreBars from "../components/ScoreBars";
import RuleFindings from "../components/RuleFindings";
import { Download, Link as LinkIcon, Check } from "lucide-react";

const CoverageList = ({ title, items, color }) => (
  <div>
    <h4 className={`text-lg font-semibold mb-2 ${color}`}>{title}</h4>
    {items && items.length > 0 ? (
      <ul className="space-y-1 text-sm text-gray-700 bg-gray-50 p-3 rounded-md max-h-48 overflow-y-auto">
        {items.map((item, index) => (
          <li key={index}>
            <code>
              {typeof item === "object"
                ? `${item.candidate} → ${item.target}`
                : item}
            </code>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">None</p>
    )}
  </div>
);

const Step3Results = () => {
  const { analysisResult, uploadData, setUploadData, setAnalysisResult } =
    useContext(AppContext);
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // If user lands here directly without data, redirect them to start over.
    if (!analysisResult) {
      navigate("/");
    }
  }, [analysisResult, navigate]);

  // Render nothing or a loader while redirecting
  if (!analysisResult) {
    return null;
  }

  const { report, reportId } = analysisResult;

  const handleDownload = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(report, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `readiness-report-${reportId}.json`;
    link.click();
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/report/${reportId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartOver = () => {
    setUploadData(null);
    setAnalysisResult(null);
    navigate("/");
  };

  return (
    <div className="animate-slide-in">
      {uploadData && (
        <p className="text-center text-gray-500 mb-2">
          Report for:{" "}
          <span className="font-semibold text-gray-700">
            {uploadData.fileName}
          </span>
        </p>
      )}
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Your E-Invoicing Readiness Report
      </h2>

      <ScoreBars scores={report.scores} />

      <div className="mt-10 pt-8 border-t">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Schema Coverage Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CoverageList
            title="Matched Fields"
            items={report.coverage.matched}
            color="text-green-600"
          />
          <CoverageList
            title="Close Matches"
            items={report.coverage.close}
            color="text-yellow-600"
          />
          <CoverageList
            title="Missing Fields"
            items={report.coverage.missing}
            color="text-red-600"
          />
        </div>
      </div>

      <RuleFindings ruleFindings={report.ruleFindings} />

      <div className="mt-10 pt-8 border-t flex flex-col md:flex-row items-center justify-center gap-4">
        <button
          onClick={handleDownload}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-brand-secondary hover:bg-brand-primary text-white font-bold py-3 px-6 rounded-md transition-all duration-300 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
        >
          <Download size={18} /> Download JSON Report
        </button>
        <button
          onClick={handleCopyLink}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-md transition-all duration-300 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
        >
          {copied ? (
            <>
              <Check size={18} /> Copied!
            </>
          ) : (
            <>
              <LinkIcon size={18} /> Copy Shareable Link
            </>
          )}
        </button>
        <button
          onClick={handleStartOver}
          className="w-full md:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-md transition-colors"
        >
          Start New Analysis
        </button>
      </div>
    </div>
  );
};

export default Step3Results;
