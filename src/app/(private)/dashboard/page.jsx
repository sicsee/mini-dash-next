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
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import TableClientes from "@/components/TableClientes";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  const [totalCustomers, setTotalCustomers] = useState(0);

  const handleCustomersUpdate = (count) => {
    setTotalCustomers(count);
  };

  useEffect(() => {
    const fetchUserName = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData?.user?.id) {
        console.error("Erro ao obter o usuário:", userError?.message);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", userData.user.id)
        .single();

      if (profileError) {
        console.error("Erro ao buscar o nome do perfil:", profileError.message);
      }

      if (profileData?.first_name) {
        setUserName(profileData.first_name);
      }
    };

    fetchUserName();
  }, []);

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
            <CardDescription>Total vendas em 90 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base sm:text-lg font-bold">R$ 56.374,82</p>
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
            <p className="text-base sm:text-lg font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-center">
              <CardTitle className="text-lg sm:text-xl text-black dark:text-white select-none">
                Pedidos hoje
              </CardTitle>
              <Percent className="ml-auto w-4 h-4" />
            </div>
            <CardDescription>Total de pedidos hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base sm:text-lg font-bold">29</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-center">
              <CardTitle className="text-lg sm:text-xl text-black dark:text-white select-none">
                Total Pedidos
              </CardTitle>
              <BadgeDollarSign className="ml-auto w-4 h-4" />
            </div>
            <CardDescription>Total de pedidos em 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base sm:text-lg font-bold">1348</p>
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
