import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { supabase } from "@/integrations/supabase/client";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { useToast } from "@/hooks/use-toast";
import { useTeamMembership } from "@/hooks/useTeamMembership";
import { useQueryClient } from "@tanstack/react-query";

interface PersonalInfoProps {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  onUpdate: (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  }) => void;
}

const PersonalInfo = ({
  firstName,
  lastName,
  email,
  phone,
  onUpdate,
}: PersonalInfoProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: firstName || "",
    last_name: lastName || "",
    email: email || "",
    phone: phone || "",
  });

  const { language } = useLanguage();
  const t = translations[language];
  const { hasRequiredRole } = useRoleCheck();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { teamMembership, isLoading: teamLoading } = useTeamMembership();
  const [managerEmail, setManagerEmail] = useState("");
  const [managerError, setManagerError] = useState("");
  const [isCheckingManager, setIsCheckingManager] = useState(false);
  const [validatedManager, setValidatedManager] = useState<{
    profileData: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    };
    teamManager: { user_id: string; role: string; team_id: string };
    teamManagers: Array<{ user_id: string; role: string; team_id: string }>;
  } | null>(null);
  const [isAssigningManager, setIsAssigningManager] = useState(false);

  const canAssignManager = hasRequiredRole([
    "agent_pro",
    "manager_pro",
    "manager_pro_gold",
    "manager_pro_platinum",
    "beta_user",
    "system_admin",
  ]);

  useEffect(() => {
    if (
      firstName !== undefined ||
      lastName !== undefined ||
      email !== undefined ||
      phone !== undefined
    ) {
      setFormData({
        first_name: firstName || "",
        last_name: lastName || "",
        email: email || "",
        phone: phone || "",
      });
    }
  }, [firstName, lastName, email, phone]);

  const validateManagerEmail = async (email: string) => {
    setIsCheckingManager(true);
    setManagerError("");
    setValidatedManager(null);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .eq("email", email)
        .maybeSingle();
      if (profileError || !profileData) {
        setManagerError("This email does not exist in our system");
        return null;
      }
      const { data: teamManagers, error: teamManagerError } = await supabase
        .from("team_managers")
        .select("user_id, role, team_id")
        .eq("user_id", profileData.id)
        .in("role", [
          "manager_pro",
          "manager_gold",
          "manager_pro_gold",
          "manager_pro_platinum",
        ]);
      if (teamManagerError) {
        console.error("Error checking team manager:", teamManagerError);
        setManagerError("Error checking manager role");
        return null;
      }
      if (!teamManagers || teamManagers.length === 0) {
        setManagerError("This email does not belong to a manager account");
        return null;
      }
      const teamManager = teamManagers[0];
      setValidatedManager({
        profileData,
        teamManager,
        teamManagers,
      });
      setManagerError("");
      toast({
        title: "Manager validated",
        description: `${profileData.first_name} ${profileData.last_name} can be assigned as your manager. Click Save to confirm.`,
      });
      return profileData;
    } catch (error) {
      console.error("Error validating manager:", error);
      setManagerError("Error validating manager email");
      return null;
    } finally {
      setIsCheckingManager(false);
    }
  };

  const assignValidatedManager = async () => {
    if (!validatedManager) return;
    setIsAssigningManager(true);
    try {
      const { profileData, teamManager } = validatedManager;
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        setManagerError("User not authenticated");
        return;
      }
      let managerTeamId = teamManager.team_id;
      if (!managerTeamId) {
        const getTeamName = (profile: typeof profileData) => {
          if (profile.first_name) return `${profile.first_name}'s Team`;
          if (profile.email) return `${profile.email}'s Team`;
          return `Team ${profile.id.slice(0, 8)}`;
        };
        const teamName = getTeamName(profileData);
        const { data: newTeam, error: teamError } = await supabase
          .from("teams")
          .insert([{ name: teamName }])
          .select()
          .single();
        if (teamError) {
          console.error("Error creating team:", teamError);
          setManagerError("Error creating team for manager");
          return;
        }
        const { error: teamManagerError } = await supabase
          .from("team_managers")
          .insert([
            {
              team_id: newTeam.id,
              user_id: profileData.id,
              role: teamManager.role,
            },
          ]);
        if (teamManagerError) {
          console.error("Error creating team manager entry:", teamManagerError);
          setManagerError("Error setting up manager team");
          return;
        }
        managerTeamId = newTeam.id;
      }
      await supabase
        .from("team_members")
        .delete()
        .eq("user_id", currentUser.id);
      const { error: insertError } = await supabase
        .from("team_members")
        .insert([
          {
            team_id: managerTeamId,
            user_id: currentUser.id,
            role: "agent",
          },
        ]);
      if (insertError) {
        console.error("Error adding user to team:", insertError);
        setManagerError("Error assigning to team");
        return;
      }
      setManagerError("");
      setManagerEmail("");
      setValidatedManager(null);
      toast({
        title: "Manager assigned",
        description: `You have been assigned to ${profileData.first_name} ${profileData.last_name}'s team.`,
      });

      // Invalidate and refetch team membership data
      queryClient.invalidateQueries({ queryKey: ["team-membership"] });
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
    } catch (error) {
      console.error("Error assigning manager:", error);
      setManagerError("Error assigning manager");
    } finally {
      setIsAssigningManager(false);
    }
  };

  const handleManagerEmailChange = async (email: string) => {
    setManagerEmail(email);
    if (!email) {
      setValidatedManager(null);
      setManagerError("");
      return;
    }
    await validateManagerEmail(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    if (validatedManager) {
      await assignValidatedManager();
    }
    setIsEditing(false);
  };

  const handleToggleEdit = async () => {
    if (isEditing) {
      onUpdate(formData);
      if (validatedManager) {
        await assignValidatedManager();
      }
    }
    setIsEditing(!isEditing);
  };

  const getManagerDisplay = () => {
    if (teamLoading) {
      return "Loading team information...";
    }
    if (teamMembership) {
      return `${teamMembership.manager_name} (${teamMembership.manager_email})`;
    }
    return "None assigned";
  };

  const getButtonText = () => {
    if (isAssigningManager) return "Assigning...";
    return isEditing ? t.save : t.edit;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t.personalInfo}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleEdit}
            disabled={isAssigningManager}
          >
            {getButtonText()}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">
                {t.firstName}
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      first_name: e.target.value,
                    }))
                  }
                  placeholder="Enter first name"
                  className="w-full"
                />
              ) : (
                <Input
                  type="text"
                  value={formData.first_name}
                  placeholder="Enter first name"
                  readOnly
                  className="w-full"
                />
              )}
            </div>
            {/* Last Name */}
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">
                {t.lastName}
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      last_name: e.target.value,
                    }))
                  }
                  placeholder="Enter last name"
                  className="w-full"
                />
              ) : (
                <Input
                  type="text"
                  value={formData.last_name}
                  placeholder="Enter last name"
                  readOnly
                  className="w-full"
                />
              )}
            </div>
            {/* Email */}
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">
                {t.email}
              </label>
              <Input
                type="email"
                value={formData.email}
                placeholder="Email is managed by the system"
                readOnly
                disabled
                className="w-full"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">
                {t.phone}
              </label>
              {isEditing ? (
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="Enter phone"
                  className="w-full"
                />
              ) : (
                <Input
                  type="tel"
                  value={formData.phone}
                  placeholder="Enter phone"
                  readOnly
                  className="w-full"
                />
              )}
            </div>
            {/* Manager assignment field */}
            <div className="space-y-2.5 md:col-span-2">
              <label
                htmlFor="manager-email"
                className="text-sm font-medium text-gray-700"
              >
                Your Manager
              </label>
              {!canAssignManager ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    You need Agent Pro or higher to assign a manager to your
                    profile.
                  </p>
                </div>
              ) : isEditing ? (
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Enter manager's email"
                    value={managerEmail}
                    onChange={(e) => handleManagerEmailChange(e.target.value)}
                    className="w-full"
                  />
                  {isCheckingManager && (
                    <p className="text-sm text-muted-foreground">
                      Checking manager...
                    </p>
                  )}
                  {validatedManager && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✓ {validatedManager.profileData.first_name}{" "}
                        {validatedManager.profileData.last_name} can be assigned
                        as your manager. Click Save to confirm.
                      </p>
                    </div>
                  )}
                  {managerError && (
                    <p className="text-sm text-destructive">{managerError}</p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-700">
                    Current Manager: {getManagerDisplay()}
                  </p>
                </div>
              )}
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

export default PersonalInfo;
