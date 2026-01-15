// /lib/supabase.ts
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lfqomdihzsnrywqujwzw.supabase.co";
const supabaseAnonKey = "sb_publishable_IGr0dApmovY_M0pBvBWcYQ_040ecJci";

console.log("SUPABASE URL:", supabaseUrl);
console.log("SUPABASE KEY PREFIX:", supabaseAnonKey?.slice(0, 20));



export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
