import { supabase } from './supabase.ts';

async function insertSuperannuationEntry() {
  // First, get the latest balance
  const { data: latestEntry, error: fetchError } = await supabase
    .from('superannuation_contributions')
    .select('current_balance')
    .order('contribution_date', { ascending: false })
    .limit(1);

  if (fetchError) {
    console.error('Error fetching latest balance:', fetchError);
    return;
  }

  const previousBalance = latestEntry?.[0]?.current_balance || 0;
  const newBalance = previousBalance + 62300;

  const { data, error } = await supabase
    .from('superannuation_contributions')
    .insert([
      {
        contribution_date: '2024-04-19',
        description: 'APulikotil balance',
        amount: 62300,
        current_balance: newBalance,
      }
    ]);

  if (error) {
    console.error('Error inserting data:', error);
  } else {
    console.log('Data inserted successfully:', data);
    console.log('New balance:', newBalance);
  }
}

insertSuperannuationEntry();