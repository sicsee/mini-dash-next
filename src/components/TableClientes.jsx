"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUp,
  ChevronsDown,
} from "lucide-react";

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-6">
      <svg
        className="animate-spin h-8 w-8 text-primary"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label="Carregando"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
    </div>
  );
}

const SortIndicator = React.memo(({ direction }) => {
  if (!direction) return null;
  const Icon = direction === "asc" ? ChevronsUp : ChevronsDown;
  return (
    <span className="inline-flex items-center gap-1">
      <Icon className="w-5 h-5" />
    </span>
  );
});

export default function TableClientes({ onCustomersUpdate }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    if (!user) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      toast.error("Erro ao buscar clientes: " + error.message);
    } else {
      setCustomers(data);
      if (onCustomersUpdate) {
        onCustomersUpdate(data.length);
      }
    }
    setLoading(false);
  }, [user, onCustomersUpdate]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user, fetchCustomers]);

  const filteredAndSortedCustomers = useMemo(() => {
    let currentItems = [...customers];

    if (sortConfig.key) {
      currentItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return currentItems;
  }, [customers, sortConfig]);

  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedCustomers.slice(startIndex, endIndex);
  }, [currentPage, itemsPerPage, filteredAndSortedCustomers]);

  const totalPages = Math.ceil(
    filteredAndSortedCustomers.length / itemsPerPage
  );

  const requestSort = useCallback((key) => {
    setSortConfig((prevSortConfig) => {
      let direction = "asc";
      if (prevSortConfig.key === key && prevSortConfig.direction === "asc") {
        direction = "desc";
      }
      return { key, direction };
    });
  }, []);

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : filteredAndSortedCustomers.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Nenhum cliente encontrado.
        </p>
      ) : (
        <div className="overflow-x-auto border border-border rounded-md dark:bg-zinc-900">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr>
                <th
                  className="border-b border-border p-4 font-medium cursor-pointer select-none whitespace-nowrap"
                  onClick={() => requestSort("name")}
                >
                  <div className="inline-flex items-center gap-1">
                    Nome
                    <SortIndicator
                      direction={
                        sortConfig.key === "name" ? sortConfig.direction : null
                      }
                    />
                  </div>
                </th>
                <th
                  className="border-b border-border p-4 font-medium cursor-pointer select-none whitespace-nowrap"
                  onClick={() => requestSort("email")}
                >
                  <div className="inline-flex items-center gap-1">
                    E-mail
                    <SortIndicator
                      direction={
                        sortConfig.key === "email" ? sortConfig.direction : null
                      }
                    />
                  </div>
                </th>
                <th
                  className="border-b border-border p-4 font-medium cursor-pointer select-none whitespace-nowrap"
                  onClick={() => requestSort("phone")}
                >
                  <div className="inline-flex items-center gap-1">
                    Telefone
                    <SortIndicator
                      direction={
                        sortConfig.key === "phone" ? sortConfig.direction : null
                      }
                    />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-border last:border-0 hover:bg-muted"
                >
                  <td className="p-4 font-medium whitespace-nowrap">
                    {customer.name}
                  </td>
                  <td className="p-4 whitespace-nowrap">{customer.email}</td>
                  <td className="p-4 whitespace-nowrap">
                    {customer.phone || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredAndSortedCustomers.length > 0 && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
          <Button
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          >
            <ChevronLeft />
          </Button>
          <span className="px-4 py-2 select-none text-sm sm:text-base">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          >
            <ChevronRight />
          </Button>
        </div>
      )}
    </>
  );
}
