export async function onRequest(context) {
    const { request, env, params } = context;

    // 1. Reconstruct the path (turns ["v1", "users"] into "v1/users")
    const path = params.route ? params.route.join("/") : "";

    // 2. Get query params from the original request
    const url = new URL(request.url);
    const query = url.search;

    // 3. Construct the destination URL
    // Use env.API_BASE_URL as the source of truth for the backend target
    const baseUrl = env.API_BASE_URL;
    const destinationUrl = `${baseUrl}/${path}${query}`;

    // 4. Create a new request with the Service Token headers
    // We copy the original method (POST/GET) and body
    const newRequest = new Request(destinationUrl, {
        method: request.method,
        headers: {
            ...Object.fromEntries(request.headers),
            "CF-Access-Client-Id": env.CF_CLIENT_ID,
            "CF-Access-Client-Secret": env.CF_CLIENT_SECRET,
        },
        body: request.body,
        redirect: "follow"
    });

    // 5. Fetch and return the response
    return fetch(newRequest);
}
