import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStateManager } from "@/hooks/useAuthStateManager";
import { ProtectedRoute } from "./ProtectedRoute";
import { AuthLoading } from "./AuthLoading";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";
import CommissionTracker from "@/pages/CommissionTracker";
import Home from "@/pages/marketing/Home";
import Products from "@/pages/marketing/Products";
import Pricing from "@/pages/marketing/Pricing";

export const AuthRoutes = () => {
  const { isAuthenticated, isLoading } = useAuthStateManager();

  if (isLoading) {
    console.log("Auth loading state:", { isLoading, isAuthenticated });
    return <AuthLoading />;
  }

  console.log("Auth routes state:", { isAuthenticated });

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <Navigate to="/assessment" replace />
          ) : (
            <Home />
          )
        } 
      />
      <Route 
        path="/products" 
        element={<Products />}
      />
      <Route 
        path="/pricing" 
        element={<Pricing />}
      />
      <Route 
        path="/auth/*" 
        element={
          isAuthenticated ? (
            <Navigate to="/assessment" replace />
          ) : (
            <Auth />
          )
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} redirectTo="/auth">
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/metrics" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} redirectTo="/auth">
            <Index />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/submitted-forms" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} redirectTo="/auth">
            <Index />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/manager-dashboard" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} redirectTo="/auth">
            <Index />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/assessment" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} redirectTo="/auth">
            <Index />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/commission-tracker" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} redirectTo="/auth">
            <Index />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="*" 
        element={<Navigate to="/auth" replace />} 
      />
    </Routes>
  );
};
