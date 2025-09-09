import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import ProfitLossList from "./pages/ProfitLossList";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import Register from "./pages/Register";
import ChangePassword from "./pages/ChangePassword";
import ApiDocs from "./pages/ApiDocs";

function App() {
  const [user, setUser] = useState(null);

  // cek localStorage saat app pertama kali load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <Router>
      {/* Navbar hanya tampil jika user sudah login */}
      {user && <Navbar />}

      <Routes>
        <Route
          path="/login"
          element={<Login setUser={setUser} />} // pass setUser ke login
        />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <PrivateRoute>
              <ChangePassword />
            </PrivateRoute>
          }
        />
        <Route
          path="/data"
          element={
            <PrivateRoute>
              <ProfitLossList />
            </PrivateRoute>
          }
        />
        <Route
          path="/api-docs"
          element={
            <PrivateRoute>
              <ApiDocs />
            </PrivateRoute>
          }
        />
        <Route
          path="*"
          element={<h2 className="text-center mt-5">404 - Page Not Found</h2>}
        />
      </Routes>
    </Router>
  );
}

export default App;
