
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import LoadingScreen from '@/components/ui/loading-screen';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("Auth callback: Processing authentication...");
        // Process the callback and set the session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast.error("Authentication failed. Please try again.");
          navigate('/auth?error=callback_error');
          return;
        }
        
        if (data.session) {
          console.log("Auth callback: Session found, redirecting to dashboard");
          
          // Save authentication state to storage for faster checks
          try {
            localStorage.setItem('sb-auth-token', 'exists');
            sessionStorage.setItem('is-authenticated', 'true');
          } catch (e) {
            console.error("Error saving auth state to storage:", e);
          }
          
          // Redirect to dashboard after a brief delay to allow state to settle
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 100);
        } else {
          console.log("Auth callback: No session found, redirecting to auth");
          toast.error("Authentication session not found");
          navigate('/auth');
        }
      } catch (e) {
        console.error('Error processing auth callback:', e);
        toast.error("Error during authentication");
        navigate('/auth?error=callback_processing');
      }
    };

    handleCallback();
  }, [navigate]);

  return <LoadingScreen message="Processing authentication..." />;
};

export default AuthCallback;
