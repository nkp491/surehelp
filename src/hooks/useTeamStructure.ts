
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfileSanitization } from './profile/useProfileSanitization';
import { ProfileMinimal, toProfileMinimal, ReportingStructureFixed } from '@/types/profile-minimal';

export const useTeamStructure = () => {
  const [reportingStructure, setReportingStructure] = useState<ReportingStructureFixed | null>(null);
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

      // Sanitize profile data and convert to ProfileMinimal to avoid circular references
      const sanitizedProfile = sanitizeProfileData({
        ...profile,
        roles: [profile.role].filter(Boolean)
      });
      
      // Get manager if reports_to is set - but check if field exists first to avoid SQL errors
      let manager: ProfileMinimal | null = null;
      
      // Check if manager_email is set
      if (sanitizedProfile.manager_email) {
        // Try to find manager by email if manager_email is set
        const { data: managerData, error: managerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', sanitizedProfile.manager_email)
          .single();
          
        if (!managerError && managerData) {
          const sanitizedManager = sanitizeProfileData({
            ...managerData,
            roles: [managerData.role].filter(Boolean)
          });
          manager = toProfileMinimal(sanitizedManager);
        }
      }

      // Get direct reports - check if field exists in database first
      // We should be careful with the reports_to field as it might not exist yet
      let directReports: ProfileMinimal[] = [];
      try {
        const { data: reportingData, error: reportingError } = await supabase
          .from('profiles')
          .select('*')
          .eq('manager_email', sanitizedProfile.email);

        if (!reportingError && reportingData) {
          // Sanitize direct reports data and convert to ProfileMinimal
          directReports = (reportingData || []).map(report => {
            const sanitizedReport = sanitizeProfileData({
              ...report,
              roles: [report.role].filter(Boolean)
            });
            return toProfileMinimal(sanitizedReport);
          });
        }
      } catch (reportingError) {
        console.warn("Error fetching direct reports:", reportingError);
        // Continue with empty direct reports
      }

      // Create a fixed structure object that uses ProfileMinimal
      const structure: ReportingStructureFixed = {
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
