
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { useToast } from "@/hooks/use-toast";

interface PersonalInfoProps {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  managerId?: string | null;
  onUpdate: (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    manager_id: string | null;
  }) => void;
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
  const { hasRequiredRole } = useRoleCheck();
  const { toast } = useToast();

  const [managerEmail, setManagerEmail] = useState('');
  const [managerError, setManagerError] = useState('');
  const [isCheckingManager, setIsCheckingManager] = useState(false);
  const [managerName, setManagerName] = useState<string | null>(null);

  // Check if user has agent_pro role to allow manager assignment
  const canAssignManager = hasRequiredRole(['agent_pro', 'manager_pro', 'manager_pro_gold', 'manager_pro_platinum', 'beta_user', 'system_admin']);

  // Fetch managers for selection
  const { data: managers, isLoading: loadingManagers } = useQuery({
    queryKey: ['managers'],
    queryFn: async () => {
      try {
        // First get user IDs of all managers from user_roles
        const { data: managerRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id')
          .in('role', ['manager_pro', 'manager_gold', 'manager_pro_gold', 'manager_pro_platinum']);

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
    enabled: isEditing && canAssignManager, // Only fetch when editing and user can assign managers
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

  // Function to validate manager email - improved to check profiles table first
  const validateManagerEmail = async (email: string) => {
    setIsCheckingManager(true);
    setManagerError('');
    
    try {
      console.log('Validating manager email:', email);
      
      // First check if the email exists in profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('email', email)
        .single();

      if (profileError || !profileData) {
        console.log('Profile not found for email:', email);
        setManagerError('This email does not exist in our system');
        return null;
      }

      console.log('Profile found:', profileData);

      // Then check if this user has a manager role in user_roles table
      // Use .maybeSingle() to handle cases where user might not have any roles
      const { data: managerRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('user_id', profileData.id)
        .in('role', ['manager_pro', 'manager_gold', 'manager_pro_gold', 'manager_pro_platinum']);

      if (roleError) {
        console.error('Error checking manager roles:', roleError);
        setManagerError('Error checking manager role');
        return null;
      }

      console.log('Manager roles found:', managerRoles);

      if (!managerRoles || managerRoles.length === 0) {
        setManagerError('This email does not belong to a manager account');
        return null;
      }

      // Take the first manager role entry
      const firstManagerRole = managerRoles[0];
      console.log('Using first manager role:', firstManagerRole);

      setManagerError('');
      return profileData;
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t.personalInfo}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleEdit}
          >
            {isEditing ? t.save : t.edit}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">{t.firstName}</label>
              {isEditing ? (
                <Input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  className="w-full"
                />
              ) : (
                <p className="text-base text-gray-900 pt-1">{formData.first_name || 'Not provided'}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">{t.lastName}</label>
              {isEditing ? (
                <Input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  className="w-full"
                />
              ) : (
                <p className="text-base text-gray-900 pt-1">{formData.last_name || 'Not provided'}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">{t.email}</label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full"
                />
              ) : (
                <p className="text-base text-gray-900 pt-1">{formData.email || 'Not provided'}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">{t.phone}</label>
              {isEditing ? (
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full"
                />
              ) : (
                <p className="text-base text-gray-900 pt-1">{formData.phone || 'Not provided'}</p>
              )}
            </div>

            {/* Manager selection field */}
            <div className="space-y-2.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Your Manager</label>
              {!canAssignManager ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    You need Agent Pro or higher to assign a manager to your profile.
                  </p>
                </div>
              ) : isEditing ? (
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
