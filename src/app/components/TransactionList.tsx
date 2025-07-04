// En src/components/TransactionList.tsx (versión final con Editar y Eliminar)
"use client";

import { useState } from "react";
import { Transaction, Account } from "@/types";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { FiTrash2, FiEdit } from "react-icons/fi";
import EditTransactionModal from "./EditTransactionModal";

type TransactionListProps = {
  transactions: Transaction[];
  accounts: Account[];
};

export default function TransactionList({
  transactions,
  accounts,
}: TransactionListProps) {
  const router = useRouter();
  // 1. Creación completa del cliente de Supabase, sin abreviaciones
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 2. Estados necesarios para manejar el modal de edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  // --- Funciones auxiliares ---
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString("es-CO", options);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // --- Lógica para los botones ---
  const handleDelete = async (
    transactionId: number,
    description: string | null
  ) => {
    const isConfirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar la transacción "${
        description ?? "Sin descripción"
      }"?`
    );

    if (isConfirmed) {
      const { error } = await supabase.rpc("delete_transaction", {
        transaction_id_val: transactionId,
      });

      if (error) {
        alert("Hubo un error al eliminar la transacción: " + error.message);
      } else {
        alert("Transacción eliminada con éxito.");
        router.refresh();
      }
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTransaction(null);
  };

  return (
    <>
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex justify-between items-center pl-4 py-2 pr-1 bg-[var(--color-surface)] rounded-xl shadow-lg border border-white/5"
          >
            <div className="flex-grow">
              <p className="font-semibold text-[var(--color-text-primary)]">
                {transaction.description ?? "Sin descripción"}
              </p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {formatDate(transaction.transaction_date)}
              </p>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <p
                className={`font-bold text-lg ${
                  transaction.type === "income"
                    ? "text-[var(--color-income)]"
                    : "text-[var(--color-expense)]"
                }`}
              >
                {transaction.type === "income" ? "+ " : "- "}
                {formatCurrency(transaction.amount)}
              </p>
              <div className="flex flex-col">
                <button
                  onClick={() => handleEdit(transaction)}
                  className="p-2 text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-full transition-colors"
                  aria-label="Editar transacción"
                >
                  <FiEdit className="h-5 w-5" />
                </button>

                <button
                  onClick={() =>
                    handleDelete(transaction.id, transaction.description)
                  }
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                  aria-label="Eliminar transacción"
                >
                  <FiTrash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* El Modal de Edición (solo se renderiza si hay una transacción seleccionada) */}
      {selectedTransaction && (
        <EditTransactionModal
          isOpen={isEditModalOpen}
          closeModal={closeEditModal}
          transaction={selectedTransaction}
          accounts={accounts}
        />
      )}
    </>
  );
}
