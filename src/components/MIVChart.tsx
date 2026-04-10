import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import type { DayResult } from '../types/miv';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  dayResults: DayResult[];
  forecastGoal: number;
}

export function MIVChart({ dayResults, forecastGoal }: Props) {
  const activeDays = dayResults.filter(r => r.dailyCalls > 0);
  const labels = activeDays.map(r => r.day.slice(0, 3));
  const mivValues = activeDays.map(r => +(r.mivPct * 100).toFixed(2));
  const goalPct = forecastGoal * 100;

  const data = {
    labels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'MIV %',
        data: mivValues,
        backgroundColor: mivValues.map(v =>
          v > goalPct ? 'rgba(249, 115, 22, 0.8)' : 'rgba(59, 130, 246, 0.8)'
        ),
        borderColor: mivValues.map(v =>
          v > goalPct ? 'rgb(249, 115, 22)' : 'rgb(59, 130, 246)'
        ),
        borderWidth: 1,
        borderRadius: 6,
        order: 2,
      },
      {
        type: 'line' as const,
        label: `Goal: ${goalPct.toFixed(1)}%`,
        data: Array(labels.length).fill(goalPct),
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
        borderDash: [6, 4],
        pointRadius: 0,
        fill: false,
        order: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: 'rgb(148, 163, 184)',
          usePointStyle: true,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: 'rgb(30, 41, 59)',
        titleColor: 'rgb(241, 245, 249)',
        bodyColor: 'rgb(241, 245, 249)',
        borderColor: 'rgb(51, 65, 85)',
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      x: {
        ticks: { color: 'rgb(148, 163, 184)' },
        grid: { color: 'rgba(51, 65, 85, 0.5)' },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'MIV %',
          color: 'rgb(148, 163, 184)',
        },
        ticks: { color: 'rgb(148, 163, 184)' },
        grid: { color: 'rgba(51, 65, 85, 0.5)' },
      },
    },
  };

  return (
    <div className="h-80">
      <Chart type="bar" data={data} options={options} />
    </div>
  );
}
