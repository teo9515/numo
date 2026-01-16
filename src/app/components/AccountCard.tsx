"use client";

import { Account } from "@/types";
import { FiEdit2, FiTrash2, FiCreditCard, FiDollarSign } from "react-icons/fi";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Notificaciones bonitas
import EditAccountModal from "./EditAccountModal";
import ConfirmModal from "./ConfirmModal";

interface AccountCardProps {
  account: Account;
  exchangeRate: number;
}

export default function AccountCard({
  account,
  exchangeRate,
}: AccountCardProps) {
  const router = useRouter();
  const supabase = createClient();

  // Estados para los modales
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Calcular balance aproximado si es USD
  const approxBalance =
    account.currency === "USD" ? account.balance * exchangeRate : null;

  // Lógica de Eliminación
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // 1. Eliminamos la cuenta (Supabase se encarga de las transacciones en cascada si está configurado,
      // o el RPC lo maneja). Usaremos delete directo por simplicidad.
      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", account.id);

      if (error) throw error;

      toast.success("Cuenta eliminada correctamente");
      setIsDeleteOpen(false);
      router.refresh();
    } catch (error: unknown) {
      console.error("Error al eliminar:", error);
      const msg = error instanceof Error ? error.message : "Error desconocido";
      toast.error("No se pudo eliminar: " + msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="group relative w-full h-full min-h-[140px] p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-[var(--color-surface)] to-black overflow-hidden hover:border-[var(--color-primary)]/30 transition-all duration-300 shadow-lg hover:shadow-orange-900/10 flex flex-col justify-between">
        {/* Glow decorativo en hover */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-primary)]/10 rounded-full blur-2xl -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

        {/* Header de la Tarjeta */}
        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`p-1.5 rounded-lg ${
                account.currency === "USD"
                  ? "bg-green-500/10 text-green-500"
                  : "bg-orange-500/10 text-orange-500"
              }`}
            >
              {account.currency === "USD" ? (
                <FiDollarSign size={14} />
              ) : (
                <FiCreditCard size={14} />
              )}
            </div>
            <h3
              className="font-bold text-lg text-white truncate max-w-[120px] sm:max-w-[150px]"
              title={account.name}
            >
              {account.name}
            </h3>
          </div>

          {/* Botones de Acción (Visibles solo en hover en desktop, siempre en móvil si prefieres) */}
          <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => setIsEditOpen(true)}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Editar cuenta"
            >
              <FiEdit2 size={16} />
            </button>
            <button
              onClick={() => setIsDeleteOpen(true)}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
              title="Eliminar cuenta"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>

        {/* Balance */}
        <div className="relative z-10 mt-2">
          <p className="text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wider font-medium mb-1">
            Balance Actual
          </p>
          <p className="text-2xl font-bold text-white tracking-tight">
            {account.currency === "USD" ? "US$ " : "$ "}
            {account.balance.toLocaleString("es-CO")}
          </p>

          {/* Subtítulo para USD */}
          {approxBalance !== null && (
            <p className="text-xs text-gray-500 mt-1 font-medium">
              (aprox. $ {approxBalance.toLocaleString("es-CO")})
            </p>
          )}
        </div>
      </div>

      {/* MODALES */}

      {/* 1. Modal de Edición (El que ya tienes) */}
      <EditAccountModal
        isOpen={isEditOpen}
        closeModal={() => setIsEditOpen(false)}
        account={account}
      />

      {/* 2. Modal de Confirmación de Borrado (El nuevo oscuro) */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar cuenta?"
        message={`Estás a punto de eliminar la cuenta "${account.name}" y TODAS sus transacciones asociadas. Esta acción no se puede deshacer.`}
        isLoading={isDeleting}
      />
    </>
  );
}
