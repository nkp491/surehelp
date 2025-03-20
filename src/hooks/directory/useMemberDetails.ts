
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';
import { useProfileSanitization } from '../profile/useProfileSanitization';

export const useMemberDetails = (members: Profile[]) => {
  const { toast } = useToast();
  const { sanitizeProfileData } = useProfileSanitization();

  // Function to get member details by ID
  const getMemberById = async (memberId: string): Promise<Profile> => {
    try {
      // First check if member exists in already loaded members
      const cachedMember = members.find((m) => m.id === memberId);
      if (cachedMember) return cachedMember;

      // If not found, fetch from database
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', memberId)
        .single();

      if (error) throw error;
      
      if (!data) {
        throw new Error('Member not found');
      }

      // Sanitize and return the profile
      return sanitizeProfileData(data);
    } catch (error: any) {
      console.error('Error fetching member details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load member details',
        variant: 'destructive'
      });
      
      // Return a dummy profile on error to avoid breaking the UI
      const errorProfile: Profile = {
        id: memberId,
        first_name: "Error",
        last_name: "Loading Profile",
        email: null,
        phone: null,
        profile_image_url: null,
        role: null,
        roles: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_sign_in: null,
        language_preference: null,
        privacy_settings: null,
        notification_preferences: null,
        skills: [],
        bio: null,
        job_title: null,
        department: null,
        location: null,
        reports_to: null,
        hire_date: null,
        extended_contact: null
      };
      
      return errorProfile;
    }
  };

  return { getMemberById };
};
