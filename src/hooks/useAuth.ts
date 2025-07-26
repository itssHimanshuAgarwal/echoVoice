import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  console.log('useAuth render - User:', user?.id, 'Loading:', loading);

  useEffect(() => {
    let mounted = true;
    
    console.log('Starting auth initialization...');
    
    // Force check localStorage for existing session
    const checkStoredSession = () => {
      try {
        const storedSession = localStorage.getItem('supabase.auth.token');
        console.log('Stored session exists:', !!storedSession);
        
        if (storedSession) {
          const parsed = JSON.parse(storedSession);
          console.log('Parsed session:', parsed);
        }
      } catch (error) {
        console.error('Error checking stored session:', error);
      }
    };
    
    checkStoredSession();
    
    // Get initial session with retry
    const getInitialSession = async (retries = 3) => {
      try {
        console.log('Getting initial session, retries left:', retries);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        console.log('Initial session result:', session?.user?.id, error);
        
        if (session) {
          setSession(session);
          setUser(session.user);
          setLoading(false);
          console.log('Session restored successfully');
        } else if (retries > 0) {
          // Retry after a short delay
          setTimeout(() => getInitialSession(retries - 1), 500);
          return;
        } else {
          setLoading(false);
          console.log('No session found after retries');
        }
      } catch (error) {
        console.error('Error getting session:', error);
        if (mounted && retries > 0) {
          setTimeout(() => getInitialSession(retries - 1), 500);
        } else if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          setLoading(false);
          toast({
            title: "Welcome!",
            description: "You've been signed in successfully.",
          });
        } else if (event === 'SIGNED_OUT') {
          setLoading(false);
          toast({
            title: "Signed out", 
            description: "You've been signed out successfully.",
          });
        } else if (event === 'TOKEN_REFRESHED') {
          setLoading(false);
          console.log('Token refreshed successfully');
        }
      }
    );

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Check your email",
        description: "We've sent you a confirmation link to complete your registration.",
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });

    if (error) {
      toast({
        title: "Google sign in failed",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };
};