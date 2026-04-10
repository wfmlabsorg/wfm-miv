export interface DayConfig {
  name: string;
  volumePct: number;
  hours: number;
}

export interface DayResult {
  day: string;
  dailyCalls: number;
  intervals: number;
  callsPerInterval: number;
  mivPct: number;
}

export interface MIVSummary {
  callsPerWeek: number;
  operatingDays: number;
  totalIntervals: number;
  avgCallsPerDay: number;
  weightedMIV: number;
  forecastGoal: number;
  goalDelta: number;
  dayResults: DayResult[];
}
