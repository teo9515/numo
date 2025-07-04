// En src/app/balances/page.tsx

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import SummaryDashboard, { SummaryData } from "../components/SummaryDashboard";

export default async function BalancesPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set(name, "", options);
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let summary: SummaryData | null = null;
  // Llamamos a la función que calcula todos los totales
  const { data: summaryData } = await supabase.rpc("get_dashboard_summary");
  if (summaryData) {
    summary = summaryData;
  }

  return (
    <main className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline">
            &larr; Volver al Inicio
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mt-2">
            Mis Balances
          </h1>
          <p className="text-gray-600">
            Un resumen detallado de tus finanzas por día, mes y año.
          </p>
        </header>

        {summary ? (
          <SummaryDashboard summary={summary} />
        ) : (
          <p>
            No hay datos de resumen para mostrar. ¡Agrega algunas transacciones!
          </p>
        )}

        {/* Botón para la funcionalidad futura */}
        <div className="mt-8">
          <button
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 cursor-not-allowed"
            disabled
          >
            Resúmenes Completos (Próximamente)
          </button>
        </div>
      </div>
    </main>
  );
}
