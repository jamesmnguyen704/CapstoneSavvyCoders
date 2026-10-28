// Pairwise precision/recall scoring for a grouping algorithm's output
// against the ground-truth `expectedCluster` labels in
// newsGroupingFixtures.js. "Pairwise" because that's what a grouping
// decision actually is — for every pair of articles, did the algorithm
// agree with ground truth on whether they're the same event?
export function clusterAssignments(groupedResults) {
  const clusterOf = new Map();
  for (const group of groupedResults) {
    clusterOf.set(group.url, group.url);
    for (const rs of group.relatedSources) clusterOf.set(rs.url, group.url);
  }
  return clusterOf;
}

export function pairwiseMetrics(fixtures, groupedResults) {
  const clusterOf = clusterAssignments(groupedResults);
  let tp = 0, fp = 0, fn = 0, tn = 0;
  const falsePositives = [];
  const falseNegatives = [];

  for (let i = 0; i < fixtures.length; i++) {
    for (let j = i + 1; j < fixtures.length; j++) {
      const a = fixtures[i];
      const b = fixtures[j];
      const groundTruthSame = a.expectedCluster === b.expectedCluster;
      const predictedSame = clusterOf.get(a.url) === clusterOf.get(b.url);

      if (predictedSame && groundTruthSame) tp++;
      else if (predictedSame && !groundTruthSame) {
        fp++;
        falsePositives.push({ a: a.title, b: b.title, aCluster: a.expectedCluster, bCluster: b.expectedCluster });
      } else if (!predictedSame && groundTruthSame) {
        fn++;
        falseNegatives.push({ a: a.title, b: b.title, cluster: a.expectedCluster });
      } else tn++;
    }
  }

  return {
    tp,
    fp,
    fn,
    tn,
    precision: tp + fp === 0 ? 1 : tp / (tp + fp),
    recall: tp + fn === 0 ? 1 : tp / (tp + fn),
    falsePositives,
    falseNegatives
  };
}
