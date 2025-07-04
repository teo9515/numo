// En src/components/TransactionForm.tsx

"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

// Definiendo los tipos que el componente necesita
interface Account {
  id: number; // El ID de la cuenta es un número
  name: string;
  balance: number;
}

interface TransactionFormProps {
  accounts: Account[];
}

export default function TransactionForm({ accounts }: TransactionFormProps) {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // 1. Guardamos una referencia segura al formulario ANTES del 'await'
    const form = event.currentTarget;

    try {
      const formData = new FormData(form);
      const formObject = Object.fromEntries(formData.entries());

      // Preparamos los datos con los nombres y tipos que espera la función RPC
      const rpcParams = {
        amount_val: Number(formObject.amount),
        type_val: formObject.type as string,
        account_id_val: Number(formObject.account_id), // Aseguramos que sea un número
        description_val: formObject.description as string,
      };

      const { error } = await supabase.rpc("add_transaction", rpcParams);

      if (error) {
        console.error("Error adding transaction:", error);
        alert("Hubo un error al agregar la transacción: " + error.message);
      } else {
        alert("¡Transacción agregada con éxito!");
        // 2. Usamos nuestra referencia segura para hacer el reset
        form.reset();
        router.refresh();
      }
    } catch (err) {
      console.error("Error procesando formulario:", err);
      alert("Error inesperado al procesar la transacción");
    }
  };

  return (
    // Este es tu JSX, está muy bien estilizado. No se ha cambiado.
    <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4 text-gray-800">
        Agregar Nueva Transacción
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Monto:
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            step="0.01"
            min="0"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Descripción:
          </label>
          <input
            type="text"
            id="description"
            name="description"
            required
            maxLength={255}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Descripción de la transacción"
          />
        </div>

        <div>
          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-2">
              Tipo:
            </legend>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  defaultChecked
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Gasto</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="income"
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Ingreso</span>
              </label>
            </div>
          </fieldset>
        </div>

        <div>
          <label
            htmlFor="account_id"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Cuenta:
          </label>
          <select
            id="account_id"
            name="account_id"
            required
            disabled={accounts.length === 0}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {accounts.length === 0 ? (
              <option value="">Crea una cuenta primero</option>
            ) : (
              <>
                <option value="">Selecciona una cuenta</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} (${account.balance.toFixed(2)})
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        <button
          type="submit"
          disabled={accounts.length === 0}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {accounts.length === 0
            ? "Crea una cuenta primero"
            : "Agregar Transacción"}
        </button>
      </form>
    </div>
  );
}
