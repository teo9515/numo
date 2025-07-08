// En src/components/EditAccountModal.tsx
"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { createClient } from "@/lib/supabase/client"; // Cambio aquí
import { useRouter } from "next/navigation";
import type { Account } from "@/types";

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
  const supabase = createClient(); // Cambio aquí - ya no necesitas las variables de entorno

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const newName = formData.get("accountName") as string;

    // Si el nombre no ha cambiado, simplemente cerramos el modal
    if (!newName || newName.trim() === account.name) {
      closeModal();
      return;
    }

    const { error } = await supabase.rpc("update_account_name", {
      account_id_val: account.id,
      new_name_val: newName.trim(),
    });

    if (error) {
      alert("Error al actualizar la cuenta: " + error.message);
    } else {
      alert("Cuenta actualizada con éxito.");
      router.refresh();
      closeModal();
    }
  };

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
          <div className="fixed inset-0 bg-black bg-opacity-40" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Editar Nombre de la Cuenta
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="accountName" className="sr-only">
                      Nombre de la cuenta
                    </label>
                    <input
                      id="accountName"
                      name="accountName"
                      type="text"
                      required
                      defaultValue={account.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
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
