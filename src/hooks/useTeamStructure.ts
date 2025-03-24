
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfileSanitization } from './profile/useProfileSanitization';

// Use a simple type alias instead of complex interfaces
type ProfileRecord = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  profile_image_url: string | null;
  role: string | null;
  roles?: string[];
  reports_to?: string | null;
  manager_email?: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: any; // Allow other properties without strict typing
};

// Create a simple structure without circular references
type TeamStructure = {
  manager: ProfileRecord | null;
  directReports: ProfileRecord[];
};

export const useTeamStructure = () => {
  const [reportingStructure, setReportingStructure] = useState<TeamStructure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { sanitizeProfileData } = useProfileSanitization();

  const getReportingStructure = async (profileId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get the requested profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (profileError) {
        throw profileError;
      }

      if (!profile) {
        throw new Error('Profile not found');
      }

      // Sanitize profile data without creating complex types
      const sanitizedProfile = sanitizeProfileData({
        ...profile,
        roles: [profile.role].filter(Boolean)
      }) as ProfileRecord;
      
      // Get manager if reports_to is set
      let manager: ProfileRecord | null = null;
      if (sanitizedProfile.reports_to) {
        const { data: managerData, error: managerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sanitizedProfile.reports_to)
          .single();
        
        if (!managerError && managerData) {
          manager = sanitizeProfileData({
            ...managerData,
            roles: [managerData.role].filter(Boolean)
          }) as ProfileRecord;
        }
      } else if (sanitizedProfile.manager_email) {
        // Try to find manager by email if reports_to is not set but manager_email is
        const { data: managerData, error: managerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', sanitizedProfile.manager_email)
          .single();
          
        if (!managerError && managerData) {
          manager = sanitizeProfileData({
            ...managerData,
            roles: [managerData.role].filter(Boolean)
          }) as ProfileRecord;
          
          // Update the reports_to field if we found the manager
          if (managerData.id) {
            // Using type assertion to bypass TypeScript's type checking
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ reports_to: managerData.id } as any)
              .eq('id', profileId);
              
            if (updateError) {
              console.error("Error updating reports_to field:", updateError);
            }
          }
        }
      }

      // Get direct reports
      const { data: reportingData, error: reportingError } = await supabase
        .from('profiles')
        .select('*')
        .eq('reports_to', profileId);

      if (reportingError) {
        throw reportingError;
      }

      // Sanitize direct reports data
      const directReports = (reportingData || []).map(report => 
        sanitizeProfileData({
          ...report,
          roles: [report.role].filter(Boolean)
        }) as ProfileRecord
      );

      // Create a simple structure object
      const structure: TeamStructure = {
        manager,
        directReports
      };

      setReportingStructure(structure);
      return structure;
    } catch (error: any) {
      console.error('Error fetching reporting structure:', error);
      setError(error.message || 'Failed to load reporting structure');
      toast({
        title: 'Error',
        description: 'Failed to load reporting structure',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    reportingStructure,
    isLoading,
    error,
    getReportingStructure
  };
};
