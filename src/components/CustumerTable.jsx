"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronsDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUp,
  Search as SearchIcon,
} from "lucide-react";
import { debounce } from "lodash";

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

const FilterInput = React.memo(
  ({ icon: Icon, value, onChange, placeholder }) => {
    return (
      <div className="relative w-full max-w-xs sm:max-w-sm">
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="pl-10 w-full"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    );
  }
);

export default function CustomerTable({ onCustomersUpdate }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [editingId, setEditingId] = useState(null);
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
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
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

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

    if (filter) {
      currentItems = currentItems.filter(
        (customer) =>
          customer.name.toLowerCase().includes(filter.toLowerCase()) ||
          customer.email.toLowerCase().includes(filter.toLowerCase()) ||
          (customer.phone && customer.phone.includes(filter))
      );
    }

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
  }, [customers, filter, sortConfig]);

  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedCustomers.slice(startIndex, endIndex);
  }, [currentPage, itemsPerPage, filteredAndSortedCustomers]);

  const totalPages = Math.ceil(
    filteredAndSortedCustomers.length / itemsPerPage
  );

  const openCreateModal = useCallback(() => {
    setEditingId(null);
    setForm({ name: "", email: "", phone: "" });
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((customer) => {
    setEditingId(customer.id);
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
    });
    setIsModalOpen(true);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!user) {
        toast.error("Usuário não autenticado.");
        return;
      }
      if (!form.name || !form.email) {
        toast.error("Nome e E-mail são obrigatórios.");
        return;
      }

      if (editingId) {
        const { error } = await supabase
          .from("customers")
          .update({
            name: form.name,
            email: form.email,
            phone: form.phone,
            created_at: new Date().toISOString(),
          })
          .eq("id", editingId)
          .eq("user_id", user.id);
        if (error) {
          toast.error("Erro ao atualizar cliente: " + error.message);
        } else {
          toast.success("Cliente atualizado com sucesso!");
          setIsModalOpen(false);
          fetchCustomers(); // Rebusca para atualizar a lista e o contador
        }
      } else {
        const { error } = await supabase.from("customers").insert([
          {
            name: form.name,
            email: form.email,
            phone: form.phone,
            user_id: user.id,
          },
        ]);
        if (error) {
          toast.error("Erro ao adicionar cliente: " + error.message);
        } else {
          toast.success("Cliente adicionado com sucesso!");
          setIsModalOpen(false);
          fetchCustomers();
        }
      }
    },
    [form, editingId, user, fetchCustomers]
  );

  const handleDelete = useCallback(
    async (id) => {
      if (!confirm("Tem certeza que quer excluir este cliente?")) return;

      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) {
        toast.error("Erro ao excluir cliente: " + error.message);
      } else {
        toast.success("Cliente excluído com sucesso!");
        if (editingId === id) {
          setEditingId(null);
          setForm({ name: "", email: "", phone: "" });
        }
        fetchCustomers();
      }
    },
    [editingId, user, fetchCustomers]
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

  const debouncedSetFilter = useMemo(
    () =>
      debounce((value) => {
        setFilter(value);
        setCurrentPage(1);
      }, 300),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSetFilter.cancel();
    };
  }, [debouncedSetFilter]);

  return (
    <>
      <div className="flex flex-col sm:flex-row mb-6 gap-4 items-center justify-between">
        <FilterInput
          icon={SearchIcon}
          placeholder="Buscar por nome, e-mail ou telefone..."
          onChange={(e) => debouncedSetFilter(e.target.value)}
        />
        <Button
          onClick={openCreateModal}
          variant="default"
          className="w-full sm:w-auto whitespace-nowrap"
        >
          Adicionar Novo Cliente
        </Button>
      </div>

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
                <th
                  className="border-b border-border p-4 font-medium cursor-pointer select-none whitespace-nowrap"
                  onClick={() => requestSort("created_at")}
                >
                  <div className="inline-flex items-center gap-1">
                    Criado Em
                    <SortIndicator
                      direction={
                        sortConfig.key === "created_at"
                          ? sortConfig.direction
                          : null
                      }
                    />
                  </div>
                </th>
                <th className="border-b border-border p-4 font-medium whitespace-nowrap">
                  Ações
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
                  <td className="p-4 whitespace-nowrap">
                    {new Date(customer.created_at).toLocaleDateString("pt-BR")}{" "}
                    {new Date(customer.created_at).toLocaleTimeString("pt-BR")}
                  </td>
                  <td className="p-4 space-x-2 flex flex-col sm:flex-row gap-2 sm:gap-0">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => openEditModal(customer)}
                      className="w-full sm:w-auto"
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive w-full sm:w-auto"
                      onClick={() => handleDelete(customer.id)}
                    >
                      Excluir
                    </Button>
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md w-[95%] p-4">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                type="text"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-0 mt-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto sm:mr-2"
                >
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" className="w-full sm:w-auto">
                {editingId ? "Salvar Alterações" : "Adicionar Cliente"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
