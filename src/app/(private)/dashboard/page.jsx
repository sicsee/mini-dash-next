"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Users, Percent, Package } from "lucide-react"; // Renomeei BadgeDollarSign para Package, que é mais comum para estoque
import MyChart from "@/components/chart"; // Certifique-se que MyChart é responsivo
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import useAuth from "@/hooks/useAuth"; // Certifique-se que useAuth está funcionando corretamente

import NewestCustomersCard from "@/components/NewstCustumer";

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth(); // Hook de autenticação
  const [userName, setUserName] = useState("");
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalStock, setTotalStock] = useState(0); // Renomeado de totalProducts para totalStock para clareza
  const [pendingSalesCount, setPendingSalesCount] = useState(0); // Renomeado para clareza

  // Efeito para redirecionar se o usuário não estiver autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Efeito para buscar os dados do dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        const thirtyDaysAgo = new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString();

        const [
          { data: profileData, error: profileError },
          { data: salesData, error: salesError },
          { data: pendingSalesData, error: pendingSalesError },
          { data: stockData, error: stockError },
          { data: customersData, error: customersError },
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("first_name")
            .eq("id", user.id)
            .single(),

          supabase
            .from("sales")
            .select("total_amount")
            .eq("user_id", user.id)
            .eq("status", "completed"),

          supabase
            .from("sales")
            .select("id")
            .eq("user_id", user.id)
            .eq("status", "pending"),

          supabase.from("stock").select("quantity"),

          supabase
            .from("customers")
            .select("id")
            .gte("created_at", thirtyDaysAgo), // Só clientes dos últimos 30 dias
        ]);

        // Nome do usuário
        if (profileError) {
          console.error("Erro ao buscar o nome:", profileError.message);
          setUserName(user.email);
        } else {
          setUserName(profileData?.first_name || user.email);
        }

        // Total de vendas
        if (salesError) {
          console.error("Erro ao buscar vendas:", salesError.message);
          setTotalSales(0);
        } else {
          const total = salesData.reduce(
            (acc, sale) => acc + sale.total_amount,
            0
          );
          setTotalSales(total);
        }

        // Vendas pendentes
        if (pendingSalesError) {
          console.error("Erro ao buscar pendentes:", pendingSalesError.message);
          setPendingSalesCount(0);
        } else {
          setPendingSalesCount(pendingSalesData.length);
        }

        // Estoque
        if (stockError) {
          console.error("Erro ao buscar estoque:", stockError.message);
          setTotalStock(0);
        } else {
          const total = stockData.reduce((acc, item) => acc + item.quantity, 0);
          setTotalStock(total);
        }

        // Total de clientes
        if (customersError) {
          console.error("Erro ao buscar clientes:", customersError.message);
          setTotalCustomers(0);
        } else {
          setTotalCustomers(customersData.length);
        }
      } catch (error) {
        console.error(
          "Erro geral ao buscar dados do dashboard:",
          error.message
        );
      }
    };

    fetchDashboardData();
  }, [user]);

  // Exibição de carregamento
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <p>Verificando autenticação...</p>
      </div>
    );
  }

  // Não renderiza nada se o usuário não estiver autenticado e não estiver carregando
  if (!user) {
    return null;
  }

  // Formatador de moeda
  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <main className="px-4 mt-2">
      {userName && (
        <div className="mt-1 mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Olá, {userName}
          </h1>
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-medium">
                Total de Vendas
              </CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />{" "}
              {/* Ícone com cor mais suave */}
            </div>
            <CardDescription className="text-xs sm:text-sm">
              Total vendas concluídas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold">
              {formatter.format(totalSales)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-medium">
                Novos Clientes
              </CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <CardDescription className="text-xs sm:text-sm">
              Novos clientes em 30 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold">{totalCustomers}</p>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-medium">
                Vendas Pendentes
              </CardTitle>
              <Percent className="w-4 h-4 text-muted-foreground" />
            </div>
            <CardDescription className="text-xs sm:text-sm">
              Total de vendas pendentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold">
              {pendingSalesCount}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-medium">
                Produtos em Estoque
              </CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />{" "}
              {/* Ícone de pacote para estoque */}
            </div>
            <CardDescription className="text-xs sm:text-sm">
              Total de produtos no estoque
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold">{totalStock}</p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-4 flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2">
          <MyChart />
        </div>

        <div className="w-full md:w-1/2">
          <NewestCustomersCard />
        </div>
      </section>
    </main>
  );
}
