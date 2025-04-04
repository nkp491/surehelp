
import React from "react";
import ManagerEmailInput from "./ManagerEmailInput";
import ManagerDisplay from "./ManagerDisplay";

interface ManagerSectionProps {
  isEditing: boolean;
  managerName: string;
  managerEmail: string;
  onManagerEmailChange: (email: string) => void;
}

const ManagerSection = ({
  isEditing,
  managerName,
  managerEmail,
  onManagerEmailChange
}: ManagerSectionProps) => {
  return (
    <div className="space-y-2.5">
      <label className="text-sm font-medium text-gray-700">Your Manager</label>
      {isEditing ? (
        <ManagerEmailInput 
          managerEmail={managerEmail}
          onChange={onManagerEmailChange}
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
