"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Users, Percent, BadgeDollarSign } from "lucide-react";
import MyChart from "@/components/chart";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import useAuth from "@/hooks/useAuth";
import TableClientes from "@/components/TableClientes";

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth(); // Hook de autenticação
  const [userName, setUserName] = useState("");
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [sales, setSales] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [completedSalesCount, setCompletedSalesCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      // Buscar nome
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Erro ao buscar o nome:", profileError.message);
        setUserName(user.email);
      } else {
        setUserName(profileData?.first_name || user.email);
      }

      const { data: salesData, error: salesError } = await supabase
        .from("sales")
        .select("total_amount")
        .eq("user_id", user.id)
        .eq("status", "completed");

      if (salesError) {
        console.error("Erro ao buscar vendas:", salesError.message);
        setTotalSales(0);
      } else {
        const total = salesData.reduce(
          (acc, sale) => acc + sale.total_amount,
          0
        );
        setTotalSales(total);
        setSales(salesData);
      }

      const { data: completedSales, error } = await supabase
        .from("sales")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "pending");

      if (error) {
        console.error("Erro ao buscar vendas concluídas:", error.message);
        setCompletedSalesCount(0);
      } else {
        setCompletedSalesCount(completedSales.length);
      }

      const { data: stockData, error: stockError } = await supabase
        .from("stock")
        .select("quantity");

      if (stockError) {
        console.error("Erro ao buscar produtos:", stockError.message);
        setTotalProducts(0);
      } else {
        const totalStock = stockData.reduce(
          (acc, stock) => acc + stock.quantity,
          0
        );
        setTotalStock(totalStock);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleCustomersUpdate = useCallback((count) => {
    setTotalCustomers(count);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <p>Verificando autenticação...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <main>
      {userName && (
        <div className="mt-1 mb-2">
          <span className="text-xl italic text-foreground font-bold">
            Olá, {userName}
          </span>
        </div>
      )}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center">
              <CardTitle className="text-lg sm:text-xl text-black dark:text-white select-none">
                Total de Vendas
              </CardTitle>
              <DollarSign className="ml-auto w-4 h-4" />
            </div>
            <CardDescription>Total vendas concluídas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base sm:text-lg font-bold">
              {formatter.format(totalSales)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-center">
              <CardTitle className="text-lg sm:text-xl text-black dark:text-white select-none">
                Novos Clientes
              </CardTitle>
              <Users className="ml-auto w-4 h-4" />
            </div>
            <CardDescription>Novos clientes em 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base sm:text-lg font-bold">{totalCustomers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-center">
              <CardTitle className="text-lg sm:text-xl text-black dark:text-white select-none">
                Vendas Pendentes
              </CardTitle>
              <Percent className="ml-auto w-4 h-4" />
            </div>
            <CardDescription>Total de vendas pendentes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base sm:text-lg font-bold">
              {completedSalesCount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-center">
              <CardTitle className="text-lg sm:text-xl text-black dark:text-white select-none">
                Produtos em Estoque
              </CardTitle>
              <BadgeDollarSign className="ml-auto w-4 h-4" />
            </div>
            <CardDescription>Total de produtos no estoque</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base sm:text-lg font-bold">{totalStock}</p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-4 space-y-4 md:flex gap-4">
        <MyChart />
        <div className="w-full max-w-2xl">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <CardTitle className="text-lg sm:text-xl text-black dark:text-white select-none">
                  Novos Clientes
                </CardTitle>
                <Users className="ml-4 w-4 h-4 md:size-6" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <TableClientes onCustomersUpdate={handleCustomersUpdate} />
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
