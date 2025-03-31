
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
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
  const [selectedManager, setSelectedManager] = useState(managerId || '');

  const { language } = useLanguage();
  const t = translations[language];

  // Fetch managers for selection
  const { data: managers, isLoading: loadingManagers } = useQuery({
    queryKey: ['managers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .or('role.eq.manager_pro,role.eq.manager_pro_gold,role.eq.manager_pro_platinum')
        .order('first_name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: isEditing, // Only fetch when editing
  });

  // Update selected manager when prop changes
  useEffect(() => {
    if (managerId !== undefined) {
      setSelectedManager(managerId || '');
    }
  }, [managerId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert empty manager_id to null for database
    const cleanedManagerId = selectedManager === '' || selectedManager === 'none' 
      ? null 
      : selectedManager;
    
    onUpdate({ manager_id: cleanedManagerId });
    setIsEditing(false);
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // If we're currently editing and toggling off, submit the form
      const cleanedManagerId = selectedManager === '' || selectedManager === 'none' 
        ? null 
        : selectedManager;
      
      onUpdate({ manager_id: cleanedManagerId });
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
              <Select
                value={selectedManager}
                onValueChange={(value) => setSelectedManager(value)}
                disabled={loadingManagers}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={loadingManagers ? "Loading managers..." : "Select your manager"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {managers?.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.first_name} {manager.last_name} {manager.email ? `(${manager.email})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-base text-gray-900 pt-1">
                {managers?.find(m => m.id === managerId) 
                  ? `${managers.find(m => m.id === managerId)?.first_name} ${managers.find(m => m.id === managerId)?.last_name}`
                  : (managerId ? 'Loading manager details...' : 'None assigned')}
              </p>
            )}
          </div>
          {isEditing && (
            <div className="flex justify-end pt-2">
              <Button type="submit">{t.save}</Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default TeamInformation;
