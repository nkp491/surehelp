
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { NotificationsDropdown } from "@/components/notifications/NotificationsDropdown";

export default function ProfileMenu() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        try {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("first_name, last_name, email, role, profile_image_url")
            .eq("id", user.id)
            .single();

          if (error) throw error;

          if (profile) {
            const fullName = [profile.first_name, profile.last_name]
              .filter(Boolean)
              .join(" ");
            setName(fullName || "User");
            setRole(profile.role || "");
            setEmail(profile.email || "");
            setAvatarUrl(profile.profile_image_url);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
    };

    getProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  // Format the role for display
  const formatRoleName = (role: string) => {
    if (!role) return "";
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="flex items-center gap-2">
      <NotificationsDropdown />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <ProfileAvatar 
              imageUrl={avatarUrl} 
              firstName={name.charAt(0)} 
              className="h-10 w-10" 
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {email}
              </p>
              {role && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formatRoleName(role)}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleProfileClick}>Profile</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/team-directory')}>
            Team Directory
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/notifications')}>
            Notifications
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
