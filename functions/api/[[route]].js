export async function onRequest(context) {
    try {
        const { request, env, params } = context;

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
            redirect: "follow"
        });

        // 7. Fetch and return
        const response = await fetch(newRequest);
        return response;

    } catch (err) {
        // Return a JSON error response instead of crashing the worker
        return new Response(JSON.stringify({
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
    }
}
