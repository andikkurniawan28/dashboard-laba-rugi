import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ setUser }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
            // const res = await fetch("http://147.139.177.186:3378/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Login failed");
                return;
            }

            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);
            navigate("/");
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
                    width: "400px",
                    borderRadius: "15px",
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                }}
            >
                <div className="card-body p-4">
                    <h3 className="card-title text-center mb-4" style={{ color: "#222E3C" }}>
                        Dashboard Laba Rugi
                    </h3>
                    <form onSubmit={handleLogin}>
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
                        {error && (
                            <p className="text-danger small text-center">{error}</p>
                        )}
                        <button
                            type="submit"
                            className="btn w-100 mt-3"
                            style={{
                                backgroundColor: "#222E3C",
                                color: "white",
                                borderRadius: "10px",
                                fontWeight: "600",
                                letterSpacing: "0.5px",
                            }}
                        >
                            Login
                        </button>
                    </form>
                    <p className="text-center mt-3 mb-0">
                        Belum punya akun?{" "}
                        <span
                            style={{
                                color: "#222E3C",
                                fontWeight: "600",
                                cursor: "pointer",
                            }}
                            onClick={() => navigate("/register")}
                        >
                            Daftar
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
