// src/app/transacciones/page.tsx

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import { Account, Transaction } from "@/types";
import TransactionList from "../components/TransactionList";
import AddTransactionModal from "../components/AddTransactionModal";

export default async function TransactionsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // Ignore
            }
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Datos
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
    <main className=" bg-[var(--brand-light)] min-h-screen">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <Link
            href="/"
            className="text-sm text-[var(--brand-orange)] hover:underline flex items-center gap-1"
          >
            <span>&larr;</span> Volver al Inicio
          </Link>

          <div className="flex justify-between items-center mt-4">
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">
              Historial de Transacciones
            </h1>
            <AddTransactionModal accounts={accounts} />
          </div>
        </header>

        <section className="bg-white rounded-3xl shadow-md p-4 md:p-6">
          {transactions.length > 0 ? (
            <TransactionList transactions={transactions} />
          ) : (
            <div className="text-center py-16">
              <p className="text-[var(--text-secondary)]">
                Aún no tienes transacciones registradas.
              </p>
              <p className="text-[var(--text-secondary)] mt-2">
                Usa el botón + Transacción para agregar la primera.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
