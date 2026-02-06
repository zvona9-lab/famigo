/**
 * Famigo – app.config.js
 * Supabase env wired correctly for Expo
 */

module.exports = ({ config }) => ({
  ...config,

  version: "9.9.9-debug",          // ⬅️ NAMJERNO UPADLJIVO
  runtimeVersion: "9.9.9-debug",   // ⬅️ forsira novi bundle

  extra: {
    ...config.extra,

    EXPO_PUBLIC_SUPABASE_URL: "https://tlfbqqdyfzlfqtanawbp.supabase.co",
    EXPO_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsZmJxcWR5ZnpsZnF0YW5hd2JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NzkyMzIsImV4cCI6MjA4NTQ1NTIzMn0.-5xG3GsB8w5huogv46_i_alJuRt88QUiEFog-XGTk_M",
  },
});
