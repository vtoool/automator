import { createClient } from "@supabase/supabase-js";
import { Groq } from "groq-sdk";
import { NextResponse } from "next/server";
import { sendTelegramNotification } from "@/lib/telegram";

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
      description: "Get the current pricing and service packages offered by the company. Use this when users ask about prices, packages, services, pricing, costs, or what services are available. ALWAYS use this tool to get accurate, up-to-date pricing information. Never make up prices.",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "create_order",
      description: "Create a new order when the client explicitly agrees to proceed with a specific service and price. Use this when the client says yes, I want to proceed, let's do it, I'll take it, book me in, etc. Only create the order after they have explicitly confirmed.",
      parameters: {
        type: "object",
        properties: {
          clientName: { type: "string", description: "Client's full name" },
          clientContact: { type: "string", description: "Contact info (sender_id, email, or phone)" },
          serviceName: { type: "string", description: "The service/package they agreed to" },
          agreedPrice: { type: "string", description: "The price they agreed to pay" }
        },
        required: ["clientName", "clientContact", "serviceName", "agreedPrice"]
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

  console.log('✅ Database services fetched:', JSON.stringify(data));
  return data || [];
}

async function executeOrderCreation(params: {
  clientName: string;
  clientContact: string;
  serviceName: string;
  agreedPrice: string;
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('orders')
    .insert({
      client_name: params.clientName,
      client_contact: params.clientContact,
      service_name: params.serviceName,
      agreed_price: params.agreedPrice,
      status: 'Pending Configuration',
    })
    .select()
    .single();

  if (error || !data) {
    console.error('Error creating order:', error);
    return { success: false, error: error?.message || 'Failed to create order' };
  }

  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'automator-nine.vercel.app';
  const portalUrl = `https://${domain}/client/${data.id}`;
  
  const notificationMessage = `🚨 *NEW ORDER!*\n\n*${params.clientName}* just booked *${params.serviceName}* for *${params.agreedPrice}!*\n\n📋 Status: Pending Configuration\n🔗 Portal: ${portalUrl}`;

  await sendTelegramNotification(notificationMessage);

  return {
    success: true,
    orderId: data.id,
    portalUrl,
  };
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

    // Add tool instruction to system prompt
    const toolInstruction = "\n\nIMPORTANT: When the user asks about prices, packages, services, or pricing, you MUST call the get_active_services tool to get accurate, up-to-date information from the database. Never make up prices or use outdated information.";
    const systemMessage = { 
      role: "system" as const, 
      content: config.system_prompt + toolInstruction 
    };
    const userMsg = { role: "user" as const, content: userMessage };

    console.log("🤖 Sending to Groq with tools...");

    const completion = await groq.chat.completions.create({
      messages: [systemMessage, ...chatHistory, userMsg],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      tools,
    });

    console.log("📤 Groq response:", JSON.stringify(completion.choices[0]?.message));

    let aiReply = "";

    // Check if Groq wants to call a tool
    if (completion.choices[0]?.message?.tool_calls && completion.choices[0].message.tool_calls.length > 0) {
      const toolCall = completion.choices[0].message.tool_calls[0];
      console.log("🔧 Tool call detected:", toolCall.function.name);

      if (toolCall.function.name === "get_active_services") {
        console.log("🔧 Executing get_active_services...");
        const services = await fetchServicesFromDB();
        console.log("📦 Services fetched from DB:", JSON.stringify(services));

        // Second call to Groq with tool result
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

        console.log("📤 Second Groq response:", JSON.stringify(secondCompletion.choices[0]?.message));
        aiReply = secondCompletion.choices[0]?.message?.content || "One moment...";
      } 
      else if (toolCall.function.name === "create_order") {
        console.log("🔧 Executing create_order...");
        
        try {
          const args = JSON.parse(toolCall.function.arguments);
          console.log("📝 Order params:", args);
          
          const orderResult = await executeOrderCreation({
            clientName: args.clientName || senderId,
            clientContact: args.clientContact || senderId,
            serviceName: args.serviceName,
            agreedPrice: args.agreedPrice,
          });

          console.log("✅ Order result:", orderResult);

          const secondCompletion = await groq.chat.completions.create({
            messages: [
              systemMessage,
              ...chatHistory,
              userMsg,
              completion.choices[0].message,
              {
                role: "tool" as const,
                tool_call_id: toolCall.id,
                content: JSON.stringify(orderResult)
              }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
          });

          aiReply = secondCompletion.choices[0]?.message?.content || "One moment...";
        } catch (err) {
          console.error("❌ Error executing order:", err);
          aiReply = "I apologize, but there was an issue creating your order. Please try again or contact support.";
        }
      }
    } else {
      // No tool call - model answered directly (might be hallucinating)
      console.log("⚠️ No tool call detected - model answered without using tools");
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
