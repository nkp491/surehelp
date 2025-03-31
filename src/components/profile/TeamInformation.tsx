
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { useToast } from "@/hooks/use-toast";
import TextField from "@/components/form-fields/TextField";
import { supabase } from "@/integrations/supabase/client";

interface TeamInformationProps {
  managerId?: string | null;
  onUpdate: (data: any) => void;
}

const TeamInformation = ({
  managerId,
  onUpdate
}: TeamInformationProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [managerEmail, setManagerEmail] = useState('');
  const [managerName, setManagerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { language } = useLanguage();
  const { toast } = useToast();
  const t = translations[language];

  // Fetch current manager details if managerId exists
  useEffect(() => {
    const fetchManagerDetails = async () => {
      if (!managerId) {
        setManagerName('');
        setManagerEmail('');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', managerId)
          .single();

        if (error) throw error;
        
        if (data) {
          setManagerName(`${data.first_name || ''} ${data.last_name || ''}`.trim());
          setManagerEmail(data.email || '');
        }
      } catch (error) {
        console.error("Error fetching manager details:", error);
      }
    };

    fetchManagerDetails();
  }, [managerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!managerEmail.trim()) {
      // If email is empty, remove manager
      console.log("Removing manager, setting manager_id to null");
      await onUpdate({ manager_id: null });
      setIsEditing(false);
      toast({
        title: "Manager Removed",
        description: "You have removed your manager assignment.",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Checking if email exists and belongs to a manager:", managerEmail.trim());
      
      // First check if the email exists in profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', managerEmail.trim())
        .maybeSingle();
        
      if (profileError) {
        console.error("Error checking profile:", profileError);
        throw profileError;
      }
      
      if (!profileData) {
        console.log("Email not found in profiles");
        toast({
          title: "Invalid Manager Email",
          description: "The email provided was not found in our system.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Then check if the user has a manager role in user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', profileData.id)
        .or('role.eq.manager_pro,role.eq.manager_pro_gold,role.eq.manager_pro_platinum');
        
      if (roleError) {
        console.error("Error checking roles:", roleError);
        throw roleError;
      }
      
      if (!roleData || roleData.length === 0) {
        console.log("User does not have manager role in user_roles table");
        toast({
          title: "Invalid Manager Email",
          description: "The email provided is not associated with a manager account.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      console.log("Valid manager found. Updating profile with manager_id:", profileData.id);
      
      // Update profile with the manager's ID
      await onUpdate({ manager_id: profileData.id });
      
      toast({
        title: "Manager Updated",
        description: "Your manager has been updated successfully.",
      });
      
      // Also fetch the manager's name to display in the UI
      const { data: managerProfile, error: managerProfileError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', profileData.id)
        .single();
        
      if (managerProfileError) {
        console.error("Error fetching manager profile:", managerProfileError);
      }
      
      if (managerProfile) {
        setManagerName(`${managerProfile.first_name || ''} ${managerProfile.last_name || ''}`.trim());
      }
      
    } catch (error) {
      console.error("Error updating manager:", error);
      toast({
        title: "Error",
        description: "There was a problem updating your manager. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // If we're currently editing and toggling off, submit the form
      handleSubmit(new Event('submit') as unknown as React.FormEvent);
    } else {
      setIsEditing(true);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold text-foreground">Team Information</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleEdit}
          className="px-4"
        >
          {isEditing ? t.save : t.edit}
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2.5">
            <label className="text-sm font-medium text-gray-700">Your Manager</label>
            {isEditing ? (
              <TextField
                label=""
                type="email"
                value={managerEmail}
                onChange={setManagerEmail}
                placeholder="Enter manager's email"
                className="mt-0"
              />
            ) : (
              <p className="text-base text-gray-900 pt-1">
                {managerName ? managerName : 'None assigned'}
                {managerEmail && <span className="text-sm text-gray-500 block">{managerEmail}</span>}
              </p>
            )}
          </div>
          {isEditing && (
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : t.save}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default TeamInformation;
