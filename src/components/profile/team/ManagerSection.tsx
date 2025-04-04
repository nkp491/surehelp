
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
  const managerName = profile?.manager_name || '';
  
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
