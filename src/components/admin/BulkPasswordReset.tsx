import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, KeyRound, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface BulkPasswordResetProps {
  selectedUserIds: string[];
  users: any[] | undefined;
  disabled?: boolean;
}

export function BulkPasswordReset({ selectedUserIds, users, disabled = false }: BulkPasswordResetProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<{ email: string; success: boolean }[]>([]);
  const { toast } = useToast();

  // Filter users to get only those that are selected and have email
  const selectedUsers = users?.filter(user => 
    selectedUserIds.includes(user.id) && user.email
  ) || [];

  const handleBulkResetPassword = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "No users with valid email addresses selected",
        variant: "destructive",
      });
      return;
    }

    setIsResetting(true);
    setResults([]);
    
    const resetResults = [];
    
    // Process each user
    for (const user of selectedUsers) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        resetResults.push({
          email: user.email,
          success: !error
        });
        
        if (error) {
          console.error(`Error sending reset email to ${user.email}:`, error);
        }
      } catch (error) {
        resetResults.push({
          email: user.email,
          success: false
        });
        console.error(`Error sending reset email to ${user.email}:`, error);
      }
    }
    
    setResults(resetResults);
    
    const successCount = resetResults.filter(r => r.success).length;
    
    toast({
      title: successCount > 0 ? "Success" : "Error",
      description: `Successfully sent ${successCount} of ${resetResults.length} password reset emails`,
      variant: successCount === 0 ? "destructive" : "default",
    });
    
    setIsResetting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={isResetting || disabled || selectedUserIds.length === 0}
          variant="outline"
          className="gap-1"
        >
          <KeyRound className="h-4 w-4" />
          Reset Passwords ({selectedUserIds.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reset User Passwords</DialogTitle>
          <DialogDescription>
            This will send password reset emails to {selectedUsers.length} selected users with valid email addresses.
          </DialogDescription>
        </DialogHeader>
        
        {selectedUsers.length === 0 && selectedUserIds.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              None of the selected users have valid email addresses. Password reset emails cannot be sent.
            </AlertDescription>
          </Alert>
        )}
        
        {results.length > 0 && (
          <div className="max-h-60 overflow-y-auto border rounded-md p-2">
            <h3 className="font-medium mb-2">Results:</h3>
            {results.map((result, index) => (
              <div key={index} className="flex items-center justify-between py-1 border-b last:border-b-0">
                <span className="text-sm truncate max-w-[200px]">{result.email}</span>
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? "Sent" : "Failed"}
                </Badge>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button 
            onClick={() => setOpen(false)} 
            variant="outline"
            disabled={isResetting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleBulkResetPassword}
            disabled={isResetting || selectedUsers.length === 0}
          >
            {isResetting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sending...
              </>
            ) : (
              `Send ${selectedUsers.length} Reset Emails`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
