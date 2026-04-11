/**
 * Generate a bell-curve-like intraday call distribution.
 * Mimics the Squirrel 365 model: heavier arrivals in the middle of the day,
 * tails at open and close.
 */
export function generateIntradayDistribution(
  dailyCalls: number,
  hoursOpen: number,
  startHour: number = 8
): { time: string; calls: number }[] {
  if (hoursOpen <= 0 || dailyCalls <= 0) return [];

  const intervalsPerHour = 2; // 30-minute intervals
  const totalIntervals = hoursOpen * intervalsPerHour;
  const midpoint = totalIntervals / 2;

  // Generate bell-curve weights using a simplified normal-like shape
  const weights: number[] = [];
  for (let i = 0; i < totalIntervals; i++) {
    // Normalized distance from center (-1 to 1)
    const x = (i - midpoint + 0.5) / midpoint;
    // Bell curve: peaks at center, drops toward edges
    const w = Math.exp(-2 * x * x);
    weights.push(w);
  }

  const totalWeight = weights.reduce((s, w) => s + w, 0);
  const intervals: { time: string; calls: number }[] = [];

  for (let i = 0; i < totalIntervals; i++) {
    const hour = startHour + Math.floor(i / intervalsPerHour);
    const min = (i % intervalsPerHour) * 30;
    const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
    const calls = Math.round((weights[i] / totalWeight) * dailyCalls);
    intervals.push({ time, calls });
  }

  // Adjust rounding error on the peak interval
  const totalAssigned = intervals.reduce((s, iv) => s + iv.calls, 0);
  const diff = dailyCalls - totalAssigned;
  if (diff !== 0 && intervals.length > 0) {
    const peakIdx = Math.floor(intervals.length / 2);
    intervals[peakIdx].calls += diff;
  }

  return intervals;
}

/**
 * Generate a flat (uniform) intraday distribution — equal calls per interval.
 */
export function generateFlatDistribution(
  dailyCalls: number,
  hoursOpen: number,
  startHour: number = 8
): { time: string; calls: number }[] {
  if (hoursOpen <= 0 || dailyCalls <= 0) return [];

  const totalIntervals = hoursOpen * 2;
  const callsPerInterval = Math.round(dailyCalls / totalIntervals);
  const intervals: { time: string; calls: number }[] = [];

  for (let i = 0; i < totalIntervals; i++) {
    const hour = startHour + Math.floor(i / 2);
    const min = (i % 2) * 30;
    const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
    intervals.push({ time, calls: callsPerInterval });
  }

  return intervals;
}
