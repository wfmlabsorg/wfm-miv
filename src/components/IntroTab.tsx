import { TrendingUp, Target, AlertTriangle } from 'lucide-react';

export function IntroTab() {
  return (
    <div className="space-y-6">
      {/* What is MIV */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          What is Minimal Interval Variance?
        </h2>
        <div className="space-y-3 text-gray-600">
          <p>
            When we analyze contact center data at the interval level (typically 30 minutes),
            every metric exhibits a <strong className="text-gray-800">Minimal Interval Variance</strong> (MIV)
            — a statistical floor of variability that <em>cannot</em> be eliminated through
            better forecasting or management.
          </p>
          <p>
            Setting performance targets tighter than the MIV creates unachievable goals
            and masks real performance issues with statistical noise.
          </p>
        </div>
      </div>

      {/* Two Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Volume MIV</h3>
          </div>
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded mb-3">
            Deterministic
          </span>
          <p className="text-gray-600 text-sm mb-3">
            Call arrivals follow a <strong>Poisson process</strong>. The variance is purely
            mathematical — given a call rate, the minimum percentage variation at the interval
            level is fixed:
          </p>
          <div className="bg-gray-50 border-l-4 border-blue-400 p-3 font-mono text-sm text-gray-700">
            MIV = sqrt(2 / (calls_per_interval x PI))
          </div>
          <p className="text-gray-500 text-sm mt-3">
            Use this to set <strong>forecast accuracy goals</strong> that account for
            organization size and operating hours.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-amber-500">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-gray-800">Abandon Rate MIV</h3>
          </div>
          <span className="inline-block bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded mb-3">
            Behavioral
          </span>
          <p className="text-gray-600 text-sm mb-3">
            Abandon rates involve <strong>human behavior</strong> on top of statistical
            variance. The standard error of a proportion creates interval-specific
            confidence bands:
          </p>
          <div className="bg-gray-50 border-l-4 border-amber-400 p-3 font-mono text-sm text-gray-700">
            MIV = sqrt(p(1-p)/n) x confidence x (1 + buffer)
          </div>
          <p className="text-gray-500 text-sm mt-3">
            Use this to set <strong>abandon rate targets</strong> that adjust dynamically
            based on call volume per interval.
          </p>
        </div>
      </div>

      {/* Key Insight */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md p-6 text-white">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Why This Matters</h3>
        </div>
        <p className="text-blue-100">
          Contact centers commonly set a single flat target (e.g., "5% forecast accuracy"
          or "3% abandon rate") across all intervals. But low-volume intervals —
          early morning, late evening, weekends — have inherently higher variance.
          Holding them to the same standard as peak hours creates false failures
          and wasted investigation.
        </p>
        <p className="text-blue-100 mt-3">
          MIV provides the <strong className="text-white">mathematically-grounded floor</strong> —
          the starting point for realistic, interval-aware targets.
        </p>
      </div>

      {/* Getting Started */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-semibold text-gray-800 mb-3">Getting Started</h3>
        <div className="space-y-2 text-gray-600 text-sm">
          <p>
            <span className="font-semibold text-blue-600">Volume MIV tab:</span> Enter
            your weekly call volume, day-of-week distribution, and hours of operation to
            calculate the minimum forecast variance by day.
          </p>
          <p>
            <span className="font-semibold text-amber-600">Abandon Rate MIV tab:</span> Enter
            interval-level call volumes (or load sample data) to see how abandon rate
            targets should flex based on volume per interval.
          </p>
        </div>
      </div>
    </div>
  );
}
