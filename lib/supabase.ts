// /lib/supabase.ts
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// NOTE: Keep keys in env in real apps. Left as-is to match your current setup.
const supabaseUrl = "https://lfqomdihzsnrywqujwzw.supabase.co";
const supabaseAnonKey = "sb_publishable_IGr0dApmovY_M0pBvBWcYQ_040ecJci";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use implicit flow so email links work in browser without PKCE verifier
    flowType: "implicit",
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    // We handle deep links ourselves in app/(auth)/auth-callback.tsx
    detectSessionInUrl: false,
  },
});
