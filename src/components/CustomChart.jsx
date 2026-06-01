import React, { useState } from 'react';

export const TrendLineChart = ({ data = [], title = 'Activity Trends' }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // SVG dimensions
  const width = 500;
  const height = 220;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  if (data.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)' }}>
        No data available
      </div>
    );
  }

  // Find max value for scaling
  const maxVal = Math.max(...data.map(d => d.value), 5);
  const scaleY = (val) => chartHeight - (val / maxVal) * chartHeight + paddingTop;
  const scaleX = (idx) => (idx / (data.length - 1)) * chartWidth + paddingLeft;

  // Build SVG Path points
  const points = data.map((d, i) => `${scaleX(i)},${scaleY(d.value)}`).join(' ');

  // Path coordinates for the filled gradient area under the curve
  const areaPoints = [
    `${scaleX(0)},${chartHeight + paddingTop}`,
    ...data.map((d, i) => `${scaleX(i)},${scaleY(d.value)}`),
    `${scaleX(data.length - 1)},${chartHeight + paddingTop}`
  ].join(' ');

  return (
    <div className="chart-container-panel" style={{ flex: 1 }}>
      <div className="chart-title-bar">
        <span style={{ fontSize: '14px', fontWeight: '700' }}>{title}</span>
        {hoveredIdx !== null && (
          <span 
            style={{ 
              fontSize: '12px', 
              color: 'var(--primary-light)', 
              fontWeight: '600',
              padding: '2px 8px',
              backgroundColor: 'var(--info-bg)',
              borderRadius: '4px'
            }}
          >
            {data[hoveredIdx].label}: {data[hoveredIdx].value} cases
          </span>
        )}
      </div>

      <div className="chart-svg-viewport">
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
          <defs>
            {/* Smooth area fill gradient */}
            <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary-light)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--primary-light)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingTop + ratio * chartHeight;
            const gridVal = Math.round(maxVal * (1 - ratio));
            return (
              <g key={i}>
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  stroke="var(--border-color)" 
                  strokeWidth="1" 
                  strokeDasharray="4 4" 
                />
                <text 
                  x={paddingLeft - 8} 
                  y={y + 4} 
                  fill="var(--text-tertiary)" 
                  fontSize="9" 
                  fontWeight="600"
                  textAnchor="end"
                >
                  {gridVal}
                </text>
              </g>
            );
          })}

          {/* X Axis Labels */}
          {data.map((d, i) => (
            <text
              key={i}
              x={scaleX(i)}
              y={height - paddingBottom + 16}
              fill="var(--text-tertiary)"
              fontSize="9"
              fontWeight="600"
              textAnchor="middle"
            >
              {d.label}
            </text>
          ))}

          {/* Filled Gradient Area */}
          <polygon points={areaPoints} fill="url(#chartAreaGradient)" />

          {/* The Trend Line */}
          <polyline
            fill="none"
            stroke="var(--primary-light)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* Interactive Data Nodes */}
          {data.map((d, i) => {
            const cx = scaleX(i);
            const cy = scaleY(d.value);
            return (
              <g key={i}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={hoveredIdx === i ? 6.5 : 4.5}
                  fill="var(--bg-secondary)"
                  stroke={hoveredIdx === i ? "var(--accent)" : "var(--primary-light)"}
                  strokeWidth="2.5"
                  style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export const DonutChart = ({ data = [], title = 'Category Weight' }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (data.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)' }}>
        No data available
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  // SVG calculations for concentric circle sectors
  const size = 180;
  const radius = 64;
  const strokeWidth = 22;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedAngle = -90; // Start sector layout from 12 o'clock

  return (
    <div className="chart-container-panel" style={{ flex: '1 1 300px' }}>
      <div className="chart-title-bar">
        <span style={{ fontSize: '14px', fontWeight: '700' }}>{title}</span>
      </div>

      <div className="donut-chart-layout">
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle 
              cx={center} 
              cy={center} 
              r={radius} 
              fill="none" 
              stroke="var(--bg-tertiary)" 
              strokeWidth={strokeWidth} 
            />

            {data.map((item, idx) => {
              const percentage = total > 0 ? (item.value / total) * 100 : 0;
              const strokeDashoffset = circumference - (percentage / 100) * circumference;
              const rotation = accumulatedAngle;
              accumulatedAngle += (percentage / 100) * 360;

              const isHovered = hoveredIdx === idx;
              const sliceColor = item.color || `hsl(${(idx * 60) % 360}, 75%, 50%)`;

              return (
                <circle
                  key={idx}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={sliceColor}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  transform={`rotate(${rotation} ${center} ${center})`}
                  strokeLinecap="round"
                  style={{ 
                    cursor: 'pointer', 
                    transition: 'stroke-width 0.2s, transform 0.2s',
                    transformOrigin: 'center'
                  }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>

          {/* Central Total Metric */}
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}
          >
            {hoveredIdx !== null ? (
              <>
                <p style={{ fontSize: '18px', fontWeight: '800', lineHeight: 1.1, color: 'var(--text-primary)' }}>
                  {data[hoveredIdx].value}
                </p>
                <p style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  {data[hoveredIdx].label}
                </p>
              </>
            ) : (
              <>
                <p style={{ fontSize: '20px', fontWeight: '800', lineHeight: 1.1, color: 'var(--text-primary)' }}>
                  {total}
                </p>
                <p style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  Total cases
                </p>
              </>
            )}
          </div>
        </div>

        {/* Legend Dock */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '200px', flex: 1 }}>
          {data.map((item, idx) => {
            const isHovered = hoveredIdx === idx;
            const sliceColor = item.color || `hsl(${(idx * 60) % 360}, 75%, 50%)`;
            return (
              <div 
                key={idx}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  opacity: hoveredIdx !== null && !isHovered ? 0.5 : 1,
                  transition: 'opacity 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <span 
                  style={{ 
                    width: '10px', 
                    height: '10px', 
                    borderRadius: '50%', 
                    backgroundColor: sliceColor,
                    display: 'inline-block',
                    flexShrink: 0
                  }} 
                />
                <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginLeft: 'auto', fontWeight: '700' }}>
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
