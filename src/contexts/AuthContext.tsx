import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Track if we've sent welcome email for this session
    let welcomeEmailSent = false;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Send welcome email for new Google signups
        if (event === 'SIGNED_IN' && session?.user && !welcomeEmailSent) {
          const provider = session.user.app_metadata?.provider;
          const isNewUser = session.user.created_at === session.user.updated_at ||
            (new Date().getTime() - new Date(session.user.created_at).getTime()) < 60000; // Within 1 minute

          if (provider === 'google' && isNewUser) {
            welcomeEmailSent = true;
            // Use setTimeout to avoid auth deadlock
            setTimeout(async () => {
              try {
                await supabase.functions.invoke('send-welcome-email', {
                  body: {
                    email: session.user.email,
                    fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
                    authMethod: 'google',
                    locale: 'es',
                    continueUrl: `${window.location.origin}/setup`,
                  },
                });
                console.log('Welcome email sent for Google signup');
              } catch (error) {
                console.error('Failed to send welcome email:', error);
              }
            }, 0);
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || email,
        },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    // Check for pending plan and redirect to checkout
    const pendingPlan = localStorage.getItem("pendingPlan");
    const redirectUrl = pendingPlan 
      ? `${window.location.origin}/checkout?plan=${pendingPlan}`
      : `${window.location.origin}/app`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
