import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStateManager } from "@/hooks/useAuthStateManager";
import { ProtectedRoute } from "./ProtectedRoute";
import { AuthLoading } from "./AuthLoading";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";

export const AuthRoutes = () => {
  const { isAuthenticated, isLoading } = useAuthStateManager();

  if (isLoading) {
    return <AuthLoading />;
  }

  return (
    <Routes>
      <Route 
        path="/auth" 
        element={isAuthenticated ? <Navigate to="/assessment" replace /> : <Auth />} 
      />
      <Route 
        path="/" 
        element={<Navigate to="/assessment" replace />} 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/metrics" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Index />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/submitted-forms" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Index />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/manager-dashboard" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Index />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/assessment" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
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