"use client";

import { useEffect, useState, memo } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const CustomTooltip = memo(({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-800 text-white p-2 rounded-md shadow-lg text-sm pointer-events-none border border-zinc-700">
        <div className="font-semibold mb-1">{label}</div>
        <div>Valor: {currencyFormatter.format(payload[0].value)}</div>
      </div>
    );
  }
  return null;
});

export default function MyChart() {
  const [chartData, setChartData] = useState([]);
  const [growthRate, setGrowthRate] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: salesData, error: fetchError } = await supabase
          .from("sales")
          .select("total_amount, sale_date")
          .eq("status", "completed");

        if (fetchError) {
          console.error("Erro ao buscar vendas:", fetchError.message);
          setError("Não foi possível carregar os dados de vendas.");
          return;
        }

        if (!salesData || salesData.length === 0) {
          setChartData([]);
          setGrowthRate(0);
          return;
        }

        const processedData = groupSalesByMonth(salesData);
        const growth = calculateGrowthRate(processedData);

        setChartData(processedData);
        setGrowthRate(growth);
      } catch (e) {
        console.error("Erro inesperado ao processar dados:", e.message);
        setError("Ocorreu um erro ao carregar os dados do gráfico.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  function groupSalesByMonth(sales) {
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

    sales.forEach((sale) => {
      const date = new Date(sale.sale_date);
      const year = date.getFullYear();
      const monthIndex = date.getMonth();
      const monthYearKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;

      if (!monthlyTotals[monthYearKey]) {
        monthlyTotals[monthYearKey] = {
          month: `${monthNames[monthIndex]}`,
          total: 0,
        };
      }
      monthlyTotals[monthYearKey].total += sale.total_amount;
    });

    return Object.keys(monthlyTotals)
      .sort()
      .map((key) => monthlyTotals[key]);
  }

  function calculateGrowthRate(data) {
    if (data.length < 2) return 0;

    const lastMonth = data[data.length - 1];
    const previousMonth = data[data.length - 2];

    if (previousMonth.total === 0) {
      return lastMonth.total > 0 ? 100 : 0;
    }

    return (
      ((lastMonth.total - previousMonth.total) / previousMonth.total) * 100
    );
  }

  return (
    <Card className="w-full shadow-lg py-4 mt-0 bg-card text-card-foreground">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Vendas por Mês</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Totais mensais de vendas concluídas.
        </CardDescription>
      </CardHeader>

      <CardContent className="h-80 sm:h-96 lg:h-[250px] flex items-center justify-center">
        {isLoading ? (
          <p className="text-muted-foreground">
            Carregando dados do gráfico...
          </p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : chartData.length === 0 ? (
          <p className="text-muted-foreground">
            Nenhum dado de venda disponível para o gráfico.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="#4a4a4a"
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={{ stroke: "#4a4a4a" }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
              />
              <Bar dataKey="total" fill="#2D719F" radius={[4, 4, 0, 0]} />{" "}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>

      <CardFooter className="flex items-center gap-2 text-sm text-muted-foreground pt-4">
        {growthRate >= 0 ? (
          <>
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span>
              Vendas cresceram{" "}
              <span className="font-semibold text-green-400">
                {growthRate.toFixed(2)}%
              </span>
              em relação ao mês anterior.
            </span>
          </>
        ) : (
          <>
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span>
              Vendas caíram
              <span className="font-semibold text-red-400">
                {Math.abs(growthRate).toFixed(2)}%
              </span>
              em relação ao mês anterior.
            </span>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
