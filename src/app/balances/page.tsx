// En src/app/balances/page.tsx (versión final rediseñada)

import { redirect } from "next/navigation";
import Link from "next/link";
import { IoChevronBack } from "react-icons/io5";
import { FiPieChart } from "react-icons/fi"; // Iconos para decorar

import SummaryDashboard, { SummaryData } from "../components/SummaryDashboard";
import { createClient } from "@/lib/supabase/server";

export default async function BalancesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let summary: SummaryData | null = null;
  const { data: summaryData } = await supabase.rpc("get_dashboard_summary");
  if (summaryData) summary = summaryData;

  return (
    // Usamos max-w-5xl para dar espacio a los gráficos sin estirar demasiado
    <div className="w-full  mx-auto px-4 md:px-0 ">
      {/* Header Consistente */}
      <header className="mb-8 pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:text-orange-400 transition-colors mb-4 text-sm font-medium pl-1"
        >
          <IoChevronBack className="h-4 w-4" />
          Volver al Inicio
        </Link>

        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Mis Balances</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Visión general de tu salud financiera
            </p>
          </div>
        </div>
      </header>

      <section className="space-y-8">
        {summary ? (
          <SummaryDashboard summary={summary} />
        ) : (
          <div className="text-center py-16 px-4 bg-[var(--color-surface)] rounded-2xl border border-white/5 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-500">
              <FiPieChart size={32} />
            </div>
            <h3 className="text-white font-medium text-lg">
              Sin datos suficientes
            </h3>
            <p className="text-[var(--color-text-secondary)] mt-2 max-w-sm mx-auto text-sm">
              No hay datos de resumen para mostrar aún. ¡Agrega algunas
              transacciones para ver tus métricas!
            </p>
            <Link
              href="/transacciones"
              className="mt-6 btn-primary flex items-center justify-center gap-2 !w-auto px-6"
            >
              Ir a Transacciones
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
