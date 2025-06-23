"use client";
import React from "react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Archive,
  ChevronsDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUp,
  Search as SearchIcon,
  // PackageOpen, // Importe PackageOpen se for usar
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
        {" "}
        {/* Adicionado max-w-xs para mobile */}
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="pl-10 w-full" // Garante que ocupa a largura total do seu container
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    );
  }
);

export default function Estoque() {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true); // Loader para os itens da tabela de estoque
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({ product_id: "", quantity: "" });
  const [editingId, setEditingId] = useState(null);
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loadingAvailableProducts, setLoadingAvailableProducts] =
    useState(false); // NOVO: Loader para produtos disponíveis

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Ordenação
  const [sortConfig, setSortConfig] = useState({
    key: "updated_at",
    direction: "desc",
  });

  const fetchStockItems = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("stock")
      .select("*, products(name)")
      .order("updated_at", { ascending: false });

    if (error) {
      toast.error("Erro ao buscar itens de estoque: " + error.message);
    } else {
      setStockItems(data);
    }
    setLoading(false);
  }, []);

  const totalQuantityInStock = useMemo(() => {
    return stockItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [stockItems]);

  const fetchAvailableProducts = useCallback(async () => {
    setLoadingAvailableProducts(true); // Inicia o loading
    const { data, error } = await supabase
      .from("products")
      .select("id, name")
      .eq("user_id", user.id); // Certifique-se de que `user` não é nulo aqui
    if (error) {
      toast.error("Erro ao buscar produtos disponíveis: " + error.message);
    } else {
      setAvailableProducts(data);
    }
    setLoadingAvailableProducts(false); // Finaliza o loading
  }, [user]); // Dependência em user para buscar produtos do usuário logado

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
      fetchStockItems();
      fetchAvailableProducts(); // Busca os produtos disponíveis quando o user é carregado
    }
  }, [user, fetchStockItems, fetchAvailableProducts]);

  const filteredAndSortedStockItems = useMemo(() => {
    let currentItems = [...stockItems];

    if (filter) {
      currentItems = currentItems.filter((item) =>
        item.products?.name.toLowerCase().includes(filter.toLowerCase())
      );
    }

    if (sortConfig.key) {
      currentItems.sort((a, b) => {
        let aValue;
        let bValue;

        if (sortConfig.key === "product_name") {
          aValue = a.products?.name || "";
          bValue = b.products?.name || "";
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

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
  }, [stockItems, filter, sortConfig]);

  const paginatedStockItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedStockItems.slice(startIndex, endIndex);
  }, [currentPage, itemsPerPage, filteredAndSortedStockItems]);

  const totalPages = Math.ceil(
    filteredAndSortedStockItems.length / itemsPerPage
  );

  const openCreateModal = useCallback(() => {
    setEditingId(null);
    setForm({ product_id: "", quantity: "" });
    setIsModalOpen(true);
    // Nota: availableProducts já é buscado no useEffect, então não precisa aqui
    // a menos que a lista mude frequentemente e você queira sempre a mais atualizada
  }, []);

  const openEditModal = useCallback((item) => {
    setEditingId(item.id);
    setForm({ product_id: item.product_id, quantity: item.quantity });
    setIsModalOpen(true);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }, []);

  const handleSelectChange = useCallback((value) => {
    setForm((f) => ({ ...f, product_id: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const quantityNumber = parseInt(form.quantity, 10);

      if (!form.product_id && !editingId) {
        toast.error("Produto é obrigatório para um novo item de estoque.");
        return;
      }
      if (isNaN(quantityNumber) || quantityNumber < 0) {
        toast.error("Quantidade inválida.");
        return;
      }
      if (!user) {
        toast.error("Usuário não autenticado.");
        return;
      }

      if (editingId) {
        // Lógica para EDIÇÃO de um item de estoque existente
        const { error } = await supabase
          .from("stock")
          .update({
            quantity: quantityNumber,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId);
        if (error) {
          toast.error("Erro ao atualizar estoque: " + error.message);
        } else {
          toast.success("Estoque atualizado.");
          setIsModalOpen(false);
          fetchStockItems();
        }
      } else {
        // Lógica para CRIAR um novo item OU ATUALIZAR um existente somando a quantidade
        try {
          // 1. Tentar encontrar um item de estoque existente para o product_id selecionado
          const { data: existingStockItem, error: searchError } = await supabase
            .from("stock")
            .select("id, quantity")
            .eq("product_id", form.product_id)
            .eq("user_id", user.id) // Garante que a busca é para o usuário logado
            .single();

          if (searchError && searchError.code !== "PGRST116") {
            // PGRST116 = No rows found (nenhuma linha encontrada)
            throw searchError;
          }

          if (existingStockItem) {
            // 2. Se o item de estoque para este produto já existe, ATUALIZAR a quantidade
            const updatedQuantity = existingStockItem.quantity + quantityNumber;

            const { error: updateError } = await supabase
              .from("stock")
              .update({
                quantity: updatedQuantity,
                updated_at: new Date().toISOString(),
              })
              .eq("id", existingStockItem.id);

            if (updateError) {
              throw updateError;
            }
            toast.success(
              `Quantidade de estoque do produto aumentada para ${updatedQuantity}.`
            );
          } else {
            // 3. Se não existe item de estoque para este produto, INSERIR um novo
            const { error: insertError } = await supabase.from("stock").insert([
              {
                product_id: form.product_id,
                quantity: quantityNumber,
                user_id: user.id,
              },
            ]);

            if (insertError) {
              throw insertError;
            }
            toast.success("Novo item de estoque criado.");
          }

          setIsModalOpen(false);
          fetchStockItems(); // Recarrega a lista de itens de estoque para refletir a mudança
        } catch (error) {
          console.error("Erro ao gerenciar item de estoque:", error.message);
          toast.error("Erro ao gerenciar item de estoque: " + error.message);
        }
      }
    },
    [form, editingId, user, fetchStockItems]
  );

  const handleDelete = useCallback(
    async (id) => {
      if (!confirm("Tem certeza que quer excluir este item de estoque?"))
        return;

      const { error } = await supabase.from("stock").delete().eq("id", id);
      if (error) {
        toast.error("Erro ao excluir: " + error.message);
      } else {
        toast.success("Item de estoque excluído.");
        if (editingId === id) {
          setEditingId(null);
          setForm({ product_id: "", quantity: "" });
        }
        fetchStockItems();
      }
    },
    [editingId, fetchStockItems]
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
    <main>
      <div className="px-4 max-w-7xl mx-auto">
        <Card className="mb-5">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex flex-col text-center sm:text-left">
                <CardTitle className="text-lg sm:text-xl text-black dark:text-white select-none">
                  Total de Itens em Estoque:
                </CardTitle>
                <CardDescription>
                  Capacidade máxima de 2.000 items
                </CardDescription>
              </div>
              <Archive className="w-8 h-8 sm:w-6 sm:h-6 flex-shrink-0 mt-2 sm:mt-0" />{" "}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
              {totalQuantityInStock} / 2.000
            </p>
          </CardContent>
        </Card>
        <div className="flex flex-col sm:flex-row mb-6 gap-4 items-center justify-between">
          <FilterInput
            icon={SearchIcon}
            placeholder="Buscar por nome do produto..."
            onChange={(e) => debouncedSetFilter(e.target.value)}
          />
          <Button
            onClick={openCreateModal}
            variant="default"
            className="w-full sm:w-auto whitespace-nowrap"
          >
            Novo Item de Estoque
          </Button>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : filteredAndSortedStockItems.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum item de estoque encontrado.
          </p>
        ) : (
          <div className="overflow-x-auto border border-border rounded-md dark:bg-zinc-900">
            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr>
                  <th
                    className="border-b border-border p-4 font-medium cursor-pointer select-none whitespace-nowrap"
                    onClick={() => requestSort("product_name")}
                  >
                    <div className="inline-flex items-center gap-1">
                      Produto
                      <SortIndicator
                        direction={
                          sortConfig.key === "product_name"
                            ? sortConfig.direction
                            : null
                        }
                      />
                    </div>
                  </th>
                  <th
                    className="border-b border-border p-4 font-medium cursor-pointer select-none whitespace-nowrap"
                    onClick={() => requestSort("quantity")}
                  >
                    <div className="inline-flex items-center gap-1">
                      Quantidade
                      <SortIndicator
                        direction={
                          sortConfig.key === "quantity"
                            ? sortConfig.direction
                            : null
                        }
                      />
                    </div>
                  </th>
                  <th
                    className="border-b border-border p-4 font-medium cursor-pointer select-none whitespace-nowrap"
                    onClick={() => requestSort("updated_at")}
                  >
                    <div className="inline-flex items-center gap-1">
                      Última Atualização
                      <SortIndicator
                        direction={
                          sortConfig.key === "updated_at"
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
                {paginatedStockItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-0 hover:bg-muted"
                  >
                    <td className="p-4 font-medium whitespace-nowrap">
                      {item.products?.name || "Produto Desconhecido"}
                    </td>
                    <td className="p-4 whitespace-nowrap">{item.quantity}</td>
                    <td className="p-4 whitespace-nowrap">
                      {new Date(item.updated_at).toLocaleDateString("pt-BR")}{" "}
                      {new Date(item.updated_at).toLocaleTimeString("pt-BR")}
                    </td>
                    <td className="p-4 space-x-2 flex flex-col sm:flex-row gap-2 sm:gap-0">
                      {" "}
                      {/* Botões em coluna no mobile */}
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => openEditModal(item)}
                        className="w-full sm:w-auto" // Botão ocupa largura total em mobile
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive w-full sm:w-auto" // Botão ocupa largura total em mobile
                        onClick={() => handleDelete(item.id)}
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
        {/* Paginação */}
        {filteredAndSortedStockItems.length > 0 && totalPages > 1 && (
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
                {editingId ? "Editar Quantidade" : "Novo Item de Estoque"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              {!editingId && (
                <div className="space-y-2">
                  <Label htmlFor="product_id">Produto</Label>
                  <Select
                    value={form.product_id}
                    onValueChange={handleSelectChange}
                    name="product_id"
                    id="product_id"
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingAvailableProducts ? (
                        <SelectItem disabled value="loading">
                          <div className="flex items-center justify-center py-2">
                            <LoadingSpinner />
                            <span className="ml-2">Carregando produtos...</span>
                          </div>
                        </SelectItem>
                      ) : availableProducts.length === 0 ? (
                        <SelectItem disabled>
                          Nenhum produto disponível
                        </SelectItem>
                      ) : (
                        availableProducts.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                  autoFocus
                  min="0"
                />
              </div>
              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-0">
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
                  {editingId ? "Salvar" : "Adicionar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
