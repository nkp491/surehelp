import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { useToast } from "@/hooks/use-toast";
import { useTeamMembership } from "@/hooks/useTeamMembership";

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

  // Get team membership information
  const { teamMembership, isLoading: teamLoading } = useTeamMembership();

  const [managerEmail, setManagerEmail] = useState("");
  const [managerError, setManagerError] = useState("");
  const [isCheckingManager, setIsCheckingManager] = useState(false);
  const [managerName, setManagerName] = useState<string | null>(null);

  // Check if user has agent_pro role to allow manager assignment
  const canAssignManager = hasRequiredRole([
    "agent_pro",
    "manager_pro",
    "manager_pro_gold",
    "manager_pro_platinum",
    "beta_user",
    "system_admin",
  ]);

  // Set manager information from team membership
  useEffect(() => {
    if (teamMembership) {
      setManagerName(
        `${teamMembership.manager_name} (${teamMembership.manager_email})`
      );
    } else {
      setManagerName(null);
    }
  }, [teamMembership]);

  // Update form data when props change
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

  // Function to validate manager email and assign to team
  const validateManagerEmail = async (email: string) => {
    setIsCheckingManager(true);
    setManagerError("");

    try {
      console.log("Validating manager email:", email);

      // First check if the email exists in profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .eq("email", email)
        .single();

      if (profileError || !profileData) {
        console.log("Profile not found for email:", email);
        setManagerError("This email does not exist in our system");
        return null;
      }

      console.log("Profile found:", profileData);

      // Check if this user is a manager in the team management system
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

      console.log("Team manager found:", teamManager);

      if (!teamManager) {
        setManagerError("This email does not belong to a manager account");
        return null;
      }

      // Get current user ID
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        setManagerError("User not authenticated");
        return null;
      }

      let managerTeamId = teamManager.team_id;

      // If manager doesn't have a team, create one
      if (!managerTeamId) {
        console.log("Manager does not have a team, creating one...");

        // Create team name based on manager's first name
        const teamName = profileData.first_name
          ? `${profileData.first_name}'s Team`
          : profileData.email
          ? `${profileData.email}'s Team`
          : `Team ${profileData.id.slice(0, 8)}`;

        // Create the team
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

        // Create entry in team_managers table
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
        console.log(
          `Team created successfully for manager ${profileData.id}: ${teamName}`
        );
      }

      // Remove user from any existing team first
      await supabase
        .from("team_members")
        .delete()
        .eq("user_id", currentUser.id);

      // Add user to the manager's team
      const { error: insertError } = await supabase
        .from("team_members")
        .insert([
          {
            team_id: managerTeamId,
            user_id: currentUser.id,
            role: "agent", // Default role for team members
          },
        ]);

      if (insertError) {
        console.error("Error adding user to team:", insertError);
        setManagerError("Error assigning to team");
        return null;
      }

      console.log("User successfully added to team:", managerTeamId);

      setManagerError("");
      setManagerEmail("");
      toast({
        title: "Manager assigned",
        description: `You have been assigned to ${profileData.first_name} ${profileData.last_name}'s team.`,
      });

      // Refresh team membership data
      window.location.reload();

      return profileData;
    } catch (error) {
      console.error("Error validating manager:", error);
      setManagerError("Error validating manager email");
      return null;
    } finally {
      setIsCheckingManager(false);
    }
  };

  // Handle manager email change
  const handleManagerEmailChange = async (email: string) => {
    setManagerEmail(email);
    if (!email) {
      return;
    }

    await validateManagerEmail(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);

    onUpdate(formData);
    setIsEditing(false);
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // If we're currently editing and toggling off, submit the form
      console.log("Saving data via toggle:", formData);
      onUpdate(formData);
    }
    setIsEditing(!isEditing);
  };

  // Get manager display information
  const getManagerDisplay = () => {
    if (teamLoading) {
      return "Loading team information...";
    }

    if (teamMembership) {
      return `${teamMembership.manager_name} (${teamMembership.manager_email})`;
    }

    return "None assigned";
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
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      first_name: e.target.value,
                    }))
                  }
                  className="w-full"
                />
              ) : (
                <p className="text-base text-gray-900 pt-1">
                  {formData.first_name || "Not provided"}
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
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      last_name: e.target.value,
                    }))
                  }
                  className="w-full"
                />
              ) : (
                <p className="text-base text-gray-900 pt-1">
                  {formData.last_name || "Not provided"}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">
                {t.email}
              </label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full"
                />
              ) : (
                <p className="text-base text-gray-900 pt-1">
                  {formData.email || "Not provided"}
                </p>
              )}
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
                  className="w-full"
                />
              ) : (
                <p className="text-base text-gray-900 pt-1">
                  {formData.phone || "Not provided"}
                </p>
              )}
            </div>

            {/* Manager assignment field */}
            <div className="space-y-2.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
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
              <Button type="submit">{t.save}</Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default PersonalInfo;
