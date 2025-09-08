import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";

// ===== Helper Functions =====
const formatNumber = (num) => (num ? Number(num).toLocaleString("en-US") : "");
const parseNumber = (val) => (val ? Number(val.toString().replace(/,/g, "")) : 0);

// ===== Modal Component =====
const ProfitLossModal = ({ show, onClose, onSubmit, form, setForm, editing }) => {
    if (!show) return null;

    return (
        <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <form onSubmit={onSubmit}>
                        <div className="modal-header">
                            <h5 className="modal-title">{editing ? "Edit Record" : "Add New Record"}</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label>Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
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
                                    value={formatNumber(parseNumber(form.revenue) - parseNumber(form.expense))}
                                    readOnly
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
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
    );
};

// ===== Table Component =====
const ProfitLossTable = ({ data, handleEdit, handleDelete, filterText }) => {
    const columns = [
        { name: "Date", selector: (row) => row.date, sortable: true },
        { name: "Revenue", selector: (row) => row.revenue, sortable: true, right: true, cell: (row) => formatNumber(row.revenue) },
        { name: "Expense", selector: (row) => row.expense, sortable: true, right: true, cell: (row) => formatNumber(row.expense) },
        { name: "Profit/Loss", selector: (row) => row.profitloss, sortable: true, right: true, cell: (row) => formatNumber(row.profitloss) },
        {
            name: "Action",
            cell: (row) => (
                <>
                    <button className="btn btn-primary btn-sm me-2" onClick={() => handleEdit(row)}>
                        Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)}>
                        Delete
                    </button>
                </>
            ),
        },
    ];

    const filteredItems = data.filter(
        (item) =>
            item.date.toLowerCase().includes(filterText.toLowerCase()) ||
            item.revenue.toString().includes(filterText) ||
            item.expense.toString().includes(filterText)
    );

    return <DataTable columns={columns} data={filteredItems} pagination highlightOnHover striped responsive />;
};

// ===== Main Component =====
function ProfitLossList() {
    const user = JSON.parse(localStorage.getItem("user"));
    const [data, setData] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ date: "", revenue: "", expense: "" });
    const [showModal, setShowModal] = useState(false);
    const [filterText, setFilterText] = useState("");

    // ===== Fetch Data User-specific =====
    const fetchData = async () => {
        try {
            const res = await fetch("http://localhost:3001/api/profitloss/list", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userID: user.id }),
            });
            const json = await res.json();
            setData(json || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Yakin hapus data ini?")) return;
        try {
            const res = await fetch(`http://localhost:3001/api/profitloss/${id}`, { method: "DELETE" });
            if (res.ok) fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (row) => {
        setEditing(row.id);
        setForm({ date: row.date, revenue: row.revenue.toString(), expense: row.expense.toString() });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            date: form.date,
            user_id: user.id,
            revenue: parseNumber(form.revenue),
            expense: parseNumber(form.expense),
            profitloss: parseNumber(form.revenue) - parseNumber(form.expense),
        };

        try {
            const url = editing
                ? `http://localhost:3001/api/profitloss/${editing}`
                : "http://localhost:3001/api/profitloss";
            const method = editing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setForm({ date: "", revenue: "", expense: "" });
                setEditing(null);
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
                <div className="d-flex justify-content-end mb-2">
                    <div className="input-group" style={{ maxWidth: "300px" }}>
                        <span className="input-group-text"><i className="bi bi-search"></i></span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-start mb-3">
                <button
                    className="btn btn-success"
                    onClick={() => {
                        setForm({ date: "", revenue: "", expense: "" });
                        setEditing(null);
                        setShowModal(true);
                    }}
                >
                    + Add New
                </button>
            </div>

            <ProfitLossTable
                data={data}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                filterText={filterText}
            />

            <ProfitLossModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmit}
                form={form}
                setForm={setForm}
                editing={editing}
            />
        </div>
    );
}

export default ProfitLossList;
