import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const senderId = searchParams.get('sender_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (senderId) {
      // Get messages for a specific user
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('sender_id', senderId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ messages });
    } else {
      // Get all recent conversations (latest message from each sender)
      const { data: messages, error } = await supabase
        .from('messages')
        .select('sender_id, message_text, role, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Group by sender_id and get the latest message for each
      const conversations: Record<string, any> = {};
      messages?.forEach((msg) => {
        if (!conversations[msg.sender_id]) {
          conversations[msg.sender_id] = {
            sender_id: msg.sender_id,
            last_message: msg.message_text,
            last_role: msg.role,
            last_timestamp: msg.created_at,
          };
        }
      });

      const conversationList = Object.values(conversations);

      return NextResponse.json({ conversations: conversationList });
    }
  } catch (error) {
    console.error('Messages Error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
