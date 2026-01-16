import { redirect } from "next/navigation";
import Link from "next/link";
import { IoChevronBack } from "react-icons/io5";

import { Account } from "@/types";
import AccountCard from "../components/AccountCard";
import CreateAccountForm from "../components/CreateAccountForm";
import { createClient } from "@/lib/supabase/server";
import { exchangeRateService } from "@/services/exchangeRateService";

// Datos Mock
const DEMO_ACCOUNTS: Account[] = [
  { id: 9901, name: "Bancolombia", balance: 2450000, currency: "COP" },
  { id: 9902, name: "Efectivo", balance: 150000, currency: "COP" },
  { id: 9903, name: "Ahorros USD", balance: 120, currency: "USD" },
  { id: 9904, name: "Nequi", balance: 50000, currency: "COP" },
  { id: 9905, name: "Davivienda", balance: 0, currency: "COP" },
  { id: 9906, name: "Inversiones", balance: 1000000, currency: "COP" },
];

interface CuentasPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CuentasPage({ searchParams }: CuentasPageProps) {
  const supabase = await createClient();
  const { demo } = await searchParams;
  const isDemoMode = demo === "true";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isDemoMode) {
    redirect("/login");
  }

  const usdToCopRate = await exchangeRateService.getExchangeRate("USD", "COP");

  let accounts: Account[] = [];

  if (isDemoMode) {
    accounts = DEMO_ACCOUNTS;
  } else if (user) {
    const { data: userAccounts } = await supabase
      .from("accounts")
      .select("id, name, balance, currency")
      .order("name");

    if (userAccounts) accounts = userAccounts;
  }

  return (
    // CAMBIO CLAVE: Ajustamos la altura a calc(100vh - 8rem) para compensar el padding del layout.
    // 'min-h-0' es vital para que el scroll interno funcione en flexbox anidados.
    <div className="w-full max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* HEADER (Fijo, no scrollea) */}
      <header className="flex-shrink-0 mb-6">
        <Link
          href={isDemoMode ? "/?demo=true" : "/"}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium mb-2 pl-1"
        >
          <IoChevronBack className="h-4 w-4" />
          Volver al Inicio
        </Link>

        <div className="flex items-center gap-3 border-b border-white/5 pb-2">
          <h1 className="text-3xl font-bold text-white">Gestión de Cuentas</h1>
          {isDemoMode && (
            <span className="bg-orange-500/10 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded border border-orange-500/20">
              DEMO
            </span>
          )}
        </div>
      </header>

      {/* CONTENIDO DIVIDIDO */}
      {/* 'flex-grow' y 'min-h-0' obligan a este div a ocupar solo el espacio restante sin empujar la página */}
      <div className="flex-grow min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* --- COLUMNA IZQUIERDA: LISTA DE CUENTAS (Scrollable) --- */}
        <section className="lg:col-span-7 flex flex-col h-full min-h-0">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4 flex-shrink-0">
            Mis Cuentas ({accounts.length})
          </h2>

          <div className="flex-grow overflow-y-auto scrollbar-sutil pr-2 pb-10">
            {accounts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {accounts.map((account, index) => (
                  <div key={account.id || index} className="w-full">
                    <AccountCard
                      account={account}
                      exchangeRate={usdToCopRate}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-2xl bg-white/5">
                <p className="text-gray-400">No tienes cuentas registradas.</p>
              </div>
            )}
          </div>
        </section>

        {/* --- COLUMNA DERECHA: FORMULARIO (Fijo) --- */}
        <section className="lg:col-span-5 h-full overflow-y-auto scrollbar-sutil lg:overflow-visible mb-5">
          <div className="bg-[var(--color-surface)] border border-white/10 rounded-2xl p-1 shadow-2xl">
            <CreateAccountForm isDemo={isDemoMode} />
          </div>
        </section>
      </div>
    </div>
  );
}
