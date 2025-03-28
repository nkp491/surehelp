
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { UpdateSuccessMessage } from "./UpdateSuccessMessage";

interface ManagerInfoProps {
  manager: {
    email: string | null;
    first_name: string | null;
    last_name: string | null;
  } | null;
  onUpdate: (data: any) => Promise<void>;
  userRole?: string | null;
}

const ManagerInfo = ({ manager, onUpdate, userRole }: ManagerInfoProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [managerEmail, setManagerEmail] = useState(manager?.email || "");
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language];

  // Only show for agent roles
  const isAgent = userRole === "agent" || userRole === "agent_pro";

  // Debug agent role and component visibility
  console.log("ManagerInfo component - userRole:", userRole, "isAgent:", isAgent);

  useEffect(() => {
    // Update the manager email when the prop changes
    setManagerEmail(manager?.email || "");
  }, [manager]);

  // Clear success message after 3 seconds
  useEffect(() => {
    let timer: number;
    if (updateSuccess) {
      timer = window.setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [updateSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      console.log("Updating manager to:", managerEmail);
      await onUpdate({ manager_email: managerEmail });
      setIsEditing(false);
      setUpdateSuccess(true);
      toast({
        title: "Manager updated",
        description: "Your manager information has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating manager:", error);
      toast({
        title: "Error",
        description: "There was a problem updating your manager information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAgent) {
    console.log("ManagerInfo not rendering - user is not an agent");
    return null;
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold text-foreground">
          Manager Information
        </CardTitle>
        <div className="flex items-center space-x-2">
          <UpdateSuccessMessage show={updateSuccess && !isEditing} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            disabled={isSubmitting}
            className="px-4"
          >
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-2.5">
            <label className="text-sm font-medium text-gray-700">Manager Email</label>
            <p className="text-base text-gray-900 pt-1">
              {manager?.email ? (
                <>
                  {manager.email}
                  {manager.first_name && manager.last_name && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({manager.first_name} {manager.last_name})
                    </span>
                  )}
                </>
              ) : (
                "No manager assigned"
              )}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2.5">
                <label className="text-sm font-medium text-gray-700">Manager Email</label>
                <Input
                  type="email"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  placeholder="Enter your manager's email"
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Enter your manager's email address. They will receive a notification and can add you to their team.
                </p>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default ManagerInfo;
