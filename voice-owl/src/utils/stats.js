const quantile = (sorted, q) => {
  if (!sorted.length) {
    return null;
  }
  const position = (sorted.length - 1) * q;
  const base = Math.floor(position);
  const rest = position - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
};

export const computePitchStats = (series) => {
  const values = series
    .map((entry) => entry.pitch)
    .filter((value) => typeof value === 'number' && !Number.isNaN(value));
  if (!values.length) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((total, value) => total + value, 0);
  return {
    average: sum / values.length,
    min: sorted[0],
    q05: quantile(sorted, 0.05),
    q10: quantile(sorted, 0.1),
    q25: quantile(sorted, 0.25),
    median: quantile(sorted, 0.5),
    q75: quantile(sorted, 0.75),
    q90: quantile(sorted, 0.9),
    q95: quantile(sorted, 0.95),
    max: sorted[sorted.length - 1],
  };
};
