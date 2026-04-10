import { useState, useMemo } from 'react';
import { BarChart3, Sliders, BookOpen } from 'lucide-react';
import {
  computeMIVAnalysis,
  DEFAULT_DAYS,
  DEFAULT_CALLS_PER_WEEK,
  DEFAULT_FORECAST_GOAL,
} from './utils/mivCalculator';
import type { DayConfig } from './types/miv';
import { IntroTab } from './components/IntroTab';
import { InputsTab } from './components/InputsTab';
import { AnalysisTab } from './components/AnalysisTab';

type Tab = 'intro' | 'inputs' | 'analysis';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'intro', label: 'Introduction', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'inputs', label: 'Inputs', icon: <Sliders className="w-4 h-4" /> },
  { id: 'analysis', label: 'Analysis', icon: <BarChart3 className="w-4 h-4" /> },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('intro');
  const [callsPerWeek, setCallsPerWeek] = useState(DEFAULT_CALLS_PER_WEEK);
  const [forecastGoal, setForecastGoal] = useState(DEFAULT_FORECAST_GOAL);
  const [days, setDays] = useState<DayConfig[]>(DEFAULT_DAYS);

  const totalPct = days.reduce((s, d) => s + d.volumePct, 0);
  const pctValid = Math.abs(totalPct - 1.0) < 0.001;

  const result = useMemo(
    () => computeMIVAnalysis(callsPerWeek, forecastGoal, days),
    [callsPerWeek, forecastGoal, days]
  );

  const updateDay = (idx: number, field: keyof DayConfig, val: number) => {
    setDays(prev =>
      prev.map((d, i) => (i === idx ? { ...d, [field]: val } : d))
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Header */}
      <header className="py-6 border-b border-slate-800">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight">
            Minimal Interval Variance
          </h1>
          <span className="bg-blue-600 text-white px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
            WFM Labs
          </span>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex border-b border-slate-800 mb-6">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'text-blue-400 border-blue-500'
                : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="min-h-[60vh] pb-8">
        {tab === 'intro' && <IntroTab />}
        {tab === 'inputs' && (
          <InputsTab
            callsPerWeek={callsPerWeek}
            setCallsPerWeek={setCallsPerWeek}
            forecastGoal={forecastGoal}
            setForecastGoal={setForecastGoal}
            days={days}
            updateDay={updateDay}
            totalPct={totalPct}
            pctValid={pctValid}
          />
        )}
        {tab === 'analysis' && (
          <AnalysisTab result={result} pctValid={pctValid} />
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-slate-600 text-xs border-t border-slate-800">
        WFM Labs — Workforce Management Tools
      </footer>
    </div>
  );
}
