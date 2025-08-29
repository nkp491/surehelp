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

  const validateManagerEmail = async (
    email: string,
    shouldAssign: boolean = false
  ) => {
    setIsCheckingManager(true);
    setManagerError("");
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .eq("email", email)
        .single();
      if (profileError || !profileData) {
        setManagerError("This email does not exist in our system");
        return null;
      }
      const { data: teamManager, error: teamManagerError } = await supabase
        .from("team_managers")
        .select("user_id, role, team_id")
        .eq("user_id", profileData.id)
        .in("role", [
          "manager_pro",
          "manager_gold",
          "manager_pro_gold",
          "manager_pro_platinum",
        ])
        .maybeSingle();
      if (teamManagerError) {
        console.error("Error checking team manager:", teamManagerError);
        setManagerError("Error checking manager role");
        return null;
      }
      if (!teamManager) {
        setManagerError("This email does not belong to a manager account");
        return null;
      }
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        setManagerError("User not authenticated");
        return null;
      }
      let managerTeamId = teamManager.team_id;
      if (!managerTeamId) {
        const getTeamName = () => {
          if (profileData.first_name) {
            return `${profileData.first_name}'s Team`;
          }
          if (profileData.email) {
            return `${profileData.email}'s Team`;
          }
          return `Team ${profileData.id.slice(0, 8)}`;
        };
        const teamName = getTeamName();
        const { data: newTeam, error: teamError } = await supabase
          .from("teams")
          .insert([{ name: teamName }])
          .select()
          .single();
        if (teamError) {
          console.error("Error creating team:", teamError);
          setManagerError("Error creating team for manager");
          return null;
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
          return null;
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
        return null;
      }
      if (shouldAssign) {
        setManagerError("");
        setManagerEmail("");
        toast({
          title: "Manager assigned",
          description: `You have been assigned to ${profileData.first_name} ${profileData.last_name}'s team.`,
        });
        queryClient.invalidateQueries({ queryKey: ["team-membership"] });
      } else {
        setManagerError("");
        toast({
          title: "Manager validated",
          description: `Manager ${profileData.first_name} ${profileData.last_name} is valid and ready to be assigned.`,
        });
      }
      return profileData;
    } catch (error) {
      console.error("Error validating manager:", error);
      setManagerError("Error validating manager email");
      return null;
    } finally {
      setIsCheckingManager(false);
    }
  };

  const handleManagerEmailChange = async (email: string) => {
    setManagerEmail(email);
    setManagerError("");
    if (!email) {
      return;
    }
    setIsCheckingManager(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .eq("email", email)
        .single();
      if (profileError || !profileData) {
        setManagerError("This email does not exist in our system");
        return;
      }
      const { data: teamManager, error: teamManagerError } = await supabase
        .from("team_managers")
        .select("user_id, role, team_id")
        .eq("user_id", profileData.id)
        .in("role", [
          "manager_pro",
          "manager_gold",
          "manager_pro_gold",
          "manager_pro_platinum",
        ])
        .maybeSingle();
      if (teamManagerError) {
        setManagerError("Error checking manager role");
        return;
      }
      if (!teamManager) {
        setManagerError("This email does not belong to a manager account");
        return;
      }
      setManagerError("");
      toast({
        title: "Manager validated",
        description: `Manager ${profileData.first_name} ${profileData.last_name} is valid and ready to be assigned.`,
      });
    } catch (error) {
      console.error("Error validating manager email:", error);
      setManagerError("Error validating manager email");
    } finally {
      setIsCheckingManager(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (managerEmail && !managerError) {
      const managerData = await validateManagerEmail(managerEmail, true);
      if (!managerData) {
        return;
      }
    }
    const { email, ...editableData } = formData;
    onUpdate(editableData);
    setIsEditing(false);
  };

  const handleToggleEdit = async () => {
    if (isEditing) {
      if (managerEmail && !managerError) {
        const managerData = await validateManagerEmail(managerEmail, true);
        if (!managerData) {
          return;
        }
      }
      const { email, ...editableData } = formData;
      onUpdate(editableData);
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
            id="manager-email"
            type="email"
            placeholder="Enter manager's email"
            value={managerEmail}
            onChange={(e) => handleManagerEmailChange(e.target.value)}
            className="w-full"
          />
          {isCheckingManager && (
            <p className="text-sm text-muted-foreground">Checking manager...</p>
          )}
          {managerError && (
            <p className="text-sm text-destructive">{managerError}</p>
          )}
        </div>
      );
    }

    return (
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-700">
          Current Manager: {getManagerDisplay()}
        </p>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t.personalInfo}</span>
          <Button variant="outline" size="sm" onClick={handleToggleEdit}>
            {isEditing ? t.save : t.edit}
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
                  placeholder="Enter first name"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      first_name: e.target.value,
                    }))
                  }
                  className="w-full"
                />
              ) : (
                <p className="text-base text-gray-900 pt-1 min-h-[20px]">
                  {formData.first_name || (
                    <span className="text-gray-400 italic">Not provided</span>
                  )}
                </p>
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
                  placeholder="Enter last name"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      last_name: e.target.value,
                    }))
                  }
                  className="w-full"
                />
              ) : (
                <p className="text-base text-gray-900 pt-1 min-h-[20px]">
                  {formData.last_name || (
                    <span className="text-gray-400 italic">Not provided</span>
                  )}
                </p>
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
                disabled
                className="w-full bg-gray-50 cursor-not-allowed opacity-75"
                title="Email cannot be changed"
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
                  placeholder="Enter phone number"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full"
                />
              ) : (
                <p className="text-base text-gray-900 pt-1 min-h-[20px]">
                  {formData.phone || (
                    <span className="text-gray-400 italic">Not provided</span>
                  )}
                </p>
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
              {renderManagerField()}
            </div>
          </div>
          {isEditing && (
            <div className="flex justify-end pt-2">
              <Button type="submit">{t.save}</Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default PersonalInfo;
