"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { FiPlusCircle } from "react-icons/fi"; // Icono para darle vida

type CreateAccountFormProps = {
  isDemo?: boolean;
};

export default function CreateAccountForm({
  isDemo = false,
}: CreateAccountFormProps) {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("0");
  const [currency, setCurrency] = useState("COP");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Por favor ingresa un nombre para la cuenta.");
      return;
    }
    setLoading(true);

    if (isDemo) {
      await new Promise((r) => setTimeout(r, 800));
      alert(`🎉 Modo Demo: Cuenta "${name}" creada.`);
      setName("");
      setBalance("0");
      setCurrency("COP");
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("Sin sesión");
      setLoading(false);
      return;
    }

    const numericBalance = parseFloat(
      balance.toString().replace(/[^0-9.-]+/g, "")
    );
    const { error } = await supabase.from("accounts").insert({
      name,
      balance: isNaN(numericBalance) ? 0 : numericBalance,
      currency,
      user_id: user.id,
    });

    if (error) {
      alert(error.message);
    } else {
      setName("");
      setBalance("0");
      setCurrency("COP");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    // CAMBIO: max-w-2xl para que sea más ancho y balanceado
    <div className="w-full max-w-2xl mx-auto ">
      <div className="bg-[var(--color-surface)] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Decoración sutil de fondo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
          <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg text-[var(--color-primary)]">
            <FiPlusCircle size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Agregar Nueva Cuenta
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Crea un nuevo bolsillo para organizar tu dinero
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Nombre - Full Width */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Ahorros Viaje, Caja Menor..."
              className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all placeholder:text-gray-600"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Balance */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                Balance Inicial
              </label>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
                required
                disabled={loading}
              />
            </div>

            {/* Moneda */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                Moneda
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all appearance-none cursor-pointer"
                disabled={loading}
              >
                <option value="COP">COP - Peso Colombiano</option>
                <option value="USD">USD - Dólar</option>
              </select>
            </div>
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="w-40 bg-[var(--color-primary)] hover:bg-orange-600 text-white font-medium tracking-[0.5px] py-2 rounded-lg shadow-lg shadow-orange-900/20 hover:shadow-orange-900/30  transition-all active:scale-[0.98] hover:cursor-pointer"
          >
            {loading
              ? "Creando..."
              : isDemo
              ? "Simular creación"
              : "Crear cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}
