import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart, ComposedChart, Bar, Legend,
} from 'recharts';

function MetricCard({ label, value, unit, color }) {
  return (
    <div className="metric-card" style={{ borderLeftColor: color || '#3b82f6' }}>
      <div className="metric-label">{label}</div>
      <div className="metric-value" style={{ color: color || '#e2e8f0' }}>
        {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : value}
        <span className="metric-unit">{unit}</span>
      </div>
    </div>
  );
}

export default function ResultsPanel({ calc, strokeSchedule }) {
  const scheduleChart = strokeSchedule.map(s => ({
    section: s.section,
    strokes: s.strokesTo - s.strokesFrom,
    pressureFrom: s.pressureFrom,
    pressureTo: s.pressureTo,
    color: s.color,
  }));

  const pressureProfile = [];
  let cumulative = 0;
  strokeSchedule.forEach(s => {
    pressureProfile.push({ strokes: cumulative, pressure: s.pressureFrom, section: s.section });
    cumulative += s.strokesTo - s.strokesFrom;
    pressureProfile.push({ strokes: cumulative, pressure: s.pressureTo, section: s.section });
  });

  const primaryMetrics = [
    { label: 'Kill Mud Weight', value: calc.killMudWeight, unit: 'ppg', color: '#10b981' },
    { label: 'ICP', value: calc.icp, unit: 'psi', color: '#3b82f6' },
    { label: 'FCP', value: calc.fcp, unit: 'psi', color: '#8b5cf6' },
    { label: 'SIDPP', value: calc.sidpp, unit: 'psi', color: '#ef4444' },
    { label: 'SICP', value: calc.sicp, unit: 'psi', color: '#f59e0b' },
    { label: 'Bottom Hole Pressure', value: calc.bottomPressure, unit: 'psi', color: '#06b6d4' },
    { label: 'Formation Pressure', value: calc.formationPressure, unit: 'psi', color: '#ec4899' },
    { label: 'MAASP', value: calc.maasp, unit: 'psi', color: '#f97316' },
  ];

  const strokeMetrics = [
    { label: 'Total Strokes', value: calc.totalStrokes, unit: 'stk', color: '#3b82f6' },
    { label: 'Total Time', value: calc.totalTime, unit: 'sec', color: '#10b981' },
    { label: 'DP Section', value: calc.strokesDP, unit: 'stk', color: '#3b82f6' },
    { label: 'DC Section', value: calc.strokesDC, unit: 'stk', color: '#8b5cf6' },
    { label: 'Open Hole', value: calc.strokesHC, unit: 'stk', color: '#f59e0b' },
    { label: 'Casing Section', value: calc.strokesCasing, unit: 'stk', color: '#10b981' },
  ];

  const volMetrics = [
    { label: 'DP Volume', value: calc.dpVol, unit: 'bbl', color: '#3b82f6' },
    { label: 'DC Volume', value: calc.dcVol, unit: 'bbl', color: '#8b5cf6' },
    { label: 'Open Hole Volume', value: calc.hcVol, unit: 'bbl', color: '#f59e0b' },
    { label: 'Casing Volume', value: calc.casingVol, unit: 'bbl', color: '#10b981' },
    { label: 'Total System Volume', value: calc.totalVol, unit: 'bbl', color: '#06b6d4' },
    { label: 'Influx Volume', value: calc.instrVol, unit: 'bbl', color: '#ef4444' },
  ];

  return (
    <div className="results-panel">
      <h2 className="form-title">Real-Time Analysis</h2>

      <h3>Primary Kill Sheet Results</h3>
      <div className="metrics-grid">
        {primaryMetrics.map(m => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      <h3>Stroke Schedule</h3>
      <div className="metrics-grid">
        {strokeMetrics.map(m => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      <h3>Volumes</h3>
      <div className="metrics-grid">
        {volMetrics.map(m => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      <h3>Pressure Profile vs Strokes</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <ComposedChart data={pressureProfile} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="strokes"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              label={{ value: 'Strokes', position: 'insideBottom', offset: -10, fill: '#94a3b8' }}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              label={{ value: 'Pressure (psi)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value) => [`${value} psi`, 'Pressure']}
            />
            <Area
              type="stepAfter"
              dataKey="pressure"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.15}
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <h3>Stroke Distribution by Section</h3>
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <ComposedChart data={scheduleChart} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="section" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              label={{ value: 'Strokes', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Bar dataKey="strokes" name="Strokes">
              {scheduleChart.map((entry, idx) => (
                <rect key={idx} fill={entry.color} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <h3>Pressure Schedule by Section</h3>
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <ComposedChart data={scheduleChart} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="section" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              label={{ value: 'Pressure (psi)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Bar dataKey="pressureFrom" name="Start Pressure" fill="#3b82f6" />
            <Bar dataKey="pressureTo" name="End Pressure" fill="#10b981" />
            <Legend wrapperStyle={{ paddingTop: 10 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
