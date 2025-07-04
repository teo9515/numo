// En src/components/AccountCard.tsx
"use client";

import { useState } from "react";
import EditAccountModal from "./EditAccountModal";
import { Account } from "@/types";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
// 1. Importamos los iconos que usaremos de react-icons
import { FiEdit, FiTrash2 } from "react-icons/fi";

type AccountCardProps = {
  account: Account;
};

export default function AccountCard({ account }: AccountCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const formatCurrency = (balance: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
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
      <div className="w-60 md:w-full flex-shrink-0 p-5 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-surface)] text-[var(--color-text-primary)] flex flex-col justify-between h-36 shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out">
        {/* Header de la tarjeta con nombre y acciones */}
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{account.name}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-1 hover:text-[var(--color-primary)] rounded-full transition-colors"
              aria-label="Editar cuenta"
            >
              <FiEdit className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 hover:text-[var(--color-primary)] rounded-full transition-colors"
              aria-label="Eliminar cuenta"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Balance de la tarjeta */}
        <div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Balance Actual
          </p>
          <p className="text-3xl font-bold tracking-tight">
            {formatCurrency(account.balance)}
          </p>
        </div>
      </div>

      {/* El modal no cambia, sigue funcionando igual por detrás */}
      <EditAccountModal
        isOpen={isEditModalOpen}
        closeModal={() => setIsEditModalOpen(false)}
        account={account}
      />
    </>
  );
}
