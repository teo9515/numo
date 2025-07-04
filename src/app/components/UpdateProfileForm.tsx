// En src/components/UpdateProfileForm.tsx (versión rediseñada)
"use client";

import type { User } from "@supabase/supabase-js";
import { Profile } from "@/types";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

type UpdateProfileFormProps = {
  user: User;
  profile: Profile | null;
};

export default function UpdateProfileForm({
  user,
  profile,
}: UpdateProfileFormProps) {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const profileData = {
      new_full_name: formData.get("full_name") as string,
      new_username: formData.get("username") as string,
      new_phone: formData.get("phone") as string,
    };

    const { error } = await supabase.rpc("update_user_profile", profileData);

    if (error) {
      alert("Hubo un error al actualizar el perfil: " + error.message);
    } else {
      alert("¡Perfil actualizado con éxito!");
      router.refresh();
    }
  };

  return (
    <div className="p-6 bg-[var(--color-surface)] rounded-2xl shadow-lg border border-white/10">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-400 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="text"
            value={user.email ?? ""}
            disabled
            className="mt-1 w-full px-3 py-2 bg-dark-primary text-gray-400 border border-gray-600 rounded-md cursor-not-allowed"
          />
        </div>
        <div>
          <label
            htmlFor="full_name"
            className="block text-sm font-medium text-gray-400 mb-1"
          >
            Nombre Completo
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            defaultValue={profile?.full_name ?? ""}
            className="mt-1 w-full px-3 py-2 bg-dark-primary text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-400 mb-1"
          >
            Nombre de Usuario
          </label>
          <input
            id="username"
            name="username"
            type="text"
            defaultValue={profile?.username ?? ""}
            className="mt-1 w-full px-3 py-2 bg-dark-primary text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-400 mb-1"
          >
            Teléfono
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={profile?.phone ?? ""}
            className="mt-1 w-full px-3 py-2 bg-dark-primary text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-dark-surface transition-colors"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}
