import { redirect } from "next/navigation";
import Link from "next/link";
import { IoChevronBack } from "react-icons/io5";
import type { User } from "@supabase/supabase-js"; // 1. Importamos el tipo

import UpdateProfileForm from "../components/UpdateProfileForm";
import { createClient } from "@/lib/supabase/server";

interface ProfilePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const supabase = await createClient();
  const { demo } = await searchParams;
  const isDemoMode = demo === "true";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si no hay usuario y no es demo, redirigir
  if (!user && !isDemoMode) {
    return redirect("/login");
  }

  // --- Lógica de Usuario para el Formulario ---
  // CORRECCIÓN: Usamos 'as unknown as User' para satisfacer a ESLint
  const effectiveUser =
    user ||
    (isDemoMode
      ? ({
          id: "demo-user",
          email: "demo@numo.app",
          app_metadata: {},
          user_metadata: {},
          aud: "authenticated",
          created_at: new Date().toISOString(),
          role: "authenticated",
          updated_at: new Date().toISOString(),
        } as unknown as User)
      : null);

  // Validación extra por seguridad de tipos (aunque la lógica de arriba ya lo cubre)
  if (!effectiveUser && !isDemoMode) return redirect("/login");

  // Si es demo, usamos un perfil falso por defecto si no existe uno real
  let profile = null;

  if (!isDemoMode && user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <div className="w-full  mx-auto pb-20">
      <header className="mb-8">
        <Link
          href={isDemoMode ? "/?demo=true" : "/"}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 text-sm font-medium pl-1"
        >
          <IoChevronBack className="h-4 w-4" />
          Volver al Inicio
        </Link>

        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>
          {isDemoMode && (
            <span className="bg-orange-500/10 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded border border-orange-500/20">
              DEMO
            </span>
          )}
        </div>
        <p className="text-gray-400 mt-2 text-sm">
          Gestiona tu información personal y preferencias.
        </p>
      </header>

      {/* Renderizamos el formulario. 
          Nota: effectiveUser no puede ser null aquí debido a los checks anteriores, 
          pero Typescript podría quejarse, así que aseguramos el tipo. */}
      {effectiveUser && (
        <UpdateProfileForm
          user={effectiveUser}
          profile={profile}
          isDemo={isDemoMode}
        />
      )}
    </div>
  );
}
