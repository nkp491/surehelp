
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
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type SidebarNavigationProps = {
  navigationItems: NavigationItem[];
};

export function SidebarNavigation({ navigationItems }: SidebarNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRequiredRole, userRoles, hasSystemAdminRole, isLoadingRoles } = useRoleCheck();
  const [renderedItems, setRenderedItems] = useState<NavigationItem[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [activePathName, setActivePathName] = useState(location.pathname);
  
  // Pre-process navigation items when userRoles are available
  useEffect(() => {
    console.log("Navigation rendering with roles:", userRoles);
    
    // Always show all items for system_admin
    if (hasSystemAdminRole) {
      console.log("User is system_admin, showing all navigation items");
      setRenderedItems(navigationItems);
      return;
    }
    
    // If roles are still loading, show default items
    if (isLoadingRoles) {
      const basicItems = navigationItems.filter(item => 
        !item.requiredRoles || 
        item.requiredRoles.includes('agent')
      );
      setRenderedItems(basicItems.length > 0 ? basicItems : navigationItems);
      return;
    }
    
    // Filter items by role for non-admins
    if (Array.isArray(userRoles) && userRoles.length > 0) {
      const filtered = navigationItems.filter(item => {
        if (!item.requiredRoles || item.requiredRoles.length === 0) return true;
        return hasRequiredRole(item.requiredRoles);
      });
      
      if (filtered.length === 0) {
        // Fallback if no items match
        const defaultItems = navigationItems.filter(item => 
          !item.requiredRoles || 
          item.requiredRoles.includes('agent') || 
          item.requiredRoles.includes('beta_user')
        );
        setRenderedItems(defaultItems.length ? defaultItems : navigationItems.slice(0, 3));
      } else {
        setRenderedItems(filtered);
      }
    } else {
      // No roles yet, but authenticated - show basic items
      const basicItems = navigationItems.filter(item => 
        !item.requiredRoles || 
        item.requiredRoles.includes('agent')
      );
      setRenderedItems(basicItems.length > 0 ? basicItems : navigationItems.slice(0, 3));
    }
  }, [navigationItems, userRoles, hasRequiredRole, hasSystemAdminRole, isLoadingRoles]);
  
  // Update active path when location changes
  useEffect(() => {
    setActivePathName(location.pathname);
    setIsNavigating(false);
  }, [location.pathname]);
  
  // Handle navigation with safety check and loading state
  const handleNavigation = (path: string) => {
    if (isNavigating || path === activePathName) return;
    
    setIsNavigating(true);
    console.log("Navigating to:", path);
    
    try {
      navigate(path);
      setActivePathName(path);
      
      // Reset navigation state after a delay
      setTimeout(() => setIsNavigating(false), 500);
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("Navigation failed. Please try again.");
      setIsNavigating(false);
    }
  };
  
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="h-12 px-4 text-lg font-bold mt-3">Agent Hub</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {renderedItems.length === 0 ? (
            <div className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading navigation...</span>
            </div>
          ) : (
            renderedItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  onClick={() => handleNavigation(item.path)}
                  disabled={isNavigating}
                  data-active={activePathName === item.path}
                >
                  {isNavigating && activePathName === item.path ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <item.icon className="w-5 h-5" />
                  )}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
