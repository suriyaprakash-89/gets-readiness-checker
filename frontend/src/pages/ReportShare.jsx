import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getReport } from "../api";
import Loader from "../components/Loader";
import ScoreBars from "../components/ScoreBars";
import RuleFindings from "../components/RuleFindings";

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

const ReportShare = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const { data } = await getReport(id);
        setReport(data);
      } catch (err) {
        setError(
          "Could not find or load the report. It may have expired or the link is incorrect."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl">
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-brand-primary">
          E-Invoicing Readiness Report
        </h1>
        <p className="mt-2 text-gray-600">
          This is a shared, read-only view of an analysis report.
        </p>
      </header>
      <main className="bg-white p-6 md:p-10 rounded-lg shadow-md">
        {loading && <Loader message="Loading report..." />}
        {error && (
          <div className="text-center text-red-600 bg-red-100 p-4 rounded-md">
            {error}
          </div>
        )}
        {report && (
          <div className="animate-slide-in">
            <p className="text-sm text-gray-500 text-center mb-6">
              Analysis Date:{" "}
              {new Date(
                report.meta.analysisDate || Date.now()
              ).toLocaleString()}
            </p>

            <ScoreBars scores={report.scores} />

            <div className="mt-10 pt-6 border-t">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Schema Coverage Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* --- FIX IS HERE --- */}
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
                {/* --- END FIX --- */}
              </div>
            </div>

            <RuleFindings ruleFindings={report.ruleFindings} />

            <div className="mt-10 text-center">
              <Link
                to="/"
                className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-6 rounded-md transition-colors"
              >
                Run Your Own Analysis
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReportShare;
