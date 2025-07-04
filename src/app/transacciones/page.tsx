// En src/app/transacciones/page.tsx (versión final corregida)

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { IoChevronBack } from "react-icons/io5";

import { Account, Transaction } from "@/types";
import TransactionList from "../components/TransactionList";
import AddTransactionModal from "../components/AddTransactionModal";

export default async function TransactionsPage() {
  const cookieStore = await cookies();

  // --- USANDO LA LÓGICA getAll/setAll QUE PREFIERES ---
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Este error puede ser ignorado en Server Components (páginas de solo lectura)
          }
        },
      },
    }
  );
  // --- FIN DEL BLOQUE DE CÓDIGO ---

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: userTransactions } = await supabase
    .from("transactions")
    .select("*")
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  const transactions: Transaction[] = userTransactions || [];

  const { data: userAccounts } = await supabase
    .from("accounts")
    .select("id, name, balance");
  const accounts: Account[] = userAccounts || [];

  return (
    // Ya no usamos <main> aquí porque el layout principal ya lo tiene
    <div className="max-w-3xl mx-auto">
      <header className="mb-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-[var(--color-primary)] hover:text-orange-400 transition-colors mb-4"
        >
          <IoChevronBack className="h-5 w-5" />
          Volver al Inicio
        </Link>
        <h1 className="text-2xl font-bold text-white">
          Historial de Transacciones
        </h1>
      </header>

      <div className="mb-8">
        <AddTransactionModal accounts={accounts} />
      </div>

      <section>
        {transactions.length > 0 ? (
          <TransactionList transactions={transactions} accounts={accounts} />
        ) : (
          <div className="text-center py-16 px-4 bg-[var(--color-surface)] rounded-lg border border-white/5">
            <p className="text-[var(--color-text-secondary)]">
              Aún no tienes transacciones registradas.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Usa el botón Nueva transacción para agregar la primera.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
