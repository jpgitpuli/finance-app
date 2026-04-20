export interface SuperannuationContribution {
  id: number;
  contribution_date: string; // Date in YYYY-MM-DD format
  description: string | null; // Optional description of the contribution
  amount: number;
  current_balance: number;
}

export interface MotorVehicle {
  id: number;
  vehicle_type: string;
  model_description: string;
  year: number;
  current_value: number;
}

export interface Jewellery {
  id: number;
  type: string;
  weight_gms: number;
  rate_per_gm: number;
  currency: string;
  total_value: number;
}

export interface OverseasAsset {
  id: number;
  asset_type: string;
  value: number;
  currency: string;
}

export interface ExchangeRate {
  id: number;
  value: number;
  value_curr: string;
  value_local: number;
  curr_local: string;
  updated_at: string;
}