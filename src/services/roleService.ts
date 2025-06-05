import { supabase } from '@/integrations/supabase/client';

const ROLES_STORAGE_KEY = 'user_roles';

export const roleService = {
  getRoles(): string[] {
    const roles = localStorage.getItem(ROLES_STORAGE_KEY);
    return roles ? JSON.parse(roles) : [];
  },
  // Save roles to localStorage
  saveRoles(roles: string[]) {
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles));
  },

  // Clear roles from localStorage
  clearRoles() {
    localStorage.removeItem(ROLES_STORAGE_KEY);
  },

  async fetchAndSaveRoles(): Promise<string[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        this.clearRoles();
        return [];
      }
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id); 
      const roles = userRoles?.map(r => r.role) || [];
      this.saveRoles(roles);
      return roles;
    } catch (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
  }
}; 