
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { formatRoleName } from "@/components/role-management/roleUtils";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle, 
} from "@/components/ui/alert-dialog"

interface RoleActionFormProps {
  userId: string;
  availableRoles: string[];
  onRoleAction: (action: "assign" | "remove", role: string, subscriptionId: string) => Promise<void>;
}

export function RoleActionForm({ userId, availableRoles, onRoleAction }: RoleActionFormProps) {
  const [role, setRole] = useState("manager_pro_platinum");
  const [action, setAction] = useState<"assign" | "remove">("assign");
  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [subscribedUser, setSubscribedUser] = useState({
    subscriptionId: "",
    userId: ""
  });
  const handleRoleAction = async (subscriptionId: string) => {
    if (!userId.trim() || !role) {
      return;
    }
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      await onRoleAction(action, role, subscriptionId);
    } catch (error: any) {
      console.error("Error performing role action:", error);
    } 
    finally {
      setIsLoading(false);
    }
  };

  const handleCheckSubscription = async () => {
    if (!userId.trim() || !role) {
      return;
    }
    const {data: subscribeduser, error} = await supabase.from("subscriptions").select("user_id, stripe_subscription_id").eq("plan_id", role).eq("user_id", userId);
    if (subscribeduser.length !== 0) {
      setSubscribedUser({
        subscriptionId: subscribeduser[0].stripe_subscription_id,
        userId: subscribeduser[0].user_id
      });
      setOpenDialog(true);
    } else {
      await handleRoleAction(subscribedUser.subscriptionId);
    }
  }

  return (
    <div>
    <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            User has an active subscription for the selected role. Proceeding will revoke their subscription.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={async () => await handleRoleAction(subscribedUser.subscriptionId)}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <div className="border-t pt-4 mt-4">
      <h3 className="font-medium mb-3">Assign or Remove Roles</h3>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="action">
          Action
        </label>
        <Select value={action} onValueChange={(value: "assign" | "remove") => setAction(value)}>
          <SelectTrigger id="action">
            <SelectValue placeholder="Select action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="assign">Assign Role</SelectItem>
            <SelectItem value="remove">Remove Role</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="mt-3">
        <label className="block text-sm font-medium mb-1" htmlFor="role">
          Role
        </label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger id="role">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {availableRoles.map((r) => (
              <SelectItem key={r} value={r}>
                {formatRoleName(r)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        onClick={handleCheckSubscription}
        disabled={isLoading || !userId.trim() || !role}
        className="w-full mt-4"
        variant={action === "remove" ? "destructive" : "default"}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {action === "assign" ? "Assigning..." : "Removing..."}
          </>
        ) : (
          action === "assign" ? "Assign Role" : "Remove Role"
        )}
      </Button>
    </div>
    </div>
  );
}
