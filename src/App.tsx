import { useState, useMemo } from 'react';
import { BarChart2, TrendingUp, Target, BookOpen, Clock, Upload, Sun, Moon } from 'lucide-react';
import {
  computeVolumeMIV,
  calculateAbandonMIV,
  parseIntervalData,
  SAMPLE_INTERVAL_DATA,
  DEFAULT_DAYS,
  DEFAULT_CALLS_PER_WEEK,
  DEFAULT_FORECAST_GOAL,
} from './utils/mivCalculator';
import type { DayConfig, AbandonSettings } from './types/miv';
import { IntroTab } from './components/IntroTab';
import { VolumeTab } from './components/VolumeTab';
import { IntervalTab } from './components/IntervalTab';
import { AbandonTab } from './components/AbandonTab';
import { YourDataTab } from './components/YourDataTab';

type Tab = 'intro' | 'volume' | 'interval' | 'abandon' | 'yourdata';

const tabs: { id: Tab; label: string; shortLabel: string; icon: React.ReactNode }[] = [
  { id: 'intro', label: 'Introduction', shortLabel: 'Intro', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'volume', label: 'Volume MIV', shortLabel: 'Volume', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'interval', label: 'Interval View', shortLabel: 'Interval', icon: <Clock className="w-4 h-4" /> },
  { id: 'abandon', label: 'Abandon Rate', shortLabel: 'Abandon', icon: <Target className="w-4 h-4" /> },
  { id: 'yourdata', label: 'Your Data', shortLabel: 'Data', icon: <Upload className="w-4 h-4" /> },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('intro');
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('wfm-theme') !== 'light';
    }
    return true;
  });

  // Volume MIV state
  const [callsPerWeek, setCallsPerWeek] = useState(DEFAULT_CALLS_PER_WEEK);
  const [forecastGoal, setForecastGoal] = useState(DEFAULT_FORECAST_GOAL);
  const [days, setDays] = useState<DayConfig[]>(DEFAULT_DAYS);

  const totalPct = days.reduce((s, d) => s + d.volumePct, 0);
  const pctValid = Math.abs(totalPct - 1.0) < 0.001;

  const volumeResult = useMemo(
    () => computeVolumeMIV(callsPerWeek, forecastGoal, days),
    [callsPerWeek, forecastGoal, days]
  );

  const updateDay = (idx: number, field: keyof DayConfig, val: number) => {
    setDays(prev => prev.map((d, i) => (i === idx ? { ...d, [field]: val } : d)));
  };

  // Abandon MIV state
  const [abandonSettings, setAbandonSettings] = useState<AbandonSettings>({
    targetAR: 3.0,
    confidenceLevel: 2,
    minCalls: 10,
  });
  const [rawData, setRawData] = useState('');
  const [abandonCalcResult, setAbandonCalcResult] = useState<ReturnType<typeof calculateAbandonMIV> | null>(null);

  const handleAbandonCalculate = (data: string) => {
    const intervals = parseIntervalData(data);
    if (intervals.length === 0) return;
    setAbandonCalcResult(calculateAbandonMIV(intervals, abandonSettings));
  };

  const handleAbandonSettingsChange = (newSettings: AbandonSettings) => {
    setAbandonSettings(newSettings);
    if (abandonCalcResult) {
      const intervals = abandonCalcResult.results.map(r => ({ time: r.time, calls: r.calls }));
      setAbandonCalcResult(calculateAbandonMIV(intervals, newSettings));
    }
  };

  const handleLoadSample = () => {
    setRawData(SAMPLE_INTERVAL_DATA);
    const intervals = parseIntervalData(SAMPLE_INTERVAL_DATA);
    setAbandonCalcResult(calculateAbandonMIV(intervals, abandonSettings));
  };

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-6 md:p-8 transition-colors">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 relative">
            <button
              onClick={() => { const next = !dark; setDark(next); localStorage.setItem('wfm-theme', next ? 'dark' : 'light'); }}
              className="absolute right-0 top-0 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all text-gray-600 dark:text-gray-300"
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="flex items-center justify-center gap-3 mb-2">
              <BarChart2 className="w-8 h-8 text-orange-500 dark:text-orange-400" />
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                Minimal Interval Variance
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Understanding the statistical floor of forecast accuracy and service-level targets
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md mb-6 overflow-x-auto">
            <nav className="flex border-b border-gray-200 dark:border-gray-700 min-w-max">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                    tab === t.id
                      ? 'text-white bg-orange-500 border-orange-600'
                      : 'text-gray-700 dark:text-gray-300 border-transparent hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {t.icon}
                  <span className="hidden md:inline">{t.label}</span>
                  <span className="md:hidden">{t.shortLabel}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          {tab === 'intro' && <IntroTab />}
          {tab === 'volume' && (
            <VolumeTab
              callsPerWeek={callsPerWeek}
              setCallsPerWeek={setCallsPerWeek}
              forecastGoal={forecastGoal}
              setForecastGoal={setForecastGoal}
              days={days}
              updateDay={updateDay}
              totalPct={totalPct}
              pctValid={pctValid}
              result={volumeResult}
              isDark={dark}
            />
          )}
          {tab === 'interval' && (
            <IntervalTab
              callsPerWeek={callsPerWeek}
              days={days}
              forecastGoal={forecastGoal}
              isDark={dark}
            />
          )}
          {tab === 'abandon' && (
            <AbandonTab
              settings={abandonSettings}
              onSettingsChange={handleAbandonSettingsChange}
              rawData={rawData}
              setRawData={setRawData}
              onCalculate={handleAbandonCalculate}
              onLoadSample={handleLoadSample}
              calcResult={abandonCalcResult}
              isDark={dark}
            />
          )}
          {tab === 'yourdata' && (
            <YourDataTab forecastGoal={forecastGoal} isDark={dark} />
          )}

          {/* Footer */}
          <div className="text-center py-6 text-gray-400 dark:text-gray-600 text-xs">
            WFM Labs — Workforce Management Tools
          </div>
        </div>
      </div>
    </div>
  );
}
