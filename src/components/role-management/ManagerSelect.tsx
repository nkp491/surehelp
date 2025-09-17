import { useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserWithRoles } from "@/hooks/useRoleManagement";
import { UserX, Edit } from "lucide-react";
import { useAdminManagerAssignment } from "@/hooks/useAdminManagerAssignment";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ManagerSelectProps {
  user: UserWithRoles;
  allUsers: UserWithRoles[];
  isAssigningManager?: boolean;
  isRemovingManager?: boolean;
}

export function ManagerSelect({
  user,
  allUsers,
  isAssigningManager = false,
  isRemovingManager = false,
}: Readonly<ManagerSelectProps>) {
  const [isEditing, setIsEditing] = useState(false);
  const [managerEmail, setManagerEmail] = useState("");
  const [managerError, setManagerError] = useState("");
  const [currentManager, setCurrentManager] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const [isLoadingManager, setIsLoadingManager] = useState(false);
  
  const { toast } = useToast();
  const { assignManagerToUser, removeManagerFromUser, isLoading: isAssigning } = useAdminManagerAssignment();


  // Fetch current manager information
  useEffect(() => {
    const fetchCurrentManager = async () => {
      setIsLoadingManager(true);
      try {
        // Check if user is in any team
        const { data: teamMember, error: teamMemberError } = await supabase
          .from("team_members")
          .select("team_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (teamMemberError || !teamMember) {
          setCurrentManager(null);
          return;
        }

        // Get team information with manager
        const { data: team, error: teamError } = await supabase
          .from("teams")
          .select("id, name, manager")
          .eq("id", teamMember.team_id)
          .maybeSingle();

        if (teamError || !team?.manager) {
          setCurrentManager(null);
          return;
        }

        // Get manager profile
        const { data: managerProfile, error: profileError } = await supabase
          .from("profiles")
          .select("first_name, last_name, email")
          .eq("email", team.manager)
          .maybeSingle();

        if (profileError || !managerProfile) {
          setCurrentManager(null);
          return;
        }

        setCurrentManager({
          name: `${managerProfile.first_name} ${managerProfile.last_name}`,
          email: managerProfile.email,
        });
      } catch (error) {
        console.error("Error fetching current manager:", error);
        setCurrentManager(null);
      } finally {
        setIsLoadingManager(false);
      }
    };

    fetchCurrentManager();
  }, [user.id]);

  // Check if user has the required role to assign a manager
  const canAssignManager = user.roles.some(role => 
    ['agent_pro', 'manager', 'manager_pro', 'manager_gold', 'manager_pro_gold', 'manager_pro_platinum', 'beta_user', 'system_admin'].includes(role)
  );



  // Handle manager email input change
  const handleManagerEmailChange = useCallback((email: string) => {
    setManagerEmail(email);
    if (!email) {
      setManagerError("");
      return;
    }
    setManagerError("");
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (managerEmail) {
      const result = await assignManagerToUser(user.id, managerEmail);
      
      if (result.success) {
        setManagerError("");
        setManagerEmail("");
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Manager assigned successfully",
        });
        // Refresh current manager info
        setCurrentManager({
          name: result.managerName || managerEmail,
          email: managerEmail,
        });
      } else {
        setManagerError(result.error || "Failed to assign manager");
      }
    } else {
      setIsEditing(false);
    }
  }, [managerEmail, user.id, assignManagerToUser, toast]);

  // Handle removing manager
  const handleRemoveManager = useCallback(async () => {
    const result = await removeManagerFromUser(user.id);
    
    if (result.success) {
      setCurrentManager(null);
      toast({
        title: "Success",
        description: "Manager removed successfully",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to remove manager",
        variant: "destructive",
      });
    }
  }, [user.id, removeManagerFromUser, toast]);


  // Get display value for manager
  const getManagerDisplayValue = () => {
    if (isLoadingManager) {
      return "Loading...";
    }
    if (currentManager) {
      return `${currentManager.name} (${currentManager.email})`;
    }
    return "None assigned";
  };

  // If user doesn't have the required role, show a disabled state
  if (!canAssignManager) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value="Agent Pro required"
          disabled
          className="w-[250px] bg-gray-50 opacity-50"
        />
        <Button
          variant="ghost"
          size="icon"
          disabled
          className="opacity-50"
        >
          <UserX className="h-4 w-4" />
        </Button>
        <div className="text-xs text-muted-foreground">
          Requires Agent Pro or higher
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            type="email"
            placeholder="Enter manager's email"
            value={managerEmail}
            onChange={(e) => handleManagerEmailChange(e.target.value)}
            className="w-[250px]"
            disabled={isAssigning}
          />
          <Button type="submit" disabled={isAssigning || !managerEmail}>
            {isAssigning ? "Assigning..." : "Assign"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsEditing(false);
              setManagerEmail("");
              setManagerError("");
            }}
            disabled={isAssigning}
          >
            Cancel
          </Button>
        </form>
        {managerError && (
          <p className="text-sm text-destructive">{managerError}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="text"
        value={getManagerDisplayValue()}
        disabled
        className="w-[250px] bg-gray-50"
        placeholder="No manager assigned"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsEditing(true)}
        disabled={isAssigning}
        title="Edit manager"
      >
        <Edit className="h-4 w-4" />
      </Button>
      {currentManager && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemoveManager}
          disabled={isAssigning}
          title="Remove manager"
        >
          {isAssigning ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          ) : (
            <UserX className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}
