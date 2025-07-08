"use client";

import { useState } from "react";
import EditAccountModal from "./EditAccountModal";
import { Account } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { FiEdit, FiTrash2 } from "react-icons/fi";

type AccountCardProps = {
  account: Account;
  exchangeRate: number | null;
};

export default function AccountCard({
  account,
  exchangeRate,
}: AccountCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const formatCurrency = (balance: number, currency: string) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(balance);
  };

  const handleDelete = async () => {
    if (account.balance !== 0) {
      alert(
        "No se puede eliminar una cuenta con saldo. El balance debe ser exactamente cero."
      );
      return;
    }
    const isConfirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar la cuenta "${account.name}"? Esta acción es permanente y borrará todas sus transacciones.`
    );
    if (isConfirmed) {
      const { data, error } = await supabase.rpc("delete_account", {
        account_id_val: account.id,
      });
      if (error) {
        alert("Hubo un error al eliminar la cuenta: " + error.message);
      } else if (data && data.startsWith("Error:")) {
        alert(data);
      } else {
        alert("¡Cuenta eliminada con éxito!");
        router.refresh();
      }
    }
  };

  return (
    <>
      <div
        className="
          w-[250px] h-44 p-5 rounded-2xl shadow-lg
          flex flex-col justify-between
          bg-gradient-to-br from-[var(--color-primary)] via-[#A04210] to-[var(--color-surface)]

 text-[var(--color-text-primary)]
          transition-transform duration-300 hover:scale-105
        "
      >
        {/* Encabezado: Nombre y acciones */}
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{account.name}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Editar cuenta"
            >
              <FiEdit className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Eliminar cuenta"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Balance */}
        <div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Balance Actual
          </p>
          <p className="text-3xl font-bold tracking-tight">
            {formatCurrency(account.balance, account.currency)}
          </p>
          {account.currency === "USD" && exchangeRate && (
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              (aprox. {formatCurrency(account.balance * exchangeRate, "COP")})
            </p>
          )}
        </div>
      </div>

      <EditAccountModal
        isOpen={isEditModalOpen}
        closeModal={() => setIsEditModalOpen(false)}
        account={account}
      />
    </>
  );
}
