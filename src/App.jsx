import useWellControl from './hooks/useWellControl';
import KillSheetForm from './components/KillSheetForm';
import ResultsPanel from './components/ResultsPanel';
import WellGeometryPlot from './components/WellGeometryPlot';
import './App.css';

function App() {
  const { data, calc, strokeSchedule, pressureProfile, wellGeometry, updateField } = useWellControl();

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-top">
          <div>
            <h1>Well Control Simulator</h1>
            <p className="subtitle">Kill Sheet & Real-Time Analysis — Wait & Weight Method</p>
          </div>
          <div className="developer-badge">
            <span className="dev-label">Developer</span>
            <span className="dev-name">Ing Carlos Jhesid Lazo Nina</span>
          </div>
        </div>
      </header>
      <div className="app-layout">
        <aside className="sidebar">
          <KillSheetForm data={data} onChange={updateField} />
        </aside>
        <main className="main-content">
          <ResultsPanel calc={calc} strokeSchedule={strokeSchedule} pressureProfile={pressureProfile} />
          <WellGeometryPlot wellGeometry={wellGeometry} md={data.md} tvd={data.tvd} />
          <footer className="app-footer">
            Well Control Simulator v1.0 | Developed by Ing Carlos Jhesid Lazo Nina
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;
