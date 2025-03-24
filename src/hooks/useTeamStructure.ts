
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, ReportingStructure } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';
import { useProfileSanitization } from './profile/useProfileSanitization';
import { ProfileMinimal, ReportingStructureFixed, toProfileMinimal } from '@/types/profile-minimal';

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

      // Sanitize profile data and convert to ProfileMinimal
      const sanitizedProfile = sanitizeProfileData({
        ...profile,
        roles: [profile.role].filter(Boolean)
      });
      
      const mappedProfile = toProfileMinimal(sanitizedProfile);

      // Get manager if reports_to is set
      let manager: ProfileMinimal | null = null;
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
          
          manager = toProfileMinimal(sanitizedManager);
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

      // Map direct reports to ProfileMinimal
      const directReports = (reportingData || []).map(report => {
        const sanitizedReport = sanitizeProfileData({
          ...report,
          roles: [report.role].filter(Boolean)
        });
        
        return toProfileMinimal(sanitizedReport);
      });

      // Create the fixed reporting structure first
      const fixedStructure: ReportingStructureFixed = {
        manager,
        directReports
      };

      // Then adapt it to the expected ReportingStructure type
      // This avoids circular references in type instantiation
      const structure: ReportingStructure = {
        manager: fixedStructure.manager as unknown as Profile | null,
        directReports: fixedStructure.directReports as unknown as Profile[]
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
