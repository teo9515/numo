// En src/app/profile/page.tsx (versión final rediseñada)

import { redirect } from "next/navigation";
import Link from "next/link";
import { IoChevronBack } from "react-icons/io5";

import UpdateProfileForm from "../components/UpdateProfileForm";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  // Usar el cliente de servidor centralizado
  const supabase = await createClient();

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
