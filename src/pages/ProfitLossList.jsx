import React, { useEffect, useState } from "react";

function ProfitLossList() {
    const [data, setData] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ date: "", revenue: "", expense: "" });
    const [showModal, setShowModal] = useState(false);

    // === Helper formatting ===
    const formatNumber = (num) => {
        if (num === "" || isNaN(num)) return "";
        return Number(num).toLocaleString("en-US");
    };

    const parseNumber = (val) => {
        if (!val) return 0;
        return Number(val.toString().replace(/,/g, ""));
    };

    // Ambil data dari API
    const fetchData = async () => {
        try {
            const res = await fetch("http://localhost:3001/api/profitloss");
            const json = await res.json();
            setData(json || []); // backend return array langsung
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Hapus data
    const handleDelete = async (id) => {
        if (!window.confirm("Yakin hapus data ini?")) return;

        try {
            const res = await fetch(`http://localhost:3001/api/profitloss/${id}`, {
                method: "DELETE",
            });
            if (res.ok) fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    // Edit data
    const handleEdit = (row) => {
        setEditing(row.id);
        setForm({
            date: row.date,
            revenue: row.revenue.toString(),
            expense: row.expense.toString(),
        });
    };

    // Simpan update
    const handleUpdate = async (e) => {
        e.preventDefault();
        const payload = {
            date: form.date,
            revenue: parseNumber(form.revenue),
            expense: parseNumber(form.expense),
            profitloss: parseNumber(form.revenue) - parseNumber(form.expense),
        };

        try {
            const res = await fetch(
                `http://localhost:3001/api/profitloss/${editing}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );
            if (res.ok) {
                setEditing(null);
                setForm({ date: "", revenue: "", expense: "" });
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Create data
    const handleCreate = async (e) => {
        e.preventDefault();
        const payload = {
            date: form.date,
            revenue: parseNumber(form.revenue),
            expense: parseNumber(form.expense),
            profitloss: parseNumber(form.revenue) - parseNumber(form.expense),
        };

        try {
            const res = await fetch("http://localhost:3001/api/profitloss", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                setForm({ date: "", revenue: "", expense: "" });
                setShowModal(false);
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="container-fluid my-5 px-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Data</h2>
                <button
                    className="btn btn-success"
                    onClick={() => {
                        setForm({ date: "", revenue: "", expense: "" });
                        setShowModal(true);
                    }}
                >
                    + Add New
                </button>
            </div>

            <table className="table table-hover table-striped table-bordered">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Revenue</th>
                        <th>Expense</th>
                        <th>Profit/Loss</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) =>
                        editing === row.id ? (
                            <tr key={row.id}>
                                <td>
                                    <input
                                        type="date"
                                        value={form.date}
                                        onChange={(e) =>
                                            setForm({ ...form, date: e.target.value })
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={formatNumber(form.revenue)}
                                        onChange={(e) =>
                                            setForm({ ...form, revenue: e.target.value.replace(/,/g, "") })
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={formatNumber(form.expense)}
                                        onChange={(e) =>
                                            setForm({ ...form, expense: e.target.value.replace(/,/g, "") })
                                        }
                                    />
                                </td>
                                <td>{formatNumber(parseNumber(form.revenue) - parseNumber(form.expense))}</td>
                                <td>
                                    <button
                                        className="btn btn-success btn-sm me-2"
                                        onClick={handleUpdate}
                                    >
                                        Save
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => setEditing(null)}
                                    >
                                        Cancel
                                    </button>
                                </td>
                            </tr>
                        ) : (
                            <tr key={row.id}>
                                <td>{row.date}</td>
                                <td>{row.revenue.toLocaleString()}</td>
                                <td>{row.expense.toLocaleString()}</td>
                                <td>{row.profitloss.toLocaleString()}</td>
                                <td>
                                    <button
                                        className="btn btn-primary btn-sm me-2"
                                        onClick={() => handleEdit(row)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(row.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        )
                    )}
                </tbody>
            </table>

            {/* Modal Create */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form onSubmit={handleCreate}>
                                <div className="modal-header">
                                    <h5 className="modal-title">Add New Record</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label>Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={form.date}
                                            onChange={(e) =>
                                                setForm({ ...form, date: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label>Revenue</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formatNumber(form.revenue)}
                                            onChange={(e) =>
                                                setForm({ ...form, revenue: e.target.value.replace(/,/g, "") })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label>Expense</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formatNumber(form.expense)}
                                            onChange={(e) =>
                                                setForm({ ...form, expense: e.target.value.replace(/,/g, "") })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label>Profit / Loss</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formatNumber(
                                                parseNumber(form.revenue) - parseNumber(form.expense)
                                            )}
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProfitLossList;
