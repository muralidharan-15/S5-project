import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RainfallChart = ({ graphData, district, loading }) => {
  if (loading || !graphData?.dates || graphData.dates.length === 0) {
    return (
      <div className="w-full h-72 glass-card rounded-xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse flex items-center justify-center">
        <span className="text-sm font-medium text-slate-400">Loading precipitation trend dataset...</span>
      </div>
    );
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(11, 31, 58, 0.9)',
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => ` Precipitation: ${context.parsed.y} mm`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: '#94a3b8' }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(148, 163, 184, 0.15)' },
        ticks: { font: { size: 11 }, color: '#94a3b8' }
      }
    }
  };

  const chartData = {
    labels: graphData.dates,
    datasets: [
      {
        label: 'Precipitation (mm)',
        data: graphData.rainfall,
        borderColor: '#0EA5E9',
        backgroundColor: 'rgba(14, 165, 233, 0.15)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#0EA5E9',
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  return (
    <div className="w-full glass-card rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-sky-500" />
            7-Day Precipitation Trend ({district})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Past observations & forecasted daily rainfall accumulation (mm)
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
};

export default RainfallChart;
