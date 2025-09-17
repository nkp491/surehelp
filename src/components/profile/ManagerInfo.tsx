import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { supabase } from "@/integrations/supabase/client";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { useTeamMembership } from "@/hooks/useTeamMembership";
import { useManagerAssignment } from "@/hooks/useManagerAssignment";

const ManagerInfo = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const { hasRequiredRole } = useRoleCheck();
  const { teamMembership, isLoading: teamLoading } = useTeamMembership();
  const { assignManager, isLoading: isAssigningManager } =
    useManagerAssignment();
  const [managerEmail, setManagerEmail] = useState("");
  const [managerError, setManagerError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const canAssignManager = hasRequiredRole([
    "agent_pro",
    "manager_pro",
    "manager_pro_gold",
    "manager_pro_platinum",
    "beta_user",
    "system_admin",
  ]);

  const handleManagerEmailChange = (email: string) => {
    setManagerEmail(email);
    if (!email) {
      setManagerError("");
      return;
    }
    // Clear previous error when typing
    setManagerError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (managerEmail) {
      // Get current user ID
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        setManagerError("User not authenticated");
        return;
      }

      // Use the new hook to assign manager
      const result = await assignManager(managerEmail, currentUser.id);

      if (result.success) {
        setManagerError("");
        setManagerEmail("");
        setIsEditing(false);
      } else {
        setManagerError(result.error || "Failed to assign manager");
      }
    } else {
      setIsEditing(false);
    }
  };

  const getButtonText = () => {
    if (isAssigningManager) return "Assigning...";
    return isEditing ? t.save : t.edit;
  };

  const renderManagerField = () => {
    if (!canAssignManager) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            You need Agent Pro or higher to assign a manager to your profile.
          </p>
        </div>
      );
    }

    if (isEditing) {
      return (
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Enter manager's email"
            value={managerEmail}
            onChange={(e) => handleManagerEmailChange(e.target.value)}
            className="w-full"
          />
          {managerError && (
            <p className="text-sm text-destructive">{managerError}</p>
          )}
        </div>
      );
    }

    let managerDisplayValue = "None assigned";

    if (teamLoading) {
      managerDisplayValue = "Loading...";
    } else if (teamMembership) {
      managerDisplayValue = `${teamMembership.manager_name} (${teamMembership.manager_email})`;
    }

    return (
      <div className="space-y-2">
        <Input
          type="text"
          value={managerDisplayValue}
          disabled
          className="w-full bg-gray-50"
          placeholder="No manager assigned"
        />
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Manager Assignment</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            disabled={isAssigningManager || !canAssignManager}
          >
            {getButtonText()}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2.5">
              <label
                htmlFor="manager-email"
                className="text-sm font-medium text-gray-700"
              >
                Your Manager
              </label>
              {renderManagerField()}
            </div>
          </div>
          {isEditing && (
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isAssigningManager}>
                {isAssigningManager ? "Assigning Manager..." : t.save}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default ManagerInfo;
