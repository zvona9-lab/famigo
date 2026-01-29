// /lib/supabase.ts
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// NOTE: Keep keys in env in real apps. Left as-is to match your current setup.
const supabaseUrl = "https://lfqomdihzsnrywqujwzw.supabase.co";
const supabaseAnonKey = "sb_publishable_IGr0dApmovY_M0pBvBWcYQ_040ecJci";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Keep implicit flow for widest compatibility (some links may still deliver hash tokens).
    // We manually handle deep links in /app/auth-callback.tsx.
    flowType: "implicit",
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
