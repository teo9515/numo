// En src/components/TransactionForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Definir el tipo Account aquí si no existe en @/types
interface Account {
  id: number;
  name: string;
  currency: string;
  balance?: number;
}

interface TransactionFormProps {
  accounts: Account[];
}

export default function TransactionForm({ accounts }: TransactionFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>(
    accounts[0]?.currency || "COP"
  );

  const supabase = createClient();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
    setAmount(isNaN(numericValue) ? "0" : numericValue.toLocaleString("es-CO"));
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const accountId = Number(e.target.value);
    const selectedAccount = accounts.find((acc) => acc.id === accountId);
    if (selectedAccount) {
      setSelectedCurrency(selectedAccount.currency);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const formObject = Object.fromEntries(formData.entries());
      const cleanAmount = Number(amount.replace(/[^0-9]/g, ""));

      // Validaciones
      if (cleanAmount <= 0) {
        throw new Error("El monto debe ser mayor a 0");
      }

      if (!formObject.account_id) {
        throw new Error("Debes seleccionar una cuenta");
      }

      if (
        !formObject.description ||
        (formObject.description as string).trim() === ""
      ) {
        throw new Error("La descripción es requerida");
      }

      const rpcParams = {
        amount_val: cleanAmount,
        type_val: formObject.type as string,
        account_id_val: Number(formObject.account_id),
        description_val: (formObject.description as string).trim(),
        currency_val: selectedCurrency,
      };

      console.log("Enviando parámetros:", rpcParams); // Para debugging

      const { error } = await supabase.rpc("add_transaction", rpcParams);

      if (error) {
        console.error("Error de Supabase:", error);
        throw new Error(`Error al agregar la transacción: ${error.message}`);
      }

      // Éxito
      form.reset();
      setAmount("0");
      setSelectedCurrency(accounts[0]?.currency || "COP");
      router.refresh();

      // Mostrar mensaje de éxito (opcional)
      alert("¡Transacción agregada con éxito!");
    } catch (err) {
      console.error("Error en handleSubmit:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error inesperado";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-black rounded-lg shadow-2xl shadow-white border border-white/20">
      <h3 className="text-xl text-center font-bold mb-6 text-white">
        Agregar Nueva Transacción
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-600 text-white rounded-md">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-400 mb-1"
          >
            Monto ({selectedCurrency})
          </label>
          <input
            type="text"
            inputMode="numeric"
            id="amount"
            name="amount"
            value={amount}
            onChange={handleAmountChange}
            required
            disabled={isSubmitting}
            className="w-full px-3 py-2 bg-gray-900 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-400 mb-1"
          >
            Descripción
          </label>
          <input
            type="text"
            id="description"
            name="description"
            required
            maxLength={255}
            disabled={isSubmitting}
            className="w-full px-3 py-2 bg-gray-900 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
            placeholder="Ej: Café con amigos"
          />
        </div>

        <div>
          <fieldset disabled={isSubmitting}>
            <legend className="text-sm font-medium text-gray-400 mb-2">
              Tipo de Transacción
            </legend>
            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  defaultChecked
                  className="h-4 w-4 mr-2 text-orange-500 bg-gray-700 border-gray-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-200">Gasto</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="income"
                  className="h-4 w-4 mr-2 text-orange-500 bg-gray-700 border-gray-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-200">Ingreso</span>
              </label>
            </div>
          </fieldset>
        </div>

        <div>
          <label
            htmlFor="account_id"
            className="block text-sm font-medium text-gray-400 mb-1"
          >
            Cuenta
          </label>
          <select
            id="account_id"
            name="account_id"
            required
            onChange={handleAccountChange}
            disabled={accounts.length === 0 || isSubmitting}
            className="w-full px-3 py-2 bg-gray-900 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {accounts.length === 0 ? (
              <option value="">Crea una cuenta primero</option>
            ) : (
              <>
                <option value="">Selecciona una cuenta</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.currency})
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        <button
          type="submit"
          disabled={accounts.length === 0 || isSubmitting}
          className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Procesando..." : "Agregar Transacción"}
        </button>
      </form>
    </div>
  );
}
