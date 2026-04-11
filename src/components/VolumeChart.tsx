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
import type { DayResult } from '../types/miv';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, BarController,
  LineElement, LineController, PointElement, Title, Tooltip, Legend
);

interface Props {
  dayResults: DayResult[];
  forecastGoal: number;
}

export function VolumeChart({ dayResults, forecastGoal }: Props) {
  const activeDays = dayResults.filter(r => r.dailyCalls > 0);
  const goalPct = forecastGoal * 100;

  const chartData = useMemo(() => {
    const labels = activeDays.map(r => r.day.slice(0, 3));
    const mivValues = activeDays.map(r => +(r.mivPct * 100).toFixed(2));

    return {
      labels,
      datasets: [
        {
          type: 'bar' as const,
          label: 'MIV %',
          data: mivValues,
          backgroundColor: mivValues.map(v =>
            v > goalPct ? 'rgba(239, 68, 68, 0.7)' : 'rgba(59, 130, 246, 0.7)'
          ),
          borderColor: mivValues.map(v =>
            v > goalPct ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)'
          ),
          borderWidth: 1,
          borderRadius: 4,
          order: 2,
        },
        {
          type: 'line' as const,
          label: `Goal: ${goalPct.toFixed(1)}%`,
          data: Array(labels.length).fill(goalPct),
          borderColor: '#3498db',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false,
          order: 1,
        },
      ],
    };
  }, [activeDays, goalPct]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 750 },
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          afterLabel: () => `Goal: ${goalPct.toFixed(1)}%`,
        },
      },
    },
    scales: {
      x: { title: { display: true, text: 'Day of Week' } },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'MIV %' },
      },
    },
  }), [goalPct]);

  if (activeDays.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No data to display</p>
      </div>
    );
  }

  return (
    <div className="h-80">
      <Chart type="bar" data={chartData} options={options} />
    </div>
  );
}
