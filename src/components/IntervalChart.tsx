import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  LineController,
  BarController,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, BarController,
  LineElement, LineController, PointElement, Title, Tooltip, Legend
);

interface Props {
  intervals: { time: string; calls: number; mivPct: number }[];
  forecastGoal: number;
  isDark?: boolean;
}

export function IntervalChart({ intervals, forecastGoal, isDark = false }: Props) {
  const goalPct = forecastGoal * 100;
  const textColor = isDark ? '#d1d5db' : '#374151';
  const gridColor = isDark ? 'rgba(75, 85, 99, 0.5)' : 'rgba(0, 0, 0, 0.1)';

  const chartData = useMemo(() => ({
    labels: intervals.map(iv => iv.time),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Call Volume',
        data: intervals.map(iv => iv.calls),
        backgroundColor: isDark ? 'rgba(129, 140, 248, 0.3)' : 'rgba(99, 102, 241, 0.3)',
        borderColor: isDark ? 'rgba(129, 140, 248, 0.8)' : 'rgba(99, 102, 241, 0.8)',
        borderWidth: 1,
        yAxisID: 'y1',
        order: 2,
      },
      {
        type: 'line' as const,
        label: 'MIV %',
        data: intervals.map(iv => +(iv.mivPct * 100).toFixed(2)),
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        pointRadius: 3,
        pointBackgroundColor: intervals.map(iv =>
          iv.mivPct * 100 > goalPct ? '#e74c3c' : '#27ae60'
        ),
        tension: 0.3,
        fill: true,
        yAxisID: 'y',
        order: 1,
      },
      {
        type: 'line' as const,
        label: `Goal: ${goalPct.toFixed(1)}%`,
        data: Array(intervals.length).fill(goalPct),
        borderColor: '#3498db',
        borderDash: [5, 5],
        pointRadius: 0,
        borderWidth: 2,
        yAxisID: 'y',
        order: 0,
      },
    ],
  }), [intervals, goalPct, isDark]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    animation: { duration: 750 },
    plugins: {
      title: {
        display: true,
        text: 'Intraday MIV % and Call Volume by Interval',
        font: { size: 14 },
        color: textColor,
      },
      legend: {
        display: true,
        labels: { color: textColor },
      },
      tooltip: {
        callbacks: {
          afterBody: (context: { dataIndex: number }[]) => {
            const idx = context[0]?.dataIndex;
            if (idx !== undefined) {
              const iv = intervals[idx];
              return [`MIV: ${(iv.mivPct * 100).toFixed(2)}%`, `Calls: ${iv.calls}`];
            }
            return [];
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Interval', color: textColor },
        ticks: { color: textColor },
        grid: { color: gridColor },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: { display: true, text: 'MIV %', color: '#e74c3c' },
        ticks: { color: textColor },
        grid: { color: gridColor },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: { display: true, text: 'Call Volume', color: isDark ? '#818cf8' : '#6366f1' },
        ticks: { color: textColor },
        grid: { drawOnChartArea: false },
      },
    },
  }), [intervals, goalPct, textColor, gridColor, isDark]);

  return (
    <div className="h-[450px]">
      <Chart type="bar" data={chartData} options={options} />
    </div>
  );
}
