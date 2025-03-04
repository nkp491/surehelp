
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Users2, UserCircle, DollarSign, BookOpen } from "lucide-react";
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
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigationItems = [
  {
    title: "Client Assessment Form",
    path: "/assessment",
    icon: ClipboardList,
  },
  {
    title: "Client Book of Business",
    path: "/submitted-forms",
    icon: BookOpen,
  },
  {
    title: "KPI Insights",
    path: "/metrics",
    icon: LayoutDashboard,
  },
  {
    title: "Commission Tracker",
    path: "/commission-tracker",
    icon: DollarSign,
  },
  {
    title: "Team",
    path: "/manager-dashboard",
    icon: Users2,
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileData, setProfileData] = useState<{
    first_name?: string | null;
    profile_image_url?: string | null;
  }>({});

  useEffect(() => {
    fetchProfileData();

    const channel = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          setProfileData(payload.new as any);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, profile_image_url')
          .eq('id', user.id)
          .single();

        if (profile) {
          setProfileData(profile);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
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
        <SidebarGroup>
          <SidebarGroupLabel className="h-12 px-4 text-lg font-bold mt-3">Agent Hub</SidebarGroupLabel>
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
      <SidebarFooter className="border-t border-gray-200 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <Avatar className="h-9 w-9">
                <AvatarImage src={profileData.profile_image_url || ''} />
                <AvatarFallback>
                  <UserCircle className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{profileData.first_name || 'Agent'}</p>
                <p className="text-xs text-gray-500">View profile</p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
