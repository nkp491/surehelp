
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle } from "lucide-react";
import { SidebarFooter } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { roleService } from "@/services/roleService";

type SidebarProfileProps = {
  profileData: {
    first_name?: string | null;
    profile_image_url?: string | null;
  };
};

export function SidebarProfile({ profileData }: SidebarProfileProps) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      roleService.clearRoles();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
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
  );
}
