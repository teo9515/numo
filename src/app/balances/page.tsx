// En src/app/balances/page.tsx (versión final rediseñada)

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { IoChevronBack } from "react-icons/io5";

import SummaryDashboard, { SummaryData } from "../components/SummaryDashboard";

export default async function BalancesPage() {
  const cookieStore = await cookies();

  // Usando la lógica getAll/setAll que prefieres
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
            // Ignorar errores en componentes de servidor
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let summary: SummaryData | null = null;
  const { data: summaryData } = await supabase.rpc("get_dashboard_summary");
  if (summaryData) summary = summaryData;

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
        <h1 className="text-2xl font-bold text-white">Mis Balances</h1>
      </header>

      <section>
        {summary ? (
          <SummaryDashboard summary={summary} />
        ) : (
          <div className="text-center py-16 px-4 bg-[var(--color-surface)] rounded-2xl border border-white/5">
            <p className="text-[var(--color-text-secondary)]">
              No hay datos de resumen para mostrar. ¡Agrega algunas
              transacciones!
            </p>
          </div>
        )}
      </section>

      {/* Botón para la funcionalidad futura */}
      <div className="mt-8">
        <button
          className="bg-[var(--color-surface)] text-gray-400 px-4 py-2 rounded-lg font-semibold border border-white/10 cursor-not-allowed"
          disabled
        >
          Resúmenes Completos (Próximamente)
        </button>
      </div>
    </div>
  );
}
