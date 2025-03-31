
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
      onUpdate({ manager_id: null });
      setIsEditing(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First verify if email exists and belongs to a manager
      const { data: managerData, error: managerError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('email', managerEmail.trim())
        .or('role.eq.manager_pro,role.eq.manager_pro_gold,role.eq.manager_pro_platinum');
        
      if (managerError) throw managerError;
      
      if (!managerData || managerData.length === 0) {
        // Email doesn't exist or user is not a manager
        toast({
          title: "Invalid Manager Email",
          description: "The email provided is not associated with a manager account.",
          variant: "destructive",
        });
        return;
      }
      
      // Update profile with the manager's ID
      onUpdate({ manager_id: managerData[0].id });
      toast({
        title: "Manager Updated",
        description: "Your manager has been updated successfully.",
      });
      
      // Also fetch the manager's name to display in the UI
      const { data: managerProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', managerData[0].id)
        .single();
        
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
    }
    setIsEditing(!isEditing);
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
