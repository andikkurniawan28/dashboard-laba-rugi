import React, { useState } from "react";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Password confirmation does not match");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        setError("Not logged in");
        return;
      }

      const res = await fetch("http://localhost:3001/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to change password");
        return;
      }

      setMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setError("Server error");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: "#f4f6f9" }}
    >
      <div className="card shadow-lg" style={{ width: "400px", border: "none" }}>
        <div
          className="card-header text-white text-center"
          style={{ backgroundColor: "#222E3C" }}
        >
          <h4 className="mb-0">Change Password</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleChangePassword}>
            <div className="mb-3">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-control"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-danger">{error}</p>}
            {message && <p className="text-success">{message}</p>}
            <button
              type="submit"
              className="btn w-100"
              style={{ backgroundColor: "#222E3C", color: "white" }}
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
