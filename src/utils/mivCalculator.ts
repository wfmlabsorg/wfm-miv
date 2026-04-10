import type { DayConfig, DayResult, MIVSummary } from '../types/miv';

const INTERVAL_MINUTES = 30;

/**
 * MIV = sqrt(2 / (calls_per_interval * PI))
 *
 * For a Poisson arrival process, the coefficient of variation at the
 * interval level represents the minimum variance that cannot be
 * forecasted away. Smaller intervals with fewer calls will always
 * have higher percentage variance.
 */
export function calculateMIV(callsPerInterval: number): number {
  if (callsPerInterval <= 0) return 0;
  return Math.sqrt(2 / (callsPerInterval * Math.PI));
}

export function computeMIVAnalysis(
  callsPerWeek: number,
  forecastGoal: number,
  days: DayConfig[]
): MIVSummary {
  const activeDays = days.filter(d => d.volumePct > 0 && d.hours > 0);
  const operatingDays = activeDays.length;

  const dayResults: DayResult[] = days.map(day => {
    const dailyCalls = callsPerWeek * day.volumePct;
    const intervals = (day.hours * 60) / INTERVAL_MINUTES;
    const callsPerInterval = intervals > 0 ? dailyCalls / intervals : 0;
    const mivPct = calculateMIV(callsPerInterval);

    return {
      day: day.name,
      dailyCalls,
      intervals,
      callsPerInterval,
      mivPct,
    };
  });

  const totalVolPct = days.reduce((s, d) => s + d.volumePct, 0);
  const weightedMIV =
    totalVolPct > 0
      ? days.reduce(
          (sum, day, i) =>
            sum + (day.volumePct / totalVolPct) * dayResults[i].mivPct,
          0
        )
      : 0;

  const totalIntervals = days.reduce(
    (s, d) => s + (d.hours * 60) / INTERVAL_MINUTES,
    0
  );

  const avgCallsPerDay =
    operatingDays > 0 ? callsPerWeek / operatingDays : 0;

  return {
    callsPerWeek,
    operatingDays,
    totalIntervals,
    avgCallsPerDay,
    weightedMIV,
    forecastGoal,
    goalDelta: weightedMIV - forecastGoal,
    dayResults,
  };
}

export const DEFAULT_DAYS: DayConfig[] = [
  { name: 'Sunday', volumePct: 0.04, hours: 8 },
  { name: 'Monday', volumePct: 0.23, hours: 16 },
  { name: 'Tuesday', volumePct: 0.18, hours: 16 },
  { name: 'Wednesday', volumePct: 0.14, hours: 16 },
  { name: 'Thursday', volumePct: 0.15, hours: 16 },
  { name: 'Friday', volumePct: 0.19, hours: 16 },
  { name: 'Saturday', volumePct: 0.07, hours: 8 },
];

export const DEFAULT_CALLS_PER_WEEK = 52000;
export const DEFAULT_FORECAST_GOAL = 0.05;
