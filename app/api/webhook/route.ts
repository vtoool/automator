import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/groq';
import { supabase } from '@/lib/supabase';

interface FacebookWebhookBody {
  object?: string;
  entry?: Array<{
    id?: string;
    messaging?: Array<{
      sender?: { id?: string };
      message?: { text?: string };
    }>;
  }>;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const hubMode = searchParams.get('hub.mode');
  const hubVerifyToken = searchParams.get('hub.verify_token');
  const hubChallenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.META_VERIFY_TOKEN;

  if (hubMode === 'subscribe' && hubVerifyToken === verifyToken) {
    console.log('Webhook verified successfully');
    return new NextResponse(hubChallenge, { status: 200 });
  }

  console.log('Webhook verification failed');
  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body: FacebookWebhookBody = await request.json();

    if (body.object !== 'page') {
      console.log('Received non-page event');
      return NextResponse.json({ error: 'Not a page event' }, { status: 404 });
    }

    if (!body.entry || !body.entry[0]?.messaging) {
      console.log('No messaging events found');
      return NextResponse.json({ message: 'EVENT_RECEIVED' }, { status: 200 });
    }

    for (const entry of body.entry) {
      if (!entry.messaging) continue;

      for (const event of entry.messaging) {
        const senderId = event.sender?.id;
        const messageText = event.message?.text;

        if (senderId && messageText) {
          console.log(`Received message from ${senderId}: ${messageText}`);

          const { error: dbError } = await supabase
            .from('messages')
            .insert({
              sender_id: senderId,
              message_text: messageText,
              platform: 'facebook',
              created_at: new Date().toISOString(),
            });

          if (dbError) {
            console.error('Failed to save message to database:', dbError);
          }

          const aiResponse = await generateAIResponse(messageText);
          console.log(`AI Response for ${senderId}: ${aiResponse}`);
        }
      }
    }

    return NextResponse.json({ message: 'EVENT_RECEIVED' }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
