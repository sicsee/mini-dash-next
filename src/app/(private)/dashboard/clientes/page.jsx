"use client";
import React, { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users } from "lucide-react";

import CustomerTable from "@/components/CustumerTable";

export default function ClientesPage() {
  const [totalCustomers, setTotalCustomers] = useState(0);

  const handleCustomersUpdate = (count) => {
    setTotalCustomers(count);
  };

  return (
    <main>
      <div className="px-4 max-w-7xl mx-auto">
        <Card className="mb-5">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex flex-col text-center sm:text-left">
                <CardTitle className="text-lg sm:text-xl text-black dark:text-white select-none">
                  Total de Clientes Registrados:
                </CardTitle>
                <CardDescription>
                  Gerencie seus contatos comerciais
                </CardDescription>
              </div>
              <Users className="w-8 h-8 sm:w-6 sm:h-6 flex-shrink-0 mt-2 sm:mt-0" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
              {totalCustomers} Clientes
            </p>
          </CardContent>
        </Card>

        <CustomerTable onCustomersUpdate={handleCustomersUpdate} />
      </div>
    </main>
  );
}
