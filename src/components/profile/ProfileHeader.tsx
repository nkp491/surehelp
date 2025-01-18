import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  onSignOut: () => void;
}

const ProfileHeader = ({ onSignOut }: ProfileHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">Profile Settings</h1>
      <Button variant="outline" onClick={onSignOut}>Sign Out</Button>
    </div>
  );
};

export default ProfileHeader;