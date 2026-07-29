import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine, Legend,
} from 'recharts';

export default function WellGeometryPlot({ wellGeometry, md, tvd }) {
  const chartData = useMemo(() => {
    const maxDepth = md;
    const data = [];

    const holeRadius = 4.25;
    const dpRadius = 2.25;
    const dcRadius = 3.25;
    const casingRadius = 4.4175;

    const steps = 50;
    const stepSize = maxDepth / steps;

    for (let i = 0; i <= steps; i++) {
      const depth = i * stepSize;
      let holeWidth = holeRadius;
      let pipeWidth = dpRadius;

      const inCasing = depth <= wellGeometry.find(s => s.isCasing)?.to || 0;
      const dcSection = wellGeometry.find(s => s.isDC);
      const inDC = dcSection && depth >= dcSection.from;

      if (inCasing) {
        holeWidth = casingRadius;
      }
      if (inDC) {
        pipeWidth = dcRadius;
      }

      data.push({
        depth: Math.round(depth),
        depthLabel: `${Math.round(depth)}'`,
        holeLeft: -holeWidth,
        holeRight: holeWidth,
        pipeLeft: -pipeWidth,
        pipeRight: pipeWidth,
        filling: holeWidth - pipeWidth,
        inCasing,
        inDC,
      });
    }

    return data;
  }, [wellGeometry, md]);

  return (
    <div>
      <h3>Wellbore Geometry</h3>
      <div style={{ width: '100%', height: 500 }}>
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            layout="vertical"
            barCategoryGap={0}
            margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              type="number"
              domain={[-5, 5]}
              ticks={[-4, -2, 0, 2, 4]}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              label={{ value: 'Radius (in)', position: 'insideBottom', offset: -10, fill: '#94a3b8' }}
            />
            <YAxis
              type="number"
              dataKey="depth"
              domain={[0, md]}
              reversed
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickFormatter={(v) => `${Math.round(v)}'`}
              label={{ value: 'Depth (ft)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value, name) => {
                const labels = { holeLeft: 'Hole Left', holeRight: 'Hole Right', pipeLeft: 'Pipe Left', pipeRight: 'Pipe Right' };
                return [`${Math.abs(value).toFixed(2)} in`, labels[name] || name];
              }}
              labelFormatter={(label) => `Depth: ${label} ft`}
            />
            <Bar dataKey="holeLeft" stackId="hole" fill="none" stroke="none">
              {chartData.map((entry, index) => (
                <Cell key={`hl-${index}`} fill={entry.inCasing ? '#2563eb' : '#92400e'} fillOpacity={0.3} />
              ))}
            </Bar>
            <Bar dataKey="holeRight" stackId="hole" fill="none" stroke="none">
              {chartData.map((entry, index) => (
                <Cell key={`hr-${index}`} fill={entry.inCasing ? '#2563eb' : '#92400e'} fillOpacity={0.3} />
              ))}
            </Bar>
            <Bar dataKey="pipeLeft" stackId="pipe" fill="none" stroke="none">
              {chartData.map((entry, index) => (
                <Cell key={`pl-${index}`} fill={entry.inDC ? '#7c3aed' : '#64748b'} fillOpacity={0.8} />
              ))}
            </Bar>
            <Bar dataKey="pipeRight" stackId="pipe" fill="none" stroke="none">
              {chartData.map((entry, index) => (
                <Cell key={`pr-${index}`} fill={entry.inDC ? '#7c3aed' : '#64748b'} fillOpacity={0.8} />
              ))}
            </Bar>
            <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="3 3" />
            <Legend
              wrapperStyle={{ paddingTop: 10 }}
              formatter={(value) => {
                const labels = {
                  holeLeft: 'Hole/Casing',
                  holeRight: '',
                  pipeLeft: 'Drill String',
                  pipeRight: '',
                };
                return <span style={{ color: '#e2e8f0' }}>{labels[value] || value}</span>;
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8, fontSize: 12, color: '#94a3b8' }}>
        <span><span style={{ color: '#2563eb' }}>■</span> Casing</span>
        <span><span style={{ color: '#92400e' }}>■</span> Open Hole</span>
        <span><span style={{ color: '#64748b' }}>■</span> Drill Pipe</span>
        <span><span style={{ color: '#7c3aed' }}>■</span> Drill Collar</span>
      </div>
    </div>
  );
}
