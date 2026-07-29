import { useMemo } from 'react';

const fields = [
  { key: 'tvd', label: 'TVD (ft)', placeholder: 'True Vertical Depth', step: 1 },
  { key: 'md', label: 'MD (ft)', placeholder: 'Measured Depth', step: 1 },
  { key: 'holeSize', label: 'Hole Size (in)', placeholder: 'Hole diameter', step: 0.1 },
  { key: 'dpOD', label: 'DP OD (in)', placeholder: 'Drill Pipe outer diameter', step: 0.1 },
  { key: 'dcOD', label: 'DC OD (in)', placeholder: 'Drill Collar outer diameter', step: 0.1 },
  { key: 'dcID', label: 'DC ID (in)', placeholder: 'Drill Collar inner diameter', step: 0.1 },
  { key: 'dcLength', label: 'DC Length (ft)', placeholder: 'Drill Collar length', step: 1 },
  { key: 'casingID', label: 'Casing ID (in)', placeholder: 'Casing inner diameter', step: 0.1 },
  { key: 'casingDepth', label: 'Casing Depth (ft)', placeholder: 'Casing shoe depth', step: 1 },
];

const kickFields = [
  { key: 'sidpp', label: 'SIDPP (psi)', placeholder: 'Shut-in Drill Pipe Pressure', step: 1 },
  { key: 'sicp', label: 'SICP (psi)', placeholder: 'Shut-in Casing Pressure', step: 1 },
  { key: 'pitGain', label: 'Pit Gain (bbl)', placeholder: 'Gain in pits', step: 1 },
  { key: 'mudWeight', label: 'Mud Weight (ppg)', placeholder: 'Current mud weight', step: 0.1 },
];

const pumpFields = [
  { key: 'pumpOutputPerStroke', label: 'Pump Output (bbl/stk)', placeholder: 'Barrels per stroke', step: 0.001 },
  { key: 'slowPumpRateSPM', label: 'Slow Pump Rate (SPM)', placeholder: 'Strokes per minute', step: 1 },
  { key: 'scratchPressureSCR', label: 'SCR Pressure (psi)', placeholder: 'Slow Circulating Rate', step: 1 },
];

const capacityFields = [
  { key: 'dpCapacity', label: 'DP Cap (bbl/1000ft)', placeholder: 'Drill Pipe capacity', step: 0.0001 },
  { key: 'dcCapacity', label: 'DC Cap (bbl/1000ft)', placeholder: 'Drill Collar capacity', step: 0.0001 },
  { key: 'hcCapacity', label: 'HC Cap (bbl/1000ft)', placeholder: 'Open Hole capacity', step: 0.0001 },
  { key: 'casingCapacity', label: 'Casing Cap (bbl/1000ft)', placeholder: 'Casing capacity', step: 0.0001 },
  { key: 'dpDisplacement', label: 'DP Disp (bbl/1000ft)', placeholder: 'Drill Pipe displacement', step: 0.0001 },
  { key: 'dcDisplacement', label: 'DC Disp (bbl/1000ft)', placeholder: 'Drill Collar displacement', step: 0.0001 },
];

function FieldGroup({ title, fields: groupFields, data, onChange, columns = 2 }) {
  return (
    <div className="field-group">
      <h4 className="group-title">{title}</h4>
      <div className={`field-grid cols-${columns}`}>
        {groupFields.map(f => (
          <div key={f.key} className="field-item">
            <label htmlFor={f.key}>{f.label}</label>
            <input
              id={f.key}
              type="number"
              value={data[f.key]}
              onChange={e => onChange(f.key, e.target.value)}
              step={f.step}
              placeholder={f.placeholder}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function KillSheetForm({ data, onChange }) {
  return (
    <div className="kill-sheet-form">
      <h2 className="form-title">Kill Sheet Parameters</h2>
      <FieldGroup title="Well Geometry" fields={fields} data={data} onChange={onChange} />
      <FieldGroup title="Kick Data" fields={kickFields} data={data} onChange={onChange} />
      <FieldGroup title="Pump Data" fields={pumpFields} data={data} onChange={onChange} />
      <FieldGroup title="Capacity / Displacement" fields={capacityFields} data={data} onChange={onChange} />
    </div>
  );
}
