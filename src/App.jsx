import useWellControl from './hooks/useWellControl';
import KillSheetForm from './components/KillSheetForm';
import ResultsPanel from './components/ResultsPanel';
import WellGeometryPlot from './components/WellGeometryPlot';
import './App.css';

function App() {
  const { data, calc, strokeSchedule, wellGeometry, updateField } = useWellControl();

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Well Control Simulator</h1>
        <p className="subtitle">Kill Sheet & Real-Time Analysis</p>
      </header>
      <div className="app-layout">
        <aside className="sidebar">
          <KillSheetForm data={data} onChange={updateField} />
        </aside>
        <main className="main-content">
          <ResultsPanel calc={calc} strokeSchedule={strokeSchedule} />
          <WellGeometryPlot wellGeometry={wellGeometry} md={data.md} tvd={data.tvd} />
        </main>
      </div>
    </div>
  );
}

export default App;
