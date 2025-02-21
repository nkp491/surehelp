import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Auth, Home, Pricing, Index } from "@/pages";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

export const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/metrics" element={<Index />} />
      <Route path="/submitted-forms" element={<Index />} />
      <Route path="/manager-dashboard" element={<Index />} />
      <Route path="/profile" element={<Index />} />
      <Route path="/assessment" element={<Index />} />
      <Route path="/commission-tracker" element={<Index />} />
    </Routes>
  );
};
