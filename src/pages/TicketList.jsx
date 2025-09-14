import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";

// ===== Helper Functions =====
const formatStatus = (status) => {
  switch (status) {
    case "open":
      return "Open";
    case "in_progress":
      return "In Progress";
    case "closed":
      return "Closed";
    default:
      return status;
  }
};

// ===== Ticket Modal =====
const TicketModal = ({ show, onClose, onSubmit, form, setForm, editing }) => {
  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={onSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{editing ? "Edit Tiket" : "Buat Tiket Baru"}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label>Keterangan</label>
                <textarea
                  className="form-control"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary">
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ===== Ticket Table =====
const TicketTable = ({ data, handleEdit, handleDelete, filterText }) => {
  const columns = [
    { name: "ID", selector: (row) => row.id, sortable: true, wrap: true },
    { name: "Keterangan", selector: (row) => row.description, sortable: true, wrap: true },
    { name: "Status", selector: (row) => row.status, sortable: true, cell: (row) => formatStatus(row.status) },
    { name: "Dibuat pada", selector: (row) => row.created_at, sortable: true, wrap: true },
    { name: "Diperbarui pada", selector: (row) => row.updated_at, sortable: true, wrap: true },
    {
      name: "Action",
      cell: (row) => (
        <>
          <button className="btn btn-primary btn-sm me-2" onClick={() => handleEdit(row)}>
            Edit
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)}>
            Hapus
          </button>
        </>
      ),
    },
  ];

  const filteredItems = data.filter(
    (item) =>
      item.description.toLowerCase().includes(filterText.toLowerCase()) ||
      item.status.toLowerCase().includes(filterText.toLowerCase())
  );

  return <DataTable columns={columns} data={filteredItems} pagination highlightOnHover striped responsive />;
};

// ===== Main Component =====
function TicketList() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [data, setData] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ description: "" });
  const [showModal, setShowModal] = useState(false);
  const [filterText, setFilterText] = useState("");

  // ===== Fetch Data =====
  const fetchData = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/ticket/list`, {
      // const res = await fetch("http://147.139.177.186:3378/api/ticket/list", {
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

  // ===== Delete Ticket =====
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus ticket ini?")) return;
    try {
      // const res = await fetch(`http://147.139.177.186:3378/api/ticket/${id}`, { method: "DELETE" });
      const res = await fetch(`${process.env.REACT_APP_API_URL}/ticket/${id}`, {
        method: "DELETE",
      });
      const dataRes = await res.json();
      if (!res.ok) throw new Error(dataRes?.error || "Failed to delete");
      fetchData();
      Swal.fire({ icon: "success", title: "Ticket deleted", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message });
    }
  };

  // ===== Edit Ticket =====
  const handleEdit = (row) => {
    setEditing(row.id);
    setForm({ description: row.description });
    setShowModal(true);
  };

  // ===== Create Ticket =====
  const createTicket = async () => {
    const payload = {
      user_id: user.id,
      app_key: user.app_key,
      description: form.description,
      product_id: 1,
    };
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/ticket`, {
      // const res = await fetch("http://147.139.177.186:3378/api/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const dataRes = await res.json();
      if (!res.ok) throw new Error(dataRes?.error || dataRes?.detail || "Failed to create ticket");

      Swal.fire({ icon: "success", title: "Ticket added", timer: 1500, showConfirmButton: false });
      setForm({ description: "" });
      fetchData();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message });
    }
  };

  // ===== Update Ticket =====
  const updateTicket = async () => {
    const payload = {
      user_id: user.id,
      app_key: user.app_key,
      description: form.description,
      product_id: 1,
    };
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/ticket/${editing}`, {
      // const res = await fetch(`http://147.139.177.186:3378/api/ticket/${editing}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const dataRes = await res.json();
      if (!res.ok) throw new Error(dataRes?.error || dataRes?.detail || "Failed to update ticket");

      Swal.fire({ icon: "success", title: "Ticket updated", timer: 1500, showConfirmButton: false });
      setForm({ description: "" });
      setEditing(null);
      fetchData();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message });
    }
  };

  // ===== Handle Submit =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await updateTicket();
    } else {
      await createTicket();
    }
    setShowModal(false);
  };

  return (
    <div className="container-fluid my-5 px-5">
      <h2>Tiket</h2>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="input-group" style={{ maxWidth: "300px" }}>
          <span className="input-group-text">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
      </div>

      <div className="d-flex justify-content-start mb-3">
        <button
          className="btn btn-success"
          onClick={() => {
            setForm({ description: "" });
            setEditing(null);
            setShowModal(true);
          }}
        >
          + Buat Tiket
        </button>
      </div>

      <TicketTable data={data} handleEdit={handleEdit} handleDelete={handleDelete} filterText={filterText} />

      <TicketModal show={showModal} onClose={() => setShowModal(false)} onSubmit={handleSubmit} form={form} setForm={setForm} editing={editing} />
    </div>
  );
}

export default TicketList;
