import { supabase } from './app/supabase.ts';

async function getAllMotorVehicles() {
  const { data, error } = await supabase
    .from('motor_vehicles')
    .select('*');

  if (error) {
    console.error('Error fetching data:', error);
  } else {
    console.log('Motor vehicles:', data);
  }
}

getAllMotorVehicles();