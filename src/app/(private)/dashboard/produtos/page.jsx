"use client";
import { useEffect, useState, useMemo } from "react";
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
  Package,
  ChevronsDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUp,
  Search as SearchIcon,
} from "lucide-react";
import { NumericFormat } from "react-number-format";

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

function SortIndicator({ direction }) {
  if (!direction) return null;

  const Icon = direction === "asc" ? ChevronsUp : ChevronsDown;

  return (
    <span className="inline-flex items-center gap-1">
      <Icon className="w-5 h-5" />
    </span>
  );
}

function FilterInput({ icon: Icon, value, onChange, placeholder }) {
  return (
    <div className="relative w-full max-w-sm">
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="pl-10"
      />
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({ name: "", price: "" });
  const [editingId, setEditingId] = useState(null);
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Ordenação
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });

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
    if (user) fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao buscar produtos: " + error.message);
    } else {
      setProducts(data);
    }
    setLoading(false);
  };

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) =>
      p.name.toLowerCase().includes(filter.toLowerCase())
    );

    if (sortConfig !== null) {
      filtered = filtered.sort((a, b) => {
        let aKey = a[sortConfig.key];
        let bKey = b[sortConfig.key];

        // Para strings (nome)
        if (typeof aKey === "string") {
          aKey = aKey.toLowerCase();
          bKey = bKey.toLowerCase();
        }

        if (aKey < bKey) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aKey > bKey) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [products, filter, sortConfig]);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ name: "", price: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
    setForm({ name: product.name, price: product.price });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    const priceNumber = parseFloat(form.price);
    if (isNaN(priceNumber) || priceNumber < 0) {
      toast.error("Preço inválido");
      return;
    }
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("products")
        .update({ name: form.name.trim(), price: priceNumber })
        .eq("id", editingId);
      if (error) {
        toast.error("Erro ao atualizar produto: " + error.message);
      } else {
        toast.success("Produto atualizado");
        setIsModalOpen(false);
        fetchProducts();
      }
    } else {
      const { error } = await supabase
        .from("products")
        .insert([
          { name: form.name.trim(), price: priceNumber, user_id: user.id },
        ]);
      if (error) {
        toast.error("Erro ao criar produto: " + error.message);
      } else {
        toast.success("Produto criado");
        setIsModalOpen(false);
        fetchProducts();
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que quer excluir?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error(
        "Erro ao excluir: O produto ainda está anexado a uma compra."
      );
    } else {
      toast.success("Produto excluído");
      if (editingId === id) {
        setEditingId(null);
        setForm({ name: "", price: "" });
      }
      fetchProducts();
    }
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <main>
      <div className="px-4 max-w-7xl mx-auto">
        <Card className="mb-5">
          <CardHeader>
            <div className="flex items-center justify-center">
              <div className="flex flex-col">
                <CardTitle className="text-lg sm:text-xl text-black dark:text-white select-none">
                  Total de Produtos:
                </CardTitle>
                <CardDescription>
                  Capacidade máxima de 15 produtos
                </CardDescription>
              </div>
              <Package className="ml-auto w-6 h-6" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg sm:text-xl font-bold">
              {products.length} / 15
            </p>
          </CardContent>
        </Card>
        <div className="flex flex-col sm:flex-row mb-6 gap-4 items-center justify-between">
          <FilterInput
            icon={SearchIcon}
            placeholder="Buscar por nome..."
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Button
            onClick={openCreateModal}
            variant="default"
            className="whitespace-nowrap"
          >
            Novo Produto
          </Button>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : filteredProducts.length === 0 ? (
          <p>Nenhum produto encontrado.</p>
        ) : (
          <div className="overflow-x-auto border border-border rounded-md dark:bg-zinc-900">
            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr>
                  {["name", "price", "created_at"].map((col) => (
                    <th
                      key={col}
                      className="border-b border-border p-4 font-medium cursor-pointer select-none"
                      onClick={() => requestSort(col)}
                    >
                      <div className="inline-flex items-center gap-1">
                        {col === "name" && "Nome"}
                        {col === "price" && "Preço"}
                        {col === "created_at" && "Adicionado em"}
                        <SortIndicator
                          direction={
                            sortConfig.key === col ? sortConfig.direction : null
                          }
                        />
                      </div>
                    </th>
                  ))}
                  <th className="border-b border-border p-4 font-medium">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-border last:border-0 hover:bg-muted"
                  >
                    <td className="p-4 font-medium">{product.name}</td>
                    <td className="p-4">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(product.price)}
                    </td>
                    <td className="p-4">
                      {new Date(product.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-4 space-x-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => openEditModal(product)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        onClick={() => handleDelete(product.id)}
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

        {/* Paginação */}
        {filteredProducts.length > 0 && totalPages > 1 && (
          <div className="flex justify-center space-x-2 mt-4">
            <Button
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            >
              <ChevronLeft />
            </Button>
            <span className="px-4 py-2 select-none">
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
        {/* Modal Criar/Editar */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço</Label>
                <NumericFormat
                  id="price"
                  name="price"
                  className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-azul-claro focus-visible:ring-[3px] focus-visible:border-none aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                  value={form.price}
                  onValueChange={({ value }) =>
                    setForm((f) => ({ ...f, price: value }))
                  }
                  thousandSeparator="."
                  decimalSeparator=","
                  decimalScale={2}
                  fixedDecimalScale
                  prefix="R$ "
                  allowNegative={false}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="mr-2">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit">{editingId ? "Salvar" : "Criar"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
