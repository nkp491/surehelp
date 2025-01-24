import Navigation from "./Navigation";
import ProfileMenu from "./ProfileMenu";
import MetricsSection from "../dashboard/MetricsSection";
import { useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const showMetrics = location.pathname === '/assessment';

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Header */}
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <img 
              src="/lovable-uploads/cb31ac2c-4859-4fad-b7ef-36988cc1dad3.png" 
              alt="SureHelp Logo" 
              className="h-8 w-auto"
            />
            <Navigation />
          </div>
          <ProfileMenu />
        </div>
        
        {/* Metrics Section - Only show on assessment page */}
        {showMetrics && (
          <div className="py-2 -mb-[1px]">
            <MetricsSection />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;