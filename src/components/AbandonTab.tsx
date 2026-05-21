import { Target, AlertTriangle } from 'lucide-react';
import { AbandonChart } from './AbandonChart';
import { ErrorBoundary } from './ErrorBoundary';
import type { AbandonSettings, AbandonResult, AbandonStatistics } from '../types/miv';

interface Props {
  settings: AbandonSettings;
  onSettingsChange: (s: AbandonSettings) => void;
  rawData: string;
  setRawData: (d: string) => void;
  onCalculate: (data: string) => void;
  onLoadSample: () => void;
  calcResult: { results: AbandonResult[]; statistics: AbandonStatistics } | null;
  isDark: boolean;
}

export function AbandonTab({
  settings, onSettingsChange,
  rawData, setRawData,
  onCalculate, onLoadSample,
  calcResult, isDark,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          <Target className="w-5 h-5 text-amber-600 dark:text-amber-400 inline mr-2" />
          Abandon Rate MIV Calculator
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border-l-4 border-amber-500">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Target Abandon Rate (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={settings.targetAR}
              onChange={e => onSettingsChange({ ...settings, targetAR: Math.max(0, Number(e.target.value)) })}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
            />
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border-l-4 border-amber-500">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Confidence Level (z-score)
            </label>
            <select
              value={settings.confidenceLevel}
              onChange={e => onSettingsChange({ ...settings, confidenceLevel: Number(e.target.value) })}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
            >
              <option value={1.645}>90% (1.645)</option>
              <option value={1.96}>95% (1.96)</option>
              <option value={2}>~95% (2.0)</option>
              <option value={2.576}>99% (2.576)</option>
            </select>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border-l-4 border-amber-500">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Min Calls for Validity
            </label>
            <input
              type="number"
              min={1}
              step={5}
              value={settings.minCalls}
              onChange={e => onSettingsChange({ ...settings, minCalls: Math.max(1, Number(e.target.value)) })}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
            />
          </div>
        </div>

        {/* Data Input */}
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Interval Data</h3>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
          Enter interval data as "Time, Calls" per line (e.g., "08:00, 124").
        </p>
        <textarea
          value={rawData}
          onChange={e => setRawData(e.target.value)}
          placeholder="08:00, 124&#10;08:30, 156&#10;09:00, 189"
          className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition font-mono text-sm"
        />
        <div className="flex gap-3 mt-3">
          <button
            onClick={onLoadSample}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-all focus:ring-2 focus:ring-orange-500"
          >
            Load Sample Data
          </button>
          <button
            onClick={() => onCalculate(rawData)}
            disabled={!rawData.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-all focus:ring-2 focus:ring-green-500"
          >
            Calculate MIV Bands
          </button>
        </div>

        {/* Formula */}
        <div className="mt-6 bg-gray-50 dark:bg-gray-800 border-l-4 border-red-500 p-4 rounded-r-lg">
          <p className="font-mono text-sm text-gray-700 dark:text-gray-300">
            SE = sqrt( p(1-p) / n )
          </p>
          <p className="font-mono text-sm text-gray-700 dark:text-gray-300">
            MIV = SE x confidence x (1 + buffer)
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            where p = target abandon rate, n = calls per interval, buffer adjusts for volume (20-30%)
          </p>
        </div>
      </div>

      {/* Results */}
      {calcResult && calcResult.results.length > 0 && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md border-l-4 border-orange-500 transition-all hover:shadow-lg">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{calcResult.statistics.totalIntervals}</div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">Total Intervals</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md border-l-4 border-amber-500 transition-all hover:shadow-lg">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{calcResult.statistics.lowVolumeIntervals}</div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">Low Volume Intervals</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md border-l-4 border-green-500 transition-all hover:shadow-lg">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                ±{calcResult.statistics.avgMIV.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">Average MIV</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md border-l-4 border-red-500 transition-all hover:shadow-lg">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                ±{calcResult.statistics.maxMIV.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">Max MIV</div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
            <ErrorBoundary>
              <AbandonChart
                results={calcResult.results}
                targetAR={settings.targetAR}
                isDark={isDark}
              />
            </ErrorBoundary>
          </div>

          {/* Insights */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 rounded-xl shadow-md p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Insights</h3>
            </div>
            <div className="text-blue-100 space-y-2 text-sm">
              <p>
                <strong className="text-white">{calcResult.statistics.lowVolumeIntervals}</strong> of{' '}
                {calcResult.statistics.totalIntervals} intervals have low volume
                (below {settings.minCalls} calls) and require wider tolerance bands.
              </p>
              <p>
                Low-volume intervals average <strong className="text-white">±{
                  calcResult.results.filter(r => r.isLowVolume).length > 0
                    ? (calcResult.results.filter(r => r.isLowVolume).reduce((s, r) => s + r.mivPercent, 0) /
                       calcResult.results.filter(r => r.isLowVolume).length).toFixed(1)
                    : '0'
                }%</strong> MIV vs <strong className="text-white">±{
                  calcResult.results.filter(r => !r.isLowVolume).length > 0
                    ? (calcResult.results.filter(r => !r.isLowVolume).reduce((s, r) => s + r.mivPercent, 0) /
                       calcResult.results.filter(r => !r.isLowVolume).length).toFixed(1)
                    : '0'
                }%</strong> for normal-volume intervals.
              </p>
              <p>
                A flat {settings.targetAR}% abandon target is unrealistic for intervals with fewer
                than ~50 calls. Use MIV bands to set interval-aware thresholds.
              </p>
            </div>
          </div>
        </>
      )}

      {(!calcResult || calcResult.results.length === 0) && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Ready to Analyze</h3>
          <p className="text-gray-500 dark:text-gray-500">
            Enter your interval call volume data above or load sample data to calculate
            abandon rate MIV bands.
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
        <h4 className="font-semibold text-amber-800 dark:text-amber-400 text-sm mb-2">Important Disclaimer</h4>
        <p className="text-amber-700 dark:text-amber-500 text-xs leading-relaxed">
          Abandon rates are fundamentally <strong>behavioral</strong> — they reflect caller
          patience, IVR design, queue messaging, callback offerings, and staffing decisions,
          not just statistical variance. Unlike volume forecasting (which follows a deterministic
          Poisson process), abandon behavior introduces additional variability that cannot be
          fully captured by statistical models alone. This tool applies Minimal Interval Variance
          concepts to abandon rates as a <strong>prototype demonstration</strong> of how
          interval-aware targets could improve on flat thresholds. The MIV bands shown here
          represent the <em>statistical component</em> of abandon rate variance — actual
          abandon rates will be influenced by operational factors beyond what this model captures.
          Use these results as a starting point for discussion, not as definitive targets.
        </p>
      </div>
    </div>
  );
}
