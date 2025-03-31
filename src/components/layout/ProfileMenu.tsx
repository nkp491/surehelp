
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { useProfileMenu } from "@/hooks/useProfileMenu";

const ProfileMenu = () => {
  const { profileData, handleSignOut } = useProfileMenu();

  return (
    <div className="flex items-center space-x-4">
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <ProfileAvatar 
            imageUrl={profileData.profile_image_url} 
            firstName={profileData.first_name} 
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleSignOut}>
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProfileMenu;
