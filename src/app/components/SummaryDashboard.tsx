// En src/components/SummaryDashboard.tsx
"use client";

// Tipo para los datos que esperamos recibir
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

// Un pequeño componente para cada tarjeta del resumen
const SummaryCard = ({
  title,
  value,
  colorClass = "text-gray-900",
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
    <div className="p-4 bg-white rounded-lg shadow-sm border">
      <h4 className="text-sm font-medium text-gray-500">{title}</h4>
      <p className={`text-xl font-bold ${colorClass}`}>
        {formatCurrency(value)}
      </p>
    </div>
  );
};

// El componente principal que exportamos y usaremos en page.tsx
export default function SummaryDashboard({ summary }: SummaryDashboardProps) {
  if (!summary) return <p>Cargando resumen...</p>;

  const netMonth = summary.month_income - summary.month_expense;
  const netDay = summary.day_income - summary.day_expense;

  return (
    <div>
      <h2 className="text-xl font-bold mb-2 text-gray-700">Resumen del Mes</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          title="Ingreso"
          value={summary.month_income}
          colorClass="text-green-600"
        />
        <SummaryCard
          title="Gasto"
          value={summary.month_expense}
          colorClass="text-red-500"
        />
        <SummaryCard
          title="Balance"
          value={netMonth}
          colorClass={netMonth >= 0 ? "text-blue-600" : "text-orange-500"}
        />
      </div>

      <h2 className="text-xl font-bold mb-2 text-gray-700">Resumen del Día</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Ingreso"
          value={summary.day_income}
          colorClass="text-green-600"
        />
        <SummaryCard
          title="Gasto"
          value={summary.day_expense}
          colorClass="text-red-500"
        />
        <SummaryCard
          title="Balance"
          value={netDay}
          colorClass={netDay >= 0 ? "text-blue-600" : "text-orange-500"}
        />
      </div>
    </div>
  );
}
