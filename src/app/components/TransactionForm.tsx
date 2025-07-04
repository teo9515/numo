// En src/components/TransactionForm.tsx

"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useState } from "react"; // 1. Importamos useState para manejar el campo de monto

// Los tipos de Account y TransactionFormProps no cambian
interface Account {
  id: number;
  name: string;
  balance: number;
}

interface TransactionFormProps {
  accounts: Account[];
}

export default function TransactionForm({ accounts }: TransactionFormProps) {
  const router = useRouter();
  // 2. Creamos un estado para manejar el valor del monto como texto
  const [amount, setAmount] = useState("0");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 3. Función para formatear el número con separadores de miles mientras el usuario escribe
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Quitamos cualquier caracter que no sea un número
    const numericValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
    // Si el resultado no es un número (ej. el campo está vacío), lo seteamos a '0'
    setAmount(isNaN(numericValue) ? "0" : numericValue.toLocaleString("es-CO"));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const formObject = Object.fromEntries(formData.entries());

    // 4. Limpiamos el valor del monto antes de enviarlo a la base de datos
    const cleanAmount = Number(amount.replace(/[^0-9]/g, ""));

    const rpcParams = {
      amount_val: cleanAmount,
      type_val: formObject.type as string,
      account_id_val: Number(formObject.account_id),
      description_val: formObject.description as string,
    };

    const { error } = await supabase.rpc("add_transaction", rpcParams);

    if (error) {
      alert("Hubo un error al agregar la transacción: " + error.message);
    } else {
      alert("¡Transacción agregada con éxito!");
      form.reset();
      setAmount("0"); // Reseteamos el estado del monto
      router.refresh();
    }
  };

  return (
    // Aplicamos el nuevo diseño oscuro
    <div className="p-6 bg-black rounded-lg shadow-2xl shadow-white border border-white/20">
      <h3 className="text-xl text-center font-bold mb-6 text-white">
        Agregar Nueva Transacción
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-400 mb-1"
          >
            Monto
          </label>
          <input
            type="text" // Cambiado a text para permitir el formato
            inputMode="numeric" // Mejora la experiencia en móviles
            id="amount"
            name="amount"
            value={amount} // Controlado por el estado
            onChange={handleAmountChange} // Manejado por nuestra función
            required
            className="w-full px-3 py-2 bg-dark-primary text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
            className="w-full px-3 py-2 bg-dark-primary text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Ej: Café con amigos" // Placeholder mejorado
          />
        </div>

        <div>
          <fieldset>
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
            disabled={accounts.length === 0}
            className="w-full px-3 py-2 bg-dark-primary text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-800 disabled:cursor-not-allowed"
          >
            {accounts.length === 0 ? (
              <option value="">Crea una cuenta primero</option>
            ) : (
              <>
                <option value="">Selecciona una cuenta</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        <button
          type="submit"
          disabled={accounts.length === 0}
          className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-dark-surface transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {accounts.length === 0
            ? "Crea una cuenta primero"
            : "Agregar Transacción"}
        </button>
      </form>
    </div>
  );
}
