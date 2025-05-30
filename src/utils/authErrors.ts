import { AuthError, AuthApiError } from "@supabase/supabase-js";

export const getErrorMessage = (error: AuthError) => {
  console.error("Auth error details:", {
    name: error.name,
    message: error.message,
    status: error instanceof AuthApiError ? error.status : 'N/A',
    code: error instanceof AuthApiError ? error.code : 'N/A',
    stack: error.stack
  });

  if (error instanceof AuthApiError) {
    switch (error.code) {
      case 'invalid_credentials':
        console.log("Invalid credentials attempt");
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'email_not_confirmed':
        console.log("Email not confirmed attempt");
        return 'Please verify your email address before signing in.';
      case 'user_not_found':
        console.log("User not found attempt");
        return 'No user found with these credentials.';
      case 'invalid_grant':
        console.log("Invalid grant attempt");
        return 'Invalid login credentials.';
      case 'otp_expired':
        console.log("OTP expired attempt");
        return 'The password reset link has expired. Please request a new one.';
      default:
        console.log("Unknown auth error:", error.code);
        return `Authentication error: ${error.message}`;
    }
  }
  return error.message;
};