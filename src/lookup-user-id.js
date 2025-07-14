export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return new Response("Missing email parameter", { status: 400 });
    }

    // Call the WordPress REST API to search for user
    const wpResponse = await fetch(
      `https://grastontechnique.com/wp-json/wp/v2/users?search=${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: "Basic " + btoa(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`),
          "Content-Type": "application/json"
        }
      }
    );

    if (!wpResponse.ok) {
      return new Response("Failed to fetch user", { status: wpResponse.status });
    }

    const users = await wpResponse.json();

    const match = users.find((u) =>
      u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!match) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ user_id: match.id, email: match.email }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
};
