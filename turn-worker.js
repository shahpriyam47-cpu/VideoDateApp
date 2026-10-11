const ALLOWED_ORIGIN = "https://shahpriyam47-cpu.github.io";

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : "null",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
    "Vary": "Origin"
  };
}

function jsonResponse(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" }
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== "GET") {
      return jsonResponse({ error: "Method not allowed." }, 405, origin);
    }
    if (origin !== ALLOWED_ORIGIN) {
      return jsonResponse({ error: "Origin not allowed." }, 403, origin);
    }
    if (!env.METERED_USERNAME || !env.METERED_CREDENTIAL) {
      console.error("The Metered TURN username and credential secrets are not configured.");
      return jsonResponse({ error: "TURN credentials are not configured." }, 500, origin);
    }

    const iceServers = [
      { urls: "stun:stun.relay.metered.ca:80" },
      {
        urls: [
          "turn:global.relay.metered.ca:80",
          "turn:global.relay.metered.ca:80?transport=tcp",
          "turn:global.relay.metered.ca:443",
          "turns:global.relay.metered.ca:443?transport=tcp"
        ],
        username: env.METERED_USERNAME,
        credential: env.METERED_CREDENTIAL
      }
    ];
    return jsonResponse(iceServers, 200, origin);
  }
};
