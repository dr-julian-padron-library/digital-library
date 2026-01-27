export async function onRequest(context) {
    const { request, env, params } = context;

    // --- CORS Configuration ---
    const origin = request.headers.get("Origin");

    // Whitelist Validation: "The Bouncer List"
    // We strictly match the origin against the environment variable ALLOWED_ORIGINS (comma-separated).
    // If no specific match is found, we return "null" to block the browser from reading the response.
    const allowedOrigins = (env.ALLOWED_ORIGINS || "").split(",").map(url => url.trim());
    const isAllowed = allowedOrigins.includes(origin);

    const corsHeaders = {
        "Access-Control-Allow-Origin": isAllowed ? origin : "null",
        "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, DELETE, OPTIONS, PATCH",
        "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || "Content-Type, Authorization, X-Requested-With, CF-Access-Client-Id, CF-Access-Client-Secret",
        "Access-Control-Allow-Credentials": "true",
    };

    // --- 1. Handle Preflight (OPTIONS) ---
    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 200,
            headers: corsHeaders
        });
    }

    // Helper to inject CORS headers into a final response
    const withCors = (response) => {
        const newHeaders = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([key, value]) => {
            newHeaders.set(key, value);
        });
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        });
    };

    try {
        // 0. Environment Validation
        if (!env.API_BASE_URL) {
            throw new Error("API_BASE_URL environment variable is missing");
        }

        // 1. Reconstruct the path (turns ["v1", "users"] into "v1/users")
        const path = params.route ? params.route.join("/") : "";

        // 2. Get query params from the original request
        const url = new URL(request.url);
        const query = url.search;

        // 3. Construct the destination URL
        // Ensure no double slashes if base has trailing slash
        const baseUrl = env.API_BASE_URL.replace(/\/$/, "");
        const destinationUrl = `${baseUrl}/${path}${query}`;

        // 4. Prepare Headers
        // We clone headers to modify them safely
        const newHeaders = new Headers(request.headers);
        newHeaders.delete("Host"); // Avoid Host header conflicts

        // Add Service Token headers if present
        if (env.CF_CLIENT_ID) {
            newHeaders.set("CF-Access-Client-Id", env.CF_CLIENT_ID);
        }
        if (env.CF_CLIENT_SECRET) {
            newHeaders.set("CF-Access-Client-Secret", env.CF_CLIENT_SECRET);
        }

        // 5. Prepare Body and Method
        const method = request.method;
        // explicit check: Request constructor throws if body is passed for GET/HEAD
        const hasBody = !["GET", "HEAD"].includes(method.toUpperCase());
        const body = hasBody ? request.body : null;

        // 6. Create new request
        const newRequest = new Request(destinationUrl, {
            method: method,
            headers: newHeaders,
            body: body,
            redirect: "manual" // CRITICAL: Do not follow redirects automatically. Browsers handle this better, and it avoids "body used" errors.
        });

        // 7. Fetch and return
        const response = await fetch(newRequest);

        // 8. Handle Redirects (Rewrite Location header)
        // If the backend redirects to an internal URL, we must rewrite it to the public proxy URL.
        const isRedirect = response.status >= 300 && response.status < 400;
        if (isRedirect) {
            const location = response.headers.get("Location");
            if (location) {
                // If the location matches the internal API_BASE_URL, rewrite it to /api
                // checking both with and without trailing slash to be safe
                const cleanBaseUrl = env.API_BASE_URL.replace(/\/$/, "");

                if (location.startsWith(cleanBaseUrl)) {
                    const relativePath = location.replace(cleanBaseUrl, "");
                    // Ensure we redirect to the public proxy path
                    const publicPath = `/api${relativePath.startsWith("/") ? "" : "/"}${relativePath}`;

                    // We must create a new response to modify headers efficiently
                    const redirectHeaders = new Headers(response.headers);
                    redirectHeaders.set("Location", publicPath);

                    const redirectResponse = new Response(response.body, {
                        status: response.status,
                        headers: redirectHeaders
                    });

                    return withCors(redirectResponse);
                }
            }
        }

        return withCors(response);

    } catch (err) {
        // Return a JSON error response instead of crashing the worker
        const errorResponse = new Response(JSON.stringify({
            error: "Proxy Worker Error",
            message: err.message,
            stack: err.stack,
            timestamp: new Date().toISOString()
        }), {
            status: 500,
            headers: {
                "Content-Type": "application/json"
            }
        });

        return withCors(errorResponse);
    }
}
