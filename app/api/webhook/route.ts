import { createClient } from "@supabase/supabase-js";
import { Groq } from "groq-sdk";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const entry = body.entry?.[0];
    const messaging = entry?.messaging?.[0];

    if (!messaging) return NextResponse.json({ status: "ok" });

    const senderId = messaging.sender.id;
    const userMessage = messaging.message.text;
    const pageId = entry.id;

    console.log(`📩 New msg from ${senderId} to Page ${pageId}: ${userMessage}`);

    // 1. GET THE BRAIN (System Prompt & Token)
    const { data: config } = await supabase
      .from("bot_configs")
      .select("*")
      .eq("page_id", pageId)
      .single();

    if (!config) {
      console.error(`❌ No config found for Page ID: ${pageId}`);
      return NextResponse.json({ status: "ok" });
    }

    // 2. FETCH CHAT HISTORY (The Memory Fix)
    const { data: history } = await supabase
      .from("messages")
      .select("role, message_text")
      .eq("sender_id", senderId)
      .order("created_at", { ascending: false })
      .limit(10);

    // Flip them so they are in chronological order (Oldest -> Newest)
    const chatHistory = history?.reverse().map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.message_text,
    })) || [];

    // 3. GENERATE AI REPLY
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: config.system_prompt },
        ...chatHistory,
        { role: "user", content: userMessage },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
    });

    const aiReply = completion.choices[0]?.message?.content || "One moment...";

    // 4. SAVE USER MESSAGE
    await supabase.from("messages").insert({
      sender_id: senderId,
      message_text: userMessage,
      role: "user",
      platform: "facebook",
    });

    // 5. SAVE AI REPLY
    await supabase.from("messages").insert({
      sender_id: senderId,
      message_text: aiReply,
      role: "assistant",
      platform: "facebook",
    });

    return NextResponse.json({ reply: aiReply });
  } catch (err) {
    console.error("❌ Error:", err);
    return NextResponse.json({ reply: "I'm having a little trouble connecting to my database right now, but Victor will get back to you shortly!" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}
