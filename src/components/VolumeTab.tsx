import { CheckCircle, XCircle, TrendingUp, Phone, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { VolumeChart } from './VolumeChart';
import { ErrorBoundary } from './ErrorBoundary';
import type { DayConfig, MIVSummary } from '../types/miv';

interface Props {
  callsPerWeek: number;
  setCallsPerWeek: (v: number) => void;
  forecastGoal: number;
  setForecastGoal: (v: number) => void;
  days: DayConfig[];
  updateDay: (idx: number, field: keyof DayConfig, val: number) => void;
  totalPct: number;
  pctValid: boolean;
  result: MIVSummary;
  isDark: boolean;
}

export function VolumeTab({
  callsPerWeek, setCallsPerWeek,
  forecastGoal, setForecastGoal,
  days, updateDay,
  totalPct, pctValid,
  result, isDark,
}: Props) {
  const goalMet = result.goalDelta <= 0;

  return (
    <div className="space-y-6">
      {/* Inputs Card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          <TrendingUp className="w-5 h-5 text-orange-500 dark:text-orange-400 inline mr-2" />
          Volume Forecast MIV
        </h2>

        {/* Volume & Goal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border-l-4 border-orange-500">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Calls Per Week
            </label>
            <input
              type="number"
              min={0}
              step={1000}
              value={callsPerWeek}
              onChange={e => setCallsPerWeek(Math.max(0, Number(e.target.value)))}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
            />
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border-l-4 border-orange-500">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Forecast Accuracy Goal (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={(forecastGoal * 100).toFixed(1)}
              onChange={e => setForecastGoal(Math.max(0, Math.min(1, Number(e.target.value) / 100)))}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
            />
          </div>
        </div>

        {/* Day Distribution */}
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Weekly Volume Distribution</h3>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
          Enter the percentage of call volume for each day. Must total 100%.
        </p>
        <div className="flex items-center gap-2 mb-3">
          {pctValid ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm font-semibold ${pctValid ? 'text-green-600' : 'text-red-600'}`}>
            Total: {(totalPct * 100).toFixed(1)}%
          </span>
        </div>

        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 pr-4">Day</th>
                <th className="pb-2 pr-4">% Volume</th>
                <th className="pb-2">Distribution</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d, i) => (
                <tr key={d.name} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2 pr-4 text-sm font-medium text-gray-700 dark:text-gray-300">{d.name}</td>
                  <td className="py-2 pr-4">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={(d.volumePct * 100).toFixed(0)}
                      onChange={e => updateDay(i, 'volumePct', Math.max(0, Number(e.target.value) / 100))}
                      className="w-20 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-2 py-1 text-center text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                    />
                  </td>
                  <td className="py-2">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded transition-all duration-300"
                        style={{ width: `${Math.min(d.volumePct * 400, 100)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Hours of Operation */}
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Hours of Operation</h3>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
          Set daily operating hours. Move slider to 0 for closed days.
        </p>
        <div className="space-y-3">
          {days.map((d, i) => (
            <div key={d.name} className="grid grid-cols-[100px_1fr_50px] items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{d.name}</span>
              <input
                type="range"
                min={0}
                max={24}
                step={1}
                value={d.hours}
                onChange={e => updateDay(i, 'hours', Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <span className="text-sm text-orange-500 dark:text-orange-400 font-semibold text-right">{d.hours}h</span>
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      {!pctValid && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          Day-of-week distribution does not sum to 100%. Results may be inaccurate.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Phone className="w-4 h-4" />} label="Calls / Week" value={result.callsPerWeek.toLocaleString()} color="blue" />
        <StatCard icon={<Phone className="w-4 h-4" />} label="Avg Calls / Day" value={Math.round(result.avgCallsPerDay).toLocaleString()} color="blue" />
        <StatCard icon={<Calendar className="w-4 h-4" />} label="Operating Days" value={String(result.operatingDays)} color="green" />
        <StatCard icon={<Clock className="w-4 h-4" />} label="Weekly Intervals" value={String(result.totalIntervals)} color="amber" />
      </div>

      {/* MIV Result + Goal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-5 border-l-4 border-orange-500">
          <div className="text-sm text-gray-500 dark:text-gray-500 mb-1">Weighted Minimal Interval Variance</div>
          <div className="text-3xl font-bold text-orange-500 dark:text-orange-400">
            {(result.weightedMIV * 100).toFixed(2)}%
          </div>
        </div>
        <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-md p-5 border-l-4 ${goalMet ? 'border-green-500' : 'border-red-500'}`}>
          <div className="text-sm text-gray-500 dark:text-gray-500 mb-1">Target vs Goal</div>
          <div className={`text-xl font-bold flex items-center gap-2 ${goalMet ? 'text-green-600' : 'text-red-600'}`}>
            {goalMet ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {goalMet ? 'Goal Achievable' : 'Goal Too Tight'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Goal: {(result.forecastGoal * 100).toFixed(1)}% | MIV: {(result.weightedMIV * 100).toFixed(2)}% | Delta: {(result.goalDelta * 100).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">MIV by Day of Week</h3>
        <ErrorBoundary>
          <VolumeChart dayResults={result.dayResults} forecastGoal={result.forecastGoal} isDark={isDark} />
        </ErrorBoundary>
      </div>

      {/* Detail Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Detailed Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 pr-4">Day</th>
                <th className="pb-2 pr-4">Daily Calls</th>
                <th className="pb-2 pr-4">Intervals</th>
                <th className="pb-2 pr-4">Calls / Interval</th>
                <th className="pb-2">MIV %</th>
              </tr>
            </thead>
            <tbody>
              {result.dayResults.filter(r => r.dailyCalls > 0).map(r => (
                <tr key={r.day} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2 pr-4 text-sm font-medium text-gray-700 dark:text-gray-300">{r.day}</td>
                  <td className="py-2 pr-4 text-sm text-gray-600 dark:text-gray-400">{Math.round(r.dailyCalls).toLocaleString()}</td>
                  <td className="py-2 pr-4 text-sm text-gray-600 dark:text-gray-400">{r.intervals}</td>
                  <td className="py-2 pr-4 text-sm text-gray-600 dark:text-gray-400">{r.callsPerInterval.toFixed(1)}</td>
                  <td className={`py-2 text-sm font-semibold ${r.mivPct > result.forecastGoal ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {(r.mivPct * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const borderColors: Record<string, string> = {
    blue: 'border-orange-500',
    green: 'border-green-500',
    amber: 'border-amber-500',
    red: 'border-red-500',
  };
  return (
    <div className={`bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md border-l-4 ${borderColors[color]} transition-all hover:shadow-lg`}>
      <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</div>
      <div className="text-sm text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-1">
        {icon} {label}
      </div>
    </div>
  );
}
