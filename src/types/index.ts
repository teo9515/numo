// Pega este código en tu nuevo archivo: src/types/index.ts

// Define la "forma" o la plantilla de un objeto Cuenta
export type Account = {
  id: number;
  name: string;
  balance: number;
};

// Define la "forma" o la plantilla de un objeto Transacción
export type Transaction = {
  id: number;
  created_at: string; // Supabase devuelve las fechas como un string en formato ISO
  user_id: string;
  account_id: number;
  amount: number;
  type: 'income' | 'expense'; // El tipo solo puede ser uno de estos dos valores
  description: string | null; // La descripción puede ser texto o puede no existir (null)
  transaction_date: string;
};

export type Profile = {
  id: string; // Coincide con el user.id
  updated_at: string;
  full_name: string | null;
  username: string | null;
  phone: string | null;
  avatar_url: string | null;
};