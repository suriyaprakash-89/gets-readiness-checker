const GETS_REQUIRED_FIELD_COUNT = 15; // Based on PRD schema

export const calculateScores = (
  mappingResult,
  rulesResult,
  postureScore,
  totalRows
) => {
  // Data Score (simple version based on rows parsed) - Assuming all rows parse, this is 100.
  const dataScore = 100;

  // Coverage Score
  const matchedCount = mappingResult.matched.length;
  const closeMatchCount = mappingResult.closeMatch.length;
  const coverageScore = Math.round(
    ((matchedCount + closeMatchCount * 0.5) / GETS_REQUIRED_FIELD_COUNT) * 100
  );

  // Rules Score
  let totalRules = Object.keys(rulesResult.stats).length;
  let failedRules = 0;
  Object.values(rulesResult.stats).forEach((stat) => {
    if (stat.failed > 0) {
      failedRules++;
    }
  });
  const rulesScore =
    totalRules > 0
      ? Math.round(((totalRules - failedRules) / totalRules) * 100)
      : 100;

  // Posture Score (from frontend questionnaire)
  // Passed directly, assumed to be 0-100

  // Overall Weighted Score (as per PRD)
  const overall =
    dataScore * 0.25 +
    coverageScore * 0.35 +
    rulesScore * 0.3 +
    postureScore * 0.1;
  const overallScore = Math.round(overall);

  let classification = "Low";
  if (overallScore > 70) {
    classification = "High";
  } else if (overallScore >= 40) {
    classification = "Medium";
  }

  return {
    data: dataScore,
    coverage: Math.min(100, coverageScore), // Cap at 100
    rules: rulesScore,
    posture: postureScore,
    overall: overallScore,
    classification,
  };
};
