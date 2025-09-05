import { AuthError, AuthApiError } from "@supabase/supabase-js";

export const getErrorMessage = (error: AuthError) => {
  console.error("Auth error details:", {
    name: error.name,
    message: error.message,
    status: error instanceof AuthApiError ? error.status : "N/A",
    code: error instanceof AuthApiError ? error.code : "N/A",
    stack: error.stack,
  });

  if (error instanceof AuthApiError) {
    switch (error.code) {
      case "invalid_credentials":
        return "Invalid email or password. Please check your credentials and try again.";
      case "email_not_confirmed":
        return "Please verify your email address before signing in.";
      case "user_not_found":
        return "No user found with these credentials.";
      case "invalid_grant":
        return "Invalid login credentials.";
      case "otp_expired":
        return "The password reset link has expired. Please request a new one.";
      default:
        return `Authentication error: ${error.message}`;
    }
  }
  return error.message;
};
