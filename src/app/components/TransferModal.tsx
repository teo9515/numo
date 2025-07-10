// En src/components/TransferModal.tsx (Con formato de miles en el monto)
"use client";

import { useState, useMemo, FormEvent, ChangeEvent } from "react";
import { Account } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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

  const destinationAccounts = useMemo(() => {
    return accounts.filter((acc) => String(acc.id) !== sourceAccountId);
  }, [accounts, sourceAccountId]);

  const sourceAccount = useMemo(() => {
    return accounts.find((acc) => String(acc.id) === sourceAccountId);
  }, [accounts, sourceAccountId]);

  // --- INICIO DE CAMBIOS ---

  // 1. LIMPIAR el string formateado para obtener un número
  const getCleanAmount = (value: string): number => {
    return Number(value.replace(/[^0-9]/g, ""));
  };

  const validateForm = () => {
    if (!sourceAccountId || !destinationAccountId) {
      return "Por favor, selecciona las cuentas de origen y destino.";
    }

    // Usamos la función para obtener el número limpio
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
      // Usamos la función para obtener el número limpio antes de enviarlo
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

  // 2. REEMPLAZAMOS la función para que formatee el número
  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Limpiamos todo lo que no sea un dígito
    const numericValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
    // Formateamos el número con separadores de miles o lo dejamos como string vacío si no es un número
    setAmount(isNaN(numericValue) ? "" : numericValue.toLocaleString("es-CO"));
  };

  // --- FIN DE CAMBIOS ---

  if (accounts.length < 2) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-[180px] h-12 bg-orange-500 text-white text-sm tracking-[2px] rounded-lg font-normal hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
        aria-label="Hacer transferencia entre cuentas"
      >
        Entre Cuentas
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="p-6 bg-black rounded-lg shadow-2xl shadow-white/10 border border-white/20 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white text-center w-full">
                Transferir entre Cuentas
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ... (resto del formulario sin cambios) ... */}
              <div>
                <label
                  htmlFor="source"
                  className="block text-sm font-medium text-gray-400 mb-1"
                >
                  Desde la cuenta:
                </label>
                <select
                  id="source"
                  value={sourceAccountId}
                  onChange={(e) => {
                    setSourceAccountId(e.target.value);
                    setDestinationAccountId("");
                  }}
                  className="w-full px-3 py-2 bg-gray-900 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                  required
                  disabled={isLoading}
                >
                  <option value="">Selecciona una cuenta</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatCurrency(acc.balance, acc.currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="destination"
                  className="block text-sm font-medium text-gray-400 mb-1"
                >
                  Hacia la cuenta:
                </label>
                <select
                  id="destination"
                  value={destinationAccountId}
                  onChange={(e) => setDestinationAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:bg-gray-800 disabled:cursor-not-allowed"
                  required
                  disabled={!sourceAccountId || isLoading}
                >
                  <option value="">Selecciona una cuenta</option>
                  {destinationAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-400 mb-1"
                >
                  Monto:
                  {sourceAccount && (
                    <span className="text-xs text-gray-400 ml-2">
                      Disponible:{" "}
                      {formatCurrency(
                        sourceAccount.balance,
                        sourceAccount.currency
                      )}
                    </span>
                  )}
                </label>
                {/* 3. El input ahora usa la nueva función de manejo */}
                <input
                  type="text"
                  inputMode="numeric"
                  id="amount"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-gray-900 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-400 mb-1"
                >
                  Descripción:
                </label>
                <input
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                  maxLength={100}
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-600 text-white rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? "Transfiriendo..." : "Confirmar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
