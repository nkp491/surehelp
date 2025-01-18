import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import "./App.css";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import SubmittedForms from "./pages/SubmittedForms";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/assessment" replace />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/metrics" element={<Index />} />
        <Route path="/submitted-forms" element={<Index />} />
        <Route path="/manager-dashboard" element={<Index />} />
        <Route path="/assessment" element={<Index />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;