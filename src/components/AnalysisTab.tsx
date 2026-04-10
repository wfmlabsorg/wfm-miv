import { CheckCircle, AlertTriangle, Phone, Calendar, Clock, BarChart3 } from 'lucide-react';
import { MIVChart } from './MIVChart';
import type { MIVSummary } from '../types/miv';

interface Props {
  result: MIVSummary;
  pctValid: boolean;
}

export function AnalysisTab({ result, pctValid }: Props) {
  const goalMet = result.goalDelta <= 0;

  return (
    <div className="space-y-6">
      {!pctValid && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          Day-of-week distribution does not sum to 100%. Results may be
          inaccurate.
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={<Phone className="w-5 h-5" />}
          label="Calls / Week"
          value={result.callsPerWeek.toLocaleString()}
        />
        <StatCard
          icon={<Phone className="w-5 h-5" />}
          label="Avg Calls / Day"
          value={Math.round(result.avgCallsPerDay).toLocaleString()}
        />
        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          label="Operating Days"
          value={String(result.operatingDays)}
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Weekly Intervals"
          value={String(result.totalIntervals)}
        />
        <div className="bg-gradient-to-br from-blue-900/50 to-slate-800 border border-blue-500/30 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
              Minimal Interval Variance
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {(result.weightedMIV * 100).toFixed(2)}%
          </div>
        </div>
        <div
          className={`rounded-xl p-4 text-center border ${
            goalMet
              ? 'border-green-500/30 bg-green-900/20'
              : 'border-orange-500/30 bg-orange-900/20'
          }`}
        >
          <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
            Target vs Goal
          </span>
          <div
            className={`flex items-center justify-center gap-2 mt-1 text-lg font-bold ${
              goalMet ? 'text-green-400' : 'text-orange-400'
            }`}
          >
            {goalMet ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            {goalMet ? 'Goal Achievable' : 'Goal Too Tight'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Goal: {(result.forecastGoal * 100).toFixed(1)}% | MIV:{' '}
            {(result.weightedMIV * 100).toFixed(2)}% | Delta:{' '}
            {(result.goalDelta * 100).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-blue-400 mb-4">
          MIV by Day of Week
        </h2>
        <MIVChart
          dayResults={result.dayResults}
          forecastGoal={result.forecastGoal}
        />
      </div>

      {/* Detail Table */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-blue-400 mb-4">
          Detailed Breakdown
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-700">
                <th className="pb-3 pr-4">Day</th>
                <th className="pb-3 pr-4">Daily Calls</th>
                <th className="pb-3 pr-4">Intervals</th>
                <th className="pb-3 pr-4">Calls / Interval</th>
                <th className="pb-3">MIV %</th>
              </tr>
            </thead>
            <tbody>
              {result.dayResults
                .filter(r => r.dailyCalls > 0)
                .map(r => (
                  <tr
                    key={r.day}
                    className="border-b border-slate-700/50"
                  >
                    <td className="py-3 pr-4 text-sm font-medium">{r.day}</td>
                    <td className="py-3 pr-4 text-sm">
                      {Math.round(r.dailyCalls).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-sm">{r.intervals}</td>
                    <td className="py-3 pr-4 text-sm">
                      {r.callsPerInterval.toFixed(1)}
                    </td>
                    <td
                      className={`py-3 text-sm font-semibold ${
                        r.mivPct > result.forecastGoal
                          ? 'text-orange-400'
                          : 'text-green-400'
                      }`}
                    >
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

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 text-center">
      <div className="flex items-center justify-center gap-2 mb-1">
        <span className="text-slate-500">{icon}</span>
        <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
          {label}
        </span>
      </div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
