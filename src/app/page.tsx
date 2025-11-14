"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Inputs = {
  currentAge: number;
  currentNetWorth: number;
  annualSalary: number;
  savingsRate: number;
  annualReturn: number;
  salaryGrowthFast: number;
  growthTransitionYears: number;
  salaryGrowthStable: number;
  inflationRate: number;
  goalNetWorth: number;
};

type ProjectionRow = {
  year: number;
  age: number;
  salary: number;
  savings: number;
  startingNetWorth: number;
  endingNetWorth: number;
  endingNetWorthReal: number;
};

const currency = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const percent = new Intl.NumberFormat("es-AR", {
  style: "percent",
  maximumFractionDigits: 1,
});

const DEFAULT_INPUTS: Inputs = {
  currentAge: 20,
  currentNetWorth: 0,
  annualSalary: 12_000,
  savingsRate: 0.25,
  annualReturn: 0.08,
  salaryGrowthFast: 0.1,
  growthTransitionYears: 10,
  salaryGrowthStable: 0.03,
  inflationRate: 0.035,
  goalNetWorth: 1_000_000,
};

const MAX_YEARS = 70;

export default function Home() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS);

  const projection = useMemo<ProjectionRow[]>(() => {
    const rows: ProjectionRow[] = [];
    let salary = inputs.annualSalary;
    let startingNetWorth = inputs.currentNetWorth;

    for (let year = 0; year <= MAX_YEARS; year += 1) {
      const age = inputs.currentAge + year;
      const savings = salary * inputs.savingsRate;
      const endingNetWorth = (startingNetWorth + savings) * (1 + inputs.annualReturn);
      const inflationFactor = Math.pow(1 + inputs.inflationRate, year);
      const endingNetWorthReal = endingNetWorth / inflationFactor;

      rows.push({
        year,
        age,
        salary,
        savings,
        startingNetWorth,
        endingNetWorth,
        endingNetWorthReal,
      });

      startingNetWorth = endingNetWorth;
      const nextYear = year + 1;
      const nextGrowthRate =
        nextYear <= inputs.growthTransitionYears ? inputs.salaryGrowthFast : inputs.salaryGrowthStable;
      salary = salary * (1 + nextGrowthRate);
    }

    return rows;
  }, [inputs]);

  const targetIndex = projection.findIndex(
    (row) => row.endingNetWorth >= inputs.goalNetWorth,
  );
  const yearsToGoal = targetIndex >= 0 ? projection[targetIndex].year : null;
  const ageAtGoal = targetIndex >= 0 ? projection[targetIndex].age : null;
  const calendarYear = targetIndex >= 0 ? new Date().getFullYear() + projection[targetIndex].year : null;

  const tableRows = projection.slice(0, 50);

  const handleNumberChange = (field: keyof Inputs, value: string, isPercent = false) => {
    const normalized = value.replace(",", ".");
    const numericValue = Number(normalized);

    if (Number.isNaN(numericValue)) return;

    setInputs((prev) => ({
      ...prev,
      [field]: isPercent ? numericValue / 100 : numericValue,
    }));
  };

  const parameterRows: {
    label: string;
    field: keyof Inputs;
    example: string;
    type?: "currency" | "percent" | "number";
    step?: string;
  }[] = [
    { label: "Edad actual", field: "currentAge", example: "20", step: "1" },
    { label: "Patrimonio actual (USD)", field: "currentNetWorth", example: "0", type: "currency", step: "1000" },
    { label: "Sueldo anual hoy (USD)", field: "annualSalary", example: "12000", type: "currency", step: "1000" },
    { label: "% del sueldo que ahorrás", field: "savingsRate", example: "25", type: "percent", step: "1" },
    { label: "Rendimiento anual de la inversión", field: "annualReturn", example: "8", type: "percent", step: "0.1" },
    {
      label: "% aumento sueldo acelerado",
      field: "salaryGrowthFast",
      example: "10",
      type: "percent",
      step: "0.1",
    },
    {
      label: "Años con crecimiento acelerado",
      field: "growthTransitionYears",
      example: "10",
      type: "number",
      step: "1",
    },
    {
      label: "% aumento sueldo estable",
      field: "salaryGrowthStable",
      example: "3",
      type: "percent",
      step: "0.1",
    },
    {
      label: "Inflación anual estimada",
      field: "inflationRate",
      example: "3.5",
      type: "percent",
      step: "0.1",
    },
    { label: "Objetivo patrimonio (USD)", field: "goalNetWorth", example: "1000000", type: "currency", step: "10000" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-8 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Simulador financiero</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Calculadora de patrimonio objetivo</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Ajustá tus parámetros como si estuvieras en la hoja de cálculo y visualizá cómo evoluciona tu patrimonio con
            aumentos salariales, ahorro e inversión. El sueldo deja de crecer a doble dígito después de los años que definas y se acerca a tu inflación estimada para tener escenarios más realistas.
          </p>
        </header>

        <section className="grid gap-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">1) Bloque de parámetros</h2>
          <div className="overflow-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Celda</th>
                  <th className="px-4 py-3">Texto</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Ejemplo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {parameterRows.map((row, index) => {
                  const isPercent = row.type === "percent";
                  const isCurrency = row.type === "currency";
                  const value = inputs[row.field];
                  const displayValue = isPercent ? (value * 100).toString() : value.toString();

                  return (
                    <tr key={row.field}>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">{`A${index + 2}`}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{row.label}</td>
                      <td className="px-4 py-3">
                        <label className="flex items-center gap-2 text-sm">
                          {isCurrency ? <span className="text-slate-400">$</span> : null}
                          <input
                            type="number"
                            inputMode="decimal"
                            step={row.step}
                            value={displayValue}
                            onChange={(event) => handleNumberChange(row.field, event.target.value, isPercent)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                          />
                          {isPercent ? <span className="text-slate-400">%</span> : null}
                        </label>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{row.example}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">2) Proyección año a año</h2>

          <div className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <div className="flex flex-wrap gap-4">
              <SummaryCard
                label="Años hasta el objetivo"
                value={yearsToGoal !== null ? `${yearsToGoal}` : "No llega al objetivo"}
              />
              <SummaryCard label="Edad cuando llegás" value={ageAtGoal !== null ? `${ageAtGoal}` : "—"} />
              <SummaryCard label="Año calendario" value={calendarYear !== null ? `${calendarYear}` : "—"} />
            </div>
            <p>
              Fórmula equivalente a Sheets:
              <code className="ml-2 rounded bg-white px-2 py-1 text-xs text-slate-700">
                INDEX(A13:A80, MATCH(TRUE, F13:F80 &gt;= objetivo, 0))
              </code>
            </p>
          </div>

          <div className="h-80 w-full rounded-xl border border-slate-200 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projection}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                <XAxis dataKey="age" stroke="#64748b" tickLine={false} />
                <YAxis stroke="#64748b" tickLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, borderColor: "#cbd5f5" }}
                  formatter={(value, name) => {
                    if (name === "savings") {
                      return [currency.format(Number(value)), "Ahorro anual"];
                    }
                    if (name === "endingNetWorthReal") {
                      return [currency.format(Number(value)), "Patrimonio final (real)"];
                    }
                    return [currency.format(Number(value)), "Patrimonio final"];
                  }}
                  labelFormatter={(label) => `Edad ${label}`}
                />
                <Legend />
                <Line type="monotone" dataKey="endingNetWorth" name="Patrimonio final" stroke="#2563eb" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="endingNetWorthReal" name="Patrimonio final (real)" stroke="#94a3b8" strokeDasharray="6 4" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="savings" name="Ahorro anual" stroke="#14b8a6" strokeWidth={2} dot={false} />
                {inputs.goalNetWorth > 0 ? (
                  <ReferenceLine
                    y={inputs.goalNetWorth}
                    stroke="#f97316"
                    strokeDasharray="6 6"
                    label={{
                      value: `Objetivo ${currency.format(inputs.goalNetWorth)}`,
                      fill: "#f97316",
                      fontSize: 12,
                    }}
                  />
                ) : null}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3">Año</th>
                  <th className="px-3 py-3">Edad</th>
                  <th className="px-3 py-3">Sueldo anual</th>
                  <th className="px-3 py-3">% Ahorro</th>
                  <th className="px-3 py-3">Ahorro anual</th>
                  <th className="px-3 py-3">Patrimonio inicial</th>
                  <th className="px-3 py-3">Patrimonio final</th>
                  <th className="px-3 py-3">Patrimonio final (real)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {tableRows.map((row) => (
                  <tr key={row.year} className={row.year === targetIndex ? "bg-orange-50" : undefined}>
                    <td className="px-3 py-2 font-mono text-xs text-slate-500">{row.year}</td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-500">{row.age}</td>
                    <td className="px-3 py-2 font-semibold text-slate-800">{currency.format(row.salary)}</td>
                    <td className="px-3 py-2 text-slate-600">{percent.format(inputs.savingsRate)}</td>
                    <td className="px-3 py-2 text-slate-600">{currency.format(row.savings)}</td>
                    <td className="px-3 py-2 text-slate-600">{currency.format(row.startingNetWorth)}</td>
                    <td className="px-3 py-2 font-semibold text-slate-900">{currency.format(row.endingNetWorth)}</td>
                    <td className="px-3 py-2 font-semibold text-slate-900">{currency.format(row.endingNetWorthReal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">5) ¿Qué podés tocar?</h2>
          <ul className="grid list-disc gap-2 pl-6 text-sm text-slate-600">
            <li>Salario anual actual (`B4`) para correr escenarios de ingresos.</li>
            <li>Porcentaje de ahorro (`B5`), probá 25%, 30% o 40%.</li>
            <li>Rendimiento anual de la inversión (`B6`) para escenarios conservadores o agresivos.</li>
            <li>% de aumento acelerado (`B7`) y cuántos años dura (`B8`).</li>
            <li>% de aumento estable (`B9`) e inflación estimada (`B10`).</li>
            <li>Patrimonio actual (`B3`) y objetivo (`B11`) para ver cuánto tardarías en llegar a 500k, 1M o 2M.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
};

function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <div className="flex flex-1 flex-col rounded-xl bg-white p-4 shadow-sm">
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      <strong className="mt-2 text-2xl text-slate-900">{value}</strong>
    </div>
  );
}
