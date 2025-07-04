// En src/components/UpdateProfileForm.tsx
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

  // --- LÓGICA DE ENVÍO ACTUALIZADA ---
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // Creamos un objeto con los nombres exactos que espera nuestra función RPC
    const profileData = {
      new_full_name: formData.get("full_name") as string,
      new_username: formData.get("username") as string,
      new_phone: formData.get("phone") as string,
    };

    // Llamamos a la función 'update_user_profile' que creamos en Supabase
    const { error } = await supabase.rpc("update_user_profile", profileData);

    if (error) {
      // Un error común podría ser si el 'username' ya está en uso por otro usuario
      console.error("Error updating profile:", error);
      alert("Hubo un error al actualizar el perfil: " + error.message);
    } else {
      alert("¡Perfil actualizado con éxito!");
      // Refrescamos la página para que los datos se actualicen en toda la app
      // por si mostramos el nombre en otro lugar, por ejemplo.
      router.refresh();
    }
  };
  // --- FIN DE LA LÓGICA DE ENVÍO ---

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="text"
            value={user.email ?? ""}
            disabled
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
          />
        </div>
        <div>
          <label
            htmlFor="full_name"
            className="block text-sm font-medium text-gray-700"
          >
            Nombre Completo
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            defaultValue={profile?.full_name ?? ""}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Nombre de Usuario
          </label>
          <input
            id="username"
            name="username"
            type="text"
            defaultValue={profile?.username ?? ""}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Teléfono
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={profile?.phone ?? ""}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}
