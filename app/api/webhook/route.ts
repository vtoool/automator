import { createClient } from "@supabase/supabase-js";
import { Groq } from "groq-sdk";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const tools = [
  {
    type: "function" as const,
    function: {
      name: "get_active_services",
      description: "Get the current pricing and service packages offered by the company. Use this when users ask about prices, packages, services, pricing, costs, or what services are available.",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  }
];

async function fetchServicesFromDB() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('services')
    .select('name, description, price')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching services:', error);
    return [];
  }

  return data || [];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 Raw Body Received:", JSON.stringify(body));

    let userMessage, senderId, pageId;

    if (body.object === 'page') {
      const entry = body.entry?.[0]?.messaging?.[0];
      userMessage = entry?.message?.text;
      senderId = entry?.sender?.id;
      pageId = body.entry?.[0]?.id;
    } 
    else {
      userMessage = body.message;
      senderId = body.sender_id;
      pageId = body.page_id;
    }

    if (!userMessage || !senderId || !pageId) {
      return NextResponse.json({ reply: "Incomplete data" }, { status: 200 });
    }

    console.log(`📩 New msg from ${senderId} to Page ${pageId}: ${userMessage}`);

    const { data: config, error: configError } = await supabase
      .from("bot_configs")
      .select("*")
      .eq("page_id", pageId)
      .single();

    if (configError || !config) {
      console.error(`❌ No config found for Page ID: ${pageId}`, configError);
      return NextResponse.json({ reply: `Error: No bot config found for page_id ${pageId}` }, { status: 400 });
    }

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

    const systemMessage = { role: "system" as const, content: config.system_prompt };
    const userMsg = { role: "user" as const, content: userMessage };

    const completion = await groq.chat.completions.create({
      messages: [systemMessage, ...chatHistory, userMsg],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      tools,
    });

    let aiReply = "";

    if (completion.choices[0]?.message?.tool_calls) {
      const toolCall = completion.choices[0].message.tool_calls[0];

      if (toolCall.function.name === "get_active_services") {
        console.log("🔧 Tool called: get_active_services");
        const services = await fetchServicesFromDB();
        console.log("📦 Services fetched:", services);

        const secondCompletion = await groq.chat.completions.create({
          messages: [
            systemMessage,
            ...chatHistory,
            userMsg,
            completion.choices[0].message,
            {
              role: "tool" as const,
              tool_call_id: toolCall.id,
              content: JSON.stringify(services)
            }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.5,
        });

        aiReply = secondCompletion.choices[0]?.message?.content || "One moment...";
      }
    } else {
      aiReply = completion.choices[0]?.message?.content || "One moment...";
    }

    await supabase.from("messages").insert({
      sender_id: senderId,
      message_text: userMessage,
      role: "user",
      platform: "facebook",
    });

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
