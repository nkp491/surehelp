
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Profile from './pages/Profile';
import Assessment from './pages/Assessment';
import Auth from './pages/Auth';
import AdminActions from './pages/AdminActions';
import CallbackHandler from './pages/CallbackHandler';
import ResetPassword from './pages/auth/reset-password';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Assessment />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminActions />} />
        <Route path="/admin-actions" element={<AdminActions />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<CallbackHandler />} />
      </Routes>
    </Router>
  );
}

export default App;
