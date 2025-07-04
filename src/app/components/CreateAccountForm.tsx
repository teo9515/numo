// En src/components/CreateAccountForm.tsx (versión rediseñada)
"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function CreateAccountForm() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const accountName = formData.get("accountName") as string;

    if (!accountName.trim()) {
      alert("Por favor, ingresa un nombre válido para la cuenta.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("accounts")
      .insert({ name: accountName, balance: 0, user_id: user.id });

    if (error) {
      alert("Hubo un error al crear la cuenta: " + error.message);
    } else {
      alert("¡Cuenta creada con éxito!");
      form.reset();
      router.refresh();
    }
  };

  return (
    <div className="p-4 bg-black/20 border-t border-white/10 mt-4">
      <h4 className="font-semibold mb-2 text-gray-300">Crear nueva cuenta</h4>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          name="accountName"
          placeholder="Ej: Ahorros, Tarjeta de Crédito..."
          required
          className="flex-grow px-3 py-2 bg-dark-primary text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          type="submit"
          className="bg-orange-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors"
        >
          Crear
        </button>
      </form>
    </div>
  );
}
