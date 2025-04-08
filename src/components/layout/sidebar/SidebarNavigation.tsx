
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
import { useProfileManagement } from "@/hooks/useProfileManagement";

type SidebarNavigationProps = {
  navigationItems: NavigationItem[];
};

export function SidebarNavigation({ navigationItems }: SidebarNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRequiredRole, userRoles } = useRoleCheck();
  const { profile } = useProfileManagement();
  
  const shouldShowBulletins = (item: NavigationItem) => {
    // If the item is not the bulletins page, show it based on role check
    if (item.path !== "/bulletins") {
      return hasRequiredRole(item.requiredRoles);
    }
    
    // For bulletins page, additional checks:
    // 1. User must have required roles
    if (!hasRequiredRole(item.requiredRoles)) {
      return false;
    }
    
    // 2. If user is agent_pro, they must have a manager
    const isAgentPro = userRoles.includes('agent_pro');
    const hasManager = !!profile?.manager_id;
    
    // Hide for agent_pro users without a manager
    if (isAgentPro && !hasManager) {
      return false;
    }
    
    return true;
  };
  
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="h-12 px-4 text-lg font-bold mt-3">Agent Hub</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {navigationItems.map((item) => {
            // Check if we should show this navigation item
            if (!shouldShowBulletins(item)) return null;
            
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
