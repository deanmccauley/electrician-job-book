import { createServerSupabaseClient } from './supabase-server';

export async function getNextInvoiceNumber() {
  console.log('🔵 getNextInvoiceNumber called');
  
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  console.log('🔵 User ID:', user.id);

  // Check if table exists and get counter
  const { data: counter, error } = await supabase
    .from('invoice_counters')
    .select('last_number')
    .eq('user_id', user.id)
    .maybeSingle();
    
  console.log('🔵 Counter query result:', { counter, error });

  let nextNumber = 1;
  if (counter) {
    nextNumber = counter.last_number + 1;
    console.log('🔵 Incrementing from:', counter.last_number, 'to:', nextNumber);
    
    const { error: updateError } = await supabase
      .from('invoice_counters')
      .update({ last_number: nextNumber })
      .eq('user_id', user.id);
      
    console.log('🔵 Update result:', updateError);
  } else {
    console.log('🔵 No counter found, creating with 1');
    const { error: insertError } = await supabase
      .from('invoice_counters')
      .insert({ user_id: user.id, last_number: 1 });
      
    console.log('🔵 Insert result:', insertError);
  }

  // Return as 0001, 0002, etc. (no INV- prefix)
  const result = nextNumber.toString().padStart(4, '0');
  console.log('🔵 Returning:', result);
  return result;
}