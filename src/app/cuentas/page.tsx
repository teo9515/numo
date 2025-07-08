// En src/app/cuentas/page.tsx

import { redirect } from "next/navigation";
import Link from "next/link";
import { IoChevronBack } from "react-icons/io5";

import { Account } from "@/types";
import AccountCard from "../components/AccountCard";
import CreateAccountForm from "../components/CreateAccountForm";
import { createClient } from "@/lib/supabase/server";
import { exchangeRateService } from "@/services/exchangeRateService"; // Importamos el servicio

export default async function CuentasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Usamos el servicio que ya creamos para obtener la tasa
  const usdToCopRate = await exchangeRateService.getExchangeRate("USD", "COP");

  let accounts: Account[] = [];
  const { data: userAccounts, error } = await supabase
    .from("accounts")
    .select("id, name, balance, currency")
    .order("name");

  if (error) {
    console.error("Error fetching accounts:", error);
  } else if (userAccounts) {
    accounts = userAccounts;
  }

  // DEBUG: Vamos a registrar qué datos estamos recibiendo
  console.log(
    "Cuentas recibidas de Supabase:",
    JSON.stringify(accounts, null, 2)
  );

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-[var(--color-primary)] hover:text-orange-400 transition-colors mb-4"
        >
          <IoChevronBack className="h-5 w-5" />
          Volver al Inicio
        </Link>
        <h1 className="text-2xl font-bold text-white">Mis Cuentas</h1>
        <p className="text-gray-400 mt-1">
          Administra tus cuentas, edita sus nombres o elimina las que ya no
          uses.
        </p>
      </header>

      <div className="bg-[var(--color-surface)] rounded-2xl shadow-lg overflow-hidden border border-white/10">
        <div className="p-4 md:p-6">
          {accounts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* --- INICIO DE LA SOLUCIÓN --- */}
              {accounts.map((account, index) => {
                // Si por alguna razón la cuenta es nula o undefined, no la renderizamos.
                if (!account) {
                  console.warn(
                    `Se encontró una cuenta inválida en el índice ${index}. Saltando...`
                  );
                  return null;
                }

                return (
                  <AccountCard
                    // Usamos el id de la cuenta o el índice como último recurso para la key.
                    key={account.id || index}
                    account={account}
                    exchangeRate={usdToCopRate}
                  />
                );
              })}
              {/* --- FIN DE LA SOLUCIÓN --- */}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400">
              <p>Aún no has creado ninguna cuenta.</p>
            </div>
          )}
        </div>
        <CreateAccountForm />
      </div>
    </div>
  );
}
