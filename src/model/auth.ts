import type { AuthChangeEvent, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export const AuthModel = {
  OAUTH_SUCCESS_KEY: "oauth_success",
  getUser: async () => {
    return supabase.auth.getUser().then(({ data: { user } }) => user || null);
  },
  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}?${AuthModel.OAUTH_SUCCESS_KEY}=true`,
      },
    });
    if (error) {
      console.error("Error signing in with Google:", error);
    }
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
  },
  subscribeToAuthChanges: (
    callback: (user: User | null, event: AuthChangeEvent) => void,
  ) => {
    const subscription = supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null, event);
    });
    return () => subscription.data.subscription.unsubscribe();
  },
};
