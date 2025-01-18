import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface ProfileHeaderProps {
  onSignOut: () => void;
}

const ProfileHeader = ({ onSignOut }: ProfileHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[#2A6F97]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-[#2A6F97]">Profile Settings</h1>
      </div>
      <Button variant="outline" onClick={onSignOut}>Sign Out</Button>
    </div>
  );
};

export default ProfileHeader;