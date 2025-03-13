
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Profile } from "@/types/profile";
import { useToast } from "@/hooks/use-toast";

interface UserRoleProps {
  role: "agent" | "manager_pro" | "beta_user" | "manager_pro_gold" | "manager_pro_platinum" | "agent_pro" | "system_admin" | null;
  canEditRole?: boolean;
  onUpdateRole?: (role: Profile["role"]) => Promise<void>;
  isCurrentUserProfile?: boolean;
}

const UserRole = ({ 
  role, 
  canEditRole = false, 
  onUpdateRole,
  isCurrentUserProfile = true 
}: UserRoleProps) => {
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Profile["role"]>(role);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to determine badge variant based on role
  const getBadgeVariant = (role: string | null) => {
    switch(role) {
      case "system_admin": return "destructive"; // Special styling for system admin
      case "manager_pro_platinum": return "outline"; 
      case "manager_pro_gold": return "outline"; 
      case "agent_pro": return "outline"; 
      case "manager_pro": return "default";
      case "beta_user": return "destructive";
      default: return "secondary";
    }
  };

  // Format the role display text with proper capitalization
  const getRoleDisplay = (role: string | null) => {
    if (!role) return "Agent";
    
    // Special cases for multi-word roles
    if (role === "system_admin") return "System Admin";
    if (role === "beta_user") return "Beta User";
    if (role === "manager_pro_gold") return "Manager Pro Gold";
    if (role === "manager_pro_platinum") return "Manager Pro Platinum";
    if (role === "agent_pro") return "Agent Pro";
    if (role === "manager_pro") return "Manager Pro";
    
    // For other roles, just capitalize the first letter
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const handleSubmit = async () => {
    if (!onUpdateRole || selectedRole === role) {
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdateRole(selectedRole);
      toast({
        title: "Role updated",
        description: `Role updated to ${getRoleDisplay(selectedRole)}`,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error updating role",
        description: "There was a problem updating the role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold text-foreground">{t.userRole}</CardTitle>
        {canEditRole && isCurrentUserProfile && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => isEditing ? handleSubmit() : setIsEditing(true)}
            className="px-4"
            disabled={isSubmitting}
          >
            {isEditing ? t.save : t.edit}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <Select 
              value={selectedRole || "agent"} 
              onValueChange={(value) => setSelectedRole(value as Profile["role"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="agent_pro">Agent Pro</SelectItem>
                <SelectItem value="manager_pro">Manager Pro</SelectItem>
                <SelectItem value="manager_pro_gold">Manager Pro Gold</SelectItem>
                <SelectItem value="manager_pro_platinum">Manager Pro Platinum</SelectItem>
                <SelectItem value="beta_user">Beta User</SelectItem>
                <SelectItem value="system_admin">System Admin</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || selectedRole === role}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <Badge 
              variant={getBadgeVariant(role)} 
              className={`text-sm ${
                role === "manager_pro_gold" 
                  ? "border-yellow-500 text-yellow-700 bg-yellow-50" 
                  : role === "manager_pro_platinum" 
                    ? "border-purple-500 text-purple-700 bg-purple-50" 
                    : role === "agent_pro"
                      ? "border-blue-500 text-blue-700 bg-blue-50"
                      : role === "system_admin"
                        ? "border-red-500 text-white bg-red-600 hover:bg-red-700"
                        : ""
              }`}
            >
              {getRoleDisplay(role)}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserRole;
