
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import LoadingScreen from '@/components/ui/loading-screen';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Process the callback and set the session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/auth?error=callback_error');
          return;
        }
        
        if (data.session) {
          console.log("Session found in callback handler, redirecting to assessment");
          
          // Save authentication state to storage for faster checks
          try {
            localStorage.setItem('sb-auth-token', 'exists');
            sessionStorage.setItem('is-authenticated', 'true');
          } catch (e) {
            console.error("Error saving auth state to storage:", e);
          }
          
          // Redirect to assessment page
          navigate('/assessment', { replace: true });
        } else {
          console.log("No session found in callback, redirecting to auth");
          navigate('/auth');
        }
      } catch (e) {
        console.error('Error processing auth callback:', e);
        navigate('/auth?error=callback_processing');
      }
    };

    handleCallback();
  }, [navigate]);

  return <LoadingScreen message="Processing authentication..." />;
};

export default AuthCallback;
