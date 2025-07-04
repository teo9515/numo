// En src/app/cuentas/page.tsx (versión final rediseñada)

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { IoChevronBack } from "react-icons/io5";

import { Account } from "@/types";
import AccountCard from "../components/AccountCard";
import CreateAccountForm from "../components/CreateAccountForm";

export default async function CuentasPage() {
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
            // Ignorar errores en componentes de servidor de solo lectura
          }
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

  let accounts: Account[] = [];
  const { data: userAccounts } = await supabase
    .from("accounts")
    .select("id, name, balance")
    .order("name");
  if (userAccounts) accounts = userAccounts;

  return (
    // El layout principal ya no necesita <main>
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
      </header>

      <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-self-center-safe gap-6">
        {accounts.length > 0 ? (
          accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))
        ) : (
          <p className="p-8 text-center text-gray-400 col-span-full">
            Aún no has creado ninguna cuenta.
          </p>
        )}
      </div>
      {/* El formulario para crear ahora va adentro del contenedor principal */}
      <CreateAccountForm />
    </div>
  );
}
