
export const getSiteUrl = (): string => {
  try {
    if (typeof window === 'undefined') {
      return '';
    }

    const currentUrl = new URL(window.location.href);
    const baseUrl = `${currentUrl.protocol}//${currentUrl.host}`;
    console.log("Base URL detected:", baseUrl);
    return baseUrl;
  } catch (error) {
    console.error("Error getting site URL:", error);
    return window.location.origin;
  }
};

export const getCallbackUrl = (): string => {
  try {
    const siteUrl = getSiteUrl();
    const callbackUrl = `${siteUrl}/auth/callback`;
    console.log("Callback URL configured as:", callbackUrl);
    return callbackUrl;
  } catch (error) {
    console.error("Error constructing callback URL:", error);
    return `${window.location.origin}/auth/callback`;
  }
};
