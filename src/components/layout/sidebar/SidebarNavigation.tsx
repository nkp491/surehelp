
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
import { useEffect, useState } from "react";

type SidebarNavigationProps = {
  navigationItems: NavigationItem[];
};

export function SidebarNavigation({ navigationItems }: SidebarNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRequiredRole, userRoles } = useRoleCheck();
  const [renderedItems, setRenderedItems] = useState<NavigationItem[]>([]);
  
  // Pre-process navigation items when userRoles are available
  useEffect(() => {
    if (!userRoles || !Array.isArray(userRoles)) return;
    
    // Always show all items for system_admin
    if (userRoles.includes('system_admin')) {
      setRenderedItems(navigationItems);
      return;
    }
    
    // Filter items by role for non-admins
    const filtered = navigationItems.filter(item => {
      if (!item.requiredRoles || item.requiredRoles.length === 0) return true;
      return hasRequiredRole(item.requiredRoles);
    });
    
    setRenderedItems(filtered);
  }, [navigationItems, userRoles, hasRequiredRole]);
  
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="h-12 px-4 text-lg font-bold mt-3">Agent Hub</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {renderedItems.map((item) => (
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
  );
}
