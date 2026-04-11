import { useState, useMemo } from 'react';
import { BarChart2, TrendingUp, Target, BookOpen } from 'lucide-react';
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
import { AbandonTab } from './components/AbandonTab';

type Tab = 'intro' | 'volume' | 'abandon';

const tabs: { id: Tab; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'intro', label: 'Introduction', icon: <BookOpen className="w-4 h-4" />, desc: 'What is MIV?' },
  { id: 'volume', label: 'Volume MIV', icon: <TrendingUp className="w-4 h-4" />, desc: 'Forecast Accuracy' },
  { id: 'abandon', label: 'Abandon Rate MIV', icon: <Target className="w-4 h-4" />, desc: 'Service Targets' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('intro');

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
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <BarChart2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">
              Minimal Interval Variance
            </h1>
          </div>
          <p className="text-gray-600">
            Understanding the statistical floor of forecast accuracy and service-level targets
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <nav className="flex border-b border-gray-200">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors border-b-2 ${
                  tab === t.id
                    ? 'text-blue-600 border-blue-600 bg-blue-50/50'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.label.split(' ')[0]}</span>
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
          />
        )}

        {/* Footer */}
        <div className="text-center py-6 text-gray-400 text-xs">
          WFM Labs — Workforce Management Tools
        </div>
      </div>
    </div>
  );
}
