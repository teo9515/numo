// En src/components/TransferModal.tsx
"use client";

import { useState, useMemo, FormEvent, ChangeEvent } from "react";
import { Account } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  FiRepeat,
  FiArrowRight,
  FiCreditCard,
  FiArrowDown,
} from "react-icons/fi";
import CustomSelect from "./CustomSelect"; // <--- IMPORTANTE: Usamos nuestro componente personalizado

function formatCurrency(balance: number, currency: string) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(balance);
}

type TransferModalProps = {
  accounts: Account[];
};

export default function TransferModal({ accounts }: TransferModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sourceAccountId, setSourceAccountId] = useState<string>("");
  const [destinationAccountId, setDestinationAccountId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState("Transferencia entre cuentas");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  // Filtrar cuentas destino (excluyendo la seleccionada en origen)
  const destinationAccounts = useMemo(() => {
    return accounts.filter((acc) => String(acc.id) !== sourceAccountId);
  }, [accounts, sourceAccountId]);

  const sourceAccount = useMemo(() => {
    return accounts.find((acc) => String(acc.id) === sourceAccountId);
  }, [accounts, sourceAccountId]);

  // --- PREPARAR OPCIONES PARA CUSTOM SELECT ---

  // Opciones para "Desde" (Todas las cuentas con saldo visible)
  const sourceOptions = accounts.map((acc) => ({
    id: acc.id,
    label: acc.name,
    subLabel: formatCurrency(acc.balance, acc.currency),
  }));

  // Opciones para "Hacia" (Filtradas, mostrando moneda)
  const destinationOptions = destinationAccounts.map((acc) => ({
    id: acc.id,
    label: acc.name,
    subLabel: acc.currency,
  }));

  // ---------------------------------------------

  const getCleanAmount = (value: string): number => {
    return Number(value.replace(/[^0-9]/g, ""));
  };

  const validateForm = () => {
    if (!sourceAccountId || !destinationAccountId) {
      return "Por favor, selecciona las cuentas de origen y destino.";
    }

    const numAmount = getCleanAmount(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return "El monto debe ser un número mayor a cero.";
    }

    if (sourceAccount && numAmount > sourceAccount.balance) {
      return `Saldo insuficiente. Disponible: ${formatCurrency(
        sourceAccount.balance,
        sourceAccount.currency
      )}`;
    }
    if (numAmount > 999999999) {
      return "El monto es demasiado grande.";
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const cleanAmount = getCleanAmount(amount);

      const { data, error: rpcError } = await supabase.rpc("transfer_balance", {
        source_account_id_val: sourceAccountId,
        destination_account_id_val: destinationAccountId,
        amount_val: cleanAmount,
        description_val: description.trim() || "Transferencia entre cuentas",
      });

      if (rpcError || (data && data.startsWith("Error:"))) {
        setError(rpcError?.message || data || "Ocurrió un error desconocido.");
      } else {
        setIsOpen(false);
        resetForm();
        router.refresh();
        setTimeout(() => {
          alert("¡Transferencia exitosa!");
        }, 100);
      }
    } catch (err) {
      console.error("Error en transferencia:", err);
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSourceAccountId("");
    setDestinationAccountId("");
    setAmount("");
    setDescription("Transferencia entre cuentas");
    setError(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
    setAmount(isNaN(numericValue) ? "" : numericValue.toLocaleString("es-CO"));
  };

  if (accounts.length < 2) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary"
        aria-label="Hacer transferencia entre cuentas"
      >
        Entre cuentas
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          {/* Tarjeta estilo Numo */}
          <div className="bg-[var(--color-surface)] border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl relative">
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            {/* Header del Modal */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg text-[var(--color-primary)]">
                  <FiRepeat size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Transferir</h2>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Mueve dinero entre tus bolsillos
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors p-1 hover:cursor-pointer"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* --- AQUI REEMPLAZAMOS LOS SELECTS --- */}
              <div className="space-y-4">
                {/* Selector ORIGEN */}
                <CustomSelect
                  label="Desde"
                  options={sourceOptions}
                  value={Number(sourceAccountId)} // CustomSelect usa number para IDs
                  onChange={(val) => {
                    setSourceAccountId(String(val));
                    setDestinationAccountId(""); // Reset destino al cambiar origen
                  }}
                  placeholder="Selecciona cuenta origen"
                  icon={<FiCreditCard />}
                  disabled={isLoading}
                />

                {/* Icono de flecha hacia abajo decorativo */}
                <div className="flex justify-center -my-3 relative z-10 pointer-events-none">
                  <div className="bg-[var(--color-surface)] border border-white/10 rounded-full p-1 text-gray-400 shadow-lg">
                    <FiArrowDown className="w-3 h-3" />
                  </div>
                </div>

                {/* Selector DESTINO */}
                <CustomSelect
                  label="Hacia"
                  options={destinationOptions}
                  value={Number(destinationAccountId)}
                  onChange={(val) => setDestinationAccountId(String(val))}
                  placeholder="Selecciona cuenta destino"
                  icon={<FiArrowRight />}
                  disabled={!sourceAccountId || isLoading}
                />
              </div>
              {/* -------------------------------------- */}

              {/* Monto y Descripción */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="amount"
                    className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider"
                  >
                    Monto
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    id="amount"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0"
                    className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="description"
                    className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider"
                  >
                    Nota
                  </label>
                  <input
                    type="text"
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all placeholder:text-gray-600"
                    maxLength={20}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center animate-pulse">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 font-medium transition-all hover:cursor-pointer"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Confirmar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
