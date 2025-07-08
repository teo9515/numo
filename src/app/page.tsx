// En src/app/page.tsx (versión final y robusta)

import { Account } from "@/types";
import AddTransactionModal from "./components/AddTransactionModal";
import NavCard from "./components/NavCard";
import AccountCard from "./components/AccountCard";
import { createClient } from "@/lib/supabase/server";
// 1. Importamos nuestro servicio centralizado
import { exchangeRateService } from "@/services/exchangeRateService";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- INICIO DE LA CORRECCIÓN ---

  // 2. Usamos el servicio para obtener la tasa. Es más limpio y consistente.
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

  // --- FIN DE LA CORRECCIÓN ---

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
                // 3. Aplicamos la misma lógica de renderizado seguro que en la página de cuentas
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

          <div className="text-center">
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
          <a href="/login">
            <button className="bg-[var(--color-primary)] hover:bg-orange-600 text-white px-8 py-3 rounded-lg text-base font-bold transition-colors shadow-lg shadow-[var(--color-primary)]/30">
              Empezar Ahora
            </button>
          </a>
        </div>
      )}
    </>
  );
}
