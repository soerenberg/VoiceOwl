import React from 'react';

const formatValue = (value) => (value == null ? '--' : value.toFixed(1));

const getToneClass = (value, lower, upper) => {
  if (value == null) {
    return 'stat--neutral';
  }
  if (lower == null && upper == null) {
    return 'stat--neutral';
  }
  if (lower != null && upper == null) {
    return value < lower ? 'stat--alert' : 'stat--good';
  }
  if (lower == null && upper != null) {
    return value > upper ? 'stat--alert' : 'stat--good';
  }
  return value >= lower && value <= upper ? 'stat--good' : 'stat--alert';
};

const PitchStats = ({ stats, duration, pitchLowerBound, pitchUpperBound }) => {
  const statItems = [
    { label: 'Duration', value: duration, unit: 's', isPitch: false },
    { label: 'Average', value: stats?.average, unit: 'Hz', isPitch: true },
    { label: 'Minimum', value: stats?.min, unit: 'Hz', isPitch: true },
    { label: '5th %', value: stats?.q05, unit: 'Hz', isPitch: true },
    { label: '10th %', value: stats?.q10, unit: 'Hz', isPitch: true },
    { label: '25th %', value: stats?.q25, unit: 'Hz', isPitch: true },
    { label: 'Median', value: stats?.median, unit: 'Hz', isPitch: true },
    { label: '75th %', value: stats?.q75, unit: 'Hz', isPitch: true },
    { label: '90th %', value: stats?.q90, unit: 'Hz', isPitch: true },
    { label: '95th %', value: stats?.q95, unit: 'Hz', isPitch: true },
    { label: 'Maximum', value: stats?.max, unit: 'Hz', isPitch: true },
  ];

  return (
    <div className="pitch-stats">
      {statItems.map((item) => (
        <div
          key={item.label}
          className={`pitch-stats__item ${
            item.isPitch ? getToneClass(item.value, pitchLowerBound, pitchUpperBound) : 'stat--neutral'
          }`}
        >
          <div className="pitch-stats__label">{item.label}</div>
          <div className="pitch-stats__value">
            {formatValue(item.value)} {item.unit}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PitchStats;
