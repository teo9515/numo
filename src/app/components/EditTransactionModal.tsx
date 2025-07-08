// En src/components/EditTransactionModal.tsx
"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Account, Transaction } from "@/types";

type EditTransactionModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  transaction: Transaction;
  accounts: Account[];
  onSuccess?: () => void; // Nuevo prop opcional para callback
};

export default function EditTransactionModal({
  isOpen,
  closeModal,
  transaction,
  accounts,
  onSuccess,
}: EditTransactionModalProps) {
  const router = useRouter();

  // Estado para manejar el valor del monto, inicializándolo con el valor actual de la transacción
  const [amount, setAmount] = useState(
    transaction.amount.toLocaleString("es-CO")
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Este efecto actualiza el monto en el formulario si la transacción seleccionada cambia
  useEffect(() => {
    setAmount(transaction.amount.toLocaleString("es-CO"));
  }, [transaction]);

  const supabase = createClient();

  // Función para formatear el número con separadores de miles
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
    setAmount(isNaN(numericValue) ? "0" : numericValue.toLocaleString("es-CO"));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);

      // Limpiamos el valor del monto antes de enviarlo
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
        console.error("Error al actualizar transacción:", error);
        alert("Error al actualizar la transacción: " + error.message);
        return;
      }

      alert("Transacción actualizada con éxito.");

      // Llamar al callback si existe, si no, hacer refresh
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }

      closeModal();
    } catch (error) {
      console.error("Error inesperado:", error);
      alert("Hubo un error inesperado. Por favor, intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para cerrar el modal sin perder el estado
  const handleClose = () => {
    if (!isSubmitting) {
      closeModal();
    }
  };

  // Formateamos la fecha para que el input type="date" la entienda
  const formattedDate = new Date(transaction.transaction_date)
    .toISOString()
    .split("T")[0];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden p-6 bg-black rounded-lg shadow-2xl shadow-white border border-white/20 text-left align-middle transition-all">
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
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 bg-dark-primary text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
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
                      id="description"
                      name="description"
                      defaultValue={transaction.description ?? ""}
                      required
                      maxLength={255}
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 bg-dark-primary text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
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
                      id="transaction_date"
                      name="transaction_date"
                      defaultValue={formattedDate}
                      required
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 bg-dark-primary text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                    />
                  </div>

                  {/* Tipo */}
                  <fieldset disabled={isSubmitting}>
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
                      id="account_id"
                      name="account_id"
                      defaultValue={transaction.account_id}
                      required
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 bg-dark-primary text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                    >
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Botones */}
                  <div className="flex justify-center gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="px-6 py-2 text-sm font-medium text-gray-200 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Guardando...
                        </>
                      ) : (
                        "Guardar Cambios"
                      )}
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
