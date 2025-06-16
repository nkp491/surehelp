import { supabase } from "@/integrations/supabase/client";

const ROLES_STORAGE_KEY = "user_roles";

export const roleService = {
  getRoles(): string[] {
    const roles = localStorage.getItem(ROLES_STORAGE_KEY);
    return roles ? JSON.parse(roles) : [];
  },
  saveRoles(roles: string[]) {
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles));
  },
  clearRoles() {
    localStorage.removeItem(ROLES_STORAGE_KEY);
  },

  async fetchAndSaveRoles(): Promise<{ roles: string[]; hasRoles: boolean }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        this.clearRoles();
        return { roles: [], hasRoles: false };
      }

      const { data: userRoles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching roles:", error);
        return { roles: [], hasRoles: false };
      }

      const roles = userRoles?.map((r) => r.role) || [];
      const hasRoles = roles.length > 0;

      if (hasRoles) {
        this.saveRoles(roles);
      } else {
        this.clearRoles();
      }

      return { roles, hasRoles };
    } catch (error) {
      console.error("Error fetching roles:", error);
      return { roles: [], hasRoles: false };
    }
  },
};
