
import React from "react";
import ManagerEmailInput from "./ManagerEmailInput";
import ManagerDisplay from "./ManagerDisplay";
import { Profile } from "@/types/profile";

interface ManagerSectionProps {
  profile?: Profile | null;
  managerEmail: string;
  setManagerEmail: (email: string) => void;
  updateManager: (managerEmail: string) => Promise<void>;
  isUpdating: boolean;
}

const ManagerSection = ({
  profile,
  managerEmail,
  setManagerEmail,
  updateManager,
  isUpdating
}: ManagerSectionProps) => {
  // Use first_name and last_name from manager info if available, otherwise empty string
  const managerName = profile?.manager_id 
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() 
    : '';
  
  return (
    <div className="space-y-2.5">
      <label className="text-sm font-medium text-gray-700">Your Manager</label>
      {isUpdating ? (
        <ManagerEmailInput 
          managerEmail={managerEmail}
          onChange={setManagerEmail}
        />
      ) : (
        <ManagerDisplay 
          managerName={managerName}
          managerEmail={managerEmail}
        />
      )}
    </div>
  );
};

export default ManagerSection;
