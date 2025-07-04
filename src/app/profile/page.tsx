// En src/app/profile/page.tsx (versión final rediseñada)

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { IoChevronBack } from "react-icons/io5";

import UpdateProfileForm from "../components/UpdateProfileForm";

export default async function ProfilePage() {
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
            // Ignorar errores
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-xl mx-auto">
      <header className="mb-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-[var(--color-primary)] hover:text-orange-400 transition-colors mb-4"
        >
          <IoChevronBack className="h-5 w-5" />
          Volver al Inicio
        </Link>
        <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
        <p className="text-gray-400 mt-1">Actualiza tu información personal.</p>
      </header>

      <UpdateProfileForm user={user} profile={profile} />
    </div>
  );
}
