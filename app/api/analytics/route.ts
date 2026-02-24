import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET() {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Total messages in last 24h
    const { count: totalMessages24h } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', twentyFourHoursAgo.toISOString());

    // Active leads (unique senders in last 24h)
    const { data: uniqueSenders } = await supabase
      .from('messages')
      .select('sender_id')
      .gte('created_at', twentyFourHoursAgo.toISOString());

    const activeLeads = uniqueSenders ? [...new Set(uniqueSenders.map(m => m.sender_id))].length : 0;

    // AI Token Usage Estimate (rough estimate based on message count * avg tokens)
    const { count: totalMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'assistant');

    const estimatedTokens = (totalMessages || 0) * 50; // Rough estimate

    // Conversion rate - looking for messages containing calendly links
    const { data: conversionMessages } = await supabase
      .from('messages')
      .select('sender_id')
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .ilike('message_text', '%calendly%');

    const uniqueConverted = conversionMessages 
      ? [...new Set(conversionMessages.map(m => m.sender_id))].length 
      : 0;
    
    const conversionRate = activeLeads > 0 
      ? Math.round((uniqueConverted / activeLeads) * 100) 
      : 0;

    // Daily message volume for the last 7 days
    const { data: dailyMessages } = await supabase
      .from('messages')
      .select('created_at, platform')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    // Group by date and platform
    const messagesByDate: Record<string, Record<string, number>> = {};
    const platforms = ['facebook', 'instagram'];

    dailyMessages?.forEach(msg => {
      const date = new Date(msg.created_at).toISOString().split('T')[0];
      const platform = msg.platform || 'facebook';
      
      if (!messagesByDate[date]) {
        messagesByDate[date] = { facebook: 0, instagram: 0 };
      }
      if (messagesByDate[date][platform] !== undefined) {
        messagesByDate[date][platform]++;
      }
    });

    const chartData = Object.entries(messagesByDate).map(([date, counts]) => ({
      date,
      facebook: counts.facebook || 0,
      instagram: counts.instagram || 0,
    }));

    return NextResponse.json({
      stats: {
        totalMessages24h: totalMessages24h || 0,
        activeLeads,
        estimatedTokens,
        conversionRate,
      },
      chartData,
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
