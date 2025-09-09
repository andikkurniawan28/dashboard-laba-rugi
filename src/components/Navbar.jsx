import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function Navbar() {
    const user = JSON.parse(localStorage.getItem("user"));

    const handleLogout = () => {
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    return (
        <nav
            className="navbar navbar-expand-lg navbar-dark"
            style={{ backgroundColor: "#222E3C" }} // Warna kustom
        >
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">
                    Profit-Loss Dashboard  ({user.organization})
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        {user && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/">
                                        Dashboard
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/data">
                                        Data
                                    </Link>
                                </li>
                                {/* User dropdown */}
                                {user && (
                                    <li className="nav-item dropdown ms-3">
                                        <button
                                            className="btn btn-dark dropdown-toggle d-flex align-items-center"
                                            id="userDropdown"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                        >
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${user.name}`}
                                                alt="avatar"
                                                className="rounded-circle me-2"
                                                width="30"
                                                height="30"
                                            />
                                            {user.name}
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                                            <li>
                                                <Link className="dropdown-item" to="/change-password">
                                                    Change Password
                                                </Link>
                                            </li>
                                            <li>
                                                <Link className="dropdown-item" to="/ticket">
                                                    Ticket
                                                </Link>
                                            </li>
                                            <li>
                                                <button className="dropdown-item" onClick={handleLogout}>
                                                    Logout
                                                </button>
                                            </li>
                                        </ul>
                                    </li>
                                )}
                            </>
                        )}
                        {!user && (
                            <li className="nav-item">
                                <Link className="nav-link" to="/login">
                                    Login
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
