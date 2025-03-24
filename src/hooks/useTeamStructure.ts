
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfileSanitization } from './profile/useProfileSanitization';
import { ProfileMinimal, ReportingStructureFixed, toProfileMinimal } from '@/types/profile-minimal';

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

      // Sanitize profile data 
      const sanitizedProfile = sanitizeProfileData({
        ...profile,
        roles: [profile.role].filter(Boolean)
      });
      
      // Convert to minimal profile
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
      } else if (profile.manager_email) {
        // Try to find manager by email if reports_to is not set but manager_email is
        const { data: managerData, error: managerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', profile.manager_email)
          .single();
          
        if (!managerError && managerData) {
          const sanitizedManager = sanitizeProfileData({
            ...managerData,
            roles: [managerData.role].filter(Boolean)
          });
          
          manager = toProfileMinimal(sanitizedManager);
          
          // Update the reports_to field if we found the manager
          if (!profile.reports_to) {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ reports_to: managerData.id })
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

      // Map direct reports to minimal profiles
      const directReports = (reportingData || []).map(report => {
        const sanitizedReport = sanitizeProfileData({
          ...report,
          roles: [report.role].filter(Boolean)
        });
        
        return toProfileMinimal(sanitizedReport);
      });

      // Create the reporting structure
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
