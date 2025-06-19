
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PersonalInfoProps {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  managerId?: string | null;
  onUpdate: (data: any) => void;
}

const PersonalInfo = ({
  firstName,
  lastName,
  email,
  phone,
  managerId,
  onUpdate
}: PersonalInfoProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: firstName || '',
    last_name: lastName || '',
    email: email || '',
    phone: phone || '',
    manager_id: managerId || ''
  });

  const { language } = useLanguage();
  const t = translations[language];

  const [managerEmail, setManagerEmail] = useState('');
  const [managerError, setManagerError] = useState('');
  const [isCheckingManager, setIsCheckingManager] = useState(false);
  const [managerName, setManagerName] = useState<string | null>(null);

  // Fetch managers for selection
  const { data: managers, isLoading: loadingManagers } = useQuery({
    queryKey: ['managers'],
    queryFn: async () => {
      try {
        // First get user IDs of all managers from user_roles
        const { data: managerRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id')
          .in('role', ['manager_pro', 'manager_pro_gold', 'manager_pro_platinum']);

        if (rolesError) throw rolesError;

        if (!managerRoles?.length) return [];

        // Then get the profile information for these managers
        const { data: managerProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', managerRoles.map(m => m.user_id))
          .order('first_name', { ascending: true });

        if (profilesError) throw profilesError;
        return managerProfiles || [];
      } catch (error) {
        console.error('Error fetching managers:', error);
        throw error;
      }
    },
    enabled: isEditing, // Only fetch when editing
  });

  // Fetch manager details when not editing
  useEffect(() => {
    const fetchManagerDetails = async () => {
      if (!managerId) {
        setManagerName(null);
        return;
      }

      try {
        const { data: manager, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', managerId)
          .single();

        if (error || !manager) {
          console.error('Error fetching manager details:', error);
          setManagerName(null);
          return;
        }

        setManagerName(`${manager.first_name} ${manager.last_name} (${manager.email})`);
      } catch (error) {
        console.error('Error fetching manager details:', error);
        setManagerName(null);
      }
    };

    fetchManagerDetails();
  }, [managerId]);

  // Update form data when props change
  useEffect(() => {
    if (firstName !== undefined || lastName !== undefined || email !== undefined || phone !== undefined || managerId !== undefined) {
      setFormData({
        first_name: firstName || '',
        last_name: lastName || '',
        email: email || '',
        phone: phone || '',
        manager_id: managerId || ''
      });
    }
  }, [firstName, lastName, email, phone, managerId]);

  // Function to validate manager email
  const validateManagerEmail = async (email: string) => {
    setIsCheckingManager(true);
    setManagerError('');
    
    try {
      // Check if the email exists in user_roles with manager role
      const { data: managerRole, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('email', email)
        .in('role', ['manager_pro', 'manager_pro_gold', 'manager_pro_platinum'])
        .single();

      if (roleError) {
        setManagerError('This email does not belong to a manager account');
        return null;
      }

      // Get the manager's profile
      const { data: managerProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('id', managerRole.user_id)
        .single();

      if (profileError) {
        setManagerError('Error finding manager profile');
        return null;
      }

      setManagerError('');
      return managerProfile;
    } catch (error) {
      console.error('Error validating manager:', error);
      setManagerError('Error validating manager email');
      return null;
    } finally {
      setIsCheckingManager(false);
    }
  };

  // Handle manager email change
  const handleManagerEmailChange = async (email: string) => {
    setManagerEmail(email);
    if (!email) {
      setFormData(prev => ({ ...prev, manager_id: 'none' }));
      return;
    }

    const manager = await validateManagerEmail(email);
    if (manager) {
      setFormData(prev => ({ ...prev, manager_id: manager.id }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);
    
    // Create a clean copy of the data for submission
    const cleanedData = {...formData};
    
    // Convert empty manager_id to null for database
    if (cleanedData.manager_id === '' || cleanedData.manager_id === 'none') {
      cleanedData.manager_id = null;
    }
    
    onUpdate(cleanedData);
    setIsEditing(false);
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // If we're currently editing and toggling off, submit the form
      console.log("Saving data via toggle:", formData);
      
      // Create a clean copy of the data for submission
      const cleanedData = {...formData};
      
      // Convert empty manager_id to null for database
      if (cleanedData.manager_id === '' || cleanedData.manager_id === 'none') {
        cleanedData.manager_id = null;
      }
      
      onUpdate(cleanedData);
    }
    setIsEditing(!isEditing);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold text-foreground">{t.personalInfo}</CardTitle>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">{t.firstName}</label>
              {isEditing ? (
                <Input
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  className="w-full"
                />
              ) : (
                <p className="text-base text-gray-900 pt-1">{firstName || '-'}</p>
              )}
            </div>
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">{t.lastName}</label>
              {isEditing ? (
                <Input
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  className="w-full"
                />
              ) : (
                <p className="text-base text-gray-900 pt-1">{lastName || '-'}</p>
              )}
            </div>
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">{t.email}</label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full"
                />
              ) : (
                <p className="text-base text-gray-900 pt-1">{email || '-'}</p>
              )}
            </div>
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">{t.phone}</label>
              {isEditing ? (
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full"
                />
              ) : (
                <p className="text-base text-gray-900 pt-1">{phone || '-'}</p>
              )}
            </div>
            {/* Manager selection field */}
            <div className="space-y-2.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Your Manager</label>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Enter manager's email"
                    value={managerEmail}
                    onChange={(e) => handleManagerEmailChange(e.target.value)}
                    className="w-full"
                  />
                  {isCheckingManager && (
                    <p className="text-sm text-muted-foreground">Checking manager...</p>
                  )}
                  {managerError && (
                    <p className="text-sm text-destructive">{managerError}</p>
                  )}
                </div>
              ) : (
                <p className="text-base text-gray-900 pt-1">
                  {managerName || (managerId ? 'Loading manager details...' : 'None assigned')}
                </p>
              )}
            </div>
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

export default PersonalInfo;
