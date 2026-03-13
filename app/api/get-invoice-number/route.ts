import { createServerSupabaseClient } from '@/app/utils/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: counter } = await supabase
      .from('invoice_counters')
      .select('last_number')
      .eq('user_id', user.id)
      .maybeSingle();

    let nextNumber = 1;
    if (counter) {
      nextNumber = counter.last_number + 1;
      await supabase
        .from('invoice_counters')
        .update({ last_number: nextNumber })
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('invoice_counters')
        .insert({ user_id: user.id, last_number: 1 });
    }

    const invoiceNumber = nextNumber.toString().padStart(4, '0');
    return NextResponse.json({ invoiceNumber });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate invoice number' }, { status: 500 });
  }
}