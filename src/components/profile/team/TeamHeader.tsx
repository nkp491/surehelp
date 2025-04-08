
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";

interface TeamHeaderProps {
  isManager: boolean;
  onCreateTeamClick: () => void;
  onEditClick: () => void;
  isEditing: boolean;
  isLoading: boolean;
  isFixing: boolean;
}

const TeamHeader = ({ 
  isManager, 
  onCreateTeamClick, 
  onEditClick, 
  isEditing, 
  isLoading,
  isFixing
}: TeamHeaderProps) => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
      <CardTitle className="text-xl font-semibold text-foreground">Team Information</CardTitle>
      <div className="flex gap-2">
        {isManager && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateTeamClick}
            className="flex items-center gap-1"
            disabled={isFixing}
          >
            <Plus className="h-4 w-4" />
            <span>Create Team</span>
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onEditClick}
          className="px-4"
          disabled={isLoading || isFixing}
        >
          {isEditing ? t.save : t.edit}
        </Button>
      </div>
    </CardHeader>
  );
};

export default TeamHeader;
