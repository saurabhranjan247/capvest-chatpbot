// api/chat.js
export default async function handler(req, res) {
  // Allow CORS (so your website can call this endpoint)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { message, history } = req.body || {};
    if (!message) return res.status(400).json({ error: "No message provided" });

    // Build the messages to send to OpenAI
    const messages = [
      { role: "system", content: "You are a friendly, concise website assistant." },
      ...(Array.isArray(history) ? history : []),
      { role: "user", content: message }
    ];

    // Call OpenAI Chat Completions endpoint directly (no client lib needed)
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",     // change if you prefer another model you have access to
        messages,
        max_tokens: 600
      })
    });

    const data = await openaiRes.json();
    const reply = data?.choices?.[0]?.message?.content ?? "Sorry, no response.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
