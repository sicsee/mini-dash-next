"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { BarChart, Bar, CartesianGrid, XAxis, Tooltip } from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function MyChart() {
  const [chartData, setChartData] = useState([]);
  const [growthRate, setGrowthRate] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data: salesData, error } = await supabase
        .from("sales")
        .select("total_amount, sale_date")
        .eq("status", "completed");

      if (error) {
        console.error("Erro ao buscar vendas:", error.message);
        return;
      }

      const processedData = groupSalesByMonth(salesData);
      const growth = calculateGrowthRate(processedData);

      setChartData(processedData);
      setGrowthRate(growth);
    };

    fetchData();
  }, []);

  return (
    <Card className="lg:w-1/2 shadow py-4 mt-0">
      <CardHeader>
        <CardTitle>Vendas por Mês</CardTitle>
        <CardDescription>Totais mensais de vendas</CardDescription>
      </CardHeader>

      <CardContent>
        <BarChart width={500} height={350} data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="total" fill="#2D719F" />
        </BarChart>
      </CardContent>

      <CardFooter className="flex gap-2 text-sm">
        {growthRate >= 0 ? (
          <>
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span>
              Vendas cresceram {growthRate.toFixed(2)}% em relação ao mês
              anterior
            </span>
          </>
        ) : (
          <>
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span>
              Vendas caíram {Math.abs(growthRate).toFixed(2)}% em relação ao mês
              anterior
            </span>
          </>
        )}
      </CardFooter>
    </Card>
  );
}

function groupSalesByMonth(salesData) {
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const monthlyTotals = {};

  salesData.forEach((sale) => {
    const date = new Date(sale.sale_date);
    const monthYear = `${monthNames[date.getMonth()]}/${date.getFullYear()}`;

    if (!monthlyTotals[monthYear]) {
      monthlyTotals[monthYear] = 0;
    }

    monthlyTotals[monthYear] += sale.total_amount;
  });

  return Object.entries(monthlyTotals)
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => {
      const [monthA, yearA] = a.month.split("/");
      const [monthB, yearB] = b.month.split("/");

      const dateA = new Date(`${yearA}-${monthNumber(monthA)}-01`);
      const dateB = new Date(`${yearB}-${monthNumber(monthB)}-01`);

      return dateA - dateB;
    });
}

function monthNumber(monthName) {
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  return monthNames.indexOf(monthName) + 1;
}

function calculateGrowthRate(data) {
  if (data.length < 2) return 0;

  const last = data[data.length - 1];
  const prev = data[data.length - 2];

  if (prev.total === 0) return 0;

  return ((last.total - prev.total) / prev.total) * 100;
}

const formatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "#1f2937",
          color: "white",
          padding: "8px",
          borderRadius: "6px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
          fontSize: "14px",
          pointerEvents: "none",
        }}
      >
        <div style={{ marginBottom: "4px", fontWeight: "600" }}>{label}</div>
        <div>Valor: {formatter.format(payload[0].value.toFixed(2))}</div>
      </div>
    );
  }

  return null;
}
