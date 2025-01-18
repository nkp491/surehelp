import { useState, useEffect } from "react";
import { useLocation, useNavigate, Routes, Route } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
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

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-gray-50 p-4 flex justify-between items-center">
        <img 
          src="/lovable-uploads/cb31ac2c-4859-4fad-b7ef-36988cc1dad3.png" 
          alt="SureHelp Logo" 
          className="h-16 object-contain"
        />
        <button
          onClick={() => navigate("/profile")}
          className="text-blue-600 hover:text-blue-800"
        >
          Profile Settings
        </button>
      </div>
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
          <div className="space-y-8">
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
          </div>
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