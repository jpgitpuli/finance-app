import { supabase } from './app/supabase.ts';

async function updateJewellery() {
  const weight = 400;
  const rate = 14280;
  const totalValue = weight * rate; // Calculate total value

  const { data, error } = await supabase
    .from('jewellery')
    .update({
      weight_gms: weight,
      rate_per_gm: rate,
      currency: 'INR',
      total_value: totalValue,
    })
    .eq('type', 'Gold Ornaments 22k'); // Assuming update by type

  if (error) {
    console.error('Error updating data:', error);
  } else {
    console.log('Data updated successfully:', data);
    console.log('New total value:', totalValue);
  }
}

updateJewellery();