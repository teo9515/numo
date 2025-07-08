"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function CreateAccountForm() {
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const accountName = formData.get("accountName") as string;
    const accountCurrency = formData.get("currency") as string;

    if (!accountName.trim() || !accountCurrency) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("accounts").insert({
      name: accountName,
      balance: 0,
      user_id: user.id,
      currency: accountCurrency,
    });

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
      <h4 className="font-semibold mb-3 text-gray-300">Crear nueva cuenta</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="accountName" className="sr-only">
              Nombre de la cuenta
            </label>
            <input
              type="text"
              id="accountName"
              name="accountName"
              placeholder="Ej: Ahorros, Bancolombia..."
              required
              className="w-full px-3 py-2 bg-dark-primary text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label htmlFor="currency" className="sr-only">
              Moneda
            </label>
            <select
              id="currency"
              name="currency"
              required
              className="w-full px-3 py-2 bg-dark-primary text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="COP">COP - Peso Colombiano</option>
              <option value="USD">USD - Dólar Americano</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-orange-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors"
        >
          Crear Cuenta
        </button>
      </form>
    </div>
  );
}
