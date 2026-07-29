import { useState, useMemo } from 'react';

const initialData = {
  tvd: 10000,
  md: 10000,
  holeSize: 8.5,
  dpOD: 4.5,
  dcOD: 6.5,
  dcID: 2.5,
  dcLength: 600,
  casingID: 8.835,
  casingDepth: 5000,
  sidpp: 300,
  sicp: 450,
  pitGain: 20,
  mudWeight: 12.0,
  pumpOutputPerStroke: 0.1,
  slowPumpRateSPM: 30,
  scratchPressureSCR: 800,
  sectionName: '',

  dpCapacity: 0.0142,
  dcCapacity: 0.0035,
  hcCapacity: 0.04,
  casingCapacity: 0.05,
  dpDisplacement: 0.0045,
  dcDisplacement: 0.006,
};

export default function useWellControl() {
  const [data, setData] = useState(initialData);

  const updateField = (field, value) => {
    setData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const calc = useMemo(() => {
    const d = data;
    const g = 0.052;

    const killMudWeight = d.mudWeight + d.sidpp / (g * d.tvd);
    const icp = d.scratchPressureSCR + d.sidpp;
    const fcp = killMudWeight * d.scratchPressureSCR / d.mudWeight;

    const dpVol = d.dpCapacity * d.md / 1000;
    const dcVol = d.dcCapacity * d.dcLength / 1000;
    const hcOpen = d.md - d.casingDepth - d.dcLength;
    const hcVol = hcOpen > 0 ? d.hcCapacity * hcOpen / 1000 : 0;
    const casingVol = d.casingCapacity * d.casingDepth / 1000;
    const totalVol = dpVol + dcVol + hcVol + casingVol;

    const strokesDP = d.md / 100 * 100 / d.pumpOutputPerStroke;
    const strokesDC = d.dcLength / 100 * 100 / d.pumpOutputPerStroke;
    const strokesHC = hcOpen > 0 ? hcOpen / 100 * 100 / d.pumpOutputPerStroke : 0;
    const strokesCasing = d.casingDepth / 100 * 100 / d.pumpOutputPerStroke;
    const totalStrokes = strokesDP + strokesDC + strokesHC + strokesCasing;

    const psiPerStrokeDP = d.scratchPressureSCR / totalStrokes;
    const psiPerStrokeDC = d.scratchPressureSCR / totalStrokes;
    const psiPerStrokeHC = d.scratchPressureSCR / totalStrokes;

    const bottomPressure = d.sidpp + g * d.mudWeight * d.tvd;
    const formationPressure = g * killMudWeight * d.tvd;
    const maasp = g * (d.mudWeight) * 0.5 * 0.052 * d.casingDepth;
    const maasp_simplified = 0.052 * d.casingDepth * (killMudWeight - d.mudWeight);

    const instrVol = d.pitGain;

    return {
      killMudWeight: Math.max(killMudWeight, 0),
      icp: Math.max(icp, 0),
      fcp: Math.max(fcp, 0),
      dpVol, dcVol, hcVol, casingVol, totalVol,
      strokesDP: Math.round(strokesDP),
      strokesDC: Math.round(strokesDC),
      strokesHC: Math.round(strokesHC),
      strokesCasing: Math.round(strokesCasing),
      totalStrokes: Math.round(totalStrokes),
      timeDP: Math.round(strokesDP / d.slowPumpRateSPM * 60),
      timeDC: Math.round(strokesDC / d.slowPumpRateSPM * 60),
      timeHC: Math.round(strokesHC / d.slowPumpRateSPM * 60),
      timeCasing: Math.round(strokesCasing / d.slowPumpRateSPM * 60),
      totalTime: Math.round(totalStrokes / d.slowPumpRateSPM * 60),
      bottomPressure: Math.round(bottomPressure),
      formationPressure: Math.round(formationPressure),
      maasp: Math.round(maasp_simplified),
      instrVol: Math.round(instrVol * 10) / 10,
      sidpp: d.sidpp,
      sicp: d.sicp,
      mudWeight: d.mudWeight,
    };
  }, [data]);

  const strokeSchedule = useMemo(() => {
    const schedule = [];
    const total = calc.totalStrokes;

    const dpStart = 0;
    const dpEnd = calc.strokesDP;
    const dcStart = dpEnd;
    const dcEnd = dcStart + calc.strokesDC;
    const hcStart = dcEnd;
    const hcEnd = hcStart + calc.strokesHC;
    const casingStart = hcEnd;
    const casingEnd = casingStart + calc.strokesCasing;

    const dpPressureStart = calc.icp;
    const dpPressureEnd = calc.icp - (calc.icp - calc.fcp) * (calc.strokesDP / total);
    const dcPressureEnd = calc.icp - (calc.icp - calc.fcp) * ((calc.strokesDP + calc.strokesDC) / total);
    const hcPressureEnd = calc.icp - (calc.icp - calc.fcp) * ((calc.strokesDP + calc.strokesDC + calc.strokesHC) / total);
    const casingPressureEnd = calc.fcp;

    schedule.push({
      section: 'Drill Pipe',
      strokesFrom: dpStart,
      strokesTo: dpEnd,
      pressureFrom: Math.round(dpPressureStart),
      pressureTo: Math.round(dpPressureEnd),
      volume: Math.round(calc.dpVol),
      color: '#3b82f6',
    });
    schedule.push({
      section: 'Drill Collar',
      strokesFrom: dcStart,
      strokesTo: dcEnd,
      pressureFrom: Math.round(dpPressureEnd),
      pressureTo: Math.round(dcPressureEnd),
      volume: Math.round(calc.dcVol),
      color: '#8b5cf6',
    });
    schedule.push({
      section: 'Open Hole',
      strokesFrom: hcStart,
      strokesTo: hcEnd,
      pressureFrom: Math.round(dcPressureEnd),
      pressureTo: Math.round(hcPressureEnd),
      volume: Math.round(calc.hcVol),
      color: '#f59e0b',
    });
    schedule.push({
      section: 'Casing',
      strokesFrom: casingStart,
      strokesTo: casingEnd,
      pressureFrom: Math.round(hcPressureEnd),
      pressureTo: Math.round(casingPressureEnd),
      volume: Math.round(calc.casingVol),
      color: '#10b981',
    });

    return schedule.filter(s => s.strokesTo > s.strokesFrom);
  }, [calc]);

  const wellGeometry = useMemo(() => {
    const sections = [];
    const maxDepth = data.md;
    sections.push({
      name: 'Casing',
      from: 0,
      to: data.casingDepth,
      id: data.casingID,
      od: data.casingID,
      isCasing: true,
    });
    sections.push({
      name: 'Open Hole',
      from: data.casingDepth,
      to: maxDepth - data.dcLength,
      id: data.holeSize,
      od: data.holeSize,
      isCasing: false,
    });
    if (data.dcLength > 0) {
      sections.push({
        name: 'DC Section',
        from: maxDepth - data.dcLength,
        to: maxDepth,
        id: data.holeSize,
        od: data.dcOD,
        isCasing: false,
        isDC: true,
      });
    }
    sections.push({
      name: 'Drill Pipe',
      from: 0,
      to: maxDepth - data.dcLength,
      id: data.dpOD,
      od: data.dpOD,
      isPipe: true,
    });
    if (data.dcLength > 0) {
      sections.push({
        name: 'Drill Collar',
        from: maxDepth - data.dcLength,
        to: maxDepth,
        id: data.dcOD,
        od: data.dcOD,
        isPipe: true,
        isDC: true,
      });
    }
    return sections;
  }, [data]);

  return { data, calc, strokeSchedule, wellGeometry, updateField };
}
