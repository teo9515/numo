"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Profile } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiAtSign,
  FiLock,
  FiSave,
} from "react-icons/fi";

type UpdateProfileFormProps = {
  user: User;
  profile: Profile | null;
  isDemo?: boolean;
};

export default function UpdateProfileForm({
  user,
  profile,
  isDemo = false,
}: UpdateProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);

      const profileData = {
        new_full_name: formData.get("full_name") as string,
        new_username: formData.get("username") as string,
        new_phone: formData.get("phone") as string,
      };

      // --- MODO DEMO ---
      if (isDemo) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        alert("🎉 Perfil actualizado (Simulación Demo)");
        setLoading(false);
        return;
      }

      // --- MODO REAL ---
      const { error } = await supabase.rpc("update_user_profile", profileData);

      if (error) throw error;

      alert("¡Perfil actualizado con éxito!");
      router.refresh();
    } catch (error) {
      // CORRECCIÓN AQUÍ: Verificamos el tipo de error de forma segura
      const errorMessage =
        error instanceof Error ? error.message : "Ocurrió un error desconocido";
      alert("Hubo un error: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--color-surface)] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* Decoración de fondo sutil */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-2">
        Información Personal
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- GRID DE 2 COLUMNAS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. Nombre Completo */}
          <div className="space-y-1.5">
            <label
              htmlFor="full_name"
              className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1"
            >
              <FiUser /> Nombre Completo
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              defaultValue={profile?.full_name ?? ""}
              disabled={loading}
              placeholder="Tu nombre"
              className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all placeholder:text-gray-600"
            />
          </div>

          {/* 2. Usuario */}
          <div className="space-y-1.5">
            <label
              htmlFor="username"
              className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1"
            >
              <FiAtSign /> Usuario
            </label>
            <input
              id="username"
              name="username"
              type="text"
              defaultValue={profile?.username ?? ""}
              disabled={loading}
              placeholder="username"
              className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all placeholder:text-gray-600"
            />
          </div>

          {/* 3. Email (Bloqueado) */}
          <div className="space-y-1.5 opacity-70">
            <label
              htmlFor="email"
              className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1"
            >
              <FiMail /> Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="text"
                value={user.email ?? ""}
                disabled
                className="w-full px-4 py-2 bg-black/20 border border-white/5 rounded-xl text-gray-400 cursor-not-allowed pl-10"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <FiLock />
              </div>
            </div>
          </div>

          {/* 4. Teléfono */}
          <div className="space-y-1.5">
            <label
              htmlFor="phone"
              className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1"
            >
              <FiPhone /> Teléfono
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={profile?.phone ?? ""}
              disabled={loading}
              placeholder="+57 300..."
              className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all placeholder:text-gray-600"
            />
          </div>
        </div>

        {/* --- BOTÓN DE ACCIÓN --- */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {loading ? (
              "Guardando..."
            ) : (
              <>
                <FiSave className="w-4 h-4" /> Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
