import React, { useState } from "react";

function Input() {
  const today = new Date().toISOString().split("T")[0];

  // state simpan nilai asli (angka murni tanpa format)
  const [date, setDate] = useState(today);
  const [revenue, setRevenue] = useState("");
  const [expense, setExpense] = useState("");
  const [profit, setProfit] = useState(0);

  // format angka untuk tampilan
  const formatNumber = (num) => {
    if (num === "" || isNaN(num)) return "";
    return Number(num).toLocaleString("en-US");
  };

  const handleRevenueChange = (e) => {
    let value = e.target.value.replace(/,/g, "");
    if (Number(value) < 0) value = "0";
    setRevenue(value);
    setProfit(Number(value) - Number(expense || 0));
  };

  const handleExpenseChange = (e) => {
    let value = e.target.value.replace(/,/g, "");
    if (Number(value) < 0) value = "0";
    setExpense(value);
    setProfit(Number(revenue || 0) - Number(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      date,
      revenue: Number(revenue),  // kirim angka murni
      expense: Number(expense),  // kirim angka murni
      profitloss: Number(profit) // backend pakai field profitloss
    };

    console.log("Payload ke API:", payload);

    try {
      const res = await fetch("http://localhost:3001/api/profitloss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert("Error: " + data.error);
      } else {
        alert("Data berhasil disimpan!");
      }
    } catch (err) {
      console.error(err);
      alert("Request gagal!");
    }

    setRevenue("");
    setExpense("");
    setProfit(0);
  };

  return (
    <div className="container-fluid my-5 px-5">
      <h2 className="mb-4">Input</h2>
      <div className="card p-4 my-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-success">Revenue</label>
            <input
              type="text"
              className="form-control"
              value={formatNumber(revenue)}
              onChange={handleRevenueChange}
              required
              autoFocus
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-danger">Expense</label>
            <input
              type="text"
              className="form-control"
              value={formatNumber(expense)}
              onChange={handleExpenseChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-primary">Profit / Loss</label>
            <input
              type="text"
              className="form-control"
              value={formatNumber(profit)}
              readOnly
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default Input;
