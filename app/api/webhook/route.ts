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
      description: "Get current pricing and service packages offered by company. Use this when users ask about prices, packages, services, pricing, costs, or what services are available. The database contains the most accurate and up-to-date information, which should take priority over any information in the chat history.",
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
      description: "CRITICAL: Create a new order ONLY when the client explicitly agrees to proceed with a SPECIFIC, VALID service package. Use this EXCLUSIVELY when the client says yes, I want to proceed, let's do it, I'll take it, book me in, etc. BEFORE calling this function, you MUST have already used get_active_services to verify the service exists. DO NOT create orders for items that are not in the service catalog (e.g., no food, physical goods, random products). Only create an order after explicit confirmation to purchase a VALID service.",
      parameters: {
        type: "object",
        properties: {
          clientName: { 
            type: "string", 
            description: "The client's full name. Must be a real person's name, not a placeholder or nickname." 
          },
          clientContact: { 
            type: "string", 
            description: "Contact information - can be sender_id, email, or phone number. Must be valid contact info." 
          },
          serviceName: { 
            type: "string", 
            description: "The EXACT name of the service being ordered. MUST perfectly match one of the services returned by get_active_services tool from the database. STRICT VALIDATION: This MUST be a valid, active service from the catalog. DO NOT accept out-of-scope requests like food (pizza, burgers), physical goods (electronics, clothing), personal items, or anything not listed in the service packages. Examples of VALID services: 'Basic Website Package', 'E-commerce Setup', 'SEO Optimization', 'Social Media Management', 'Custom Development'. Examples of INVALID services: 'Pizza', 'Burger', 'iPhone', 'T-shirt', 'Laptop', 'Random item'. If the service name does not match an active database service, return an error and do not create the order." 
          },
          agreedPrice: { 
            type: "string", 
            description: "The price they agreed to pay. Must match the exact pricing from the service catalog returned by get_active_services. Format as currency (e.g., '50 EUR', '100 USD', '299 EUR')." 
          }
        },
        required: ["clientName", "clientContact", "serviceName", "agreedPrice"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "request_human_intervention",
      description: "Triggers a silent alarm to a human manager. Use this ONLY when a user demands a deep discount, asks for a highly custom project not in the database, or becomes frustrated. This tool pings the human team and allows you to gracefully hand off the conversation.",
      parameters: {
        type: "object",
        properties: {
          customer_name: {
            type: "string",
            description: "The customer's name (can use sender_id if name not known)"
          },
          reason: {
            type: "string",
            description: "Brief explanation of why the AI needs help (e.g., 'Customer demands 50% discount', 'Custom project request outside catalog', 'Frustrated with pricing')"
          },
          last_message: {
            type: "string",
            description: "The user's exact last message that triggered this intervention request"
          }
        },
        required: ["customer_name", "reason", "last_message"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "update_lead_profile",
      description: "Update the CRM/lead profile with information gathered during the conversation. Use this to remember user details like name, email, phone, interested service, objections, or status changes. This helps maintain context across conversations.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The user's full name if provided"
          },
          email: {
            type: "string",
            description: "The user's email address if provided"
          },
          phone: {
            type: "string",
            description: "The user's phone number if provided"
          },
          interestedService: {
            type: "string",
            description: "The service/package the user is interested in (e.g., 'AI Pro Closer', 'Basic Website Package')"
          },
          objection: {
            type: "string",
            description: "Any objection or concern the user has expressed (e.g., 'Needs to consult team', 'Too expensive')"
          },
          status: {
            type: "string",
            description: "Lead status: 'Lead' (default), 'Thinking' (considering), 'Closed' (won), 'Lost' (declined)"
          }
        },
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

  console.log('✅ Database services fetched:', JSON.stringify(data));
  return data || [];
}

async function validateServiceExists(serviceName: string): Promise<{ valid: boolean; errorMessage?: string }> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('services')
    .select('name, price')
    .eq('is_active', true);

  if (error || !data) {
    console.error('Error validating service:', error);
    return { valid: false, errorMessage: 'Unable to validate service. Please try again.' };
  }

  const validServiceNames = data.map(s => s.name.toLowerCase());
  const serviceNameLower = serviceName.toLowerCase().trim();
  
  const isValid = validServiceNames.includes(serviceNameLower);
  
  if (!isValid) {
    const availableServices = data.map(s => s.name).join(', ');
    console.log(`❌ Invalid service requested: "${serviceName}". Available services: ${availableServices}`);
    return { 
      valid: false, 
      errorMessage: `Invalid service requested. The service "${serviceName}" is not available. Please choose from our available services: ${availableServices}`
    };
  }

  const matchedService = data.find(s => s.name.toLowerCase() === serviceNameLower);
  console.log(`✅ Service validated: "${matchedService?.name}"`);
  return { valid: true };
}

async function getLeadMemory(pageId: string, senderId: string): Promise<string> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('page_id', pageId)
    .eq('sender_id', senderId)
    .single();

  if (error || !data) {
    console.log('📝 No existing lead memory found');
    return '';
  }

  console.log('📝 Found existing lead memory:', data);

  const memoryParts = [];
  if (data.name) memoryParts.push(`Known name: ${data.name}`);
  if (data.email) memoryParts.push(`Email: ${data.email}`);
  if (data.phone) memoryParts.push(`Phone: ${data.phone}`);
  if (data.interested_service) memoryParts.push(`Interested in: ${data.interested_service}`);
  if (data.objection) memoryParts.push(`Previous objection: ${data.objection}`);
  if (data.status && data.status !== 'Lead') memoryParts.push(`Status: ${data.status}`);
  if (data.last_interaction) memoryParts.push(`Last contact: ${new Date(data.last_interaction).toLocaleDateString()}`);

  if (memoryParts.length === 0) return '';

  return `\n\n[MEMORY: ${memoryParts.join('. ')}. Do not ask for this information again if you already have it.]`;
}

async function updateLeadProfile(params: {
  pageId: string;
  senderId: string;
  name?: string;
  email?: string;
  phone?: string;
  interestedService?: string;
  objection?: string;
  status?: string;
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const updateData: Record<string, any> = {
    last_interaction: new Date().toISOString(),
  };

  if (params.name !== undefined) updateData.name = params.name;
  if (params.email !== undefined) updateData.email = params.email;
  if (params.phone !== undefined) updateData.phone = params.phone;
  if (params.interestedService !== undefined) updateData.interested_service = params.interestedService;
  if (params.objection !== undefined) updateData.objection = params.objection;
  if (params.status !== undefined) updateData.status = params.status;

  const { data, error } = await supabase
    .from('leads')
    .upsert({
      page_id: params.pageId,
      sender_id: params.senderId,
      ...updateData,
    }, {
      onConflict: 'page_id,sender_id'
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error updating lead profile:', error);
    return { success: false, error: error.message };
  }

  console.log('✅ Lead profile updated:', data);
  return { success: true, lead: data };
}

async function executeOrderCreation(params: {
  clientName: string;
  clientContact: string;
  serviceName: string;
  agreedPrice: string;
}) {
  console.log(`🔍 Validating service: "${params.serviceName}"`);
  
  const validation = await validateServiceExists(params.serviceName);
  
  if (!validation.valid) {
    console.log(`❌ Service validation failed: ${validation.errorMessage}`);
    return { 
      success: false, 
      error: validation.errorMessage || 'Invalid service requested',
      isValidationError: true
    };
  }

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
    console.log("🚀 Webhook Triggered");
    
    const body = await req.json();
    console.log("📥 Incoming Webhook Body:", JSON.stringify(body, null, 2));
    
    let finalAiReply = "";
    let aiAction = "none";

    let userMessage, senderId, pageId, userName;

    if (body.object === 'page') {
      const entry = body.entry?.[0]?.messaging?.[0];
      userMessage = entry?.message?.text;
      senderId = entry?.sender?.id;
      pageId = body.entry?.[0]?.id;
      userName = entry?.sender?.name || 'User';
      console.log("📱 Facebook webhook detected:", { userMessage, senderId, pageId, userName });
    } 
    else {
      userMessage = body.message;
      senderId = body.sender_id;
      pageId = body.page_id;
      userName = body.user_name || 'User';
      console.log("💬 UChat webhook detected:", { userMessage, senderId, pageId, userName });
    }

    if (!userMessage || !senderId || !pageId) {
      console.log("⚠️ Incomplete data, returning early:", { userMessage, senderId, pageId });
      return NextResponse.json({ reply: "Incomplete data" }, { status: 200 });
    }

    console.log(`📩 New message from ${userName} (${senderId}) to Page ${pageId}: ${userMessage}`);

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

    const leadMemory = await getLeadMemory(pageId, senderId);

    const toolInstruction = "\n\nIMPORTANT: When the user asks about pricing, packages, services, or pricing information, you MUST use the get_active_services tool to fetch the current, accurate information from the database. The database contains the most up-to-date and accurate information, which should take priority over any information in the chat history or in your training data. Never make up prices or use information from chat history for pricing questions.\n\nCRITICAL ORDER INSTRUCTIONS: When creating an order with create_order tool, you MUST have already verified the service exists using get_active_services. DO NOT create orders for invalid services (food, physical goods, etc.). After the order is created, the tool will return a portalUrl. You MUST provide the EXACT portalUrl returned by the tool to the user. DO NOT generate fake Calendly links, fake booking links, or any other fake URLs. Only use the exact portalUrl from the tool response.\n\nCRM INSTRUCTIONS: Use the update_lead_profile tool to save important information about the user (name, email, phone, interested service, objections, status). This helps maintain context across conversations and enables follow-ups.";
    const systemMessage = { 
      role: "system" as const, 
      content: config.system_prompt + leadMemory + toolInstruction 
    };
    const userMsg = { role: "user" as const, content: userMessage };

    console.log("🤖 Starting tool calling loop...");

    let messages: any[] = [systemMessage, ...chatHistory, userMsg];
    let maxIterations = 10;
    let iteration = 0;

    while (iteration < maxIterations) {
      iteration++;
      console.log(`🔄 Iteration ${iteration}/${maxIterations}`);

      const completion = await groq.chat.completions.create({
        messages,
        model: "openai/gpt-oss-120b",
        temperature: 0.4,
        tools,
        tool_choice: "auto",
      });

      console.log("📤 Groq response:", JSON.stringify(completion.choices[0]?.message));

      const assistantMessage = completion.choices[0]?.message;
      
      if (!assistantMessage?.tool_calls || assistantMessage.tool_calls.length === 0) {
        console.log("✅ No tool calls - final response received");
        finalAiReply = assistantMessage?.content || "One moment...";
        console.log("✅ finalAiReply set:", finalAiReply);
        break;
      }

      console.log(`🔧 ${assistantMessage.tool_calls.length} tool call(s) detected`);
      messages.push(assistantMessage);

      for (const toolCall of assistantMessage.tool_calls) {
        console.log("🔧 Executing tool:", toolCall.function.name);

        let toolResult;
        
        try {
          if (toolCall.function.name === "get_active_services") {
            const services = await fetchServicesFromDB();
            console.log("📦 Services fetched from DB:", JSON.stringify(services));
            toolResult = JSON.stringify(services);
          } 
          else if (toolCall.function.name === "create_order") {
            const args = JSON.parse(toolCall.function.arguments);
            console.log("📝 Order params:", args);
            
            const orderResult = await executeOrderCreation({
              clientName: args.clientName || userName || senderId,
              clientContact: args.clientContact || senderId,
              serviceName: args.serviceName,
              agreedPrice: args.agreedPrice,
            });

            console.log("✅ Order result:", orderResult);
            toolResult = JSON.stringify(orderResult);
          }
          else if (toolCall.function.name === "request_human_intervention") {
            const args = JSON.parse(toolCall.function.arguments);
            console.log("📝 Human intervention params:", args);
            
            const inboxLink = `https://www.facebook.com/messages/t/${pageId}/${senderId}`;
            const interventionMessage = `🚨 **HUMAN INTERVENTION REQUIRED** 🚨\n\n**Customer:** ${userName}\n**ID:** ${senderId}\n**Reason:** ${args.reason}\n**Last Message:** "${args.last_message}"\n\n🔗 Inbox: ${inboxLink}`;
            
            await sendTelegramNotification(interventionMessage);
            console.log("✅ Human intervention ping sent to Telegram");
            
            const interventionResult = {
              success: true,
              message: "Human manager has been notified and will review your request shortly."
            };
            
            toolResult = JSON.stringify(interventionResult);
            aiAction = "pause";
            console.log("🚨 AI action set to pause for human handoff");
          }
          else if (toolCall.function.name === "update_lead_profile") {
            const args = JSON.parse(toolCall.function.arguments);
            console.log("📝 Lead profile update params:", args);
            
            const leadResult = await updateLeadProfile({
              pageId,
              senderId,
              name: args.name,
              email: args.email,
              phone: args.phone,
              interestedService: args.interestedService,
              objection: args.objection,
              status: args.status,
            });

            console.log("✅ Lead profile result:", leadResult);
            toolResult = JSON.stringify(leadResult);
          } else {
            console.log("⚠️ Unknown tool:", toolCall.function.name);
            toolResult = JSON.stringify({ error: `Unknown tool: ${toolCall.function.name}` });
          }
        } catch (err) {
          console.error("❌ Error executing tool:", err);
          toolResult = JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' });
        }

        messages.push({
          role: "assistant" as const,
          tool_call_id: toolCall.id,
          content: toolResult,
        } as any);
      }
    }

    if (iteration >= maxIterations) {
      console.error("❌ ERROR: Max iterations reached - possible infinite loop");
      finalAiReply = "I apologize, but I encountered an issue processing your request. Please try again.";
    }

    if (!finalAiReply || finalAiReply.trim() === "") {
      console.error("❌ ERROR: finalAiReply is empty!");
      finalAiReply = "One moment...";
    }

    console.log("📤 Final reply to send:", finalAiReply);
    console.log("📤 finalAiReply length:", finalAiReply?.length || 0);
    console.log("📤 aiAction:", aiAction);

    await supabase.from("messages").insert({
      sender_id: senderId,
      message_text: userMessage,
      role: "user",
      platform: "facebook",
    });

    await supabase.from("messages").insert({
      sender_id: senderId,
      message_text: finalAiReply,
      role: "assistant",
      platform: "facebook",
    });

    console.log("✅ About to return response:", JSON.stringify({ reply: finalAiReply, action: aiAction }));
    return NextResponse.json({ reply: finalAiReply, action: aiAction });
  } catch (err) {
    console.error("❌ FATAL ERROR in webhook:");
    console.error("Error message:", err instanceof Error ? err.message : 'Unknown error');
    console.error("Error stack:", err instanceof Error ? err.stack : 'No stack available');
    return NextResponse.json({ reply: `Error processing request: ${err instanceof Error ? err.message : 'Unknown error'}` }, { status: 500 });
  }
}
