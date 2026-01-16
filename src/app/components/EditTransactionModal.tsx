"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Account, Transaction } from "@/types";
import { toast } from "sonner"; // <--- IMPORTAR SONNER
import {
  FiEdit2,
  FiX,
  FiDollarSign,
  FiAlignLeft,
  FiCalendar,
  FiCreditCard,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiSave,
} from "react-icons/fi";

type EditTransactionModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  transaction: Transaction;
  accounts: Account[];
  onSuccess?: () => void;
};

export default function EditTransactionModal({
  isOpen,
  closeModal,
  transaction,
  accounts,
  onSuccess,
}: EditTransactionModalProps) {
  const router = useRouter();
  const supabase = createClient();

  // Estado para el monto formateado
  const [amount, setAmount] = useState(
    transaction.amount.toLocaleString("es-CO")
  );

  // Estado para el tipo de transacción
  const [type, setType] = useState<"income" | "expense">(transaction.type);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setAmount(transaction.amount.toLocaleString("es-CO"));
    setType(transaction.type);
  }, [transaction]);

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

      if (error) throw error;

      // ÉXITO: Notificación bonita
      toast.success("Transacción actualizada correctamente");

      // Llamar al callback o refrescar
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
      closeModal();
    } catch (error: unknown) {
      // ERROR: Notificación bonita y Type Safe
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error desconocido al actualizar";
      console.error("Error:", error);

      toast.error("Error al actualizar: " + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) closeModal();
  };

  // Formatear fecha YYYY-MM-DD
  const formattedDate = new Date(transaction.transaction_date)
    .toISOString()
    .split("T")[0];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[var(--color-surface)] border border-white/10 p-6 text-left align-middle shadow-2xl transition-all relative">
                {/* Glow decorativo */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                {/* Header */}
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg text-[var(--color-primary)]">
                      <FiEdit2 size={20} />
                    </div>
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-xl font-bold text-white"
                      >
                        Editar Transacción
                      </Dialog.Title>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        Modifica los detalles del movimiento
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-white transition-colors p-1 cursor-pointer"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5 relative z-10"
                >
                  {/* Selector de TIPO */}
                  <div className="grid grid-cols-2 gap-3 p-1 bg-black/40 rounded-xl border border-white/5">
                    <label
                      className={`cursor-pointer flex items-center justify-center gap-2 py-2 rounded-lg transition-all border ${
                        type === "expense"
                          ? "bg-red-500/10 border-red-500/50 text-red-400"
                          : "border-transparent text-gray-400 hover:text-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value="expense"
                        className="hidden"
                        checked={type === "expense"}
                        onChange={() => setType("expense")}
                      />
                      <FiArrowUpRight /> Gasto
                    </label>
                    <label
                      className={`cursor-pointer flex items-center justify-center gap-2 py-2 rounded-lg transition-all border ${
                        type === "income"
                          ? "bg-green-500/10 border-green-500/50 text-green-400"
                          : "border-transparent text-gray-400 hover:text-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value="income"
                        className="hidden"
                        checked={type === "income"}
                        onChange={() => setType("income")}
                      />
                      <FiArrowDownLeft /> Ingreso
                    </label>
                  </div>

                  {/* Monto */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="amount"
                      className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1"
                    >
                      <FiDollarSign /> Monto
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
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all font-mono"
                    />
                  </div>

                  {/* Descripción */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="description"
                      className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1"
                    >
                      <FiAlignLeft /> Descripción
                    </label>
                    <input
                      type="text"
                      id="description"
                      name="description"
                      defaultValue={transaction.description ?? ""}
                      required
                      maxLength={255}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                    />
                  </div>

                  {/* Fecha y Cuenta (Grid de 2) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="transaction_date"
                        className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1"
                      >
                        <FiCalendar /> Fecha
                      </label>
                      <input
                        type="date"
                        id="transaction_date"
                        name="transaction_date"
                        defaultValue={formattedDate}
                        required
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all text-sm [color-scheme:dark]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="account_id"
                        className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1"
                      >
                        <FiCreditCard /> Cuenta
                      </label>
                      <div className="relative">
                        <select
                          id="account_id"
                          name="account_id"
                          defaultValue={transaction.account_id}
                          required
                          disabled={isSubmitting}
                          className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all appearance-none cursor-pointer text-sm"
                        >
                          {accounts.map((acc) => (
                            <option
                              key={acc.id}
                              value={acc.id}
                              className="bg-[#1A1A1A] text-white"
                            >
                              {acc.name}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                          <svg
                            className="h-4 w-4 fill-current"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="px-4 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 font-medium transition-all text-sm cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-orange-600 transition-all shadow-lg shadow-orange-900/20 text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        "Guardando..."
                      ) : (
                        <>
                          <FiSave className="w-4 h-4" /> Guardar Cambios
                        </>
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
