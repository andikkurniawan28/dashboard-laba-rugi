import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";

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
                                    onChange={(e) => setForm({ ...form, revenue: e.target.value.replace(/,/g, "") })}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label>Expense</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formatNumber(form.expense)}
                                    onChange={(e) => setForm({ ...form, expense: e.target.value.replace(/,/g, "") })}
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
                    <button className="btn btn-primary btn-sm me-2" onClick={() => handleEdit(row)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)}>Delete</button>
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

    const fetchData = async () => {
        try {
            const res = await fetch("http://147.139.177.186:3378/api/profitloss/list", {
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

    // ===== Delete =====
    const handleDelete = async (id) => {
        if (!window.confirm("Yakin hapus data ini?")) return;
        try {
            const res = await fetch(`http://147.139.177.186:3378/api/profitloss/${id}`, { method: "DELETE" });
            const dataRes = await res.json();
            if (!res.ok) throw new Error(dataRes?.error || "Failed to delete");
            fetchData();
            Swal.fire({ icon: "success", title: "Data deleted successfully", timer: 1500, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: "error", title: "Error", text: err.message });
        }
    };

    // ===== Edit =====
    const handleEdit = (row) => {
        setEditing(row.id);
        setForm({ date: row.date, revenue: row.revenue.toString(), expense: row.expense.toString() });
        setShowModal(true);
    };

    // ===== Add / Update =====
    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            date: form.date,
            user_id: user.id,
            app_key: user.app_key,
            revenue: parseNumber(form.revenue),
            expense: parseNumber(form.expense),
            profitloss: parseNumber(form.revenue) - parseNumber(form.expense),
        };

        try {
            const url = editing ? `http://147.139.177.186:3378/api/profitloss/${editing}` : "http://147.139.177.186:3378/api/profitloss";
            const method = editing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const dataRes = await res.json();
            if (!res.ok) throw new Error(dataRes?.error || dataRes?.detail || "Failed to save");

            setForm({ date: "", revenue: "", expense: "" });
            setEditing(null);
            setShowModal(false);
            fetchData();
            Swal.fire({
                icon: "success",
                title: editing ? "Data updated successfully" : "Data added successfully",
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (err) {
            Swal.fire({ icon: "error", title: "Error", text: err.message });
        }
    };

    // ===== Import Excel =====
    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const dataFile = await file.arrayBuffer();
            const workbook = XLSX.read(dataFile);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(sheet);

            const failedRows = [];

            for (const [index, row] of json.entries()) {
                const payload = {
                    date: row.Date, // pastikan format YYYY-MM-DD
                    user_id: user.id,
                    app_key: user.app_key,
                    revenue: parseNumber(row.Revenue),
                    expense: parseNumber(row.Expense),
                    profitloss: parseNumber(row.Revenue) - parseNumber(row.Expense),
                };

                try {
                    const res = await fetch("http://147.139.177.186:3378/api/profitloss", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    });
                    console.log("Import payload:", payload);

                    const dataRes = await res.json();
                    // if (!res.ok) {
                    //     // Tangkap error dari backend
                    //     failedRows.push({ row: index + 1, date: row.Date, error: dataRes?.error || dataRes?.detail });
                    //     console.error(`Row ${index + 1} (${row.Date}) failed:`, dataRes);
                    // }
                    if (!res.ok) throw new Error(dataRes?.error || dataRes?.detail || "Import failed for row " + row.Date);
                } catch (err) {
                    failedRows.push({ row: index + 1, date: row.Date, error: err.message });
                    console.error(`Row ${index + 1} (${row.Date}) failed:`, err);
                }
            }

            fetchData();

            if (failedRows.length > 0) {
                Swal.fire({
                    icon: "error",
                    title: "Import completed with errors",
                    html: failedRows.map(f => `Row ${f.row} (${f.date}): ${f.error}`).join("<br/>"),
                    width: 600,
                    showConfirmButton: true,
                });
            } else {
                Swal.fire({ icon: "success", title: "Import successful", timer: 1500, showConfirmButton: false });
            }
        } catch (err) {
            console.error("Import process failed:", err);
            Swal.fire({ icon: "error", title: "Import failed", text: err.message });
        }
    };

    // ===== Export Excel =====
    const handleExport = () => {
        try {
            const worksheet = XLSX.utils.json_to_sheet(
                data.map((row) => ({
                    Date: row.date,
                    Revenue: row.revenue,
                    Expense: row.expense,
                    ProfitLoss: row.profitloss,
                }))
            );
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "ProfitLoss");
            XLSX.writeFile(workbook, "ProfitLoss.xlsx");
            Swal.fire({ icon: "success", title: "Export successful", timer: 1500, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: "error", title: "Export failed", text: err.message });
        }
    };

    // ===== Download Template =====
    const downloadTemplate = () => {
        try {
            const templateData = [{ Date: "YYYY-MM-DD", Revenue: 0, Expense: 0 }];
            const worksheet = XLSX.utils.json_to_sheet(templateData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
            XLSX.writeFile(workbook, "ProfitLossTemplate.xlsx");
            Swal.fire({ icon: "success", title: "Template downloaded", timer: 1500, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: "error", title: "Template download failed", text: err.message });
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
                <div className="btn-group">
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

                    <label className="btn btn-primary mb-0">
                        <i className="bi bi-upload me-1"></i> Import from Excel
                        <input type="file" accept=".xlsx, .xls" onChange={handleImport} hidden />
                    </label>

                    <button className="btn btn-secondary" onClick={handleExport}>
                        <i className="bi bi-download me-1"></i> Export to Excel
                    </button>

                    <button className="btn btn-info" onClick={downloadTemplate}>
                        <i className="bi bi-file-earmark-text me-1"></i> Download Template
                    </button>

                    <button className="btn btn-success" onClick={() => (window.location.href = "/api-docs")}>
                        <i className="bi bi-code-slash me-1"></i> API Documentation
                    </button>

                </div>
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
