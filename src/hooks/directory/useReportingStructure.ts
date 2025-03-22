
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, ReportingStructure } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';
import { useProfileSanitization } from '../profile/useProfileSanitization';

// Create a simplified type that breaks circular references
type BasicProfileData = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  reports_to: string | null;
  [key: string]: any; // Allow other properties
};

export const useReportingStructure = (getMemberById: (id: string) => Promise<Profile>) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { sanitizeProfileData } = useProfileSanitization();
  
  // Helper function to convert any profile data to a safe format
  const createSafeProfile = (data: any): Profile => {
    // First create a simple object with basic properties
    const basicData: BasicProfileData = {
      id: data.id || '',
      first_name: data.first_name || null,
      last_name: data.last_name || null,
      email: data.email || null,
      reports_to: data.reports_to || null
    };
    
    // Copy other properties that aren't recursive
    Object.keys(data).forEach(key => {
      if (key !== 'manager' && key !== 'directReports') {
        basicData[key] = data[key];
      }
    });
    
    // Then process with sanitization function
    return sanitizeProfileData(basicData);
  };
  
  // Function to get reporting structure for a team member
  const getReportingStructure = async (profileId: string): Promise<ReportingStructure | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the requested profile
      const memberData = await getMemberById(profileId);
      const member = createSafeProfile(memberData);
      
      // Initialize manager
      let manager: Profile | null = null;
      
      // Get manager if applicable
      if (member.reports_to) {
        try {
          const managerData = await getMemberById(member.reports_to);
          manager = createSafeProfile(managerData);
        } catch (err) {
          console.error('Error fetching manager:', err);
          // Continue without manager
        }
      }
      
      // Get direct reports
      let directReports: Profile[] = [];
      
      try {
        // Fetch data in a try/catch block
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('reports_to', profileId);
          
        if (fetchError) throw fetchError;
        
        // Process the data safely
        if (data && Array.isArray(data)) {
          // Map the data items directly
          directReports = data.map(item => {
            try {
              return createSafeProfile(item);
            } catch (err) {
              console.error('Error processing direct report:', err);
              // Return a minimal valid profile as fallback
              return {
                id: item.id || 'unknown',
                first_name: null,
                last_name: null,
                email: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                last_sign_in: null,
                language_preference: null,
                privacy_settings: null,
                notification_preferences: null,
                skills: null,
                bio: null,
                job_title: null,
                department: null,
                location: null,
                reports_to: null,
                hire_date: null,
                extended_contact: null,
                profile_image_url: null,
                role: null
              } as Profile;
            }
          });
        }
      } catch (err) {
        console.error('Error fetching direct reports:', err);
        // Continue with empty array
      }
      
      // Create the final structure object
      const result: ReportingStructure = {
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
