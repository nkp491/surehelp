
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
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, AlertCircle, File, Circle } from "lucide-react";
import * as LucideIcons from "lucide-react";

type SidebarNavigationProps = {
  navigationItems: NavigationItem[];
};

export function SidebarNavigation({ navigationItems }: SidebarNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRequiredRole, userRoles, hasSystemAdminRole, isLoadingRoles, refetchRoles } = useRoleCheck();
  const [renderedItems, setRenderedItems] = useState<NavigationItem[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [activePathName, setActivePathName] = useState(location.pathname);
  const [isInitialRender, setIsInitialRender] = useState(true);
  
  useEffect(() => {
    try {
      const cachedNavItems = sessionStorage.getItem('nav-items');
      if (cachedNavItems) {
        const parsedItems = JSON.parse(cachedNavItems);
        console.log("Using cached navigation items from sessionStorage");
        setRenderedItems(parsedItems);
        setIsInitialRender(false);
      }
    } catch (e) {
      console.error('Error checking sessionStorage for navigation items:', e);
    }
  }, []);
  
  useEffect(() => {
    const checkAdmin = async () => {
      if (!isInitialRender && renderedItems.length <= 3 && localStorage.getItem('is-system-admin') === 'true') {
        console.log("Force refetching roles due to limited menu items for admin");
        await refetchRoles();
      }
    };
    
    checkAdmin();
  }, [renderedItems.length, refetchRoles, isInitialRender]);
  
  const filterNavigationItems = useCallback(() => {
    if (hasSystemAdminRole) {
      console.log("User is system_admin, showing all navigation items");
      setRenderedItems(navigationItems);
      
      try {
        sessionStorage.setItem('nav-items', JSON.stringify(navigationItems));
      } catch (e) {
        console.error('Error caching navigation items:', e);
      }
      
      return;
    }
    
    if (isLoadingRoles) {
      try {
        const isAdmin = localStorage.getItem('is-system-admin') === 'true';
        if (isAdmin) {
          console.log("Using admin status from localStorage during loading");
          setRenderedItems(navigationItems);
          return;
        }
        
        const cachedNavItems = sessionStorage.getItem('nav-items');
        if (cachedNavItems && !isInitialRender) {
          const parsedItems = JSON.parse(cachedNavItems);
          console.log("Using cached navigation items during loading");
          setRenderedItems(parsedItems);
          return;
        }
      } catch (e) {
        console.error('Error checking localStorage:', e);
      }
      
      const basicItems = navigationItems.filter(item => 
        !item.requiredRoles || 
        item.requiredRoles.includes('agent')
      );
      setRenderedItems(basicItems.length > 0 ? basicItems : navigationItems.slice(0, 3));
      return;
    }
    
    if (Array.isArray(userRoles) && userRoles.length > 0) {
      const filtered = navigationItems.filter(item => {
        if (!item.requiredRoles || item.requiredRoles.length === 0) return true;
        return hasRequiredRole(item.requiredRoles);
      });
      
      if (filtered.length === 0) {
        const defaultItems = navigationItems.filter(item => 
          !item.requiredRoles || 
          item.requiredRoles.includes('agent') || 
          item.requiredRoles.includes('beta_user')
        );
        setRenderedItems(defaultItems.length ? defaultItems : navigationItems.slice(0, 3));
      } else {
        setRenderedItems(filtered);
        
        try {
          sessionStorage.setItem('nav-items', JSON.stringify(filtered));
        } catch (e) {
          console.error('Error caching navigation items:', e);
        }
      }
    } else {
      const basicItems = navigationItems.filter(item => 
        !item.requiredRoles || 
        item.requiredRoles.includes('agent')
      );
      setRenderedItems(basicItems.length > 0 ? basicItems : navigationItems.slice(0, 3));
    }
    
    setIsInitialRender(false);
  }, [navigationItems, userRoles, hasRequiredRole, hasSystemAdminRole, isLoadingRoles, isInitialRender]);
  
  useEffect(() => {
    filterNavigationItems();
  }, [filterNavigationItems]);
  
  useEffect(() => {
    setActivePathName(location.pathname);
    setIsNavigating(false);
  }, [location.pathname]);
  
  const handleNavigation = (path: string) => {
    if (isNavigating || path === activePathName) return;
    
    setIsNavigating(true);
    console.log("Navigating to:", path);
    
    try {
      navigate(path);
      setActivePathName(path);
      
      setTimeout(() => setIsNavigating(false), 500);
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("Navigation failed. Please try again.");
      setIsNavigating(false);
    }
  };

  const handleGotoHome = () => {
    navigate('/');
  };
  
  // Fixed renderIcon function to properly handle different icon types
  const renderIcon = (item: NavigationItem) => {
    if (typeof item.icon === 'function') {
      const Icon = item.icon;
      return <Icon className="w-5 h-5" />;
    }
    
    if (typeof item.icon === 'string') {
      // Explicitly check if the icon exists in LucideIcons
      const iconName = item.icon as keyof typeof LucideIcons;
      if (LucideIcons[iconName] && typeof LucideIcons[iconName] === 'function') {
        // Use dynamic component reference
        const DynamicIcon = LucideIcons[iconName];
        return <DynamicIcon className="w-5 h-5" />;
      }
      return <File className="w-5 h-5" />;
    }
    
    return <Circle className="w-5 h-5" />;
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="h-12 px-4 text-lg font-bold mt-3">Agent Hub</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {isLoadingRoles && isInitialRender ? (
            <div className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading navigation...</span>
            </div>
          ) : renderedItems.length === 0 ? (
            <div className="p-4 space-y-3">
              <div className="px-4 py-3 text-sm text-muted-foreground flex items-center gap-2 border rounded-md bg-slate-50">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span>No navigation items available</span>
              </div>
              <button 
                onClick={handleGotoHome}
                className="w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center gap-2 border rounded-md hover:bg-slate-50 transition-colors"
              >
                Go to Homepage
              </button>
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
                    renderIcon(item)
                  )}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          )}
          
          {!isLoadingRoles && Array.isArray(userRoles) && userRoles.length === 0 && (
            <div className="px-4 py-3 mt-3 text-xs text-muted-foreground border-t">
              <p>Your account has no assigned roles.</p>
              <button 
                onClick={handleGotoHome}
                className="text-blue-600 hover:text-blue-800 hover:underline mt-2"
              >
                Return to Homepage
              </button>
            </div>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
