
import React from "react";
import { Routes, Route } from "react-router-dom";
import Auth from "@/pages/Auth";
import TermsOfUse from "@/pages/marketing/TermsOfUse";

export const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/callback" element={<div>Processing login...</div>} />
      <Route path="/terms" element={<TermsOfUse />} />
    </Routes>
  );
};
