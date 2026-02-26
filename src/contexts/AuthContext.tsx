import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null; requiresEmailConfirmation: boolean }>;
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
    }).catch((err) => {
      console.error('[AuthContext] getSession failed:', err);
      setLoading(false); // CRITICAL: never leave loading=true
    });

    // Safety timeout: if loading is STILL true after 8s, force it off
    const safetyTimeout = setTimeout(() => {
      setLoading((current) => {
        if (current) {
          console.warn('[AuthContext] Safety timeout triggered - forcing loading=false');
          return false;
        }
        return current;
      });
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };

    
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || email,
        },
      },
    });

    return {
      error,
      requiresEmailConfirmation: !data.session,
    };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const pendingPlan = localStorage.getItem("pendingPlan");
    const redirectUrl = (pendingPlan === "pro_monthly" || pendingPlan === "pro_yearly")
      ? `${window.location.origin}/checkout?plan=${pendingPlan}`
      : `${window.location.origin}/auth`;

    const hostname = window.location.hostname;
    const isCustomDomain =
      !hostname.includes("lovable.app") &&
      !hostname.includes("lovableproject.com") &&
      hostname !== "localhost";

    if (isCustomDomain) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) return { error };

      if (!data?.url) {
        return { error: new Error("No se pudo iniciar el login con Google") };
      }

      const oauthUrl = new URL(data.url);
      const allowedHosts = new Set<string>([
        'accounts.google.com',
        new URL(import.meta.env.VITE_SUPABASE_URL).hostname,
      ]);

      if (!allowedHosts.has(oauthUrl.hostname)) {
        return { error: new Error("URL de autenticación inválida") };
      }

      window.location.assign(data.url);
      return { error: null };
    }

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
