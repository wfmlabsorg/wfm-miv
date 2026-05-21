import { useState, useMemo } from 'react';
import { Clock } from 'lucide-react';
import { calculateVolumeMIV } from '../utils/mivCalculator';
import { generateIntradayDistribution, generateFlatDistribution } from '../utils/intradayDistribution';
import { IntervalChart } from './IntervalChart';
import { ErrorBoundary } from './ErrorBoundary';

interface Props {
  callsPerWeek: number;
  days: { name: string; volumePct: number; hours: number }[];
  forecastGoal: number;
  isDark: boolean;
}

type DistShape = 'bell' | 'flat';

export function IntervalTab({ callsPerWeek, days, forecastGoal, isDark }: Props) {
  const activeDays = days.filter(d => d.volumePct > 0 && d.hours > 0);
  const [selectedDay, setSelectedDay] = useState(activeDays.length > 1 ? activeDays[1].name : activeDays[0]?.name ?? 'Monday');
  const [startHour, setStartHour] = useState(8);
  const [distShape, setDistShape] = useState<DistShape>('bell');

  const day = days.find(d => d.name === selectedDay);
  const dailyCalls = day ? callsPerWeek * day.volumePct : 0;
  const hoursOpen = day?.hours ?? 0;

  const intervals = useMemo(() => {
    const gen = distShape === 'bell' ? generateIntradayDistribution : generateFlatDistribution;
    return gen(dailyCalls, hoursOpen, startHour);
  }, [dailyCalls, hoursOpen, startHour, distShape]);

  const intervalResults = useMemo(() =>
    intervals.map(iv => ({
      ...iv,
      mivPct: calculateVolumeMIV(iv.calls),
    })),
    [intervals]
  );

  const avgMIV = intervalResults.length > 0
    ? intervalResults.reduce((s, r) => s + r.mivPct, 0) / intervalResults.length
    : 0;
  const maxMIV = intervalResults.length > 0
    ? Math.max(...intervalResults.map(r => r.mivPct))
    : 0;
  const minMIV = intervalResults.length > 0
    ? Math.min(...intervalResults.map(r => r.mivPct))
    : 0;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          <Clock className="w-5 h-5 text-orange-500 dark:text-orange-400 inline mr-2" />
          Interval-Level MIV View
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
          See how MIV varies across 30-minute intervals within a single day. Lower-volume
          intervals (early/late) show significantly higher variance than peak intervals.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border-l-4 border-orange-500">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Day</label>
            <select
              value={selectedDay}
              onChange={e => setSelectedDay(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
            >
              {activeDays.map(d => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border-l-4 border-orange-500">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Start Hour</label>
            <select
              value={startHour}
              onChange={e => setStartHour(Number(e.target.value))}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{`${i.toString().padStart(2, '0')}:00`}</option>
              ))}
            </select>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border-l-4 border-orange-500">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Distribution Shape</label>
            <select
              value={distShape}
              onChange={e => setDistShape(e.target.value as DistShape)}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
            >
              <option value="bell">Bell Curve (realistic)</option>
              <option value="flat">Flat (uniform)</option>
            </select>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border-l-4 border-orange-500">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Daily Calls</label>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{Math.round(dailyCalls).toLocaleString()}</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">{hoursOpen}h / {hoursOpen * 2} intervals</div>
          </div>
        </div>
      </div>

      {intervals.length > 0 && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md border-l-4 border-orange-500 transition-all hover:shadow-lg">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{intervals.length}</div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">Intervals</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md border-l-4 border-green-500 transition-all hover:shadow-lg">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{(avgMIV * 100).toFixed(2)}%</div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">Avg MIV</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md border-l-4 border-red-500 transition-all hover:shadow-lg">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{(maxMIV * 100).toFixed(2)}%</div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">Max MIV (tail intervals)</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md border-l-4 border-amber-500 transition-all hover:shadow-lg">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{(minMIV * 100).toFixed(2)}%</div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">Min MIV (peak intervals)</div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
              {selectedDay} — Intraday MIV by Interval
            </h3>
            <ErrorBoundary>
              <IntervalChart
                intervals={intervalResults}
                forecastGoal={forecastGoal}
                isDark={isDark}
              />
            </ErrorBoundary>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Interval Detail</h3>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-white dark:bg-gray-900">
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-2 pr-4">Time</th>
                    <th className="pb-2 pr-4">Calls</th>
                    <th className="pb-2 pr-4">% of Daily</th>
                    <th className="pb-2">MIV %</th>
                  </tr>
                </thead>
                <tbody>
                  {intervalResults.map(r => (
                    <tr key={r.time} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-1.5 pr-4 text-sm font-medium text-gray-700 dark:text-gray-300">{r.time}</td>
                      <td className="py-1.5 pr-4 text-sm text-gray-600 dark:text-gray-400">{r.calls.toLocaleString()}</td>
                      <td className="py-1.5 pr-4 text-sm text-gray-600 dark:text-gray-400">
                        {dailyCalls > 0 ? ((r.calls / dailyCalls) * 100).toFixed(1) : '0'}%
                      </td>
                      <td className={`py-1.5 text-sm font-semibold ${r.mivPct > forecastGoal ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {(r.mivPct * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
