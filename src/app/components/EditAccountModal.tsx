"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Account } from "@/types";
import { FiEdit2, FiSave, FiX, FiCreditCard } from "react-icons/fi";
import { toast } from "sonner"; // <--- IMPORTAR SONNER

type EditAccountModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  account: Account;
};

export default function EditAccountModal({
  isOpen,
  closeModal,
  account,
}: EditAccountModalProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const newName = formData.get("accountName") as string;

    // Validación simple: si no hay cambios, cerramos
    if (!newName || newName.trim() === account.name) {
      setIsLoading(false);
      closeModal();
      return;
    }

    try {
      const { error } = await supabase.rpc("update_account_name", {
        account_id_val: account.id,
        new_name_val: newName.trim(),
      });

      if (error) throw error;

      // ÉXITO: Usamos toast
      toast.success("Cuenta actualizada correctamente");

      router.refresh();
      closeModal();
    } catch (error) {
      // ERROR: Usamos toast
      const errorMessage =
        error instanceof Error ? error.message : "Ocurrió un error desconocido";

      toast.error("Error al actualizar: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
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
                        Editar Cuenta
                      </Dialog.Title>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        Modifica el nombre de tu bolsillo
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-white transition-colors p-1 cursor-pointer"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                {/* Formulario */}
                <form
                  onSubmit={handleSubmit}
                  className="mt-4 space-y-5 relative z-10"
                >
                  <div className="space-y-1.5">
                    <label
                      htmlFor="accountName"
                      className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1"
                    >
                      <FiCreditCard /> Nombre de la cuenta
                    </label>
                    <input
                      id="accountName"
                      name="accountName"
                      type="text"
                      required
                      defaultValue={account.name}
                      placeholder="Ej: Ahorros, Nequi..."
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all placeholder:text-gray-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 font-medium transition-all text-sm cursor-pointer"
                      disabled={isLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-orange-600 transition-all shadow-lg shadow-orange-900/20 text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isLoading ? (
                        "Guardando..."
                      ) : (
                        <>
                          <FiSave className="w-4 h-4" /> Guardar
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
