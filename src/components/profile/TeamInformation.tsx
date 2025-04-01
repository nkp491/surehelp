
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { useManagerValidation } from "./team/useManagerValidation";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { TeamCreationDialog } from "@/components/team/TeamCreationDialog";
import TeamHeader from "./team/TeamHeader";
import ManagerSection from "./team/ManagerSection";
import TeamsSection from "./team/TeamsSection";
import { useTeamInformationLogic } from "@/hooks/useTeamInformationLogic";

interface TeamInformationProps {
  managerId?: string | null;
  onUpdate: (data: any) => void;
}

const TeamInformation = ({
  managerId,
  onUpdate
}: TeamInformationProps) => {
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  
  const { language } = useLanguage();
  const t = translations[language];
  const { validateManagerEmail, isLoading } = useManagerValidation();
  const { userRoles } = useRoleCheck();
  
  const isManager = userRoles.some(role => role.startsWith('manager_pro'));
  const isAgent = userRoles.some(role => role === 'agent' || role === 'agent_pro');

  const {
    isEditing,
    setIsEditing,
    managerEmail,
    setManagerEmail,
    managerName,
    userTeams,
    isLoadingTeams,
    fixingTeamAssociation,
    isProcessing,
    showAlert,
    alertMessage,
    handleRefreshTeams,
    handleForceTeamAssociation,
    toggleEditing
  } = useTeamInformationLogic(managerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationResult = await validateManagerEmail(managerEmail);
    
    if (validationResult.valid) {
      await onUpdate({ manager_id: validationResult.managerId });
      setIsEditing(false);
    }
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      handleSubmit(new Event('submit') as unknown as React.FormEvent);
    } else {
      toggleEditing();
    }
  };

  return (
    <Card className="shadow-sm">
      <TeamHeader 
        isManager={isManager}
        onCreateTeamClick={() => setShowCreateTeamDialog(true)}
        onEditClick={handleToggleEdit}
        isEditing={isEditing}
        isLoading={isLoading}
        isFixing={fixingTeamAssociation || isProcessing}
      />
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <ManagerSection 
            isEditing={isEditing}
            managerName={managerName}
            managerEmail={managerEmail}
            onManagerEmailChange={setManagerEmail}
          />

          <TeamsSection 
            teams={userTeams}
            isLoadingTeams={isLoadingTeams}
            isFixing={fixingTeamAssociation || isProcessing}
            showAlert={showAlert}
            alertMessage={alertMessage}
            onRefresh={handleRefreshTeams}
            onForceTeamAssociation={handleForceTeamAssociation}
            managerId={managerId}
          />
          
          {isEditing && (
            <div className="flex justify-end pt-2">
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors" disabled={isLoading || fixingTeamAssociation || isProcessing}>
                {isLoading ? "Saving..." : t.save}
              </button>
            </div>
          )}
        </form>
      </CardContent>
      
      <TeamCreationDialog
        open={showCreateTeamDialog}
        onOpenChange={setShowCreateTeamDialog}
        onSuccess={() => handleRefreshTeams()}
      />
    </Card>
  );
};

export default TeamInformation;
