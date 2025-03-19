
import { useState } from "react";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRoleCheck } from "@/hooks/useRoleCheck";

interface AddTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
}

export function AddTeamMemberDialog({ 
  open, 
  onOpenChange, 
  teamId 
}: AddTeamMemberDialogProps) {
  const { addTeamMember, isLoading } = useTeamManagement();
  const { hasRequiredRole } = useRoleCheck();
  const [userQuery, setUserQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("agent");

  // Determine if user can add managers
  const canAddManagers = hasRequiredRole(['manager_pro_gold', 'manager_pro_platinum', 'system_admin']);

  // Search for users that aren't already in the team
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['user-search', userQuery, teamId],
    queryFn: async () => {
      if (!userQuery.trim() || userQuery.length < 3) return [];

      // Get team members to exclude them from search
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId);

      const teamMemberIds = teamMembers?.map(m => m.user_id) || [];

      // Search for users by name or email
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, profile_image_url')
        .or(`first_name.ilike.%${userQuery}%,last_name.ilike.%${userQuery}%,email.ilike.%${userQuery}%`)
        .limit(10);

      if (error) throw error;

      // Filter out users that are already team members
      return data.filter(user => !teamMemberIds.includes(user.id));
    },
    enabled: open && userQuery.length >= 3,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedRole) return;
    
    await addTeamMember.mutateAsync({
      teamId,
      userId: selectedUserId,
      role: selectedRole
    });
    
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setUserQuery("");
    setSelectedUserId("");
    setSelectedRole("agent");
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Search for a user to add to your team.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="user-search">Search User</Label>
              <Input
                id="user-search"
                value={userQuery}
                onChange={(e) => {
                  setUserQuery(e.target.value);
                  setSelectedUserId("");
                }}
                placeholder="Search by name or email"
                autoFocus
              />
            </div>

            {userQuery.length >= 3 && (
              <div className="border rounded-md max-h-40 overflow-y-auto">
                {isSearching ? (
                  <div className="p-3 text-center">
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                    Searching...
                  </div>
                ) : searchResults && searchResults.length > 0 ? (
                  <div className="divide-y">
                    {searchResults.map(user => (
                      <div 
                        key={user.id}
                        className={`p-2 cursor-pointer hover:bg-muted flex items-center ${selectedUserId === user.id ? 'bg-muted' : ''}`}
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        <div className="flex-1">
                          <p className="font-medium">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                        {selectedUserId === user.id && (
                          <UserPlus className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center text-muted-foreground">
                    No users found
                  </div>
                )}
              </div>
            )}

            {selectedUserId && (
              <div className="grid gap-2 mt-2">
                <Label htmlFor="role-select">Assign Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger id="role-select">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="agent_pro">Agent Pro</SelectItem>
                    
                    {/* Only show manager roles if user has permission */}
                    {canAddManagers && (
                      <>
                        <SelectItem value="manager_pro">Manager Pro</SelectItem>
                        {hasRequiredRole(['manager_pro_platinum', 'system_admin']) && (
                          <>
                            <SelectItem value="manager_pro_gold">Manager Pro Gold</SelectItem>
                            <SelectItem value="manager_pro_platinum">Manager Pro Platinum</SelectItem>
                          </>
                        )}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !selectedUserId || !selectedRole}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add to Team
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
