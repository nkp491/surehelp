import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import LoadingScreen from '@/components/ui/loading-screen';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Process the hash fragment from the URL if it exists
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          // Handle the hash fragment if present
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error during auth callback:', error);
            navigate('/auth?error=callback_error');
            return;
          }
          
          if (data.session) {
            navigate('/assessment');
            return;
          }
        }
        
        // Otherwise, attempt to get the session directly
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/auth?error=callback_error');
          return;
        }
        
        if (data.session) {
          navigate('/assessment');
        } else {
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
