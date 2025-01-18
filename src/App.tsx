import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import "./App.css";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Assessment from "./pages/Assessment";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/assessment" replace />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/metrics" element={<Dashboard />} />
        <Route path="/submitted-forms" element={<Dashboard />} />
        <Route path="/manager-dashboard" element={<Dashboard />} />
        <Route path="/assessment" element={<Assessment />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;