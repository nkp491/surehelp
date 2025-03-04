
/**
 * Defines routes that should be accessible without authentication
 */
export const publicRoutes = [
  '/auth',
  '/auth/terms',
  '/terms',
  '/auth/callback',
  '/auth/*' // Add wildcard for all auth routes
];

/**
 * Checks if the current path is a public route that doesn't require authentication
 */
export const isPublicRoute = (path: string): boolean => {
  return publicRoutes.some(route => {
    // Check for exact match
    if (route === path) return true;
    
    // Check if path starts with a public route pattern
    if (route.endsWith('/*')) {
      const baseRoute = route.slice(0, -2);
      if (path === baseRoute || path.startsWith(baseRoute + '/')) {
        return true;
      }
    }
    
    return false;
  });
};
