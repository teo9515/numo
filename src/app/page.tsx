// En src/app/page.tsx (versión simplificada y corregida)

import Link from "next/link";
import { Account } from "@/types";
import AddTransactionModal from "./components/AddTransactionModal";
import NavCard from "./components/NavCard";
import AccountCard from "./components/AccountCard";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

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

  // El return ahora es más simple, sin <main> ni clases de altura
  return (
    <>
      {user ? (
        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
              Tus cuentas
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
              {accounts.length > 0 ? (
                accounts.map((account) => (
                  <div key={account.id} className="snap-start">
                    <AccountCard account={account} />
                  </div>
                ))
              ) : (
                <div className="w-full text-center p-8 bg-[var(--color-surface)] rounded-lg border border-[var(--color-secondary)] text-[var(--color-text-secondary)]">
                  <p>Crea tu primera cuenta para empezar.</p>
                </div>
              )}
            </div>
          </div>

          <div className="text-center ">
            <AddTransactionModal accounts={accounts} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <NavCard href="/transacciones" title="Transacciones" />
            <NavCard href="/cuentas" title="Cuentas" />
            <NavCard href="/balances" title="Balances" />
            <NavCard href="/profile" title="Mi Perfil" />
          </div>
        </div>
      ) : (
        <div className="text-center mt-16 md:mt-32">
          <h2 className="text-4xl font-bold text-[var(--color-text-primary)] mb-4">
            Controla tus finanzas.
          </h2>
          <p className="text-[var(--color-text-secondary)] text-lg mb-8 max-w-md mx-auto">
            Numo te da las herramientas para organizar tus ingresos y gastos con
            claridad.
          </p>
          <Link href="/login">
            <button className="bg-[var(--color-primary)] hover:bg-orange-600 text-white px-8 py-3 rounded-lg text-base font-bold transition-colors shadow-lg shadow-[var(--color-primary)]/30">
              Empezar Ahora
            </button>
          </Link>
        </div>
      )}
    </>
  );
}
