import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const navigate = useNavigate();
    const [organization, setOrganization] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const res = await fetch("http://147.139.177.186:3378/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    organization,
                    name,
                    email,
                    whatsapp,
                    password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Registration failed");
                return;
            }

            setSuccess("Registration successful! Redirecting to login...");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setError("Server error");
            console.error(err);
        }
    };

    return (
        <div
            className="d-flex justify-content-center align-items-center vh-100"
            style={{
                backgroundColor: "#222E3C",
                fontFamily: "Segoe UI, sans-serif",
            }}
        >
            <div
                className="card shadow-lg border-0"
                style={{
                    width: "420px",
                    borderRadius: "15px",
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                }}
            >
                <div className="card-body p-4">
                    <h3 className="card-title text-center mb-4" style={{ color: "#222E3C" }}>
                        Dashboard Laba Rugi
                    </h3>
                    <form onSubmit={handleRegister}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Nama Bisnis / Toko / Resto</label>
                            <input
                                type="text"
                                className="form-control"
                                value={organization}
                                onChange={(e) => setOrganization(e.target.value)}
                                required
                                style={{ borderRadius: "10px" }}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Nama Lengkap Anda</label>
                            <input
                                type="text"
                                className="form-control"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                style={{ borderRadius: "10px" }}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ borderRadius: "10px" }}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold">WhatsApp</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="62xxxx"
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                required
                                style={{ borderRadius: "10px" }}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ borderRadius: "10px" }}
                            />
                        </div>
                        {error && <p className="text-danger small text-center">{error}</p>}
                        {success && <p className="text-success small text-center">{success}</p>}
                        <button
                            type="submit"
                            className="btn w-100 mt-3"
                            style={{
                                backgroundColor: "#222E3C",
                                color: "white",
                                borderRadius: "10px",
                                fontWeight: "600",
                            }}
                        >
                            Daftar
                        </button>
                    </form>
                    <p className="text-center mt-3 mb-0">
                        Sudah punya akun?{" "}
                        <span
                            style={{
                                color: "#222E3C",
                                fontWeight: "600",
                                cursor: "pointer",
                            }}
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
