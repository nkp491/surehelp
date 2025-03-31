
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

export function AppSidebar() {
  const { profileData } = useSidebarProfile();
  
  return (
    <Sidebar>
      <SidebarHeader className="h-[70px] flex items-center justify-center px-6 pt-6 relative">
        <img 
          src="/lovable-uploads/dcabcc30-0eb6-4b0b-9ff2-fbc393e364c8.png" 
          alt="SureHelp" 
          className="h-[40px] w-auto mt-3"
        />
        <SidebarTrigger className="absolute right-[-40px] bg-white rounded-full shadow-md border border-gray-100 p-1.5 hover:bg-gray-50 transition-all duration-200" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNavigation 
          navigationItems={navigationItems}
        />
      </SidebarContent>
      <SidebarProfile profileData={profileData} />
    </Sidebar>
  );
}

export default AppSidebar;
