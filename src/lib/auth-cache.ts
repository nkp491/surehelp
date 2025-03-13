
// This file is now deprecated. Functionality has been moved to:
// - src/lib/role-cache.ts
// - src/lib/role-utils.ts
// - src/lib/fetch-roles.ts

// Re-export from the new modules for backward compatibility
import { 
  getRolesFromCache,
  setRolesInCache,
  getRolesFromStorage,
  invalidateRolesCache,
  cacheVerificationResult,
  getVerificationFromCache
} from './role-cache';

export {
  getRolesFromCache,
  setRolesInCache,
  getRolesFromStorage,
  invalidateRolesCache,
  cacheVerificationResult,
  getVerificationFromCache
};
