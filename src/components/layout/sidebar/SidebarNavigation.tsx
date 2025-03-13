
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
  
  // Pre-process navigation items when userRoles are available
  useEffect(() => {
    console.log("Navigation rendering with roles:", userRoles);
    
    try {
      // Always show all items for system_admin
      if (hasSystemAdminRole) {
        console.log("User is system_admin, showing all navigation items");
        setRenderedItems(navigationItems);
        return;
      }
      
      // While loading roles, show all navigation items with a loading indicator
      if (isLoadingRoles) {
        console.log("Roles still loading, showing all items temporarily");
        setRenderedItems(navigationItems);
        return;
      }
      
      // Filter items by role for non-admins
      if (Array.isArray(userRoles) && userRoles.length > 0) {
        const filtered = navigationItems.filter(item => {
          if (!item.requiredRoles || item.requiredRoles.length === 0) return true;
          const hasRole = hasRequiredRole(item.requiredRoles);
          console.log(`Navigation item ${item.title} requires roles ${item.requiredRoles?.join(', ')}, user has access: ${hasRole}`);
          return hasRole;
        });
        
        console.log("Filtered navigation items:", filtered.map(f => f.title).join(', '));
        
        if (filtered.length === 0) {
          // Fallback if no items match (possible race condition)
          console.warn("No navigation items matched user roles, showing default items");
          toast.warning("Navigation is limited due to role verification. Please refresh if items are missing.");
          const defaultItems = navigationItems.filter(item => 
            !item.requiredRoles || 
            item.requiredRoles.includes('agent') || 
            item.requiredRoles.includes('beta_user')
          );
          setRenderedItems(defaultItems.length ? defaultItems : navigationItems);
        } else {
          setRenderedItems(filtered);
        }
      } else {
        // No roles yet, but authenticated - show all items while roles load
        console.log("No roles loaded yet, showing all items temporarily");
        setRenderedItems(navigationItems);
      }
    } catch (error) {
      console.error("Error in navigation rendering:", error);
      // Fallback to all items in case of error
      setRenderedItems(navigationItems);
      toast.error("Error loading navigation. Please refresh the page.");
    }
  }, [navigationItems, userRoles, hasRequiredRole, hasSystemAdminRole, isLoadingRoles]);
  
  // Handle navigation with safety check and loading state
  const handleNavigation = (path: string) => {
    if (isNavigating || path === location.pathname) return;
    
    setIsNavigating(true);
    console.log("Navigating to:", path);
    
    try {
      navigate(path);
      // Reset navigation state after a delay
      setTimeout(() => setIsNavigating(false), 1000);
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
                  data-active={location.pathname === item.path}
                >
                  {isNavigating && location.pathname === item.path ? (
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
