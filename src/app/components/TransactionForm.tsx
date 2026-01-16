"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Account } from "@/types";
import {
  FiDollarSign,
  FiAlignLeft,
  FiCreditCard,
  FiArrowDownCircle,
  FiArrowUpCircle,
  FiPlusCircle,
} from "react-icons/fi";
import CustomSelect from "./CustomSelect";

interface TransactionFormProps {
  accounts: Account[];
  closeModal?: () => void;
  isDemo?: boolean;
}

export default function TransactionForm({
  accounts,
  closeModal,
  isDemo = false,
}: TransactionFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<"expense" | "income">(
    "expense"
  );
  const [selectedCurrency, setSelectedCurrency] = useState<string>(
    accounts[0]?.currency || "COP"
  );

  const [selectedAccountId, setSelectedAccountId] = useState<number | string>(
    ""
  );
  const [description, setDescription] = useState("");

  const supabase = createClient();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setAmount("");
      return;
    }
    const numericValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
    setAmount(isNaN(numericValue) ? "0" : numericValue.toLocaleString("es-CO"));
  };

  const handleAccountSelect = (id: string | number) => {
    const accountId = Number(id);
    setSelectedAccountId(accountId);
    const selectedAccount = accounts.find((acc) => acc.id === accountId);
    if (selectedAccount) {
      setSelectedCurrency(selectedAccount.currency);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const cleanAmount = Number(amount.replace(/[^0-9]/g, ""));

      if (cleanAmount <= 0) throw new Error("El monto debe ser mayor a 0");
      if (!selectedAccountId) throw new Error("Debes seleccionar una cuenta");
      if (!description.trim()) throw new Error("La descripción es requerida");

      if (isDemo) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        alert(
          `🎉 Simulación: ${
            transactionType === "expense" ? "Gasto" : "Ingreso"
          } de ${amount} ${selectedCurrency}`
        );
        if (closeModal) closeModal();
        return;
      }

      const rpcParams = {
        amount_val: cleanAmount,
        type_val: transactionType,
        account_id_val: Number(selectedAccountId),
        description_val: description.trim(),
        currency_val: selectedCurrency,
      };

      const { error } = await supabase.rpc("add_transaction", rpcParams);

      if (error) throw new Error(`Error: ${error.message}`);

      setAmount("0");
      setDescription("");
      router.refresh();

      if (closeModal) closeModal();
      else alert("¡Transacción agregada!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error inesperado";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const accountOptions = accounts.map((acc) => ({
    id: acc.id,
    label: acc.name,
    subLabel: acc.currency,
  }));

  return (
    // CAMBIO 1: El contenedor principal es 'relative' pero NO tiene 'overflow-hidden' ni estilos de borde/fondo.
    // Esto permite que los hijos (el menú) se salgan de la caja.
    <div className="relative w-full max-w-sm mx-auto z-10">
      {/* CAMBIO 2: CAPA DE FONDO (Aquí sí va el overflow-hidden para cortar el blur y los bordes redondeados) */}
      <div className="absolute inset-0 bg-[var(--color-surface)] border border-white/10 rounded-2xl shadow-2xl overflow-hidden -z-10">
        {/* Decoración de luz naranja */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
      </div>

      {/* CAMBIO 3: CAPA DE CONTENIDO (Tiene el padding, pero es visible) */}
      <div className="p-5">
        {/* Header Compacto */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-1.5 bg-[var(--color-primary)]/10 rounded-lg text-[var(--color-primary)]">
            <FiPlusCircle size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {isDemo ? "Simular Transacción" : "Nueva Transacción"}
            </h3>
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              Registra un ingreso o gasto
            </p>
          </div>
        </div>

        {/* Tabs Tipo */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-black/40 rounded-lg border border-white/5">
          <button
            type="button"
            onClick={() => setTransactionType("expense")}
            className={`flex items-center hover:cursor-pointer justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              transactionType === "expense"
                ? "bg-[var(--color-expense)] text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FiArrowDownCircle
              className={
                transactionType === "expense" ? "animate-bounce-slow" : ""
              }
            />
            Gasto
          </button>
          <button
            type="button"
            onClick={() => setTransactionType("income")}
            className={`flex items-center hover:cursor-pointer  justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              transactionType === "income"
                ? "bg-[var(--color-income)] text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FiArrowUpCircle
              className={
                transactionType === "income" ? "animate-bounce-slow" : ""
              }
            />
            Ingreso
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Monto */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1">
              <FiDollarSign /> Monto ({selectedCurrency})
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={handleAmountChange}
              required
              disabled={isSubmitting}
              placeholder="0"
              className="w-full px-4 py-2 text-xl font-bold bg-black/40 border border-white/10 rounded-lg text-white text-center focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1">
              <FiAlignLeft /> Descripción
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all placeholder:text-gray-600"
              placeholder="Ej: Netflix, Cena..."
            />
          </div>

          {/* CUENTA: Aquí está el Select que ahora flotará libremente */}
          <CustomSelect
            label="Cuenta"
            options={accountOptions}
            value={selectedAccountId}
            onChange={handleAccountSelect}
            disabled={accounts.length === 0 || isSubmitting}
            placeholder={
              accounts.length === 0
                ? "Crea una cuenta primero"
                : "Selecciona una cuenta"
            }
            icon={<FiCreditCard />}
          />

          {error && (
            <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs text-center animate-pulse">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            {closeModal && (
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2.5  hover:cursor-pointer rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 font-medium text-sm transition-all"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={accounts.length === 0 || isSubmitting}
              className={`btn-primary w-full text-sm !py-2.5 ${
                !closeModal ? "col-span-2" : ""
              }`}
            >
              {isSubmitting ? "Guardando..." : isDemo ? "Simular" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
