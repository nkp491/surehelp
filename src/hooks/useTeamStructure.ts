
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, ReportingStructure } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';
import { useProfileSanitization } from './profile/useProfileSanitization';

export const useTeamStructure = () => {
  const [reportingStructure, setReportingStructure] = useState<ReportingStructure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { sanitizeProfileData } = useProfileSanitization();

  // Define a simplified profile type to avoid infinite type instantiation
  type SimplifiedProfile = Omit<Profile, 'manager' | 'directReports'>;

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

      // Map to our SimplifiedProfile type with sanitization
      const sanitizedProfile = sanitizeProfileData({
        ...profile,
        roles: [profile.role].filter(Boolean)
      });
      
      // Cast to SimplifiedProfile to avoid recursive type issues
      const mappedProfile = sanitizedProfile as SimplifiedProfile;

      // Get manager if reports_to is set
      let manager: SimplifiedProfile | null = null;
      if (mappedProfile.reports_to) {
        const { data: managerData, error: managerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', mappedProfile.reports_to)
          .single();
        
        if (!managerError && managerData) {
          const sanitizedManager = sanitizeProfileData({
            ...managerData,
            roles: [managerData.role].filter(Boolean)
          });
          // Cast to SimplifiedProfile to avoid recursive type issues
          manager = sanitizedManager as SimplifiedProfile;
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

      // Map direct reports to SimplifiedProfile type with sanitization
      const directReports = (reportingData || []).map(report => {
        const sanitizedReport = sanitizeProfileData({
          ...report,
          roles: [report.role].filter(Boolean)
        });
        // Cast to SimplifiedProfile to avoid recursive type issues
        return sanitizedReport as SimplifiedProfile;
      });

      // Create the reporting structure
      // Use type assertion to satisfy TypeScript but avoid infinite recursion
      const structure: ReportingStructure = {
        manager: manager as unknown as Profile | null,
        directReports: directReports as unknown as Profile[]
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
