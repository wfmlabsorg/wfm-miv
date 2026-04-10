import { CheckCircle, XCircle } from 'lucide-react';
import type { DayConfig } from '../types/miv';

interface Props {
  callsPerWeek: number;
  setCallsPerWeek: (v: number) => void;
  forecastGoal: number;
  setForecastGoal: (v: number) => void;
  days: DayConfig[];
  updateDay: (idx: number, field: keyof DayConfig, val: number) => void;
  totalPct: number;
  pctValid: boolean;
}

export function InputsTab({
  callsPerWeek,
  setCallsPerWeek,
  forecastGoal,
  setForecastGoal,
  days,
  updateDay,
  totalPct,
  pctValid,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Volume & Goal */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-blue-400 mb-4">
          Weekly Volume & Forecast Goal
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <label className="block">
            <span className="text-sm text-slate-400 font-medium">
              Calls Per Week
            </span>
            <input
              type="number"
              min={0}
              step={1000}
              value={callsPerWeek}
              onChange={e =>
                setCallsPerWeek(Math.max(0, Number(e.target.value)))
              }
              className="mt-1 block w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-400 font-medium">
              Forecast Accuracy Goal (%)
            </span>
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={(forecastGoal * 100).toFixed(1)}
              onChange={e =>
                setForecastGoal(
                  Math.max(0, Math.min(1, Number(e.target.value) / 100))
                )
              }
              className="mt-1 block w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition"
            />
          </label>
        </div>
      </div>

      {/* Day of Week Distribution */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-blue-400 mb-2">
          Weekly Volume Distribution
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Enter the percentage of call volume for each day of the week. Ensure
          allocations add up to 100%.
        </p>
        <div className="flex items-center gap-2 mb-4">
          {pctValid ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <XCircle className="w-5 h-5 text-red-400" />
          )}
          <span
            className={`font-semibold ${pctValid ? 'text-green-400' : 'text-red-400'}`}
          >
            Total: {(totalPct * 100).toFixed(1)}%
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-700">
                <th className="pb-2 pr-4">Day</th>
                <th className="pb-2 pr-4">% Volume</th>
                <th className="pb-2">Distribution</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d, i) => (
                <tr key={d.name} className="border-b border-slate-700/50">
                  <td className="py-2 pr-4 text-sm font-medium">{d.name}</td>
                  <td className="py-2 pr-4">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={(d.volumePct * 100).toFixed(0)}
                      onChange={e =>
                        updateDay(
                          i,
                          'volumePct',
                          Math.max(0, Number(e.target.value) / 100)
                        )
                      }
                      className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </td>
                  <td className="py-2">
                    <div className="bg-slate-900 rounded h-5 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded transition-all duration-300"
                        style={{ width: `${Math.min(d.volumePct * 400, 100)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hours of Operation */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-blue-400 mb-2">
          Hours of Operation
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Indicate how many hours you are open each day. Move the slider to 0
          for days the business is closed.
        </p>
        <div className="space-y-3">
          {days.map((d, i) => (
            <div
              key={d.name}
              className="grid grid-cols-[100px_1fr_50px] items-center gap-4"
            >
              <span className="text-sm font-medium">{d.name}</span>
              <input
                type="range"
                min={0}
                max={24}
                step={1}
                value={d.hours}
                onChange={e => updateDay(i, 'hours', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-sm text-blue-400 font-semibold text-right">
                {d.hours}h
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
