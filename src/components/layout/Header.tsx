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
        <div className="flex justify-end items-center h-[70px] px-8 bg-white">
          <ProfileMenu />
        </div>
        
        {showMetrics && (
          <>
            <Separator className="bg-[#D9D9D9] h-[0.5px] opacity-50" />
            <div className="relative w-full">
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