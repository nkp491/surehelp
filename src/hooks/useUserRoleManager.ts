
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { assignRoleToUser, removeRoleFromUser, getUserRoles } from "@/utils/roles";

interface UserInfo {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
}

export function useUserRoleManager() {
  const [userId, setUserId] = useState("c65f14e1-81d4-46f3-9183-22e935936d0e");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const { toast } = useToast();

  const handleLookupRoles = async () => {
    if (!userId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid user ID",
        variant: "destructive",
      });
      return;
    }

    setIsLookingUp(true);
    setUserRoles([]);
    setUserInfo(null);
    
    try {
      const result = await getUserRoles(userId);
      
      if (result.success) {
        setUserRoles(result.roles || []);
        setUserInfo({
          email: result.email || null,
          firstName: result.firstName || null,
          lastName: result.lastName || null
        });
        
        toast({
          title: "Success",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleRoleAction = async (action: "assign" | "remove", role: string) => {
    if (!userId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid user ID",
        variant: "destructive",
      });
      return;
    }

    try {
      let result;
      
      if (action === "assign") {
        result = await assignRoleToUser(userId, role);
      } else {
        result = await removeRoleFromUser(userId, role);
      }
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        // Refresh roles display if we're looking at the same user
        if (userInfo) {
          handleLookupRoles();
        }
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const selectUser = (user: { id: string; first_name: string | null; last_name: string | null; email: string | null }) => {
    setUserId(user.id);
    setUserInfo({
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name
    });
    // Also load the roles for this user
    getUserRoles(user.id).then(result => {
      if (result.success) {
        setUserRoles(result.roles || []);
      }
    });
  };

  return {
    userId,
    setUserId,
    userInfo,
    userRoles,
    isLookingUp,
    handleLookupRoles,
    handleRoleAction,
    selectUser
  };
}
