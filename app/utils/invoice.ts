import { createServerSupabaseClient } from './supabase-server';

export async function getNextInvoiceNumber() {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: counter } = await supabase
    .from('invoice_counters')
    .select('last_number')
    .eq('user_id', user.id)
    .single();

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

  return `INV-${nextNumber.toString().padStart(3, '0')}`;
}