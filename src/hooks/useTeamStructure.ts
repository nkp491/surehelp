
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfileSanitization } from './profile/useProfileSanitization';

// Define simple types that avoid recursive references
interface ProfileItem {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  profile_image_url: string | null;
  manager_email?: string | null;
  [key: string]: any; // Allow other properties
}

interface ReportingItem {
  manager: ProfileItem | null;
  directReports: ProfileItem[];
}

export const useTeamStructure = () => {
  const [reportingStructure, setReportingStructure] = useState<ReportingItem | null>(null);
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

      // Sanitize profile data
      const sanitizedProfile = sanitizeProfileData({
        ...profile,
        roles: [profile.role].filter(Boolean)
      });
      
      // Get manager if available - check if manager_email field exists first
      let manager: ProfileItem | null = null;
      
      // Check if manager_email exists in the profile
      const hasManagerEmail = 'manager_email' in sanitizedProfile;
      
      if (hasManagerEmail && sanitizedProfile.manager_email) {
        try {
          // Try to find manager by email if manager_email is set
          const { data: managerData, error: managerError } = await supabase
            .from('profiles')
            .select('id, email, first_name, last_name, role, profile_image_url')
            .eq('email', sanitizedProfile.manager_email)
            .single();
            
          if (!managerError && managerData) {
            manager = {
              id: managerData.id,
              email: managerData.email,
              first_name: managerData.first_name,
              last_name: managerData.last_name,
              role: managerData.role,
              profile_image_url: managerData.profile_image_url
            };
          }
        } catch (err) {
          console.error("Error fetching manager:", err);
        }
      }

      // Get direct reports - check if the column exists first
      const directReports: ProfileItem[] = [];
      
      if (sanitizedProfile.email) {
        try {
          // First check if manager_email column exists
          const testQuery = await supabase
            .from('profiles')
            .select('manager_email')
            .limit(1);
            
          // If manager_email column exists, proceed with query
          if (!testQuery.error || !testQuery.error.message.includes('manager_email')) {
            const { data: reportingData, error: reportingError } = await supabase
              .from('profiles')
              .select('id, email, first_name, last_name, role, profile_image_url')
              .eq('manager_email', sanitizedProfile.email);

            if (!reportingError && reportingData && Array.isArray(reportingData)) {
              for (const report of reportingData) {
                directReports.push({
                  id: report.id,
                  email: report.email,
                  first_name: report.first_name,
                  last_name: report.last_name,
                  role: report.role,
                  profile_image_url: report.profile_image_url
                });
              }
            }
          }
        } catch (reportingError) {
          console.warn("Error fetching direct reports:", reportingError);
          // Continue with empty direct reports
        }
      }

      // Create the reporting structure with proper type annotations
      const structure: ReportingItem = {
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
