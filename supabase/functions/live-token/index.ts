import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Mints a short-lived Gemini Live API ephemeral token so the browser
// never sees the real GEMINI_API_KEY. The client uses this token to open
// a direct WebSocket session with the Gemini Live API for real-time,
// speech-to-speech voice interviews.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY secret is not configured." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Gemini's token-creation endpoint. Tokens are valid for a short window
    // (a few minutes to start a session, session itself can run longer) and
    // are scoped so they cannot be used to call other Gemini endpoints.
    const resp = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/authTokens",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          uses: 1,
          expireTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          newSessionExpireTime: new Date(Date.now() + 60 * 1000).toISOString(),
        }),
      },
    );

    if (!resp.ok) {
      const text = await resp.text();
      const isQuota = resp.status === 429 || /RESOURCE_EXHAUSTED|quota/i.test(text);
      const message = isQuota
        ? "You've hit today's free Gemini quota for Live Voice. This resets daily (usually midnight Pacific time). Try classic Text mode meanwhile, or check aistudio.google.com for your exact reset time."
        : `Failed to mint live token: ${text.slice(0, 300)}`;
      return new Response(
        JSON.stringify({ error: message, quotaExceeded: isQuota }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await resp.json();
    return new Response(
      JSON.stringify({ token: data.name, model: Deno.env.get("GEMINI_LIVE_MODEL") || "gemini-3.1-flash-live-preview" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
