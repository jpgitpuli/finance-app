import { supabase } from './supabase.ts';

async function insertMotorVehicle() {
  const { data, error } = await supabase
    .from('motor_vehicles')
    .insert([
      {
        vehicle_type: 'Car',
        model_description: 'Merceds Benz GLC 250',
        year: 2019,
        current_value: 5000.00,
      }
    ]);

  if (error) {
    console.error('Error inserting data:', error);
  } else {
    console.log('Data inserted successfully:', data);
  }
}

insertMotorVehicle();