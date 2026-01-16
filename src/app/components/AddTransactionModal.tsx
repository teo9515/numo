"use client";

import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import TransactionForm from "./TransactionForm";
import { Account } from "@/types";

type AddTransactionProps = {
  accounts: Account[];
  isDemo?: boolean; // Nueva prop opcional
};

export default function AddTransactionModal({
  accounts,
  isDemo = false,
}: AddTransactionProps) {
  const [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      <button type="button" onClick={openModal} className="btn-primary">
        Nueva transacción
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          {/* Fondo oscuro semitransparente */}
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-transparent text-left align-middle transition-all">
                  {/* Pasamos la prop isDemo al formulario */}
                  <TransactionForm
                    accounts={accounts}
                    closeModal={closeModal}
                    isDemo={isDemo}
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
