
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStateManager } from "@/hooks/useAuthStateManager";
import { AuthLoading } from "./AuthLoading";
import Auth from "@/pages/Auth";

export const AuthRoutes = () => {
  const { isAuthenticated, isLoading } = useAuthStateManager();

  if (isLoading) {
    console.log("Auth loading state:", { isLoading, isAuthenticated });
    return <AuthLoading />;
  }

  console.log("Auth routes state:", { isAuthenticated });

  if (isAuthenticated) {
    return <Navigate to="/assessment" replace />;
  }

  return (
    <Routes>
      <Route path="*" element={<Auth />} />
    </Routes>
  );
};
