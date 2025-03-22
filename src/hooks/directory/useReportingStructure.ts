
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, ReportingStructure } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';
import { useProfileSanitization } from '../profile/useProfileSanitization';

export const useReportingStructure = (getMemberById: (id: string) => Promise<Profile>) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { sanitizeProfileData } = useProfileSanitization();

  // Function to get reporting structure for a team member
  const getReportingStructure = async (profileId: string): Promise<ReportingStructure | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Get the requested profile
      const member = await getMemberById(profileId);
      
      // If profile has a reports_to field, get the manager
      let manager: Profile | null = null;
      if (member.reports_to) {
        try {
          manager = await getMemberById(member.reports_to);
        } catch (error) {
          console.error('Error fetching manager:', error);
          // Continue even if manager fetch fails
        }
      }
      
      // Get direct reports (people who report to this profile)
      const { data: reportingData, error: reportingError } = await supabase
        .from('profiles')
        .select('*')
        .eq('reports_to', profileId);

      if (reportingError) {
        throw reportingError;
      }

      // Using any[] type to break recursive type inference
      const directReports: Profile[] = [];
      
      // Process direct reports with type assertions to avoid deep instantiation
      if (reportingData && Array.isArray(reportingData)) {
        // Use any[] to break the deep type instantiation
        const rawReports = reportingData as any[];
        
        for (const rawReport of rawReports) {
          try {
            // Use any type assertion to break type recursion
            const sanitizedProfile = sanitizeProfileData(rawReport as any);
            directReports.push(sanitizedProfile);
          } catch (err) {
            console.error('Error processing direct report:', err);
          }
        }
      }

      // Create and return the reporting structure with type assertion
      const result: ReportingStructure = {
        manager,
        directReports
      };
      
      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load reporting structure';
      console.error('Error fetching reporting structure:', error);
      setError(errorMessage);
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
    getReportingStructure,
    isLoadingStructure: isLoading,
    structureError: error
  };
};
