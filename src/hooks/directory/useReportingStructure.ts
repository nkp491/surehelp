
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';
import { useProfileSanitization } from '../profile/useProfileSanitization';

// Define a simple return type without recursive references
interface ReportingStructureResult {
  manager: Profile | null;
  directReports: Profile[];
}

export const useReportingStructure = (getMemberById: (id: string) => Promise<Profile>) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { sanitizeProfileData } = useProfileSanitization();
  
  // Function to get reporting structure for a team member
  const getReportingStructure = async (profileId: string): Promise<ReportingStructureResult | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the requested profile
      let member: Profile;
      try {
        const rawMember = await getMemberById(profileId);
        member = JSON.parse(JSON.stringify(rawMember));
      } catch (err) {
        throw new Error(`Failed to get member profile: ${err}`);
      }
      
      // Get manager if applicable
      let manager: Profile | null = null;
      if (member.reports_to) {
        try {
          const rawManager = await getMemberById(member.reports_to);
          manager = JSON.parse(JSON.stringify(rawManager));
        } catch (err) {
          console.error('Error fetching manager:', err);
          // Continue without manager
        }
      }
      
      // Get direct reports
      let directReports: Profile[] = [];
      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('reports_to', profileId);
          
        if (fetchError) throw fetchError;
        
        if (data && Array.isArray(data)) {
          directReports = data.map(item => {
            return JSON.parse(JSON.stringify(item));
          });
        }
      } catch (err) {
        console.error('Error fetching direct reports:', err);
        // Continue with empty array
      }
      
      // Create the final structure object
      const result: ReportingStructureResult = {
        manager,
        directReports
      };
      
      return result;
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
    getReportingStructure,
    isLoadingStructure: isLoading,
    structureError: error
  };
};
