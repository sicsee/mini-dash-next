"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient"; // Ajuste o caminho para o seu cliente Supabase
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
  ShoppingCart,
  ChevronsDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUp,
  Search as SearchIcon,
  PlusCircle,
  Trash2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { debounce } from "lodash";
import { cn } from "@/lib/utils";

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
          d="M4 12a8 8 0 018-8v4a4 40 00-4 4H4z"
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

export default function Vendas() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSaleId, setEditingSaleId] = useState(null);

  // Estados para o formulário de venda
  const [saleForm, setSaleForm] = useState({
    customer_id: "",
    sale_date: new Date().toISOString().split("T")[0], // Formato YYYY-MM-DD
    status: "completed",
    notes: "",
  });
  const [saleItems, setSaleItems] = useState([]); // Itens da venda sendo criada/editada
  const [availableProducts, setAvailableProducts] = useState([]); // Produtos para adicionar
  const [availableCustomers, setAvailableCustomers] = useState([]); // Clientes para selecionar

  // Loading específico para dados do modal
  const [loadingModalData, setLoadingModalData] = useState(false);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Ordenação
  const [sortConfig, setSortConfig] = useState({
    key: "sale_date",
    direction: "desc",
  });

  // Mapa de cores para o status da venda
  const statusColorMap = {
    completed:
      "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300",
    pending:
      "bg-orange-100 text-orange-800 dark:bg-orange-800/20 dark:text-orange-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300",
  };

  // --- Funções de Busca de Dados ---
  const fetchSales = useCallback(async () => {
    setLoading(true);
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("sales")
      .select(
        "*, customers(name), sale_items(id, product_id, quantity, price_at_sale, products(name))"
      ) // Busca itens e nomes de produto/cliente
      .eq("user_id", user.id)
      .order("sale_date", { ascending: false });

    if (error) {
      toast.error("Erro ao buscar vendas: " + error.message);
      console.error("Erro ao buscar vendas:", error);
    } else {
      setSales(data);
    }
    setLoading(false);
  }, [user]);

  // Esta função agora será chamada APENAS quando o modal é aberto
  const fetchModalDropdownData = useCallback(async () => {
    setLoadingModalData(true);
    if (!user) {
      setLoadingModalData(false);
      return;
    }

    // Buscar produtos
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("id, name, price")
      .eq("user_id", user.id);

    if (productsError) {
      toast.error("Erro ao buscar produtos: " + productsError.message);
      console.error("Erro ao buscar produtos:", productsError);
    } else {
      setAvailableProducts(productsData || []);
    }

    // Buscar clientes
    const { data: customersData, error: customersError } = await supabase
      .from("customers")
      .select("id, name")
      .eq("user_id", user.id);

    if (customersError) {
      toast.error("Erro ao buscar clientes: " + customersError.message);
      console.error("Erro ao buscar clientes:", customersError);
    } else {
      setAvailableCustomers(customersData || []);
    }
    setLoadingModalData(false);
  }, [user]);

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
      fetchSales();
    }
  }, [user, fetchSales]);

  const filteredAndSortedSales = useMemo(() => {
    let currentSales = [...sales];

    if (filter) {
      currentSales = currentSales.filter(
        (sale) =>
          sale.customers?.name.toLowerCase().includes(filter.toLowerCase()) ||
          sale.status.toLowerCase().includes(filter.toLowerCase()) ||
          sale.notes?.toLowerCase().includes(filter.toLowerCase()) ||
          (sale.sale_items &&
            sale.sale_items.some((item) =>
              item.products?.name.toLowerCase().includes(filter.toLowerCase())
            ))
      );
    }

    if (sortConfig.key) {
      currentSales.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "customer_name") {
          aValue = a.customers?.name || "";
          bValue = b.customers?.name || "";
        }

        // Para strings, use localeCompare para ordenação correta
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        // Para números ou datas, faça a comparação direta
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return currentSales;
  }, [sales, filter, sortConfig]);

  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedSales.slice(startIndex, endIndex);
  }, [currentPage, itemsPerPage, filteredAndSortedSales]);

  const totalPages = Math.ceil(filteredAndSortedSales.length / itemsPerPage);

  const openCreateModal = useCallback(async () => {
    setEditingSaleId(null);
    setSaleForm({
      customer_id: "",
      sale_date: new Date().toISOString().split("T")[0],
      status: "completed",
      notes: "",
    });
    setSaleItems([]);
    await fetchModalDropdownData(); // Carrega os dados APENAS ao abrir o modal
    setIsModalOpen(true);
  }, [fetchModalDropdownData]);

  const openEditModal = useCallback(
    async (sale) => {
      setLoadingModalData(true);
      setEditingSaleId(sale.id);
      setSaleForm({
        customer_id: sale.customer_id,
        sale_date: sale.sale_date.split("T")[0],
        status: sale.status,
        notes: sale.notes || "",
      });

      const { data: itemsData, error: itemsError } = await supabase
        .from("sale_items")
        .select("*, products(name, price)")
        .eq("sale_id", sale.id);

      if (itemsError) {
        toast.error("Erro ao carregar itens da venda: " + itemsError.message);
        console.error("Erro ao carregar itens da venda:", itemsError);
        setSaleItems([]);
      } else {
        setSaleItems(
          itemsData.map((item) => ({
            ...item,
            product_name: item.products.name,
            current_product_price: item.products.price,
            id: item.id,
          }))
        );
      }
      await fetchModalDropdownData(); // Carrega os dados APENAS ao abrir o modal
      setLoadingModalData(false);
      setIsModalOpen(true);
    },
    [fetchModalDropdownData]
  );

  const handleSaleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setSaleForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSaleItemChange = useCallback(
    (index, field, value) => {
      const updatedItems = [...saleItems];
      updatedItems[index][field] = value;

      if (field === "quantity" || field === "price_at_sale") {
        const quantity = parseFloat(updatedItems[index].quantity || 0);
        const priceAtSale = parseFloat(updatedItems[index].price_at_sale || 0);
        updatedItems[index].total_item_amount = (
          quantity * priceAtSale
        ).toFixed(2);
      }
      setSaleItems(updatedItems);
    },
    [saleItems]
  );

  const addSaleItem = useCallback(() => {
    setSaleItems((prev) => [
      ...prev,
      {
        product_id: "",
        quantity: 1,
        price_at_sale: 0,
        total_item_amount: 0,
        isNew: true,
      },
    ]);
  }, []);

  const removeSaleItem = useCallback((index) => {
    setSaleItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const calculateTotalSaleAmount = useMemo(() => {
    return saleItems
      .reduce((sum, item) => sum + parseFloat(item.total_item_amount || 0), 0)
      .toFixed(2);
  }, [saleItems]);

  const handleProductSelect = useCallback(
    (index, productId) => {
      const product = availableProducts.find((p) => p.id === productId);
      if (product) {
        const updatedItems = [...saleItems];
        updatedItems[index].product_id = productId;
        updatedItems[index].price_at_sale = product.price;
        updatedItems[index].product_name = product.name; // Adiciona o nome do produto para exibição
        updatedItems[index].total_item_amount = (
          updatedItems[index].quantity * product.price
        ).toFixed(2);
        setSaleItems(updatedItems);
      }
    },
    [saleItems, availableProducts]
  );

  const handleSubmitSale = useCallback(
    async (e) => {
      e.preventDefault();
      setLoadingModalData(true);

      if (!user) {
        toast.error("Usuário não autenticado.");
        setLoadingModalData(false);
        return;
      }
      if (!saleForm.customer_id) {
        toast.error("Cliente é obrigatório.");
        setLoadingModalData(false);
        return;
      }
      if (saleItems.length === 0) {
        toast.error("Adicione pelo menos um item à venda.");
        setLoadingModalData(false);
        return;
      }
      const hasInvalidQuantity = saleItems.some(
        (item) =>
          parseFloat(item.quantity) <= 0 || isNaN(parseFloat(item.quantity))
      );
      if (hasInvalidQuantity) {
        toast.error("Quantidade inválida para um ou mais itens.");
        setLoadingModalData(false);
        return;
      }
      const hasInvalidPrice = saleItems.some(
        (item) =>
          parseFloat(item.price_at_sale) <= 0 ||
          isNaN(parseFloat(item.price_at_sale))
      );
      if (hasInvalidPrice) {
        toast.error("Preço inválido para um ou mais itens.");
        setLoadingModalData(false);
        return;
      }
      const hasUnselectedProduct = saleItems.some((item) => !item.product_id);
      if (hasUnselectedProduct) {
        toast.error("Selecione um produto para todos os itens da venda.");
        setLoadingModalData(false);
        return;
      }

      try {
        let saleIdToUse = editingSaleId;
        let finalTotalAmount = parseFloat(calculateTotalSaleAmount);

        // --- Lógica para reverter o estoque ANTES de atualizar a venda ---
        // Isso é crucial para edições: primeiro reverte o que foi vendido antes,
        // depois aplica as novas quantidades.
        if (editingSaleId) {
          const { data: oldSaleItems, error: oldItemsError } = await supabase
            .from("sale_items")
            .select("product_id, quantity")
            .eq("sale_id", editingSaleId);

          if (oldItemsError) throw oldItemsError;

          for (const oldItem of oldSaleItems) {
            const { data: stockData, error: stockError } = await supabase
              .from("stock")
              .select("id, quantity")
              .eq("product_id", oldItem.product_id)
              .eq("user_id", user.id)
              .single();

            if (stockError && stockError.code !== "PGRST116") {
              // PGRST116 = No rows found
              console.warn(
                `Estoque para produto ${oldItem.product_id} não encontrado ao reverter.`
              );
              // Não joga erro fatal, apenas avisa. A reversão pode continuar se o item não existe no estoque.
            } else if (stockData) {
              const newQuantity = (stockData.quantity || 0) + oldItem.quantity;
              const { error: updateStockError } = await supabase
                .from("stock")
                .update({
                  quantity: newQuantity,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", stockData.id);
              if (updateStockError) {
                console.error(
                  `Erro ao reverter estoque para produto ${oldItem.product_id}: ${updateStockError.message}`
                );
                toast.error(
                  `Erro ao reverter estoque para ${oldItem.product_name}.`
                );
                // Considerar se deve ou não lançar o erro aqui para parar a transação.
                // Por simplicidade, vamos apenas logar e avisar.
              }
            }
          }
        }

        if (editingSaleId) {
          // Atualizar venda existente
          const { error: saleError } = await supabase
            .from("sales")
            .update({
              customer_id: saleForm.customer_id,
              sale_date: saleForm.sale_date,
              status: saleForm.status,
              notes: saleForm.notes,
              total_amount: finalTotalAmount,
              updated_at: new Date().toISOString(),
            })
            .eq("id", editingSaleId)
            .eq("user_id", user.id);

          if (saleError) throw saleError;
          toast.success("Venda atualizada com sucesso!");

          // Excluir todos os itens antigos e inserir os novos.
          const { error: deleteItemsError } = await supabase
            .from("sale_items")
            .delete()
            .eq("sale_id", editingSaleId);
          if (deleteItemsError) throw deleteItemsError;
        } else {
          // Criar nova venda
          const { data: newSaleData, error: saleError } = await supabase
            .from("sales")
            .insert({
              user_id: user.id,
              customer_id: saleForm.customer_id,
              sale_date: saleForm.sale_date,
              status: saleForm.status,
              notes: saleForm.notes,
              total_amount: finalTotalAmount,
            })
            .select("id")
            .single();

          if (saleError) throw saleError;
          saleIdToUse = newSaleData.id;
          toast.success("Venda criada com sucesso!");
        }

        // Inserir itens da venda (novos ou atualizados)
        const itemsToInsert = saleItems.map((item) => ({
          sale_id: saleIdToUse,
          product_id: item.product_id,
          quantity: parseFloat(item.quantity),
          price_at_sale: parseFloat(item.price_at_sale),
          total_item_amount: parseFloat(item.total_item_amount),
        }));

        if (itemsToInsert.length > 0) {
          const { error: itemsError } = await supabase
            .from("sale_items")
            .insert(itemsToInsert);
          if (itemsError) throw itemsError;

          // --- Lógica para DESCONTAR do estoque APÓS a venda ser registrada ---
          for (const item of itemsToInsert) {
            // 1. Buscar o item de estoque correspondente
            const { data: stockData, error: stockSearchError } = await supabase
              .from("stock")
              .select("id, quantity")
              .eq("product_id", item.product_id)
              .eq("user_id", user.id)
              .single();

            if (stockSearchError && stockSearchError.code !== "PGRST116") {
              // PGRST116 = No rows found (nenhuma linha encontrada)
              throw new Error(
                `Erro ao buscar estoque para produto ${
                  item.product_name || item.product_id
                }: ${stockSearchError.message}`
              );
            }

            if (stockData) {
              // 2. Calcular nova quantidade
              const newQuantity = (stockData.quantity || 0) - item.quantity;

              if (newQuantity < 0) {
                // Aviso se o estoque ficar negativo
                toast.warning(
                  `Estoque do produto "${
                    item.product_name || item.product_id
                  }" ficou negativo!`
                );
              }

              // 3. Atualizar o estoque
              const { error: updateStockError } = await supabase
                .from("stock")
                .update({
                  quantity: newQuantity,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", stockData.id);

              if (updateStockError) {
                throw new Error(
                  `Erro ao atualizar estoque para produto ${
                    item.product_name || item.product_id
                  }: ${updateStockError.message}`
                );
              }
            } else {
              // O produto vendido não tem registro de estoque
              toast.warning(
                `Produto "${
                  item.product_name || item.product_id
                }" vendido, mas não encontrado no estoque para desconto.`
              );
            }
          }
        }

        setIsModalOpen(false);
        fetchSales(); // Recarrega a lista de vendas (para ver as alterações)
      } catch (error) {
        console.error(
          "Erro ao salvar venda ou atualizar estoque:",
          error.message
        );
        toast.error("Erro ao salvar venda: " + error.message);
      } finally {
        setLoadingModalData(false);
      }
    },
    [
      editingSaleId,
      saleForm,
      saleItems,
      user,
      calculateTotalSaleAmount,
      fetchSales,
    ]
  );

  const handleDeleteSale = useCallback(
    async (id) => {
      if (
        !confirm(
          "Tem certeza que quer excluir esta venda? Esta ação também reverterá os itens para o estoque."
        )
      )
        return;

      try {
        setLoading(true); // Pode ser bom mostrar um loader geral

        // 1. Buscar os itens da venda antes de excluí-la
        const { data: saleToDeleteItems, error: itemsError } = await supabase
          .from("sale_items")
          .select("product_id, quantity")
          .eq("sale_id", id);

        if (itemsError)
          throw new Error(
            "Erro ao buscar itens da venda para reverter estoque: " +
              itemsError.message
          );

        // 2. Reverter as quantidades para o estoque
        for (const item of saleToDeleteItems) {
          const { data: stockData, error: stockError } = await supabase
            .from("stock")
            .select("id, quantity")
            .eq("product_id", item.product_id)
            .eq("user_id", user.id)
            .single();

          if (stockError && stockError.code !== "PGRST116") {
            console.warn(
              `Estoque para produto ${item.product_id} não encontrado ao reverter na exclusão.`
            );
          } else if (stockData) {
            const newQuantity = (stockData.quantity || 0) + item.quantity;
            const { error: updateStockError } = await supabase
              .from("stock")
              .update({
                quantity: newQuantity,
                updated_at: new Date().toISOString(),
              })
              .eq("id", stockData.id);
            if (updateStockError) {
              console.error(
                `Erro ao reverter estoque para produto ${item.product_id} durante exclusão: ${updateStockError.message}`
              );
              toast.error(
                `Atenção: Não foi possível reverter todo o estoque ao excluir a venda.`
              );
            }
          }
        }

        // 3. Excluir a venda
        const { error: saleDeleteError } = await supabase
          .from("sales")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id); // Garante que só o dono pode excluir

        if (saleDeleteError) throw saleDeleteError;

        toast.success("Venda excluída e estoque revertido com sucesso!");
        fetchSales(); // Recarrega a lista
      } catch (error) {
        console.error(
          "Erro ao excluir venda ou reverter estoque:",
          error.message
        );
        toast.error("Erro ao excluir venda: " + error.message);
      } finally {
        setLoading(false);
      }
    },
    [user, fetchSales]
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <main>
      <div className="px-4 max-w-7xl mx-auto">
        <Card className="mb-5">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex flex-col text-center sm:text-left">
                <CardTitle className="text-lg sm:text-xl text-black dark:text-white select-none">
                  Total de Vendas Registradas:
                </CardTitle>
                <CardDescription>
                  Gerencie suas transações comerciais
                </CardDescription>
              </div>
              <ShoppingCart className="w-8 h-8 sm:w-6 sm:h-6 flex-shrink-0 mt-2 sm:mt-0" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
              {filteredAndSortedSales.length} Vendas
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row mb-6 gap-4 items-center justify-between">
          <FilterInput
            icon={SearchIcon}
            placeholder="Buscar por cliente, status ou produto..."
            onChange={(e) => debouncedSetFilter(e.target.value)}
          />
          <Button
            onClick={openCreateModal}
            variant="default"
            className="w-full sm:w-auto whitespace-nowrap"
          >
            Registrar Nova Venda
          </Button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filteredAndSortedSales.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma venda encontrada.
          </p>
        ) : (
          <div className="overflow-x-auto border border-border rounded-md dark:bg-zinc-900">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr>
                  <th
                    className="border-b border-border p-4 font-medium cursor-pointer select-none whitespace-nowrap"
                    onClick={() => requestSort("customer_name")}
                  >
                    <div className="inline-flex items-center gap-1">
                      Cliente
                      <SortIndicator
                        direction={
                          sortConfig.key === "customer_name"
                            ? sortConfig.direction
                            : null
                        }
                      />
                    </div>
                  </th>
                  <th
                    className="border-b border-border p-4 font-medium cursor-pointer select-none whitespace-nowrap"
                    onClick={() => requestSort("sale_date")}
                  >
                    <div className="inline-flex items-center gap-1">
                      Data da Venda
                      <SortIndicator
                        direction={
                          sortConfig.key === "sale_date"
                            ? sortConfig.direction
                            : null
                        }
                      />
                    </div>
                  </th>
                  <th
                    className="border-b border-border p-4 font-medium cursor-pointer select-none whitespace-nowrap"
                    onClick={() => requestSort("total_amount")}
                  >
                    <div className="inline-flex items-center gap-1">
                      Valor Total
                      <SortIndicator
                        direction={
                          sortConfig.key === "total_amount"
                            ? sortConfig.direction
                            : null
                        }
                      />
                    </div>
                  </th>
                  <th
                    className="border-b border-border p-4 font-medium cursor-pointer select-none whitespace-nowrap"
                    onClick={() => requestSort("status")}
                  >
                    <div className="inline-flex items-center gap-1">
                      Status
                      <SortIndicator
                        direction={
                          sortConfig.key === "status"
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
                {paginatedSales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-b border-border last:border-0 hover:bg-muted"
                  >
                    <td className="p-4 font-medium whitespace-nowrap">
                      {sale.customers?.name || "Cliente Desconhecido"}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {new Date(sale.sale_date).toLocaleDateString("pt-BR")}{" "}
                      {new Date(sale.sale_date).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      R$ {parseFloat(sale.total_amount).toFixed(2)}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-semibold",
                          statusColorMap[sale.status] ||
                            "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        )}
                      >
                        {sale.status === "completed"
                          ? "Concluída"
                          : sale.status === "pending"
                          ? "Pendente"
                          : sale.status === "cancelled"
                          ? "Cancelada"
                          : sale.status}
                      </span>
                    </td>
                    <td className="p-4 space-x-2 flex flex-col sm:flex-row gap-2 sm:gap-0">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => openEditModal(sale)}
                        className="w-full sm:w-auto"
                      >
                        Detalhes / Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive w-full sm:w-auto"
                        onClick={() => handleDeleteSale(sale.id)}
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
        {filteredAndSortedSales.length > 0 && totalPages > 1 && (
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

        {/* Modal Criar/Editar Venda */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-xl w-[95%] p-4 overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>
                {editingSaleId
                  ? "Detalhes / Editar Venda"
                  : "Registrar Nova Venda"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitSale} className="space-y-6">
              {loadingModalData ? (
                <LoadingSpinner />
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="customer_id">Cliente</Label>
                      <Select
                        value={saleForm.customer_id}
                        onValueChange={(value) =>
                          setSaleForm((prev) => ({
                            ...prev,
                            customer_id: value,
                          }))
                        }
                        name="customer_id"
                        id="customer_id"
                        required
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCustomers.length === 0 ? (
                            <SelectItem disabled value="">
                              Nenhum cliente disponível
                            </SelectItem>
                          ) : (
                            availableCustomers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sale_date">Data da Venda</Label>
                      {/* CAMPO DE DATA PADRÃO HTML NOVAMENTE */}
                      <Input
                        id="sale_date"
                        name="sale_date"
                        type="date"
                        value={saleForm.sale_date}
                        onChange={handleSaleFormChange}
                        required
                        disabled={loadingModalData}
                      />
                      {/* FIM DO CAMPO DE DATA PADRÃO HTML */}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Input
                      id="notes"
                      name="notes"
                      type="text"
                      value={saleForm.notes}
                      onChange={handleSaleFormChange}
                      disabled={loadingModalData}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={saleForm.status}
                      onValueChange={(value) =>
                        setSaleForm((prev) => ({ ...prev, status: value }))
                      }
                      name="status"
                      id="status"
                      required
                      disabled={loadingModalData}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Concluída</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Itens da Venda */}
                  <h3 className="text-lg font-semibold mt-6 mb-4">
                    Itens da Venda
                  </h3>
                  {saleItems.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                      Adicione produtos a esta venda.
                    </p>
                  )}
                  {saleItems.map((item, index) => (
                    <div
                      key={item.id || `new-item-${index}`}
                      className="grid gap-4 sm:grid-cols-4 items-end border p-4 rounded-md relative"
                    >
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor={`product-${index}`}>Produto</Label>
                        <Select
                          value={item.product_id}
                          onValueChange={(value) =>
                            handleProductSelect(index, value)
                          }
                          name={`product-${index}`}
                          id={`product-${index}`}
                          required
                          disabled={loadingModalData}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione um produto" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableProducts.length === 0 ? (
                              <SelectItem disabled value="">
                                Nenhum produto disponível
                              </SelectItem>
                            ) : (
                              availableProducts.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} (R${" "}
                                  {parseFloat(product.price).toFixed(2)})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`quantity-${index}`}>Qtd</Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleSaleItemChange(
                              index,
                              "quantity",
                              e.target.value
                            )
                          }
                          min="1"
                          required
                          disabled={loadingModalData}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`price-${index}`}>Preço Unit.</Label>
                        <Input
                          id={`price-${index}`}
                          type="number"
                          value={parseFloat(item.price_at_sale).toFixed(2)}
                          onChange={(e) =>
                            handleSaleItemChange(
                              index,
                              "price_at_sale",
                              e.target.value
                            )
                          }
                          step="0.01"
                          min="0.01"
                          required
                          disabled={loadingModalData}
                        />
                      </div>
                      <div className="col-span-4 flex items-center justify-between mt-2">
                        <p className="text-sm text-muted-foreground">
                          Total Item: R${" "}
                          {parseFloat(item.total_item_amount).toFixed(2)}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-destructive ml-auto"
                          onClick={() => removeSaleItem(index)}
                          disabled={loadingModalData}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={addSaleItem}
                    variant="secondary"
                    className="w-full gap-2"
                    disabled={loadingModalData}
                  >
                    <PlusCircle className="h-4 w-4" /> Adicionar Item
                  </Button>

                  <div className="flex justify-end items-center text-xl font-bold mt-6 pt-4 border-t border-border">
                    Total da Venda: R$ {calculateTotalSaleAmount}
                  </div>
                </>
              )}

              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-0 mt-4">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto sm:mr-2"
                    disabled={loadingModalData}
                  >
                    Cancelar
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={loadingModalData}
                >
                  {loadingModalData
                    ? "Salvando..."
                    : editingSaleId
                    ? "Salvar Venda"
                    : "Registrar Venda"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
