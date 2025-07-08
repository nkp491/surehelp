
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
import { useRoleCheck } from "@/hooks/useRoleCheck";

type SidebarNavigationProps = {
  navigationItems: NavigationItem[];
};

export function SidebarNavigation({ navigationItems }: SidebarNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRequiredRole } = useRoleCheck();
  
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="h-12 px-4 text-lg font-bold my-3">Agent Hub</SidebarGroupLabel>
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
                  className="mb-2"
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
