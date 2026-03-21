const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!apiBaseUrl) {
  // This throws early so setup issues are obvious during development.
  throw new Error(
    "Missing EXPO_PUBLIC_API_BASE_URL. Set it in apps/mobile/.env.local."
  );
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in apps/mobile/.env.local."
  );
}

export const env = {
  apiBaseUrl: apiBaseUrl.replace(/\/+$/, ""),
  supabaseUrl,
  supabaseAnonKey,
};
