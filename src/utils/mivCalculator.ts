import type { DayConfig, DayResult, MIVSummary, IntervalData, AbandonResult, AbandonSettings, AbandonStatistics } from '../types/miv';

const INTERVAL_MINUTES = 30;

// ─── Volume MIV ─────────────────────────────────────────────
// Deterministic: based on Poisson arrival process
// MIV = sqrt(2 / (calls_per_interval * PI))

export function calculateVolumeMIV(callsPerInterval: number): number {
  if (callsPerInterval <= 0) return 0;
  return Math.sqrt(2 / (callsPerInterval * Math.PI));
}

export function computeVolumeMIV(
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
    const mivPct = calculateVolumeMIV(callsPerInterval);
    return { day: day.name, dailyCalls, intervals, callsPerInterval, mivPct };
  });

  const totalVolPct = days.reduce((s, d) => s + d.volumePct, 0);
  const weightedMIV =
    totalVolPct > 0
      ? days.reduce((sum, day, i) => sum + (day.volumePct / totalVolPct) * dayResults[i].mivPct, 0)
      : 0;

  const totalIntervals = days.reduce((s, d) => s + (d.hours * 60) / INTERVAL_MINUTES, 0);
  const avgCallsPerDay = operatingDays > 0 ? callsPerWeek / operatingDays : 0;

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

// ─── Abandon Rate MIV ───────────────────────────────────────
// Behavioral: based on binomial proportion standard error
// SE = sqrt(p(1-p)/n), MIV = SE * confidence * (1 + buffer)

export function calculateAbandonMIV(
  intervals: IntervalData[],
  settings: AbandonSettings
): { results: AbandonResult[]; statistics: AbandonStatistics } {
  const { targetAR, confidenceLevel, minCalls } = settings;
  const targetARDecimal = targetAR / 100;

  const results = intervals.map(interval => {
    const calls = interval.calls;
    const isLowVolume = calls < minCalls;

    let operationalBuffer = 0.20;
    if (calls < 25) operationalBuffer = 0.30;
    else if (calls < 100) operationalBuffer = 0.25;

    const standardError = Math.sqrt((targetARDecimal * (1 - targetARDecimal)) / Math.max(calls, 1));
    const mivDecimal = standardError * confidenceLevel * (1 + operationalBuffer);
    const mivPercent = mivDecimal * 100;

    const upperBound = targetAR + mivPercent;
    const lowerBound = Math.max(0, targetAR - mivPercent);

    return {
      time: interval.time,
      calls,
      mivPercent,
      upperBound,
      lowerBound,
      isLowVolume,
      operationalBuffer: operationalBuffer * 100,
    };
  });

  const lowVolumeCount = results.filter(r => r.isLowVolume).length;
  const avgMIV = results.length > 0
    ? results.reduce((sum, r) => sum + r.mivPercent, 0) / results.length
    : 0;
  const maxMIV = results.length > 0 ? Math.max(...results.map(r => r.mivPercent)) : 0;

  return {
    results,
    statistics: {
      totalIntervals: results.length,
      lowVolumeIntervals: lowVolumeCount,
      avgMIV,
      maxMIV,
    },
  };
}

export function parseIntervalData(rawData: string): IntervalData[] {
  return rawData
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      const [time, callsStr] = line.split(',').map(s => s.trim());
      const calls = parseInt(callsStr);
      return time && !isNaN(calls) ? { time, calls } : null;
    })
    .filter((d): d is IntervalData => d !== null);
}

export const SAMPLE_INTERVAL_DATA = `06:00, 3
06:30, 5
07:00, 17
07:30, 45
08:00, 68
08:30, 89
09:00, 124
09:30, 156
10:00, 189
10:30, 234
11:00, 267
11:30, 289
12:00, 312
12:30, 298
13:00, 276
13:30, 245
14:00, 223
14:30, 198
15:00, 167
15:30, 134
16:00, 98
16:30, 67
17:00, 43
17:30, 28
18:00, 15
18:30, 8
19:00, 4
19:30, 2`;

// ─── Defaults ────────────────────────────────────────────────

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
