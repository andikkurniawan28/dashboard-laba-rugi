import React, { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import 'bootstrap/dist/css/bootstrap.min.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [dailyLabels, setDailyLabels] = useState([]);
  const [monthlyLabels, setMonthlyLabels] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [dailyExpense, setDailyExpense] = useState([]);
  const [dailyProfit, setDailyProfit] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [monthlyExpense, setMonthlyExpense] = useState([]);
  const [monthlyProfit, setMonthlyProfit] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/profitloss/stats")
      .then((res) => res.json())
      .then((data) => {
        // daily
        const dailyKeys = Object.keys(data.dailyRevenue).sort();
        setDailyLabels(dailyKeys);
        setDailyRevenue(dailyKeys.map((k) => data.dailyRevenue[k]));
        setDailyExpense(dailyKeys.map((k) => data.dailyExpense[k]));
        setDailyProfit(dailyKeys.map((k) => data.dailyProfitloss[k]));

        // monthly
        const monthlyKeys = Object.keys(data.monthlyRevenue).sort();
        setMonthlyLabels(monthlyKeys);
        setMonthlyRevenue(monthlyKeys.map((k) => data.monthlyRevenue[k]));
        setMonthlyExpense(monthlyKeys.map((k) => data.monthlyExpense[k]));
        setMonthlyProfit(monthlyKeys.map((k) => data.monthlyProfitloss[k]));
      })
      .catch((err) => console.error("Error fetching:", err));
  }, []);

  return (
    <div className="container-fluid my-5 px-5">
      <h2 className="mb-4">Dashboard Profit/Loss</h2>

      <div className="row mb-5">
        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Daily Revenue</h5>
            <Line data={{
              labels: dailyLabels,
              datasets: [{ label: "Revenue", data: dailyRevenue, borderColor: "green", backgroundColor: "rgba(0,255,0,0.3)" }]
            }} />
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Daily Expense</h5>
            <Line data={{
              labels: dailyLabels,
              datasets: [{ label: "Expense", data: dailyExpense, borderColor: "red", backgroundColor: "rgba(255,0,0,0.3)" }]
            }} />
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Daily Profit/Loss</h5>
            <Line data={{
              labels: dailyLabels,
              datasets: [{ label: "Profit/Loss", data: dailyProfit, borderColor: "blue", backgroundColor: "rgba(0,0,255,0.3)" }]
            }} />
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Monthly Revenue</h5>
            <Bar data={{
              labels: monthlyLabels,
              datasets: [{ label: "Revenue", data: monthlyRevenue, backgroundColor: "green" }]
            }} />
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Monthly Expense</h5>
            <Bar data={{
              labels: monthlyLabels,
              datasets: [{ label: "Expense", data: monthlyExpense, backgroundColor: "red" }]
            }} />
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Monthly Profit/Loss</h5>
            <Bar data={{
              labels: monthlyLabels,
              datasets: [{ label: "Profit/Loss", data: monthlyProfit, backgroundColor: "blue" }]
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
