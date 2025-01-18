import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Header from "@/components/layout/Header";
import MainContent from "@/components/layout/MainContent";
import AuthGuard from "@/components/auth/AuthGuard";

const Index = () => {
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [showManagerDashboard, setShowManagerDashboard] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Update state based on current route
  useEffect(() => {
    setShowSubmissions(location.pathname === '/submitted-forms');
    setShowManagerDashboard(location.pathname === '/manager-dashboard');
    setShowDashboard(location.pathname === '/metrics');
  }, [location.pathname]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Header />
        <div className="container mx-auto py-8">
          <DashboardHeader 
            showSubmissions={showSubmissions}
            onSubmissionsClick={() => {
              setShowSubmissions(!showSubmissions);
              navigate(showSubmissions ? '/' : '/submitted-forms');
            }}
            showManagerDashboard={showManagerDashboard}
            onManagerDashboardClick={() => {
              setShowManagerDashboard(!showManagerDashboard);
              navigate(showManagerDashboard ? '/' : '/manager-dashboard');
            }}
            showDashboard={showDashboard}
            onDashboardClick={() => {
              setShowDashboard(!showDashboard);
              navigate(showDashboard ? '/' : '/metrics');
            }}
          />
          <MainContent />
        </div>
      </div>
    </AuthGuard>
  );
};

export default Index;