// En src/app/page.tsx (Versión con TransferModal)

import { Account } from "@/types";
import AddTransactionModal from "./components/AddTransactionModal";
import TransferModal from "./components/TransferModal";
import NavCard from "./components/NavCard";
import AccountCard from "./components/AccountCard";
import { createClient } from "@/lib/supabase/server";
import { exchangeRateService } from "@/services/exchangeRateService";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const usdToCopRate = await exchangeRateService.getExchangeRate("USD", "COP");

  let accounts: Account[] = [];
  if (user) {
    const { data: userAccounts, error } = await supabase
      .from("accounts")
      .select("id, name, balance, currency")
      .order("name");

    if (error) {
      console.error("Error fetching accounts:", error);
    } else if (userAccounts) {
      accounts = userAccounts;
    }
  }

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
                accounts.map((account, index) => {
                  if (!account) {
                    console.warn(
                      `Se encontró una cuenta inválida en el índice ${index} de la página de inicio. Saltando...`
                    );
                    return null;
                  }
                  return (
                    <div key={account.id || index} className="snap-start">
                      <AccountCard
                        account={account}
                        exchangeRate={usdToCopRate}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="w-full text-center p-8 bg-[var(--color-surface)] rounded-lg border border-[var(--color-secondary)] text-[var(--color-text-secondary)]">
                  <p>Crea tu primera cuenta para empezar.</p>
                  <p className="text-sm mt-2 opacity-75">
                    Ve a la sección Cuentas para crear tu primera cuenta.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sección de acciones rápidas */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Acciones rápidas
            </h3>
            <div className="flex w-full items-center space-x-4 justify-center">
              <AddTransactionModal accounts={accounts} />
              <TransferModal accounts={accounts} />
            </div>
          </div>

          {/* Navegación */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Menú
            </h3>
            <div className="w-full grid grid-cols-2 justify-items-center  gap-4">
              <NavCard href="/transacciones" title="Transacciones" />
              <NavCard href="/cuentas" title="Cuentas" />
              <NavCard href="/balances" title="Balances" />
              <NavCard href="/profile" title="Mi Perfil" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-max px-4">
          <div className="text-center max-w-md">
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-text-primary)] mb-4 leading-tight">
              Controla tus finanzas.
            </h2>
            <p className="text-[var(--color-text-secondary)] text-lg mb-8">
              Numo te da las herramientas para organizar tus ingresos y gastos
              con claridad.
            </p>
            <a href="/login">
              <button className="bg-[var(--color-primary)] hover:bg-orange-600 text-white px-8 py-3 rounded-lg text-base font-bold transition-colors shadow-lg shadow-[var(--color-primary)]/30">
                Empezar Ahora
              </button>
            </a>
          </div>
        </div>
      )}
    </>
  );
}
