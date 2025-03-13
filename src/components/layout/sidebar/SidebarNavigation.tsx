
import { useNavigate, useLocation } from "react-router-dom";
import { NavigationItem } from "./navigationItems";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type SidebarNavigationProps = {
  navigationItems: NavigationItem[];
  hasRequiredRole: (requiredRoles?: string[]) => boolean;
};

export function SidebarNavigation({ navigationItems, hasRequiredRole }: SidebarNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="h-12 px-4 text-lg font-bold mt-3">Agent Hub</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {navigationItems.map((item) => {
            // Only show items if user has required role
            if (!hasRequiredRole(item.requiredRoles)) return null;
            
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  onClick={() => navigate(item.path)}
                  data-active={location.pathname === item.path}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
