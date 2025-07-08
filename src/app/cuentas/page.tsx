// En src/app/cuentas/page.tsx (versión final rediseñada)

import { redirect } from "next/navigation";
import Link from "next/link";
import { IoChevronBack } from "react-icons/io5";

import { Account } from "@/types";
import AccountCard from "../components/AccountCard";
import CreateAccountForm from "../components/CreateAccountForm";
import { createClient } from "@/lib/supabase/server";

export default async function CuentasPage() {
  // Usar el cliente de servidor centralizado
  const supabase = await createClient();

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

      <div className=" flex flex-col justify-center items-center gap-6">
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
