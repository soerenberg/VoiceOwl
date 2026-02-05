import React, { useMemo } from 'react';

const CHART_WIDTH = 1000;

const getY = (pitch, graphLower, graphUpper, lineHeight) => {
  const clamped = Math.min(Math.max(pitch, graphLower), graphUpper);
  const ratio = (clamped - graphLower) / (graphUpper - graphLower || 1);
  return lineHeight - ratio * lineHeight;
};

const buildPath = (points) => {
  if (!points.length) {
    return '';
  }
  return points.map((point, idx) => `${idx === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ');
};

const computeMovingAverage = (series, windowSeconds, stepSeconds) => {
  const windowSize = Math.max(1, Math.round(windowSeconds / stepSeconds));
  const values = series.map((entry) => entry.pitch);
  return series.map((entry, index) => {
    const start = Math.max(0, index - windowSize + 1);
    let sum = 0;
    let count = 0;
    for (let i = start; i <= index; i += 1) {
      const value = values[i];
      if (typeof value === 'number' && !Number.isNaN(value)) {
        sum += value;
        count += 1;
      }
    }
    return {
      time: entry.time,
      pitch: count ? sum / count : null,
    };
  });
};

const PitchGraph = ({
  series,
  duration,
  lineWidth,
  lineHeight,
  tickGap,
  graphLower,
  graphUpper,
  showMarkers,
  showAvg1,
  showAvg3,
  showAvg10,
  pitchLowerBound,
  pitchUpperBound,
  cursorTime,
  onSeek,
  precisionMs,
}) => {
  const stepSeconds = precisionMs / 1000;
  const lineCount = Math.max(1, Math.ceil(duration / lineWidth));

  const averages = useMemo(() => ({
    avg1: showAvg1 ? computeMovingAverage(series, 1, stepSeconds) : null,
    avg3: showAvg3 ? computeMovingAverage(series, 3, stepSeconds) : null,
    avg10: showAvg10 ? computeMovingAverage(series, 10, stepSeconds) : null,
  }), [series, showAvg1, showAvg3, showAvg10, stepSeconds]);

  const ticks = useMemo(() => {
    const result = [];
    for (let value = graphLower; value <= graphUpper; value += tickGap) {
      result.push(value);
    }
    return result;
  }, [graphLower, graphUpper, tickGap]);

  const handleClick = (event, lineIndex) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const ratio = offsetX / rect.width;
    const time = Math.min(duration, lineIndex * lineWidth + ratio * lineWidth);
    onSeek(time);
  };

  if (!series.length) {
    return <div className="pitch-graph__empty">Upload or record audio to see pitch analysis.</div>;
  }

  return (
    <div className="pitch-graph">
      {Array.from({ length: lineCount }, (_, lineIndex) => {
        const lineStart = lineIndex * lineWidth;
        const lineEnd = Math.min(duration, lineStart + lineWidth);
        const lineSeries = series.filter((entry) => entry.time >= lineStart && entry.time <= lineEnd);

        const buildSeriesPoints = (inputSeries) => {
          const points = [];
          const markers = [];
          let currentPath = [];
          const paths = [];
          inputSeries.forEach((entry) => {
            if (entry.time < lineStart || entry.time > lineEnd) {
              return;
            }
            if (typeof entry.pitch !== 'number' || Number.isNaN(entry.pitch)) {
              if (currentPath.length) {
                paths.push(buildPath(currentPath));
                currentPath = [];
              }
              return;
            }
            const x = ((entry.time - lineStart) / lineWidth) * CHART_WIDTH;
            const y = getY(entry.pitch, graphLower, graphUpper, lineHeight);
            currentPath.push({ x, y });
            if (showMarkers) {
              markers.push({ x, y });
            }
          });
          if (currentPath.length) {
            paths.push(buildPath(currentPath));
          }
          return { paths, markers };
        };

        const mainSeries = buildSeriesPoints(lineSeries);
        const avg1Series = averages.avg1 ? buildSeriesPoints(averages.avg1) : null;
        const avg3Series = averages.avg3 ? buildSeriesPoints(averages.avg3) : null;
        const avg10Series = averages.avg10 ? buildSeriesPoints(averages.avg10) : null;
        const cursorX =
          cursorTime >= lineStart && cursorTime <= lineEnd
            ? ((cursorTime - lineStart) / lineWidth) * CHART_WIDTH
            : null;

        const lowerBound = pitchLowerBound ?? graphLower;
        const upperBound = pitchUpperBound ?? graphUpper;
        const lowerY = getY(lowerBound, graphLower, graphUpper, lineHeight);
        const upperY = getY(upperBound, graphLower, graphUpper, lineHeight);

        return (
          <div
            key={`line-${lineIndex}`}
            className="pitch-graph__line"
            style={{ animationDelay: `${lineIndex * 0.05}s` }}
          >
            <svg
              viewBox={`0 0 ${CHART_WIDTH} ${lineHeight}`}
              height={lineHeight}
              preserveAspectRatio="none"
              onClick={(event) => handleClick(event, lineIndex)}
            >
              <rect width={CHART_WIDTH} height={lineHeight} className="pitch-graph__bg" />
              <rect width={CHART_WIDTH} height={upperY} className="pitch-graph__zone pitch-graph__zone--high" />
              <rect
                width={CHART_WIDTH}
                y={upperY}
                height={lowerY - upperY}
                className="pitch-graph__zone pitch-graph__zone--mid"
              />
              <rect
                width={CHART_WIDTH}
                y={lowerY}
                height={lineHeight - lowerY}
                className="pitch-graph__zone pitch-graph__zone--low"
              />
              {ticks.map((tick) => {
                const y = getY(tick, graphLower, graphUpper, lineHeight);
                return (
                  <g key={`tick-${lineIndex}-${tick}`}>
                    <line x1="0" x2={CHART_WIDTH} y1={y} y2={y} className="pitch-graph__tick" />
                    <text x="4" y={y - 2} className="pitch-graph__tick-label">
                      {tick}
                    </text>
                  </g>
                );
              })}
              {mainSeries.paths.map((path, idx) => (
                <path key={`path-${lineIndex}-${idx}`} d={path} className="pitch-graph__path" />
              ))}
              {avg1Series?.paths.map((path, idx) => (
                <path key={`avg1-${lineIndex}-${idx}`} d={path} className="pitch-graph__path pitch-graph__path--avg1" />
              ))}
              {avg3Series?.paths.map((path, idx) => (
                <path key={`avg3-${lineIndex}-${idx}`} d={path} className="pitch-graph__path pitch-graph__path--avg3" />
              ))}
              {avg10Series?.paths.map((path, idx) => (
                <path key={`avg10-${lineIndex}-${idx}`} d={path} className="pitch-graph__path pitch-graph__path--avg10" />
              ))}
              {showMarkers &&
                mainSeries.markers.map((marker, idx) => (
                  <rect
                    key={`marker-${lineIndex}-${idx}`}
                    x={marker.x - 2}
                    y={marker.y - 2}
                    width="4"
                    height="4"
                    className="pitch-graph__marker"
                  />
                ))}
              {cursorX != null && (
                <line x1={cursorX} x2={cursorX} y1="0" y2={lineHeight} className="pitch-graph__cursor" />
              )}
            </svg>
            <div className="pitch-graph__line-label">
              {lineStart.toFixed(1)}s - {lineEnd.toFixed(1)}s
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PitchGraph;
