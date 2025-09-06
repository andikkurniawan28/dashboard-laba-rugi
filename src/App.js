import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Input from "./pages/Input";
import ProfitLossList from "./pages/ProfitLossList";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/input" element={<Input />} />
        <Route path="/data" element={<ProfitLossList />} />
      </Routes>
    </Router>
  );
}

export default App;
