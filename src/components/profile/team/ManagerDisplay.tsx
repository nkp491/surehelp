
import React from "react";
import { Profile } from "@/types/profile";
import ProfileAvatar from "@/components/profile/ProfileAvatar";

interface ManagerDisplayProps {
  managerName: string;
  managerEmail: string;
}

const ManagerDisplay = ({ managerName, managerEmail }: ManagerDisplayProps) => {
  return (
    <div className="flex items-center gap-3">
      <ProfileAvatar
        firstName={managerName.split(' ')[0]}
        className="h-10 w-10"
      />
      <div>
        <p className="text-base text-gray-900 pt-1">
          {managerName ? managerName : 'None assigned'}
          {managerEmail && <span className="text-sm text-gray-500 block">{managerEmail}</span>}
        </p>
      </div>
    </div>
  );
};

export default ManagerDisplay;
