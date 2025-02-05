import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface ProfileHeaderProps {
  onSignOut: () => void;
}

const ProfileHeader = ({ onSignOut }: ProfileHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center py-6 px-8">
      <div className="flex items-center gap-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[#2A6F97] hover:bg-blue-50"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-base font-medium">Back to Dashboard</span>
        </Button>
        <h1 className="text-3xl font-bold text-[#2A6F97] tracking-tight">Profile Settings</h1>
      </div>
      <Button 
        variant="outline" 
        onClick={onSignOut}
        className="px-8 py-2 text-base font-medium border-2 hover:bg-blue-50 ml-12"
      >
        Sign Out
      </Button>
    </div>
  );
};

export default ProfileHeader;