import { Account } from "@/types";
import AddTransactionModal from "./components/AddTransactionModal";
import TransferModal from "./components/TransferModal";
import NavCard from "./components/NavCard";
import AccountCard from "./components/AccountCard";
import { createClient } from "@/lib/supabase/server";
import { exchangeRateService } from "@/services/exchangeRateService";
import Link from "next/link";

const DEMO_ACCOUNTS: Account[] = [
  { id: 9901, name: "Bancolombia", balance: 2450000, currency: "COP" },
  { id: 9902, name: "Efectivo", balance: 150000, currency: "COP" },
  { id: 9903, name: "Ahorros USD", balance: 120, currency: "USD" },
];

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const supabase = await createClient();
  const { demo } = await searchParams;
  const isDemoMode = demo === "true";

  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  const totalBalanceCOP = accounts.reduce((acc, account) => {
    if (account.currency === "USD") {
      return acc + account.balance * usdToCopRate;
    }
    return acc + account.balance;
  }, 0);

  const showDashboard = user || isDemoMode;

  return (
    <>
      {showDashboard ? (
        <div className="space-y-6 pb-6 w-full max-w-7xl mx-auto h-full flex flex-col justify-center">
          {/* HEADER DASHBOARD: Balance (Izq) + Acciones (Der) */}
          <section className="flex flex-col md:flex-row justify-between items-end gap-4 mt-2">
            {/* Balance */}
            <div className="flex flex-col gap-1 w-full md:w-auto">
              {isDemoMode && (
                <div className="bg-orange-100 text-[#FF6B00] text-[10px] font-bold px-2 py-0.5 rounded-full w-fit mb-1 border border-orange-200">
                  ⚡ Demo
                </div>
              )}
              <p className="text-[var(--color-text-secondary)] text-sm font-medium">
                Balance total estimado
              </p>
              <div className="text-4xl font-semibold text-[#FF6B00] tracking-tight leading-none">
                $ {totalBalanceCOP.toLocaleString("es-CO")}{" "}
                <span className="text-lg text-[var(--color-text-secondary)] font-normal ml-1">
                  COP
                </span>
              </div>
            </div>

            {/* Acciones Rápidas (Ahorran espacio vertical al estar aquí) */}
            <div className="flex gap-3 w-full md:w-auto">
              <div className="w-full md:w-auto">
                <AddTransactionModal accounts={accounts} isDemo={isDemoMode} />
              </div>
              <div className="w-full md:w-auto">
                <TransferModal accounts={accounts} />
              </div>
            </div>
          </section>

          {/* CUENTAS */}
          <section className="space-y-3">
            <div className="flex justify-between items-end">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                Mis Cuentas
              </h2>
              <Link
                href="/cuentas"
                className="text-xs text-[var(--color-primary)] hover:underline"
              >
                Ver todas
              </Link>
            </div>

            <div className="flex  gap-4 overflow-x-auto py-2 snap-x snap-mandatory -mx-4 px-4 scrollbar-sutil">
              {accounts.length > 0 ? (
                accounts.map((account, index) => {
                  if (!account) return null;
                  return (
                    <div
                      key={account.id || index}
                      className="snap-center shrink-0 w-[85%] sm:w-[230px]"
                    >
                      <AccountCard
                        account={account}
                        exchangeRate={usdToCopRate}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="w-full text-center p-6 bg-[var(--color-surface)] rounded-lg border border-dashed border-[var(--color-secondary)]">
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    No tienes cuentas activas.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* NAVEGACIÓN */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
              Navegación
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <NavCard
                href="/transacciones"
                title="Transacciones"
                isDemo={isDemoMode}
              />
              <NavCard href="/cuentas" title="Cuentas" isDemo={isDemoMode} />
              <NavCard href="/balances" title="Balances" isDemo={isDemoMode} />
              <NavCard href="/profile" title="Mi Perfil" isDemo={isDemoMode} />
            </div>
          </section>
        </div>
      ) : (
        <div className="relative flex flex-col items-center justify-center flex-grow w-full h-auto overflow-hidden">
          {/* 1. Efecto de Luz de Fondo (Glow) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-orange-500/20 rounded-full blur-[100px] pointer-events-none" />
          {/* Contenido Principal */}

          <div className="relative flex flex-col items-center justify-center min-h-[80vh] w-full overflow-hidden">
            {/* 1. Efecto de Luz de Fondo (Más pequeño para ajustarse al contenido) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-orange-900/5 rounded-full blur-[80px] pointer-events-none" />

            {/* Contenido Principal (Más estrecho: max-w-sm) */}
            <div className="relative z-10 w-full max-w-sm px-6 text-center space-y-6">
              {/* Logo y Slogan */}
              <div className="space-y-3">
                <h2 className="text-5xl font-extrabold text-white tracking-tighter drop-shadow-2xl">
                  Numo<span className="text-[var(--color-primary)]">.</span>
                </h2>
                <p className="text-[var(--color-text-secondary)] text-base font-medium leading-relaxed">
                  Controla tus finanzas con <br />{" "}
                  <span className="text-gray-300">claridad absoluta.</span>
                </p>
              </div>

              {/* Botones */}
              <div className="flex flex-col gap-3 pt-2">
                <Link href="/login" className="w-full">
                  {/* Usamos tu clase global btn-primary */}
                  <button className="btn-primary w-full ">
                    Iniciar Sesión
                  </button>
                </Link>

                <Link href="/?demo=true" className="w-full">
                  <button className="w-full bg-transparent text-gray-400 border border-white/10 py-2 rounded-lg text-base font-medium transition-all hover:bg-white/5 hover:text-white hover:border-white/20 active:scale-95 hover:cursor-pointer">
                    Ver Demo
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
