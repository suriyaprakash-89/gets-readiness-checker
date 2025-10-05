import React, { useState } from "react";
import { ChevronDown, CheckCircle, XCircle } from "lucide-react";

const RuleFindings = ({ ruleFindings }) => {
  const [openRule, setOpenRule] = useState(null);

  const toggleRule = (ruleId) => {
    setOpenRule(openRule === ruleId ? null : ruleId);
  };

  if (!ruleFindings) return null;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Rule-by-Rule Analysis
      </h3>
      <div className="space-y-2">
        {ruleFindings.map((finding) => (
          <div key={finding.rule} className="border border-gray-200 rounded-md">
            <button
              onClick={() => toggleRule(finding.rule)}
              className="w-full flex justify-between items-center p-4 text-left"
              disabled={finding.ok}
            >
              <div className="flex items-center">
                {finding.ok ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 mr-3" />
                )}
                <span className="font-medium">
                  {finding.rule.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex items-center">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    finding.ok
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {finding.ok ? "Passed" : "Failed"}
                </span>
                {!finding.ok && (
                  <ChevronDown
                    className={`w-5 h-5 ml-4 transition-transform ${
                      openRule === finding.rule ? "rotate-180" : ""
                    }`}
                  />
                )}
              </div>
            </button>
            {openRule === finding.rule && !finding.ok && (
              <div className="bg-gray-50 p-4 border-t border-gray-200 text-sm">
                <p className="font-semibold text-gray-800">{finding.message}</p>
                {finding.value && (
                  <p className="mt-1 text-gray-600">
                    Offending Value:{" "}
                    <code className="bg-red-100 text-red-800 p-1 rounded">
                      {finding.value}
                    </code>
                  </p>
                )}
                {finding.exampleLine && (
                  <p className="mt-1 text-gray-600">
                    Example on line:{" "}
                    <code className="font-mono">{finding.exampleLine}</code>
                  </p>
                )}
                {finding.expected && (
                  <p className="mt-1 text-gray-600">
                    Expected:{" "}
                    <code className="font-mono">{finding.expected}</code>, Got:{" "}
                    <code className="font-mono">{finding.got}</code>
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RuleFindings;
