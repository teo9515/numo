// En src/app/page.tsx (y en el resto de tus páginas)

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
// ... el resto de tus importaciones ...
import { Account } from "@/types";
import AddTransactionModal from "./components/AddTransactionModal";
import NavCard from "./components/NavCard";
import AccountCard from "./components/AccountCard";

export default async function Home() {
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
          // En páginas de solo lectura, típicamente no necesitas setAll
          // pero se requiere para la interfaz
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // Ignore errors en páginas de solo lectura
            }
          });
        },
      },
    }
  );

  // El resto de tu código para obtener datos y renderizar no necesita cambiar
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let accounts: Account[] = [];
  if (user) {
    const { data: userAccounts } = await supabase
      .from("accounts")
      .select("id, name, balance")
      .order("name");
    if (userAccounts) accounts = userAccounts;
  }

  return (
    <main className="bg-[var(--color-background)] text-[var(--color-text-primary)] min-h-screen">
      <div className="max-w-4xl mx-auto ">
        {user ? (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
                Your Balance
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
                {accounts.length > 0 ? (
                  accounts.map((account) => (
                    <div key={account.id} className="snap-start">
                      <AccountCard account={account} />
                    </div>
                  ))
                ) : (
                  <div className="w-full text-center p-8 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-secondary)] text-[var(--color-text-secondary)]">
                    <p>Crea tu primera cuenta para empezar.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="text-center">
              <AddTransactionModal accounts={accounts} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NavCard
                href="/transacciones"
                title="Transacciones"
                description="Historial y nuevos movimientos."
              />
              <NavCard
                href="/cuentas"
                title="Cuentas"
                description="Administra y crea cuentas."
              />
              <NavCard
                href="/balances"
                title="Balances"
                description="Análisis y resúmenes."
              />
              <NavCard
                href="/perfil"
                title="Mi Perfil"
                description="Edita tu información."
              />
            </div>
          </div>
        ) : (
          <div className="text-center mt-32">
            <h2 className="text-4xl font-bold text-[var(--color-text-primary)] mb-4">
              Controla tus finanzas.
            </h2>
            <p className="text-[var(--color-text-secondary)] text-lg mb-8 max-w-md mx-auto">
              Numo te da las herramientas para organizar tus ingresos y gastos
              con claridad.
            </p>
            <Link href="/login">
              <button className="bg-[var(--color-primary)] hover:bg-orange-600 text-white px-8 py-3 rounded-2xl text-base font-bold transition-colors shadow-lg shadow-[var(--color-primary)]/30">
                Empezar Ahora
              </button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
