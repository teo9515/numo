// En src/components/EditTransactionModal.tsx
"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react"; // 1. Importamos useState y useEffect
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import type { Account, Transaction } from "@/types";

type EditTransactionModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  transaction: Transaction;
  accounts: Account[];
};

export default function EditTransactionModal({
  isOpen,
  closeModal,
  transaction,
  accounts,
}: EditTransactionModalProps) {
  const router = useRouter();
  // 2. Creamos un estado para manejar el valor del monto, inicializándolo con el valor actual de la transacción
  const [amount, setAmount] = useState(
    transaction.amount.toLocaleString("es-CO")
  );

  // Este efecto actualiza el monto en el formulario si la transacción seleccionada cambia
  useEffect(() => {
    setAmount(transaction.amount.toLocaleString("es-CO"));
  }, [transaction]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 3. Función para formatear el número con separadores de miles
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
    setAmount(isNaN(numericValue) ? "0" : numericValue.toLocaleString("es-CO"));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    // 4. Limpiamos el valor del monto antes de enviarlo
    const cleanAmount = Number(amount.replace(/[^0-9]/g, ""));

    const rpcParams = {
      transaction_id_val: transaction.id,
      new_amount: cleanAmount,
      new_type: formData.get("type") as string,
      new_account_id: Number(formData.get("account_id")),
      new_description: formData.get("description") as string,
      new_date: formData.get("transaction_date") as string,
    };

    const { error } = await supabase.rpc("edit_transaction", rpcParams);

    if (error) {
      alert("Error al actualizar la transacción: " + error.message);
    } else {
      alert("Transacción actualizada con éxito.");
      router.refresh();
      closeModal();
    }
  };

  // Formateamos la fecha para que el input type="date" la entienda
  const formattedDate = new Date(transaction.transaction_date)
    .toISOString()
    .split("T")[0];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {/* Aplicamos el nuevo diseño oscuro al panel del modal */}
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden p-6 bg-black rounded-lg shadow-xs shadow-white border border-white/20 text-left align-middle transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-xl text-center font-bold mb-6 text-white"
                >
                  Editar Transacción
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Monto */}
                  <div>
                    <label
                      htmlFor="amount"
                      className="block text-sm font-medium text-gray-400 mb-1"
                    >
                      Monto
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="amount"
                      name="amount"
                      value={amount}
                      onChange={handleAmountChange}
                      required
                      className="w-full px-3 py-2 bg-dark-primary text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  {/* Descripción */}
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-400 mb-1"
                    >
                      Descripción
                    </label>
                    <input
                      type="text"
                      name="description"
                      defaultValue={transaction.description ?? ""}
                      required
                      className="w-full px-3 py-2 bg-dark-primary text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  {/* Fecha */}
                  <div>
                    <label
                      htmlFor="transaction_date"
                      className="block text-sm font-medium text-gray-400 mb-1"
                    >
                      Fecha
                    </label>
                    <input
                      type="date"
                      name="transaction_date"
                      defaultValue={formattedDate}
                      required
                      className="w-full px-3 py-2 bg-dark-primary text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  {/* Tipo */}
                  <fieldset>
                    <legend className="text-sm font-medium text-gray-400 mb-2">
                      Tipo
                    </legend>
                    <div className="flex gap-6">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          value="expense"
                          defaultChecked={transaction.type === "expense"}
                          className="h-4 w-4 mr-2 text-orange-500 bg-gray-700 border-gray-600 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-200">Gasto</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          value="income"
                          defaultChecked={transaction.type === "income"}
                          className="h-4 w-4 mr-2 text-orange-500 bg-gray-700 border-gray-600 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-200">Ingreso</span>
                      </label>
                    </div>
                  </fieldset>
                  {/* Cuenta */}
                  <div>
                    <label
                      htmlFor="account_id"
                      className="block text-sm font-medium text-gray-400 mb-1"
                    >
                      Cuenta
                    </label>
                    <select
                      name="account_id"
                      defaultValue={transaction.account_id}
                      required
                      className="w-full px-3 py-2 bg-dark-primary text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Botones */}
                  <div className=" flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
