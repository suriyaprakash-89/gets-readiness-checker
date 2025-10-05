import React from "react";

const ScoreBar = ({ label, score, color }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{score}/100</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full`}
        style={{
          width: `${score}%`,
          backgroundColor: color.replace("text-", "bg-"),
        }}
      ></div>
    </div>
  </div>
);

const ScoreBars = ({ scores }) => {
  const getScoreColor = (score) => {
    if (score > 70) return "text-green-600";
    if (score >= 40) return "text-yellow-500";
    return "text-red-600";
  };

  const getOverallColorClass = () => {
    if (scores.classification === "High") return "bg-green-100 text-green-800";
    if (scores.classification === "Medium")
      return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
      <div className="md:col-span-2 flex flex-col items-center justify-center p-6 bg-gray-100 rounded-lg">
        <p className="text-sm font-medium text-gray-600">Overall Readiness</p>
        <p
          className="text-6xl font-bold my-2"
          style={{ color: getScoreColor(scores.overall).replace("text-", "") }}
        >
          {scores.overall}
        </p>
        <span
          className={`px-4 py-1 text-lg font-semibold rounded-full ${getOverallColorClass()}`}
        >
          {scores.classification}
        </span>
      </div>
      <div className="md:col-span-3 space-y-4">
        <ScoreBar
          label="Data Quality"
          score={scores.data}
          color={getScoreColor(scores.data)}
        />
        <ScoreBar
          label="Schema Coverage"
          score={scores.coverage}
          color={getScoreColor(scores.coverage)}
        />
        <ScoreBar
          label="Validation Rules"
          score={scores.rules}
          color={getScoreColor(scores.rules)}
        />
        <ScoreBar
          label="Process Posture"
          score={scores.posture}
          color={getScoreColor(scores.posture)}
        />
      </div>
    </div>
  );
};

export default ScoreBars;
