import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.object === 'page') {
      for (const entry of body.entry) {
        // Facebook IDs can sometimes come in as numbers or strings with spaces
        const rawPageId = entry.id?.toString() || "";
        const pageId = rawPageId.trim(); // FORCE CLEAN ID
        
        const event = entry.messaging ? entry.messaging[0] : null;

        if (event && event.message && !event.message.is_echo) {
          const senderId = event.sender.id;
          const userMessage = event.message.text;

          // DEBUG LOG - NOW INSIDE THE LOOP
          console.log(`🔍 DEBUG: Looking for config with ID: [${pageId}] (Length: ${pageId.length})`);

          const { data: config, error } = await supabase
            .from('bot_configs')
            .select('*')
            .eq('page_id', pageId)
            .maybeSingle();

          if (error) {
            console.error("❌ Supabase Query Error:", error.message, error.details, error.hint);
            continue;
          }

          if (!config) {
            console.error(`❌ ID ${pageId} not found in bot_configs table.`);
            continue;
          }

          if (!config.is_active) {
            console.error(`❌ Bot is not active for Page ID: ${pageId}`);
            continue;
          }

          const completion = await groq.chat.completions.create({
            messages: [
              { role: "system", content: config.system_prompt },
              { role: "user", content: userMessage }
            ],
            model: "llama-3.3-70b-versatile",
          });

          const aiReply = completion.choices[0]?.message?.content || "I am currently offline.";

          await sendMetaMessage(senderId, aiReply, config.access_token);

          // Save history
          await supabase.from('messages').insert({
            sender_id: senderId,
            role: 'assistant',
            message_text: aiReply,
            platform: 'facebook'
          });
        }
      }
      return new NextResponse('EVENT_RECEIVED', { status: 200 });
    }
    return new NextResponse('Not Found', { status: 404 });
  } catch (error) {
    console.error("🔥 Server Error:", error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

async function sendMetaMessage(recipientId: string, text: string, pageToken: string) {
  const url = `https://graph.facebook.com/v18.0/me/messages?access_token=${pageToken}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text: text }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    console.error(`❌ Meta API Error:`, data);
  } else {
    console.log(`✅ Sent reply.`);
  }
}