// En src/app/cuentas/page.tsx

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import { Account } from "@/types";
import AccountCard from "../components/AccountCard";
import CreateAccountForm from "../components/CreateAccountForm";

export default async function CuentasPage() {
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

  let accounts: Account[] = [];
  const { data: userAccounts } = await supabase
    .from("accounts")
    .select("id, name, balance")
    .order("name");
  if (userAccounts) accounts = userAccounts;

  return (
    <main className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline">
            &larr; Volver al Inicio
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mt-2">Mis Cuentas</h1>
          <p className="text-gray-600">
            Administra tus cuentas, edita sus nombres o elimina las que ya no
            uses.
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.length > 0 ? (
              accounts.map((account) => (
                <AccountCard key={account.id} account={account} />
              ))
            ) : (
              <p className="p-4 text-gray-500 col-span-full">
                Aún no has creado ninguna cuenta. Usa el formulario de abajo
                para empezar.
              </p>
            )}
          </div>
          <CreateAccountForm />
        </div>
      </div>
    </main>
  );
}
