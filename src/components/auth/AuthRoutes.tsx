
import React from "react";
import { Routes, Route } from "react-router-dom";
import Auth from "@/pages/Auth";
import TermsOfUse from "@/pages/marketing/TermsOfUse";
import ResetPassword from "@/pages/auth/reset-password";
import AuthCallback from "@/pages/auth/callback";

export const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/callback" element={<AuthCallback />} />
      <Route path="/terms" element={<TermsOfUse />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
};
