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

    // Support both snake_case and camelCase to be safe
    const userMessage = body.message || body.userMessage;
    const senderId = body.sender_id || body.senderId;
    const pageId = body.page_id || body.pageId;

    if (!userMessage || !senderId || !pageId) {
      console.error("❌ Incoming Body:", JSON.stringify(body)); // Log the WHOLE body so we can see it
      return NextResponse.json({ reply: "Missing Data" }, { status: 400 });
    }

    console.log(`📩 New msg from ${senderId} to Page ${pageId}: ${userMessage}`);

    // 1. GET THE BRAIN (System Prompt & Token)
    const { data: config, error: configError } = await supabase
      .from("bot_configs")
      .select("*")
      .eq("page_id", pageId)
      .single();

    if (configError || !config) {
      console.error(`❌ No config found for Page ID: ${pageId}`, configError);
      return NextResponse.json({ reply: `Error: No bot config found for page_id ${pageId}` }, { status: 400 });
    }

    // 2. FETCH CHAT HISTORY
    const { data: history } = await supabase
      .from("messages")
      .select("role, message_text")
      .eq("sender_id", senderId)
      .order("created_at", { ascending: false })
      .limit(10);

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
    return NextResponse.json({ reply: `Error processing request: ${err instanceof Error ? err.message : 'Unknown error'}` }, { status: 500 });
  }
}
