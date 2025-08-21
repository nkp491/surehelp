
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { navigationItems } from "./sidebar/navigationItems";
import { useSidebarProfile } from "@/hooks/useSidebarProfile";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import { SidebarProfile } from "./sidebar/SidebarProfile";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";

export function AppSidebar() {
  const { profileData } = useSidebarProfile();
  const isMobile = useIsMobile();
  let sidebarContext: ReturnType<typeof useSidebar> | null = null;
  try {
    sidebarContext = useSidebar();
  } catch(e) { console.log("Sidebar context not available"); }

  // Show mobile trigger only if sidebar is closed on mobile
  const showMobileTrigger = isMobile && sidebarContext && !sidebarContext.openMobile;

  return (
    <>
      {showMobileTrigger && (
        <div className="fixed top-4 left-4 z-50 md:hidden">
          <SidebarTrigger className="bg-white rounded-full shadow-md border border-gray-100 p-2 hover:bg-gray-50 transition-all duration-200" />
        </div>
      )}
      <Sidebar>
        <SidebarHeader className="h-[70px] flex items-center justify-center px-6 pt-6 relative">
          <img 
            src="/lovable-uploads/dcabcc30-0eb6-4b0b-9ff2-fbc393e364c8.png" 
            alt="SureHelp" 
            className="h-[40px] w-auto mt-3"
          />
          {/* Desktop trigger only */}
          {!isMobile && (
            <SidebarTrigger className="absolute right-[-40px] bg-white rounded-full shadow-md border border-gray-100 p-1.5 hover:bg-gray-50 transition-all duration-200" />
          )}
        </SidebarHeader>
        <SidebarContent>
          <SidebarNavigation 
            navigationItems={navigationItems}
          />
        </SidebarContent>
        <SidebarProfile profileData={profileData} />
      </Sidebar>
    </>
  );
}

export default AppSidebar;
