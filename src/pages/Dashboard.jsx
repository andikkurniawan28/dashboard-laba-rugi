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

// ======================= InsightCards Component =======================
const InsightCards = ({ insight }) => {
    const format = (num) =>
        (num ?? 0).toLocaleString("en", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

    const cards = [
        { title: "Pendapatan Rata-rata", value: insight?.avgRevenue, color: "text-success" },
        { title: "Laba Tertinggi", value: insight?.maxProfit, color: "text-primary" },
        { title: "Beban Terendah", value: insight?.minExpense, color: "text-danger" },
        { title: "Pendapatan Tertinggi", value: insight?.maxRevenue, color: "text-success" },
    ];

    return (
        <div className="row mb-3">
            {cards.map((card) => (
                <div key={card.title} className="col-md-3 mb-3">
                    <div className="card p-3 text-center">
                        <h6>{card.title}</h6>
                        <h4 className={card.color}>{format(card.value)}</h4>
                    </div>
                </div>
            ))}
        </div>
    );
};


// ======================= ChartCard Component =======================
const ChartCard = ({ title, type = "line", labels, datasets }) => (
    <div className="col-md-6 mb-4">
        <div className="card p-3">
            <h5>{title}</h5>
            {type === "line" ? (
                <Line data={{ labels, datasets }} />
            ) : (
                <Bar data={{ labels, datasets }} />
            )}
        </div>
    </div>
);

// ======================= Main Dashboard Component =======================
function Dashboard() {
    const [dailyLabels, setDailyLabels] = useState([]);
    const [monthlyLabels, setMonthlyLabels] = useState([]);
    const [dailyRevenue, setDailyRevenue] = useState([]);
    const [dailyExpense, setDailyExpense] = useState([]);
    const [dailyProfit, setDailyProfit] = useState([]);
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [monthlyExpense, setMonthlyExpense] = useState([]);
    const [monthlyProfit, setMonthlyProfit] = useState([]);
    const [monthlyMargin, setMonthlyMargin] = useState([]);
    const [yearlyLabels, setYearlyLabels] = useState([]);
    const [yearlyRevenue, setYearlyRevenue] = useState([]);
    const [yearlyExpense, setYearlyExpense] = useState([]);
    const [yearlyProfit, setYearlyProfit] = useState([]);
    const [yearlyMargin, setYearlyMargin] = useState([]);
    const [insight, setInsight] = useState({});

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user"));
                if (!user) return;

                const res = await fetch("http://147.139.177.186:3378/api/profitloss/stats", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: user.id }),
                });

                if (!res.ok) throw new Error("Failed to fetch stats");

                const data = await res.json();

                // daily
                const dailyKeys = Object.keys(data.dailyRevenue).sort();
                setDailyLabels(dailyKeys);
                setDailyRevenue(dailyKeys.map((k) => data.dailyRevenue[k]));
                setDailyExpense(dailyKeys.map((k) => data.dailyExpense[k]));
                setDailyProfit(dailyKeys.map((k) => data.dailyProfitloss[k]));

                // monthly
                const monthlyData = data.monthlyStats || [];
                setMonthlyLabels(monthlyData.map((m) => m.month));
                setMonthlyRevenue(monthlyData.map((m) => m.revenue));
                setMonthlyExpense(monthlyData.map((m) => m.expense));
                setMonthlyProfit(monthlyData.map((m) => m.profitloss));
                setMonthlyMargin(monthlyData.map((m) => m.profitMargin));

                // yearly
                const yearlyKeys = Object.keys(data.yearlyRevenue).sort();
                setYearlyLabels(yearlyKeys);
                setYearlyRevenue(yearlyKeys.map((k) => data.yearlyRevenue[k]));
                setYearlyExpense(yearlyKeys.map((k) => data.yearlyExpense[k]));
                setYearlyProfit(yearlyKeys.map((k) => data.yearlyProfitloss[k]));
                setYearlyMargin(yearlyKeys.map((k) => data.yearlyProfitMargin[k]));

                // insight
                setInsight(data);
            } catch (err) {
                console.error("Error fetching:", err);
            }
        };

        fetchStats();
    }, []);


    return (
        <div className="container-fluid my-5 px-5">
            <h2 className="mb-4">Dashboard</h2>
            <InsightCards insight={insight} />

            <div className="row mb-5">
                <ChartCard
                    title="Pendapatan Harian"
                    type="line"
                    labels={dailyLabels}
                    datasets={[{ label: "Pendapatan", data: dailyRevenue, borderColor: "green", backgroundColor: "rgba(0,255,0,0.3)" }]}
                />
                <ChartCard
                    title="Beban Harian"
                    type="line"
                    labels={dailyLabels}
                    datasets={[{ label: "Beban", data: dailyExpense, borderColor: "red", backgroundColor: "rgba(255,0,0,0.3)" }]}
                />
                <ChartCard
                    title="Laba Harian"
                    type="line"
                    labels={dailyLabels}
                    datasets={[{ label: "Laba", data: dailyProfit, borderColor: "blue", backgroundColor: "rgba(0,0,255,0.3)" }]}
                />

                {/* ✅ Tambahan Chart Gabungan */}
                <ChartCard
                    title="Ringkasan Harian"
                    type="line"
                    labels={dailyLabels}
                    datasets={[
                        { label: "Pendapatan", data: dailyRevenue, borderColor: "green", backgroundColor: "rgba(0,255,0,0.2)", fill: true },
                        { label: "Beban", data: dailyExpense, borderColor: "red", backgroundColor: "rgba(255,0,0,0.2)", fill: true },
                        { label: "Laba", data: dailyProfit, borderColor: "blue", backgroundColor: "rgba(0,0,255,0.2)", fill: true },
                    ]}
                />

                <ChartCard
                    title="Pendapatan Bulanan"
                    type="bar"
                    labels={monthlyLabels}
                    datasets={[{ label: "Pendapatan", data: monthlyRevenue, backgroundColor: "green" }]}
                />
                <ChartCard
                    title="Beban Bulanan"
                    type="bar"
                    labels={monthlyLabels}
                    datasets={[{ label: "Beban", data: monthlyExpense, backgroundColor: "red" }]}
                />
                <ChartCard
                    title="Laba Bulanan"
                    type="bar"
                    labels={monthlyLabels}
                    datasets={[{ label: "Laba", data: monthlyProfit, backgroundColor: "blue" }]}
                />
                <ChartCard
                    title="Profit Margin (%) Bulanan"
                    type="line"
                    labels={monthlyLabels}
                    datasets={[{ label: "Profit Margin", data: monthlyMargin, borderColor: "orange", backgroundColor: "rgba(255,165,0,0.3)" }]}
                />
                <ChartCard
                    title="Ringkasan Tahun Ini"
                    type="bar"
                    labels={yearlyLabels}
                    datasets={[
                        { label: "Pendapatan", data: yearlyRevenue, backgroundColor: "green" },
                        { label: "Beban", data: yearlyExpense, backgroundColor: "red" },
                        { label: "Laba", data: yearlyProfit, backgroundColor: "blue" },
                    ]}
                />
                <ChartCard
                    title="Profit Margin (%) Tahunan"
                    type="line"
                    labels={yearlyLabels}
                    datasets={[{ label: "Profit Margin", data: yearlyMargin, borderColor: "purple", backgroundColor: "rgba(128,0,128,0.3)" }]}
                />
            </div>

        </div>
    );
}

export default Dashboard;
