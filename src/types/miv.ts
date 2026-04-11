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

// Abandon Rate MIV types
export interface IntervalData {
  time: string;
  calls: number;
}

export interface AbandonResult {
  time: string;
  calls: number;
  mivPercent: number;
  upperBound: number;
  lowerBound: number;
  isLowVolume: boolean;
  operationalBuffer: number;
}

export interface AbandonSettings {
  targetAR: number;
  confidenceLevel: number;
  minCalls: number;
}

export interface AbandonStatistics {
  totalIntervals: number;
  lowVolumeIntervals: number;
  avgMIV: number;
  maxMIV: number;
}
