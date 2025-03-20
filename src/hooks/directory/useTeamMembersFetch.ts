
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';
import { useProfileSanitization } from '../profile/useProfileSanitization';

export const useTeamMembersFetch = () => {
  const [members, setMembers] = useState<Profile[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Profile[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { sanitizeProfileData } = useProfileSanitization();

  // Function to fetch all team members
  const fetchTeamMembers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*');

      if (profileError) {
        throw profileError;
      }

      if (!profileData) {
        throw new Error('No data returned from profiles');
      }

      // Map and sanitize the database profiles to our Profile type
      const mappedProfiles: Profile[] = profileData.map(profile => 
        sanitizeProfileData(profile)
      );

      // Extract unique departments
      const uniqueDepartments: string[] = Array.from(
        new Set(
          mappedProfiles
            .filter(member => member.department)
            .map(member => member.department as string)
        )
      ).sort();

      setMembers(mappedProfiles);
      setFilteredMembers(mappedProfiles);
      setDepartments(uniqueDepartments);
    } catch (error: any) {
      console.error('Error fetching team directory:', error);
      setError(error.message || 'Failed to load team directory');
      toast({
        title: 'Error',
        description: 'Failed to load team directory',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load team members on component mount
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  return {
    members,
    filteredMembers,
    setFilteredMembers,
    departments,
    isLoading,
    error,
    refreshMembers: fetchTeamMembers
  };
};
