// En src/components/CreateAccountForm.tsx

"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function CreateAccountForm() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // --- FUNCIÓN CORREGIDA ---
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const accountName = formData.get("accountName") as string;

    if (!accountName.trim()) {
      alert("Por favor, ingresa un nombre válido para la cuenta.");
      return;
    }

    // 1. Obtenemos la información del usuario actual desde el cliente de Supabase
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Si por alguna razón no encontramos un usuario, detenemos el proceso
    if (!user) {
      alert(
        "No se pudo identificar al usuario. Por favor, inicia sesión de nuevo."
      );
      return;
    }

    // 2. Ahora, en el objeto que insertamos, incluimos el user_id
    const { error } = await supabase
      .from("accounts")
      .insert({ name: accountName, balance: 0, user_id: user.id });

    if (error) {
      console.error("Error creating account:", error);
      alert("Hubo un error al crear la cuenta: " + error.message);
    } else {
      alert("¡Cuenta creada con éxito!");
      form.reset();
      router.refresh();
    }
  };
  // --- FIN DE LA CORRECCIÓN ---

  return (
    <div className="p-4 bg-gray-100 border-t">
      <h4 className="font-semibold mb-2 text-gray-700">Crear nueva cuenta</h4>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          name="accountName"
          placeholder="Ej: Ahorros, Tarjeta de Crédito..."
          required
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors"
        >
          Crear
        </button>
      </form>
    </div>
  );
}
