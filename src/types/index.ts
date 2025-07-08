// En src/types/index.ts

// Define la "forma" o la plantilla de un objeto Cuenta
export type Account = {
  id: number;
  name: string;
  balance: number;
  currency: string; // <-- CORRECCIÓN AÑADIDA AQUÍ
};

// Define la "forma" o la plantilla de un objeto Transacción
export type Transaction = {
  id: number;
  created_at: string;
  user_id: string;
  account_id: number;
  amount: number;
  type: 'income' | 'expense';
  description: string | null;
  transaction_date: string;
  currency: string; // <-- CORRECCIÓN AÑADIDA AQUÍ TAMBIÉN
};

// El tipo Profile ya está bien
export type Profile = {
  id: string;
  updated_at: string;
  full_name: string | null;
  username: string | null;
  phone: string | null;
  avatar_url: string | null;
};