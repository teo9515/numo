// En src/components/SummaryDashboard.tsx (versión rediseñada)
"use client";

export type SummaryData = {
  day_income: number;
  day_expense: number;
  month_income: number;
  month_expense: number;
  year_income: number;
  year_expense: number;
};

type SummaryDashboardProps = {
  summary: SummaryData;
};

const SummaryCard = ({
  title,
  value,
  colorClass = "text-[var(--color-text-primary)]", // Color por defecto
}: {
  title: string;
  value: number;
  colorClass?: string;
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    // --- TARJETA REDISEÑADA ---
    <div className="p-4 bg-[var(--color-surface)] rounded-lg shadow-lg border border-white/5">
      <h4 className="text-sm font-medium text-[var(--color-text-secondary)]">
        {title}
      </h4>
      <p className={`text-2xl font-bold mt-1 ${colorClass}`}>
        {formatCurrency(value)}
      </p>
    </div>
  );
};

export default function SummaryDashboard({ summary }: SummaryDashboardProps) {
  if (!summary) return <p>Cargando resumen...</p>;

  const netMonth = summary.month_income - summary.month_expense;
  const netDay = summary.day_income - summary.day_expense;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-3 text-white">Resumen del Día</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <SummaryCard
            title="Ingreso"
            value={summary.day_income}
            colorClass="text-[var(--color-income)]"
          />
          <SummaryCard
            title="Gasto"
            value={summary.day_expense}
            colorClass="text-[var(--color-expense)]"
          />
          <SummaryCard
            title="Balance"
            value={netDay}
            colorClass={netDay >= 0 ? "text-blue-400" : "text-orange-400"}
          />
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-3 text-white">Resumen del Mes</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <SummaryCard
            title="Ingreso"
            value={summary.month_income}
            colorClass="text-[var(--color-income)]"
          />
          <SummaryCard
            title="Gasto"
            value={summary.month_expense}
            colorClass="text-[var(--color-expense)]"
          />
          <SummaryCard
            title="Balance"
            value={netMonth}
            colorClass={netMonth >= 0 ? "text-blue-400" : "text-orange-400"}
          />
        </div>
      </div>
    </div>
  );
}
