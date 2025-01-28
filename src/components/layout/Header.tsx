import Navigation from "./Navigation";
import ProfileMenu from "./ProfileMenu";
import MetricsSection from "../dashboard/MetricsSection";
import { useLocation } from "react-router-dom";
import { MetricsProvider } from "@/contexts/MetricsContext";

const Header = () => {
  const location = useLocation();
  const showMetrics = location.pathname === '/assessment';

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/cb31ac2c-4859-4fad-b7ef-36988cc1dad3.png" 
              alt="SureHelp Logo" 
              className="h-6 w-auto"
            />
            <Navigation />
          </div>
          <ProfileMenu />
        </div>
        
        {showMetrics && (
          <div className="py-0.5 border-t border-gray-50">
            <MetricsProvider>
              <MetricsSection />
            </MetricsProvider>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;