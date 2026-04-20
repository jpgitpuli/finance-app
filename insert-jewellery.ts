import { supabase } from './app/supabase.ts';

async function insertJewellery() {
  const weight = 400;
  const rate = 6000;
  const totalValue = weight * rate; // Calculate total value

  const { data, error } = await supabase
    .from('jewellery')
    .insert([
      {
        type: 'Gold Ornaments 22k',
        weight_gms: weight,
        rate_per_gm: rate,
        currency: 'INR',
        total_value: totalValue,
      }
    ]);

  if (error) {
    console.error('Error inserting data:', error);
  } else {
    console.log('Data inserted successfully:', data);
    console.log('Total value:', totalValue);
  }
}

insertJewellery();