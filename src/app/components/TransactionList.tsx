// En src/components/TransactionList.tsx
"use client";

// 1. Importamos el tipo 'Transaction' desde nuestro archivo central de tipos
import { Transaction } from "@/types";

// 2. YA NO NECESITAMOS la definición local de 'Transaction' aquí, así que la eliminamos.

type TransactionListProps = {
  transactions: Transaction[];
};

export default function TransactionList({
  transactions,
}: TransactionListProps) {
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

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm border"
        >
          <div>
            {/* 3. Manejamos el caso en que la descripción sea nula */}
            <p className="font-semibold text-gray-800">
              {transaction.description ?? "Sin descripción"}
            </p>
            <p className="text-sm text-gray-500">
              {formatDate(transaction.transaction_date)}
            </p>
          </div>
          <p
            className={`font-bold text-lg ${
              transaction.type === "income" ? "text-green-600" : "text-red-500"
            }`}
          >
            {transaction.type === "income" ? "+" : "-"}{" "}
            {formatCurrency(transaction.amount)}
          </p>
        </div>
      ))}
    </div>
  );
}
