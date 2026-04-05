export default {
  async fetch(request, env) {

    // ✅ Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    if (request.method !== "POST") {
      return new Response("Only POST allowed", { status: 405 });
    }

    const { message, sessionId } = await request.json();

    let history = await env.CHAT_MEMORY.get(sessionId);
    history = history ? JSON.parse(history) : [];

    history.push({ role: "user", content: message });

const response = await env.AI.run(
  "@cf/meta/llama-3-8b-instruct",
  { messages: history }
);

    const reply = response.response;

    history.push({ role: "assistant", content: reply });
    await env.CHAT_MEMORY.put(sessionId, JSON.stringify(history));

    return new Response(JSON.stringify({ reply }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};