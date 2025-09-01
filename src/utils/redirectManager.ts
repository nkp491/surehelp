// Global redirect manager to prevent multiple redirects
class RedirectManager {
  private static instance: RedirectManager;
  private isRedirecting = false;
  private redirectTimeout: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): RedirectManager {
    if (!RedirectManager.instance) {
      RedirectManager.instance = new RedirectManager();
    }
    return RedirectManager.instance;
  }

  async redirectTo(path: string, navigate: (path: string, options?: any) => void, options?: any): Promise<void> {
    if (this.isRedirecting) {
      console.log(`Redirect already in progress, skipping redirect to ${path}`);
      return;
    }

    console.log(`RedirectManager: Redirecting to ${path}`);
    this.isRedirecting = true;

    // Clear any existing timeout
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
    }

    // Add a small delay to prevent rapid redirects
    this.redirectTimeout = setTimeout(() => {
      try {
        navigate(path, options);
        console.log(`RedirectManager: Successfully redirected to ${path}`);
      } catch (error) {
        console.error(`RedirectManager: Error redirecting to ${path}:`, error);
      } finally {
        // Reset the redirecting flag after a delay
        setTimeout(() => {
          this.isRedirecting = false;
        }, 500);
      }
    }, 100);
  }

  reset(): void {
    this.isRedirecting = false;
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
      this.redirectTimeout = null;
    }
  }
}

export const redirectManager = RedirectManager.getInstance();
