import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('bot_configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ configs: data });
  } catch (error) {
    console.error('Bot Configs Error:', error);
    return NextResponse.json({ error: 'Failed to fetch bot configs' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { page_id, system_prompt } = body;

    if (!page_id) {
      return NextResponse.json({ error: 'page_id is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (system_prompt !== undefined) updateData.system_prompt = system_prompt;

    const { data, error } = await supabase
      .from('bot_configs')
      .update(updateData)
      .eq('page_id', page_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ config: data });
  } catch (error) {
    console.error('Bot Config Patch Error:', error);
    return NextResponse.json({ error: 'Failed to patch bot config' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, system_prompt, access_token, is_active, page_name } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (system_prompt !== undefined) updateData.system_prompt = system_prompt;
    if (access_token !== undefined) updateData.access_token = access_token;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (page_name !== undefined) updateData.page_name = page_name;

    const { data, error } = await supabase
      .from('bot_configs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ config: data });
  } catch (error) {
    console.error('Bot Config Update Error:', error);
    return NextResponse.json({ error: 'Failed to update bot config' }, { status: 500 });
  }
}
