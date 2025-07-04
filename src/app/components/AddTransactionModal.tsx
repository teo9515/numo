// En src/components/AddTransactionModal.tsx
"use client";

import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import TransactionForm from "./TransactionForm";
import { Account } from "@/types";

type AddTransactionProps = {
  accounts: Account[];
};

export default function AddTransactionModal({ accounts }: AddTransactionProps) {
  const [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="bg-orange-500 text-white h-10 w-[190px] rounded-lg font-normal hover:bg-orange-600 transition-colors text-sm tracking-[2px]"
      >
        Nueva transacción
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          {/* Fondo oscuro semitransparente */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-10"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-100"
          >
            <div className="fixed inset-0 bg-black/90" />
            {/* Aumentamos la opacidad del fondo para mayor contraste */}
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
                leaveTo="opacity-100 scale-95"
              >
                {/* --- CAMBIO CLAVE AQUÍ --- */}
                {/* Hacemos el panel del modal transparente, ya que el formulario tiene su propio fondo */}
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-transparent text-left align-middle shadow-xl transition-all">
                  {/* Ahora el TransactionForm se mostrará con su propio diseño oscuro sin conflictos */}
                  <TransactionForm accounts={accounts} />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
