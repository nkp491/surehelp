
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface ProfileAvatarProps {
  imageUrl?: string | null;
  firstName?: string | null;
  className?: string;
}

const ProfileAvatar = ({ imageUrl, firstName, className = "h-8 w-8" }: ProfileAvatarProps) => {
  return (
    <Avatar className={`${className} shadow-md border border-gray-100`}>
      <AvatarImage src={imageUrl || ''} />
      <AvatarFallback className="bg-white">
        {firstName?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  );
};

export default ProfileAvatar;
