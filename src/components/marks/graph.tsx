import React from "react";
import { Line } from "react-chartjs-2";
import { ChartData } from "chart.js/auto";

interface LineChartProps {
  chartData: ChartData<"line">;
}

const LineChart: React.FC<LineChartProps> = ({ chartData }) => {
  return (
    <div className="chart-container">
      <Line
        data={chartData}
        options={{
          plugins: {
            title: {
              display: false,
              text: "Percentage in individual components",
            },
            legend: {
              display: true,
            },
          },
        }}
      />
    </div>
  );
};

export default LineChart;
