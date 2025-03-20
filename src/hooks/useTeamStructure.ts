
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

      // Map to our Profile type with sanitization
      const mappedProfile: Profile = sanitizeProfileData({
        ...profile,
        roles: [profile.role].filter(Boolean)
      });

      // Get manager if reports_to is set
      let manager: Profile | null = null;
      if (mappedProfile.reports_to) {
        const { data: managerData, error: managerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', mappedProfile.reports_to)
          .single();
        
        if (!managerError && managerData) {
          manager = sanitizeProfileData({
            ...managerData,
            roles: [managerData.role].filter(Boolean)
          });
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

      // Map direct reports to Profile type with sanitization
      const directReports: Profile[] = (reportingData || []).map(report => 
        sanitizeProfileData({
          ...report,
          roles: [report.role].filter(Boolean)
        })
      );

      // Create the reporting structure
      const structure: ReportingStructure = {
        manager: manager || mappedProfile,  // If no manager found, use the profile itself
        directReports: directReports
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
