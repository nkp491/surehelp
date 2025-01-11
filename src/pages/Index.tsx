import { useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import SubmittedForms from "./SubmittedForms";
import Dashboard from "./Dashboard";
import ManagerDashboard from "./ManagerDashboard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricsSection from "@/components/dashboard/MetricsSection";
import AssessmentFormSection from "@/components/dashboard/AssessmentFormSection";
import { MetricsProvider } from "@/contexts/MetricsContext";

const Index = () => {
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [showManagerDashboard, setShowManagerDashboard] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSubmissionsClick = () => {
    if (location.pathname === '/submitted-forms') {
      setShowSubmissions(false);
      navigate('/');
    } else {
      setShowSubmissions(true);
      navigate('/submitted-forms');
    }
  };

  const handleManagerDashboardClick = () => {
    if (location.pathname === '/manager-dashboard') {
      setShowManagerDashboard(false);
      navigate('/');
    } else {
      setShowManagerDashboard(true);
      navigate('/manager-dashboard');
    }
  };

  const handleDashboardClick = () => {
    if (location.pathname === '/metrics') {
      setShowDashboard(false);
      navigate('/');
    } else {
      setShowDashboard(true);
      navigate('/metrics');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto py-8">
        <DashboardHeader 
          showSubmissions={showSubmissions}
          onSubmissionsClick={handleSubmissionsClick}
          showManagerDashboard={showManagerDashboard}
          onManagerDashboardClick={handleManagerDashboardClick}
          showDashboard={showDashboard}
          onDashboardClick={handleDashboardClick}
        />

        <MetricsProvider>
          <MetricsSection />
          <Routes>
            {showSubmissions && (
              <Route path="/submitted-forms" element={<SubmittedForms />} />
            )}
            {showDashboard && (
              <Route path="/metrics" element={<Dashboard />} />
            )}
            {showManagerDashboard && (
              <Route path="/manager-dashboard" element={<ManagerDashboard />} />
            )}
          </Routes>
        </MetricsProvider>

        <Separator className="my-12" />
        
        <AssessmentFormSection 
          isFormOpen={isFormOpen}
          setIsFormOpen={setIsFormOpen}
        />
      </div>
    </div>
  );
};

export default Index;