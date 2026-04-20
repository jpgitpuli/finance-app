import { supabase } from './app/supabase.ts';

async function updateMotorVehicleValue() {
  const { data, error } = await supabase
    .from('motor_vehicles')
    .update({ current_value: 50000 })
    .eq('id', 1); // Assuming the first record has id=1

  if (error) {
    console.error('Error updating data:', error);
  } else {
    console.log('Data updated successfully:', data);
  }
}

updateMotorVehicleValue();