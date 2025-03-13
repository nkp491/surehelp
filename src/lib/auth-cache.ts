
import { queryClient } from "@/lib/react-query";

const ROLES_CACHE_KEY = "user-roles";
const ROLE_VERIFICATION_CACHE_KEY = "role-verification";

// Cache roles for 5 minutes by default
const ROLES_CACHE_TIME = 5 * 60 * 1000;

export const getRolesFromCache = () => {
  return queryClient.getQueryData<string[]>(ROLES_CACHE_KEY) || [];
};

export const setRolesInCache = (roles: string[]) => {
  queryClient.setQueryData(ROLES_CACHE_KEY, roles);
  
  // Store in localStorage as fallback
  try {
    localStorage.setItem(ROLES_CACHE_KEY, JSON.stringify(roles));
  } catch (error) {
    console.error("Failed to store roles in localStorage:", error);
  }
};

export const getRolesFromStorage = (): string[] => {
  try {
    const storedRoles = localStorage.getItem(ROLES_CACHE_KEY);
    return storedRoles ? JSON.parse(storedRoles) : [];
  } catch (error) {
    console.error("Failed to retrieve roles from localStorage:", error);
    return [];
  }
};

export const invalidateRolesCache = () => {
  queryClient.invalidateQueries({ queryKey: [ROLES_CACHE_KEY] });
  queryClient.invalidateQueries({ queryKey: [ROLE_VERIFICATION_CACHE_KEY] });
  
  try {
    localStorage.removeItem(ROLES_CACHE_KEY);
  } catch (error) {
    console.error("Failed to remove roles from localStorage:", error);
  }
};

// Cache verification results for specific role requirements
export const cacheVerificationResult = (requiredRoles: string[], result: boolean) => {
  const cacheKey = getVerificationCacheKey(requiredRoles);
  queryClient.setQueryData([ROLE_VERIFICATION_CACHE_KEY, cacheKey], result);
};

export const getVerificationFromCache = (requiredRoles: string[]) => {
  const cacheKey = getVerificationCacheKey(requiredRoles);
  return queryClient.getQueryData<boolean>([ROLE_VERIFICATION_CACHE_KEY, cacheKey]);
};

// Create a stable cache key from role requirements
const getVerificationCacheKey = (requiredRoles: string[] | undefined) => {
  if (!requiredRoles || requiredRoles.length === 0) return "no-roles";
  return requiredRoles.sort().join(":");
};
