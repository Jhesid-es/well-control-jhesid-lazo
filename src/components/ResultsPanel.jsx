import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, ComposedChart, Bar, Legend, PieChart, Pie, Cell, Line,
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

const CHART_TOOLTIP = {
  contentStyle: { backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8 },
  labelStyle: { color: '#e2e8f0' },
};

export default function ResultsPanel({ calc, strokeSchedule, pressureProfile }) {
  const scheduleChart = strokeSchedule.map(s => ({
    section: s.section,
    strokes: s.strokesTo - s.strokesFrom,
    pressureFrom: Math.round(s.pressureFrom),
    pressureTo: Math.round(s.pressureTo),
    volume: s.volume,
    color: s.color,
  }));

  const stringVolData = [
    { name: 'Drill Pipe', value: calc.dpVol, color: '#3b82f6' },
    { name: 'Drill Collar', value: calc.dcVol, color: '#8b5cf6' },
  ].filter(d => d.value > 0);

  const annVolData = [
    { name: 'Casing', value: calc.casingAnnVol, color: '#10b981' },
    { name: 'OH (DP)', value: calc.ohAnnVol, color: '#f59e0b' },
    { name: 'OH (DC)', value: calc.ohDCAnnVol, color: '#ec4899' },
  ].filter(d => d.value > 0);

  const mwData = [
    { name: 'Current MW', value: calc.mudWeight, fill: '#f59e0b' },
    { name: 'Kill MW', value: calc.killMudWeight, fill: '#10b981' },
  ];

  const primaryMetrics = [
    { label: 'Kill Mud Weight', value: calc.killMudWeight, unit: 'ppg', color: '#10b981' },
    { label: 'ICP', value: calc.icp, unit: 'psi', color: '#3b82f6' },
    { label: 'FCP', value: calc.fcp, unit: 'psi', color: '#8b5cf6' },
    { label: 'SIDPP', value: calc.sidpp, unit: 'psi', color: '#ef4444' },
    { label: 'SICP', value: calc.sicp, unit: 'psi', color: '#f59e0b' },
    { label: 'BHP (Static)', value: calc.staticBHP, unit: 'psi', color: '#06b6d4' },
    { label: 'BHP (Kill)', value: calc.bottomPressure, unit: 'psi', color: '#14b8a6' },
    { label: 'Formation Pressure', value: calc.formationPressure, unit: 'psi', color: '#ec4899' },
    { label: 'MAASP', value: calc.maasp, unit: 'psi', color: '#f97316' },
    { label: 'Influx Volume', value: calc.instrVol, unit: 'bbl', color: '#ef4444' },
  ];

  const strokeMetrics = [
    { label: 'String Strokes', value: calc.stringStrokes, unit: 'stk', color: '#3b82f6' },
    { label: 'Annular Strokes', value: calc.annStrokes, unit: 'stk', color: '#10b981' },
    { label: 'Total Strokes', value: calc.totalStrokes, unit: 'stk', color: '#a78bfa' },
    { label: 'String Time', value: calc.timeString, unit: 'sec', color: '#3b82f6' },
    { label: 'Total Time', value: calc.totalTime, unit: 'sec', color: '#10b981' },
  ];

  const volMetrics = [
    { label: 'String Volume', value: calc.stringVol, unit: 'bbl', color: '#3b82f6' },
    { label: 'Annular Volume', value: calc.totalAnnVol, unit: 'bbl', color: '#10b981' },
    { label: 'Total System', value: calc.totalVol, unit: 'bbl', color: '#a78bfa' },
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

      <h3>Stroke Schedule Summary</h3>
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

      <div className="charts-grid-2col">
        <div>
          <h3>Kill Circulation Pressure Profile</h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <ComposedChart data={pressureProfile} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="strokes" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'Strokes', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'Pressure (psi)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip {...CHART_TOOLTIP} />
                <Legend wrapperStyle={{ paddingTop: 8 }} />
                <Area yAxisId="left" type="stepAfter" dataKey="pumpPressure" name="Pump Pressure" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="bhp" name="BHP" stroke="#14b8a6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="casingPressure" name="Casing Pressure" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3>Mud Weight Comparison</h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <ComposedChart data={mwData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis domain={[0, 'auto']} tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'ppg', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip {...CHART_TOOLTIP} />
                <Bar dataKey="value" name="Mud Weight">
                  {mwData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="charts-grid-2col">
        <div>
          <h3>String Internal Volume Distribution</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={stringVolData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={4}>
                  {stringVolData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip {...CHART_TOOLTIP} />
                <Legend wrapperStyle={{ paddingTop: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3>Annular Volume Distribution</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={annVolData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={4}>
                  {annVolData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip {...CHART_TOOLTIP} />
                <Legend wrapperStyle={{ paddingTop: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <h3>Stroke Distribution by Section</h3>
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <ComposedChart data={scheduleChart} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="section" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-20} textAnchor="end" height={60} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'Strokes', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...CHART_TOOLTIP} />
            <Bar dataKey="strokes" name="Strokes">
              {scheduleChart.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="charts-grid-2col">
        <div>
          <h3>Pressure Schedule by Section</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <ComposedChart data={scheduleChart} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="section" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'Pressure (psi)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip {...CHART_TOOLTIP} />
                <Legend wrapperStyle={{ paddingTop: 8 }} />
                <Bar dataKey="pressureFrom" name="Start Pressure" fill="#3b82f6" />
                <Bar dataKey="pressureTo" name="End Pressure" fill="#10b981" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3>Volume by Section</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <ComposedChart data={scheduleChart} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="section" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'Volume (bbl)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip {...CHART_TOOLTIP} />
                <Bar dataKey="volume" name="Volume (bbl)">
                  {scheduleChart.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
