"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { User, Loader2 } from "lucide-react";

export default function NewestCustomersCard() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewestCustomers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: supabaseError } = await supabase
          .from("customers")
          .select("id, name, email, created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        if (supabaseError) {
          console.error("Erro ao buscar clientes:", supabaseError.message);
          setError("Erro ao carregar os clientes.");
          setCustomers([]);
          return;
        }

        setCustomers(data || []);
      } catch (err) {
        console.error("Erro inesperado:", err.message);
        setError("Erro inesperado ao carregar os clientes.");
        setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewestCustomers();
  }, []);

  return (
    <Card className="bg-card text-card-foreground flex flex-col shadow-md">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-xl font-semibold">
            Últimos Clientes
          </CardTitle>
          <User className="w-5 h-5 text-muted-foreground" />
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          Os 5 clientes mais recentes cadastrados.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col p-0">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Carregando clientes...</span>
          </div>
        ) : error ? (
          <p className="text-center text-sm text-destructive py-10">{error}</p>
        ) : customers.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">
            Nenhum cliente cadastrado ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    E-mail
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, index) => (
                  <tr
                    key={customer.id || index}
                    className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium truncate max-w-[150px]">
                      {customer.name}
                    </td>
                    <td className="px-4 py-3 truncate max-w-[200px] text-muted-foreground">
                      {customer.email}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
