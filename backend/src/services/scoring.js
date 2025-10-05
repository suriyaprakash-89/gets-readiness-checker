const GETS_REQUIRED_FIELD_COUNT = 15; 

export const calculateScores = (
  mappingResult,
  rulesResult,
  postureScore,
  totalRows
) => {
 
  const dataScore = 100;

  const matchedCount = mappingResult.matched.length;
  const closeMatchCount = mappingResult.closeMatch.length;
  const coverageScore = Math.round(
    ((matchedCount + closeMatchCount * 0.5) / GETS_REQUIRED_FIELD_COUNT) * 100
  );

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
    coverage: Math.min(100, coverageScore), 
    rules: rulesScore,
    posture: postureScore,
    overall: overallScore,
    classification,
  };
};
