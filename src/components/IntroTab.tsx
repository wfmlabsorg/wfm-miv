import { Info } from 'lucide-react';

export function IntroTab() {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <Info className="w-6 h-6 text-blue-400 mt-0.5 flex-shrink-0" />
          <h2 className="text-xl font-semibold text-blue-400">
            What is Minimal Interval Variance?
          </h2>
        </div>
        <div className="space-y-4 text-slate-300">
          <p>
            When we break contact center data down to the lowest level interval
            (using 30 minutes for our analysis), we encounter a{' '}
            <span className="font-semibold text-white">
              Minimal Interval Variance
            </span>{' '}
            (MIV). This variance{' '}
            <em className="text-orange-300">cannot</em> be forecasted
            away, and should be leveraged to understand the minimum variance
            inherent in any forecast.
          </p>
          <p>
            This application demonstrates how forecast accuracy goals should
            consider:
          </p>
          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li>
              The <span className="font-semibold text-white">size</span> of
              your organization (calls offered per week)
            </li>
            <li>
              How widely or narrowly calls are{' '}
              <span className="font-semibold text-white">distributed</span>{' '}
              across the week
            </li>
            <li>
              The{' '}
              <span className="font-semibold text-white">
                hours of operation
              </span>{' '}
              across each day
            </li>
          </ol>
          <p>
            The underlying math uses the relationship between call volume and
            statistical variance: for a given call rate, the coefficient of
            variation at the interval level is{' '}
            <code className="bg-slate-900 px-2 py-0.5 rounded text-blue-300 text-sm">
              MIV = sqrt(2 / (calls_per_interval x PI))
            </code>
            . Smaller intervals with fewer calls will always have higher
            percentage variance — this is a mathematical certainty, not a
            forecasting failure.
          </p>
        </div>
      </div>

      <div className="bg-slate-800/50 border-l-4 border-blue-500 rounded-r-xl p-5">
        <h3 className="font-semibold text-white mb-3">Getting Started</h3>
        <div className="space-y-2 text-slate-300 text-sm">
          <p>
            <span className="font-semibold text-blue-400">Step 1:</span> Go to
            the <span className="font-semibold text-white">Inputs</span> tab
            and enter your weekly call volume.
          </p>
          <p>
            <span className="font-semibold text-blue-400">Step 2:</span> Adjust
            the day-of-week distribution and hours of operation.
          </p>
          <p>
            <span className="font-semibold text-blue-400">Step 3:</span> View
            your results on the{' '}
            <span className="font-semibold text-white">Analysis</span> tab.
          </p>
        </div>
      </div>
    </div>
  );
}
