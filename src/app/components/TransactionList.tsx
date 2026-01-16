// En src/components/TransactionList.tsx
"use client";

import { useState } from "react";
import { Transaction, Account } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { FiTrash2, FiEdit, FiCreditCard } from "react-icons/fi";
import { toast } from "sonner"; // Notificaciones bonitas
import EditTransactionModal from "./EditTransactionModal";
import ConfirmModal from "./ConfirmModal"; // Tu nuevo modal oscuro

type TransactionListProps = {
  transactions: Transaction[];
  accounts: Account[];
};

export default function TransactionList({
  transactions,
  accounts,
}: TransactionListProps) {
  const router = useRouter();
  const supabase = createClient();

  // Estados para Edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  // Estados para Eliminación (Reemplaza al window.confirm)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Funciones auxiliares ---
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
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

  // --- Lógica de Eliminación ---

  // 1. Abre el modal de confirmación
  const promptDelete = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteModalOpen(true);
  };

  // 2. Ejecuta el borrado real
  const confirmDelete = async () => {
    if (!transactionToDelete) return;

    setIsDeleting(true);

    try {
      const { error } = await supabase.rpc("delete_transaction", {
        transaction_id_val: transactionToDelete.id,
      });

      if (error) throw error;

      // Éxito: Notificación bonita
      toast.success("Transacción eliminada correctamente");

      // Limpieza
      setIsDeleteModalOpen(false);
      setTransactionToDelete(null);
      router.refresh();
    } catch (error: unknown) {
      console.error("Error inesperado:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      toast.error("Error al eliminar: " + errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Lógica de Edición ---
  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleModalSuccess = () => {
    closeEditModal();
    toast.success("Transacción actualizada correctamente");
    router.refresh();
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No hay transacciones registradas.</p>
        <p className="text-sm mt-2">
          Agrega tu primera transacción para comenzar.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {transactions.map((transaction) => {
          // Buscamos la cuenta asociada para mostrar su nombre
          const account = accounts.find(
            (acc) => acc.id === transaction.account_id
          );

          return (
            <div
              key={transaction.id}
              className="flex justify-between items-center pl-4 py-3 pr-2 bg-[var(--color-surface)] rounded-lg shadow-lg border border-white/5 transition-colors hover:bg-white/5 group"
            >
              <div className="flex-grow">
                <p className="font-semibold text-[var(--color-text-primary)] mb-0.5 group-hover:text-white transition-colors">
                  {transaction.description ?? "Sin descripción"}
                </p>

                {/* Info de Fecha y Cuenta */}
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <span>{formatDate(transaction.transaction_date)}</span>

                  {account && (
                    <>
                      <span className="text-white/20">•</span>
                      <span className="flex items-center gap-1 text-orange-400/90 font-medium text-xs bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">
                        <FiCreditCard size={10} />
                        {account.name}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 md:gap-4">
                <p
                  className={`font-bold text-lg whitespace-nowrap ${
                    transaction.type === "income"
                      ? "text-[var(--color-income)]"
                      : "text-[var(--color-expense)]"
                  }`}
                >
                  {transaction.type === "income" ? "+ " : "- "}
                  {formatCurrency(transaction.amount)}
                </p>

                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleEdit(transaction)}
                    className="p-2 text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-full transition-colors"
                    title="Editar"
                  >
                    <FiEdit className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => promptDelete(transaction)} // Abre el modal personalizado
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                    title="Eliminar"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Edición */}
      {selectedTransaction && (
        <EditTransactionModal
          isOpen={isEditModalOpen}
          closeModal={closeEditModal}
          transaction={selectedTransaction}
          accounts={accounts}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Modal de Confirmación (Reemplazo elegante del window.confirm) */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="¿Eliminar transacción?"
        message={`Estás a punto de eliminar "${transactionToDelete?.description}". El dinero volverá al balance original.`}
        isLoading={isDeleting}
      />
    </>
  );
}
