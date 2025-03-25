
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
      
      // Get manager if reports_to is set
      let manager: ProfileMinimal | null = null;
      if (sanitizedProfile.reports_to) {
        const { data: managerData, error: managerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sanitizedProfile.reports_to)
          .single();
        
        if (!managerError && managerData) {
          const sanitizedManager = sanitizeProfileData({
            ...managerData,
            roles: [managerData.role].filter(Boolean)
          });
          manager = toProfileMinimal(sanitizedManager);
        }
      } else if (sanitizedProfile.manager_email) {
        // Try to find manager by email if reports_to is not set but manager_email is
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
          
          // Update the reports_to field if we found the manager
          if (managerData.id) {
            // Fix: Use explicit type for update data without type inference
            const updateData = { reports_to: managerData.id };
            const { error: updateError } = await supabase
              .from('profiles')
              .update(updateData)
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

      // Sanitize direct reports data and convert to ProfileMinimal
      const directReports = (reportingData || []).map(report => {
        const sanitizedReport = sanitizeProfileData({
          ...report,
          roles: [report.role].filter(Boolean)
        });
        return toProfileMinimal(sanitizedReport);
      });

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
