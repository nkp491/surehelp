import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, AlertCircle, Users } from "lucide-react";
import { TeamLimitIndicator } from "@/components/team/TeamLimitIndicator";
import { useTeamLimitValidation } from "@/hooks/useTeamLimitValidation";

const translations = {
  en: {
    personalInfo: "Personal Information",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    phone: "Phone",
    managerEmail: "Manager Email",
    assignManager: "Assign Manager",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    managerValidation: "Manager Validation",
    teamLimits: "Team Limits",
  },
  es: {
    personalInfo: "Información Personal",
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Correo Electrónico",
    phone: "Teléfono",
    managerEmail: "Correo del Gerente",
    assignManager: "Asignar Gerente",
    save: "Guardar",
    cancel: "Cancelar",
    edit: "Editar",
    managerValidation: "Validación del Gerente",
    teamLimits: "Límites del Equipo",
  },
};

interface PersonalInfoWithTeamLimitsProps {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  onUpdate: (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  }) => void;
}

const PersonalInfoWithTeamLimits = ({
  firstName,
  lastName,
  email,
  phone,
  onUpdate,
}: PersonalInfoWithTeamLimitsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: firstName || "",
    last_name: lastName || "",
    email: email || "",
    phone: phone || "",
  });
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
  const [nameErrors, setNameErrors] = useState({
    first_name: "",
    last_name: "",
  });

  const { language } = useLanguage();
  const t = translations[language];
  const { hasRequiredRole } = useRoleCheck();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // Get team limit validation for the validated manager
  const { canAdd: canManagerAddMembers, message: teamLimitMessage } =
    useTeamLimitValidation({
      managerId: validatedManager?.profileData.id,
      enabled: !!validatedManager?.profileData.id,
    });

  const canAssignManager = hasRequiredRole([
    "agent_pro",
    "manager",
    "manager_pro",
    "manager_pro_gold",
    "manager_pro_platinum",
    "beta_user",
    "system_admin",
  ]);

  // Validation functions for name fields
  const validateNameField = (
    value: string,
    fieldName: "first_name" | "last_name"
  ) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      setNameErrors((prev) => ({
        ...prev,
        [fieldName]: `${
          fieldName === "first_name" ? "First" : "Last"
        } name is required`,
      }));
      return false;
    }

    if (trimmedValue.length < 2) {
      setNameErrors((prev) => ({
        ...prev,
        [fieldName]: `${
          fieldName === "first_name" ? "First" : "Last"
        } name must be at least 2 characters long`,
      }));
      return false;
    }

    if (!/^[a-zA-Z\s'-]+$/.test(trimmedValue)) {
      setNameErrors((prev) => ({
        ...prev,
        [fieldName]: `${
          fieldName === "first_name" ? "First" : "Last"
        } name can only contain letters, spaces, hyphens, and apostrophes`,
      }));
      return false;
    }

    setNameErrors((prev) => ({ ...prev, [fieldName]: "" }));
    return true;
  };

  const handleSave = useCallback(() => {
    const isFirstNameValid = validateNameField(
      formData.first_name,
      "first_name"
    );
    const isLastNameValid = validateNameField(formData.last_name, "last_name");

    if (!isFirstNameValid || !isLastNameValid) {
      return;
    }

    onUpdate({
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email,
      phone: formData.phone,
    });
    setIsEditing(false);
  }, [formData, onUpdate]);

  const handleCancel = useCallback(() => {
    setFormData({
      first_name: firstName || "",
      last_name: lastName || "",
      email: email || "",
      phone: phone || "",
    });
    setNameErrors({ first_name: "", last_name: "" });
    setIsEditing(false);
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
          "manager",
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
        description: `${profileData.first_name} ${profileData.last_name} can be assigned as your manager. Check team limits below.`,
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

      // Check team limits before assigning
      if (!canManagerAddMembers) {
        setManagerError(teamLimitMessage || "Manager's team is at capacity");
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
        setManagerError("Error assigning user to team");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["team-membership"] });
      toast({
        title: "Manager assigned",
        description: `${profileData.first_name} ${profileData.last_name} has been assigned as your manager.`,
      });
      setValidatedManager(null);
      setManagerEmail("");
    } catch (error) {
      console.error("Error assigning manager:", error);
      setManagerError("Error assigning manager");
    } finally {
      setIsAssigningManager(false);
    }
  };

  useEffect(() => {
    setFormData({
      first_name: firstName || "",
      last_name: lastName || "",
      email: email || "",
      phone: phone || "",
    });
  }, [firstName, lastName, email, phone]);

  return (
    <div className="space-y-6">
      {/* Personal Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t.personalInfo}</span>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                {t.edit}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  {t.cancel}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={
                    !formData.first_name.trim() || !formData.last_name.trim()
                  }
                >
                  {t.save}
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* First Name */}
          <div className="space-y-2.5">
            <label className="text-sm font-medium text-gray-700">
              {t.firstName}
            </label>
            {isEditing ? (
              <>
                <Input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      first_name: e.target.value,
                    }));
                    validateNameField(e.target.value, "first_name");
                  }}
                  placeholder="Enter first name"
                  className="w-full"
                />
                {nameErrors.first_name && (
                  <p className="text-sm text-red-500">
                    {nameErrors.first_name}
                  </p>
                )}
              </>
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
              <>
                <Input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      last_name: e.target.value,
                    }));
                    validateNameField(e.target.value, "last_name");
                  }}
                  placeholder="Enter last name"
                  className="w-full"
                />
                {nameErrors.last_name && (
                  <p className="text-sm text-red-500">{nameErrors.last_name}</p>
                )}
              </>
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
        </CardContent>
      </Card>

      {/* Manager Assignment Card */}
      {canAssignManager && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t.assignManager}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manager-email">{t.managerEmail}</Label>
              <div className="flex gap-2">
                <Input
                  id="manager-email"
                  type="email"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  placeholder="Enter manager's email address"
                  className="flex-1"
                />
                <Button
                  onClick={() => validateManagerEmail(managerEmail)}
                  disabled={!managerEmail.trim() || isCheckingManager}
                >
                  {isCheckingManager ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Validate"
                  )}
                </Button>
              </div>
              {managerError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{managerError}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Manager Validation Result */}
            {validatedManager && (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="font-medium">
                        Manager: {validatedManager.profileData.first_name}{" "}
                        {validatedManager.profileData.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Email: {validatedManager.profileData.email}
                      </div>
                      <Badge variant="outline">
                        {validatedManager.teamManager.role
                          .replace("_", " ")
                          .toUpperCase()}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>

                {/* Team Limits Information */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Users className="h-4 w-4" />
                    {t.teamLimits}
                  </div>
                  <TeamLimitIndicator
                    managerId={validatedManager.profileData.id}
                    showDetails={true}
                  />
                </div>

                {/* Assignment Button */}
                <div className="flex gap-2">
                  <Button
                    onClick={assignValidatedManager}
                    disabled={!canManagerAddMembers || isAssigningManager}
                    className="flex-1"
                  >
                    {isAssigningManager ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {t.assignManager}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setValidatedManager(null);
                      setManagerEmail("");
                      setManagerError("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>

                {!canManagerAddMembers && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Cannot assign this manager: {teamLimitMessage}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PersonalInfoWithTeamLimits;
