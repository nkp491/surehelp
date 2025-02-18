import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Users2, UserCircle } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarHeader,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Client Assessment Form",
    path: "/assessment",
    icon: ClipboardList,
  },
  {
    title: "Client Book of Business",
    path: "/submitted-forms",
    icon: ClipboardList,
  },
  {
    title: "KPI Insights",
    path: "/metrics",
    icon: LayoutDashboard,
  },
  {
    title: "Team",
    path: "/manager-dashboard",
    icon: Users2,
  },
  {
    title: "Profile",
    path: "/profile",
    icon: UserCircle,
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <Sidebar>
      <SidebarHeader className="h-[70px] flex items-center px-6 relative">
        <img 
          src="/lovable-uploads/dcabcc30-0eb6-4b0b-9ff2-fbc393e364c8.png" 
          alt="SureHelp" 
          className="h-[40px] w-auto"
        />
        <SidebarTrigger className="absolute right-[-40px] bg-white rounded-full shadow-md border border-gray-100 p-1.5 hover:bg-gray-50 transition-all duration-200" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Agent Hub</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    data-active={location.pathname === item.path}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}