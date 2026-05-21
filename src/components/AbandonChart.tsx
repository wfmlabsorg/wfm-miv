import { useMemo, useRef, useEffect } from 'react';
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
  Filler,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import type { AbandonResult } from '../types/miv';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, BarController,
  LineElement, LineController, PointElement, Title, Tooltip, Legend, Filler
);

interface Props {
  results: AbandonResult[];
  targetAR: number;
  isDark?: boolean;
}

export function AbandonChart({ results, targetAR, isDark = false }: Props) {
  const chartRef = useRef<ChartJS>(null);
  const textColor = isDark ? '#d1d5db' : '#374151';
  const gridColor = isDark ? 'rgba(75, 85, 99, 0.5)' : 'rgba(0, 0, 0, 0.1)';

  useEffect(() => {
    if (chartRef.current) chartRef.current.update();
  }, [results, targetAR]);

  const times = results.map(r => r.time);

  const chartData = useMemo(() => ({
    labels: times,
    datasets: [
      {
        type: 'line' as const,
        label: `Target AR (${targetAR}%)`,
        data: Array(times.length).fill(targetAR),
        borderColor: '#3498db',
        borderDash: [5, 5],
        pointRadius: 0,
        borderWidth: 2,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'MIV Upper Bound',
        data: results.map(r => +r.upperBound.toFixed(2)),
        borderColor: '#f39c12',
        borderDash: [3, 3],
        pointRadius: 0,
        fill: '+1',
        backgroundColor: isDark ? 'rgba(243, 156, 18, 0.15)' : 'rgba(243, 156, 18, 0.1)',
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'MIV Lower Bound',
        data: results.map(r => +r.lowerBound.toFixed(2)),
        borderColor: '#f39c12',
        borderDash: [3, 3],
        pointRadius: 0,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: 'Call Volume',
        data: results.map(r => r.calls),
        backgroundColor: results.map(r =>
          r.isLowVolume
            ? (isDark ? 'rgba(248, 113, 113, 0.25)' : 'rgba(239, 68, 68, 0.2)')
            : (isDark ? 'rgba(156, 163, 175, 0.3)' : 'rgba(149, 165, 166, 0.3)')
        ),
        borderColor: results.map(r =>
          r.isLowVolume
            ? (isDark ? 'rgba(248, 113, 113, 0.7)' : 'rgba(239, 68, 68, 0.6)')
            : (isDark ? 'rgba(156, 163, 175, 0.8)' : 'rgba(149, 165, 166, 0.8)')
        ),
        borderWidth: 1,
        yAxisID: 'y1',
        order: 1,
      },
    ],
  }), [results, targetAR, times, isDark]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    animation: { duration: 750 },
    plugins: {
      title: {
        display: true,
        text: 'Interval-Specific Abandon Rate MIV Bands',
        font: { size: 16 },
        color: textColor,
      },
      legend: {
        display: true,
        labels: { color: textColor },
      },
      tooltip: {
        callbacks: {
          afterBody: (context: { dataIndex: number }[]) => {
            if (context[0]?.dataIndex !== undefined) {
              const r = results[context[0].dataIndex];
              return [
                `Call Volume: ${r.calls}`,
                `MIV Range: ±${r.mivPercent.toFixed(1)}%`,
                `Acceptable: ${r.lowerBound.toFixed(1)}% - ${r.upperBound.toFixed(1)}%`,
                r.isLowVolume ? 'Low Volume Interval' : 'Normal Volume',
              ];
            }
            return [];
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Time of Day', color: textColor },
        ticks: { color: textColor },
        grid: { color: gridColor },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: { display: true, text: 'Abandon Rate (%)', color: '#e74c3c' },
        ticks: { color: textColor },
        grid: { color: gridColor },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: { display: true, text: 'Call Volume', color: isDark ? '#9ca3af' : '#95a5a6' },
        ticks: { color: textColor },
        grid: { drawOnChartArea: false },
      },
    },
  }), [results, textColor, gridColor, isDark]);

  if (results.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500">No data to display</p>
      </div>
    );
  }

  return (
    <div className="h-[500px]">
      <Chart ref={chartRef} type="bar" data={chartData} options={options} />
    </div>
  );
}
