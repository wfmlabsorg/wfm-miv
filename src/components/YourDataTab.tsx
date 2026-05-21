import { useState, useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';
import { calculateVolumeMIV, parseIntervalData } from '../utils/mivCalculator';
import { IntervalChart } from './IntervalChart';
import { ErrorBoundary } from './ErrorBoundary';

const SAMPLE_VOLUME = `06:00, 45
06:30, 78
07:00, 134
07:30, 198
08:00, 267
08:30, 312
09:00, 389
09:30, 423
10:00, 456
10:30, 478
11:00, 501
11:30, 489
12:00, 467
12:30, 445
13:00, 423
13:30, 401
14:00, 378
14:30, 356
15:00, 312
15:30, 267
16:00, 198
16:30, 145
17:00, 98
17:30, 67
18:00, 34
18:30, 18`;

const SAMPLE_SMALL_CENTER = `08:00, 12
08:30, 18
09:00, 24
09:30, 31
10:00, 37
10:30, 42
11:00, 45
11:30, 43
12:00, 38
12:30, 35
13:00, 32
13:30, 28
14:00, 23
14:30, 18
15:00, 14
15:30, 9
16:00, 5`;

interface IntervalResult {
  time: string;
  calls: number;
  mivPct: number;
}

export function YourDataTab({ forecastGoal, isDark }: { forecastGoal: number; isDark: boolean }) {
  const [rawData, setRawData] = useState('');
  const [results, setResults] = useState<IntervalResult[]>([]);

  const calculate = useCallback((data: string) => {
    const intervals = parseIntervalData(data);
    if (intervals.length === 0) return;
    const computed = intervals.map(iv => ({
      time: iv.time,
      calls: iv.calls,
      mivPct: calculateVolumeMIV(iv.calls),
    }));
    setResults(computed);
  }, []);

  const handleLoadSample = (sample: string) => {
    setRawData(sample);
    calculate(sample);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setRawData(text);
      calculate(text);
    };
    reader.readAsText(file);
  };

  const totalCalls = results.reduce((s, r) => s + r.calls, 0);
  const avgMIV = results.length > 0
    ? results.reduce((s, r) => s + r.mivPct, 0) / results.length
    : 0;
  const maxMIV = results.length > 0 ? Math.max(...results.map(r => r.mivPct)) : 0;
  const minMIV = results.length > 0 ? Math.min(...results.map(r => r.mivPct)) : 0;

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          <Upload className="w-5 h-5 text-teal-600 dark:text-teal-400 inline mr-2" />
          Analyze Your Own Data
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
          Upload or paste your interval-level call volume data to see the MIV for each
          interval. Format: one line per interval as <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-sm">Time, Calls</code> (e.g., "08:00, 124").
        </p>

        {/* Sample buttons */}
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={() => handleLoadSample(SAMPLE_VOLUME)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-all focus:ring-2 focus:ring-orange-500 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Sample: Large Center (6k/day)
          </button>
          <button
            onClick={() => handleLoadSample(SAMPLE_SMALL_CENTER)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all focus:ring-2 focus:ring-indigo-500 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Sample: Small Center (500/day)
          </button>
          <label className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload CSV
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        <textarea
          value={rawData}
          onChange={e => setRawData(e.target.value)}
          placeholder="08:00, 124&#10;08:30, 156&#10;09:00, 189&#10;..."
          className="w-full h-40 p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition font-mono text-sm"
        />
        <button
          onClick={() => calculate(rawData)}
          disabled={!rawData.trim()}
          className="mt-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white px-6 py-2 rounded-md text-sm font-medium transition-all focus:ring-2 focus:ring-green-500"
        >
          Calculate MIV
        </button>
      </div>

      {results.length > 0 && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md border-l-4 border-orange-500 transition-all hover:shadow-lg">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{totalCalls.toLocaleString()}</div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">Total Calls</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md border-l-4 border-green-500 transition-all hover:shadow-lg">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{(avgMIV * 100).toFixed(2)}%</div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">Avg MIV</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md border-l-4 border-red-500 transition-all hover:shadow-lg">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{(maxMIV * 100).toFixed(2)}%</div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">Max MIV</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md border-l-4 border-amber-500 transition-all hover:shadow-lg">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{(minMIV * 100).toFixed(2)}%</div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">Min MIV</div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Your Data — MIV by Interval</h3>
            <ErrorBoundary>
              <IntervalChart intervals={results} forecastGoal={forecastGoal} isDark={isDark} />
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
                    <th className="pb-2 pr-4">% of Total</th>
                    <th className="pb-2">MIV %</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.time} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-1.5 pr-4 text-sm font-medium text-gray-700 dark:text-gray-300">{r.time}</td>
                      <td className="py-1.5 pr-4 text-sm text-gray-600 dark:text-gray-400">{r.calls.toLocaleString()}</td>
                      <td className="py-1.5 pr-4 text-sm text-gray-600 dark:text-gray-400">
                        {totalCalls > 0 ? ((r.calls / totalCalls) * 100).toFixed(1) : '0'}%
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

      {results.length === 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Upload or Paste Your Data</h3>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            Load a sample dataset above to see it in action, or paste your own interval-level
            call volumes. CSV files should have two columns: Time and Calls.
          </p>
        </div>
      )}
    </div>
  );
}
