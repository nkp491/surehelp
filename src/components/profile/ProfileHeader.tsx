
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  onSignOut: () => void;
}

const ProfileHeader = ({ onSignOut }: ProfileHeaderProps) => {
  return (
    <div className="flex justify-between items-center py-6 px-8">
      <h1 className="text-3xl font-bold text-[#2A6F97] tracking-tight">Profile Settings</h1>
      <Button 
        variant="outline" 
        onClick={onSignOut}
        className="px-8 py-2 text-base font-medium border-2 hover:bg-blue-50"
      >
        Sign Out
      </Button>
    </div>
  );
};

export default ProfileHeader;
