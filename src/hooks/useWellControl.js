import { useState, useMemo } from 'react';

const g = 0.052;

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

    const killMudWeight = d.mudWeight + d.sidpp / (g * d.tvd);

    const icp = d.scratchPressureSCR + d.sidpp;
    const fcp = d.scratchPressureSCR * killMudWeight / d.mudWeight;

    const dpLen = d.md - d.dcLength;

    const dpVol = d.dpCapacity * dpLen / 1000;
    const dcVol = d.dcCapacity * d.dcLength / 1000;
    const stringVol = dpVol + dcVol;

    const ohLen = d.md - d.casingDepth - d.dcLength;
    const casingAnnVol = d.casingCapacity * d.casingDepth / 1000;
    const ohAnnVol = ohLen > 0 ? d.hcCapacity * ohLen / 1000 : 0;
    const ohDCAnnVol = d.dcLength > 0 ? d.hcCapacity * d.dcLength / 1000 : 0;
    const totalAnnVol = casingAnnVol + ohAnnVol + ohDCAnnVol;
    const totalVol = stringVol + totalAnnVol;

    const stringStrokes = stringVol / d.pumpOutputPerStroke;
    const casingStrokes = casingAnnVol / d.pumpOutputPerStroke;
    const ohStrokes = ohAnnVol / d.pumpOutputPerStroke;
    const ohDCStrokes = ohDCAnnVol / d.pumpOutputPerStroke;
    const annStrokes = casingStrokes + ohStrokes + ohDCStrokes;
    const totalStrokes = stringStrokes + annStrokes;

    const bottomPressure = d.sidpp + g * d.mudWeight * d.tvd;
    const formationPressure = g * killMudWeight * d.tvd;
    const maasp = g * (killMudWeight - d.mudWeight) * d.casingDepth;
    const staticBHP = g * d.mudWeight * d.tvd;

    return {
      killMudWeight: Math.max(killMudWeight, 0),
      icp: Math.max(icp, 0),
      fcp: Math.max(fcp, 0),
      dpVol: Math.round(dpVol * 100) / 100,
      dcVol: Math.round(dcVol * 100) / 100,
      stringVol: Math.round(stringVol * 100) / 100,
      casingAnnVol: Math.round(casingAnnVol * 100) / 100,
      ohAnnVol: Math.round(ohAnnVol * 100) / 100,
      ohDCAnnVol: Math.round(ohDCAnnVol * 100) / 100,
      totalAnnVol: Math.round(totalAnnVol * 100) / 100,
      totalVol: Math.round(totalVol * 100) / 100,
      stringStrokes: Math.round(stringStrokes),
      casingStrokes: Math.round(casingStrokes),
      ohStrokes: Math.round(ohStrokes),
      ohDCStrokes: Math.round(ohDCStrokes),
      annStrokes: Math.round(annStrokes),
      totalStrokes: Math.round(totalStrokes),
      timeString: Math.round(stringStrokes / d.slowPumpRateSPM * 60),
      timeAnn: Math.round(annStrokes / d.slowPumpRateSPM * 60),
      totalTime: Math.round(totalStrokes / d.slowPumpRateSPM * 60),
      bottomPressure: Math.round(bottomPressure),
      formationPressure: Math.round(formationPressure),
      staticBHP: Math.round(staticBHP),
      maasp: Math.round(Math.max(maasp, 0)),
      instrVol: d.pitGain,
      sidpp: d.sidpp,
      sicp: d.sicp,
      mudWeight: d.mudWeight,
      dpLen,
      ohLen: Math.max(ohLen, 0),
      pumpOutput: d.pumpOutputPerStroke,
      spm: d.slowPumpRateSPM,
    };
  }, [data]);

  const strokeSchedule = useMemo(() => {
    const schedule = [];
    const c = calc;

    schedule.push({
      section: 'String (DP)',
      type: 'string',
      subType: 'dp',
      strokesFrom: 0,
      strokesTo: c.stringStrokes * (c.dpVol / (c.dpVol + c.dcVol + 0.001)),
      pressureFrom: c.icp,
      pressureTo: c.icp - (c.icp - c.fcp) * (c.dpVol / (c.dpVol + c.dcVol + 0.001)),
      volume: c.dpVol,
      strokes: Math.round(c.stringStrokes * (c.dpVol / (c.dpVol + c.dcVol + 0.001))),
      color: '#3b82f6',
    });

    if (c.dcVol > 0) {
      const dpStrokes = c.stringStrokes * (c.dpVol / (c.dpVol + c.dcVol));
      const dpPressureEnd = c.icp - (c.icp - c.fcp) * (c.dpVol / (c.dpVol + c.dcVol));
      schedule.push({
        section: 'String (DC)',
        type: 'string',
        subType: 'dc',
        strokesFrom: dpStrokes,
        strokesTo: c.stringStrokes,
        pressureFrom: dpPressureEnd,
        pressureTo: c.fcp,
        volume: c.dcVol,
        strokes: Math.round(c.stringStrokes - dpStrokes),
        color: '#8b5cf6',
      });
    }

    let cumStrokes = c.stringStrokes;
    if (c.casingAnnVol > 0) {
      schedule.push({
        section: 'Casing Annulus',
        type: 'annular',
        strokesFrom: cumStrokes,
        strokesTo: cumStrokes + c.casingStrokes,
        pressureFrom: c.fcp,
        pressureTo: c.fcp,
        volume: c.casingAnnVol,
        strokes: c.casingStrokes,
        color: '#10b981',
      });
      cumStrokes += c.casingStrokes;
    }

    if (c.ohAnnVol > 0) {
      schedule.push({
        section: 'OH Annulus (DP)',
        type: 'annular',
        strokesFrom: cumStrokes,
        strokesTo: cumStrokes + c.ohStrokes,
        pressureFrom: c.fcp,
        pressureTo: c.fcp,
        volume: c.ohAnnVol,
        strokes: c.ohStrokes,
        color: '#f59e0b',
      });
      cumStrokes += c.ohStrokes;
    }

    if (c.ohDCAnnVol > 0) {
      schedule.push({
        section: 'OH Annulus (DC)',
        type: 'annular',
        strokesFrom: cumStrokes,
        strokesTo: cumStrokes + c.ohDCStrokes,
        pressureFrom: c.fcp,
        pressureTo: c.fcp,
        volume: c.ohDCAnnVol,
        strokes: c.ohDCStrokes,
        color: '#ec4899',
      });
    }

    return schedule.filter(s => Math.round(s.strokesTo - s.strokesFrom) > 0);
  }, [calc]);

  const pressureProfile = useMemo(() => {
    const points = [];
    const total = calc.totalStrokes;
    const steps = Math.min(100, total);

    for (let i = 0; i <= steps; i++) {
      const strokeRatio = i / steps;
      const strokes = strokeRatio * total;
      let pressure;

      if (strokes <= calc.stringStrokes) {
        const ratio = calc.stringStrokes > 0 ? strokes / calc.stringStrokes : 1;
        pressure = calc.icp - (calc.icp - calc.fcp) * ratio;
      } else {
        pressure = calc.fcp;
      }

      const bhp = calc.bottomPressure;

      const annPresFriction = pressure;
      const casingP = calc.sicp - (strokes / total) * (calc.sicp - 0);

      points.push({
        strokes: Math.round(strokes),
        pumpPressure: Math.round(pressure),
        bhp: bhp,
        casingPressure: Math.max(0, Math.round(casingP)),
      });
    }
    return points;
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

  return { data, calc, strokeSchedule, pressureProfile, wellGeometry, updateField };
}
