
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Profile from './pages/Profile';
import Assessment from './pages/Assessment';
import Auth from './pages/Auth';
import CallbackHandler from './pages/CallbackHandler';
import ResetPassword from './pages/auth/reset-password';
import MainContent from './components/layout/MainContent';
import AuthGuard from './components/auth/AuthGuard';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import TermsOfUse from './pages/marketing/TermsOfUse';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Authentication routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<CallbackHandler />} />
          <Route path="/auth/terms" element={<TermsOfUse />} />
          
          {/* Protected routes with sidebar navigation */}
          <Route path="/" element={<AuthGuard><Navigate to="/metrics" replace /></AuthGuard>} />
          <Route path="/assessment" element={<AuthGuard><MainContent /></AuthGuard>} />
          <Route path="/profile" element={<AuthGuard><MainContent /></AuthGuard>} />
          <Route path="/metrics" element={<AuthGuard><MainContent /></AuthGuard>} />
          <Route path="/submitted-forms" element={<AuthGuard><MainContent /></AuthGuard>} />
          <Route path="/manager-dashboard" element={<AuthGuard><MainContent /></AuthGuard>} />
          <Route path="/commission-tracker" element={<AuthGuard><MainContent /></AuthGuard>} />
          <Route path="/role-management" element={<AuthGuard><MainContent /></AuthGuard>} />
          <Route path="/team" element={<AuthGuard><MainContent /></AuthGuard>} />
          <Route path="/bulletins" element={<AuthGuard><MainContent /></AuthGuard>} />
          <Route path="/terms" element={<AuthGuard><MainContent /></AuthGuard>} />
          <Route path="/admin" element={<AuthGuard><MainContent /></AuthGuard>} />
          <Route path="/admin-actions" element={<AuthGuard><MainContent /></AuthGuard>} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
