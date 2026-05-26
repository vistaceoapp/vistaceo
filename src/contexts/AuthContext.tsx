import { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { safeLocalStorage } from "@/lib/safe-storage";
import { collectSignupTrackingContext } from "@/lib/signup-tracking";

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
  const welcomeEmailSentRef = useRef(false);
  const initializedRef = useRef(false);

  const clearClientAuthState = useCallback(() => {
    setSession(null);
    setUser(null);

    try {
      Object.keys(localStorage).forEach((key) => {
        if (
          key.startsWith("sb-") ||
          key.startsWith("supabase.auth") ||
          key.startsWith("vc_") ||
          key === "setupProgress" ||
          key === "setupQuestionsCache" ||
          key === "setupQuestionsMeta" ||
          key === "setupUniversalProfile" ||
          key === "selectedCountryCode"
        ) {
          localStorage.removeItem(key);
        }
      });
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith("sb-") || key.startsWith("vc_") || key === "va_session") {
          sessionStorage.removeItem(key);
        }
      });
    } catch {
      safeLocalStorage.removeItem("setupProgress");
      safeLocalStorage.removeItem("setupQuestionsCache");
      safeLocalStorage.removeItem("setupQuestionsMeta");
      safeLocalStorage.removeItem("setupUniversalProfile");
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        // Avoid duplicate state writes if value is identical (prevents extra re-renders)
        setSession((prev) => (prev?.access_token === newSession?.access_token ? prev : newSession));
        setUser((prev) => (prev?.id === newSession?.user?.id ? prev : (newSession?.user ?? null)));
        if (loading) setLoading(false);
        initializedRef.current = true;

        // 🔥 Track login on EVERY SIGNED_IN — only once per browser session
        if (event === 'SIGNED_IN' && newSession?.user) {
          try {
            const sessionKey = `va_login_tracked_${newSession.user.id}`;
            if (!sessionStorage.getItem(sessionKey)) {
              sessionStorage.setItem(sessionKey, '1');
              // Fire login event (updates profiles.last_login_at + login_count)
              setTimeout(() => {
                supabase.functions.invoke('track-user-activity', {
                  body: {
                    event_type: 'login',
                    event_data: {
                      provider: newSession.user.app_metadata?.provider || 'email',
                    },
                    page_path: window.location.pathname,
                  },
                }).catch((err) => console.debug('[login tracking] failed:', err));
              }, 0);
            }
          } catch {
            // sessionStorage might be unavailable — still try to track
          }
        }

        // Send welcome email for new Google signups
        if (event === 'SIGNED_IN' && newSession?.user && !welcomeEmailSentRef.current) {
          const provider = newSession.user.app_metadata?.provider;
          const isNewUser = newSession.user.created_at === newSession.user.updated_at ||
            (new Date().getTime() - new Date(newSession.user.created_at).getTime()) < 60000;

          if (provider === 'google' && isNewUser) {
            welcomeEmailSentRef.current = true;
            // Google Ads conversion (signup gratis vía Google)
            import("@/lib/google-ads-conversion")
              .then((m) => m.fireGoogleAdsSignupConversion({ method: "google" }))
              .catch(() => {});
            setTimeout(async () => {
              const fullName = newSession.user.user_metadata?.full_name || newSession.user.email?.split('@')[0];
              try {
                await supabase.functions.invoke('send-email-setup-reminder', {
                  body: { email: newSession.user.email, fullName },
                });
              } catch (error) {
                console.error('Failed to send welcome email:', error);
              }
              try {
                const trackingContext = collectSignupTrackingContext();
                await supabase.functions.invoke('notify-admin', {
                  body: {
                    event: 'user_signup',
                    email: newSession.user.email,
                    fullName,
                    authMethod: 'google',
                    userId: newSession.user.id,
                    avatarUrl: newSession.user.user_metadata?.avatar_url,
                    googleSubject: newSession.user.user_metadata?.sub,
                    emailVerified: newSession.user.user_metadata?.email_verified,
                    createdAt: newSession.user.created_at,
                    ...trackingContext,
                  },
                });
              } catch (error) {
                console.error('[notify-admin] signup google failed:', error);
              }
            }, 0);
          }
        }
      }
    );


    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      // If onAuthStateChange already fired, skip — prevents double render
      if (initializedRef.current) return;
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setLoading(false);
      initializedRef.current = true;
    }).catch((err) => {
      console.error('[AuthContext] getSession failed:', err);
      setLoading(false);
    });

    const safetyTimeout = setTimeout(() => {
      setLoading((current) => {
        if (current) {
          console.warn('[AuthContext] Safety timeout triggered');
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

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName || email },
      },
    });
    return { error, requiresEmailConfirmation: !data.session };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const pendingPlan = safeLocalStorage.getItem("pendingPlan");
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
        options: { redirectTo: redirectUrl, skipBrowserRedirect: true, queryParams: { prompt: 'select_account' } },
      });

      if (error) return { error };
      if (!data?.url) return { error: new Error("No se pudo iniciar el login con Google") };

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
      options: { redirectTo: redirectUrl, queryParams: { prompt: 'select_account' } },
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('[AuthContext] signOut failed:', error);
    } finally {
      clearClientAuthState();
      // Wipe additional UX flags so the next ingreso pide todo de nuevo
      try {
        localStorage.removeItem('has_logged_in');
        localStorage.removeItem('pendingPlan');
        localStorage.removeItem('pendingPlanTimestamp');
      } catch { /* noop */ }
      welcomeEmailSentRef.current = false;
      initializedRef.current = true;
      setLoading(false);
      // Hard reload to make 100% seguro que no queda estado en memoria.
      try {
        window.location.replace('/auth?mode=login');
      } catch { /* noop */ }
    }
  }, [clearClientAuthState]);

  // Stable context value — only re-renders consumers when actual values change
  const value = useMemo(
    () => ({ user, session, loading, signUp, signIn, signInWithGoogle, signOut }),
    [user, session, loading, signUp, signIn, signInWithGoogle, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
