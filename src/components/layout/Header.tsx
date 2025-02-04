import ProfileMenu from "./ProfileMenu";
import MetricsSection from "../dashboard/MetricsSection";
import { useLocation } from "react-router-dom";
import { MetricsProvider } from "@/contexts/MetricsContext";
import { Separator } from "@/components/ui/separator";

const Header = () => {
  const location = useLocation();
  const showMetrics = location.pathname === '/assessment';

  return (
    <header className="bg-transparent">
      <div className="max-w-[1800px] mx-auto">
        <div className="absolute top-4 right-8 z-50">
          <ProfileMenu />
        </div>
        
        {showMetrics && (
          <>
            <div className="relative w-full pt-2">
              <MetricsProvider>
                <MetricsSection />
              </MetricsProvider>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;