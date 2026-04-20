import { supabase } from './supabase';

async function insertSuperannuationEntry() {
  const { data, error } = await supabase
    .from('superannuation_contributions')
    .insert([
      {
        contribution_date: '2026-04-19',
        description: 'J Pulikotil Balance',
        amount: 36099,
        current_balance: 36099, // Since this is the first entry
      }
    ]);

  if (error) {
    console.error('Error inserting data:', error);
  } else {
    console.log('Data inserted successfully:', data);
  }
}

insertSuperannuationEntry();