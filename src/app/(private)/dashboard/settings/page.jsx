"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PencilLine, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import Resizer from "react-image-file-resizer";

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Usuário não autenticado. Redirecionando para o login.");

        return;
      }

      const { data, error } = await supabase

        .from("profiles")

        .select("*")

        .eq("user_id", user.id)

        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setProfile(data);

        setNewFirstName(data.first_name || "");

        setNewLastName(data.last_name || "");

        setNewEmail(data.email || "");

        setNewPhone(data.phone || "");
      } else {
        setProfile({
          id: user.id,

          user_id: user.id,

          first_name: user.user_metadata?.first_name || "",

          last_name: user.user_metadata?.last_name || "",

          email: user.email,

          phone: "",

          avatar_url: user.user_metadata?.avatar_url || "",

          created_at: user.created_at,

          updated_at: new Date().toISOString(),
        });

        setNewFirstName(user.user_metadata?.first_name || "");

        setNewLastName(user.user_metadata?.last_name || "");

        setNewEmail(user.email || "");

        setNewPhone("");

        console.warn(
          "Perfil não encontrado na tabela profiles. Usando dados do auth.user como fallback."
        );
      }
    } catch (error) {
      console.error("Erro ao buscar perfil:", error.message);

      toast.error("Erro ao carregar dados do perfil: " + error.message, {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSavePersonal = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error(
          "Usuário não autenticado. Por favor, faça login novamente."
        );
        setLoading(false);
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: newFirstName,
          last_name: newLastName,
          phone: newPhone,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      if (newEmail && newEmail !== user.email) {
        const { error: authEmailError } = await supabase.auth.updateUser({
          email: newEmail,
        });
        if (authEmailError) {
          toast.info(
            "Um email de verificação foi enviado para o novo endereço. Por favor, confirme a alteração de email.",
            { duration: 7000 }
          );
          console.warn(
            "Erro ao atualizar email no Auth (pode ser necessário verificação):",
            authEmailError.message
          );
        } else {
          toast.success("Email atualizado com sucesso no Auth.");
        }
      }

      const { error: metaError } = await supabase.auth.updateUser({
        data: {
          first_name: newFirstName,
          last_name: newLastName,
        },
      });

      if (metaError)
        console.warn(
          "Erro ao atualizar metadados do usuário:",
          metaError.message
        );

      await fetchProfile();
      setIsEditingPersonal(false);
      toast.success("Informações pessoais atualizadas com sucesso!", {
        duration: 3000,
      });
    } catch (error) {
      console.error("Erro ao salvar informações pessoais:", error.message);
      toast.error("Erro ao salvar: " + error.message, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      toast.error("Nenhum arquivo selecionado.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Formato de imagem não suportado. Use JPG, PNG, GIF ou WebP."
      );
      return;
    }

    const maxSizeMB = 2; // 2MB
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`A imagem deve ter no máximo ${maxSizeMB}MB.`);
      return;
    }

    setLoading(true);

    // **** AQUI: A FUNÇÃO Resizer.imageFileResizer VAI EXECUTAR O CALLBACK ****
    Resizer.imageFileResizer(
      file,
      200, // Largura máxima
      200, // Altura máxima
      "JPEG", // Formato de saída
      100, // Qualidade
      0, // Rotação (0 = sem rotação)
      async (resizedFile) => {
        // **** A VARIÁVEL resizedFile SÓ EXISTE AQUI DENTRO ****
        try {
          // Todas as operações que usam 'resizedFile' DEVEM estar aqui dentro
          // ou em funções que são chamadas de dentro daqui e que recebem 'resizedFile' como argumento.

          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) {
            toast.error("Usuário não autenticado.");
            setLoading(false);
            return;
          }

          // CORREÇÃO DA "INVALID KEY" - Garanta que está usando Template Literals corretos
          const fileExtension = resizedFile.name.split(".").pop();
          const filePath = `${user.id}/${Date.now()}.${fileExtension}`;
          const bucketName = "avatars";

          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from(bucketName)
              .upload(filePath, resizedFile, {
                // <-- USANDO resizedFile AQUI
                cacheControl: "3600",
                upsert: true,
              });

          if (uploadError) {
            console.error("Erro no upload para o Storage:", uploadError);
            throw new Error(
              `Erro ao fazer upload da imagem: ${uploadError.message}`
            );
          }

          const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

          const publicUrl = publicUrlData.publicUrl;

          const { error: updateProfileError } = await supabase
            .from("profiles")
            .update({
              avatar_url: publicUrl,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);

          if (updateProfileError) {
            console.error(
              "Erro ao atualizar avatar_url no perfil:",
              updateProfileError
            );
            throw new Error(
              `Erro ao salvar URL do avatar no perfil: ${updateProfileError.message}`
            );
          }

          const { error: updateAuthMetaError } = await supabase.auth.updateUser(
            {
              data: { avatar_url: publicUrl },
            }
          );
          if (updateAuthMetaError) {
            console.warn(
              "Erro ao atualizar avatar_url nos metadados do Auth:",
              updateAuthMetaError.message
            );
          }

          // Atualize o estado profile imediatamente
          setProfile({ ...profile, avatar_url: publicUrl });

          toast.success("Foto de perfil atualizada com sucesso!", {
            duration: 3000,
          });
        } catch (error) {
          console.error("Erro capturado em handleAvatarUpload:", error);
          toast.error("Erro ao carregar imagem: " + error.message, {
            duration: 5000,
          });
        } finally {
          setLoading(false); // <-- Certifique-se que o setLoading(false) também está aqui
        }
      },
      "file" // Tipo de saída do Resizer: File/Blob
    );
  };

  async function deleteAccount() {
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();
    if (getUserError || !user) {
      toast.error("Usuário não autenticado.");
      return;
    }

    const { error } = await supabase.rpc("delete_current_user");
    if (error) {
      toast.error("Erro ao excluir a conta: " + error.message);
    } else {
      toast.success("Conta excluída com sucesso!");
      await supabase.auth.signOut();
      window.location.href = "/login";
    }
  }

  const formatCreatedAt = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getDisplayName = () => {
    if (profile) {
      return (
        `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
        "Usuário"
      );
    }
    return "Convidado";
  };

  const getAvatarFallback = () => {
    if (profile?.first_name) {
      return profile.first_name[0].toUpperCase();
    }
    return "US";
  };

  if (loading && !profile) {
    return (
      <main className="p-4 max-w-6xl flex flex-col items-center justify-center h-screen space-y-4">
        <h1 className="text-2xl font-bold">Carregando perfil...</h1>
        <div className="animate-spin h-10 w-10 border-4 border-t-transparent rounded-full border-primary"></div>
      </main>
    );
  }

  return (
    <main className="w-full mx-auto space-y-8">
      <h1 className="text-3xl font-bold select-none">Meu Perfil</h1>

      <Card className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 border rounded-xl shadow-sm">
        <div className="relative group">
          <Avatar className="size-24">
            <AvatarImage
              src={profile?.avatar_url || ""} // Isso está correto
              alt={`${getDisplayName()} avatar`}
            />
            <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
          </Avatar>
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full cursor-pointer shadow-sm opacity-0 group-hover:opacity-100 transition hover:scale-105"
          >
            <ImagePlus className="h-4 w-4" />
            <Input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={loading}
            />
          </label>
        </div>

        <div className="flex flex-col items-center sm:items-start">
          <h2 className="text-2xl font-semibold">{getDisplayName()}</h2>
          <p className="text-muted-foreground">Plano base</p>
          <p className="text-sm text-muted-foreground">
            Conta criada em {formatCreatedAt(profile?.created_at)}
          </p>
        </div>
      </Card>

      {/* Informações Pessoais */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl font-bold mb-3 sm:mb-0">
            Informações Pessoais
          </CardTitle>
          <Button
            variant="outline"
            className="gap-2 transition hover:bg-muted"
            onClick={() => setIsEditingPersonal(!isEditingPersonal)}
          >
            <PencilLine className="h-4 w-4" />
            {isEditingPersonal ? "Cancelar" : "Editar"}
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Primeiro Nome */}
            <div>
              <Label htmlFor="firstName">Primeiro Nome</Label>
              {isEditingPersonal ? (
                <Input
                  id="firstName"
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                  disabled={loading}
                />
              ) : (
                <p className="font-medium">{profile?.first_name || "N/A"}</p>
              )}
            </div>

            {/* Sobrenome */}
            <div>
              <Label htmlFor="lastName">Sobrenome</Label>
              {isEditingPersonal ? (
                <Input
                  id="lastName"
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                  disabled={loading}
                />
              ) : (
                <p className="font-medium">{profile?.last_name || "N/A"}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">E-mail</Label>
              {isEditingPersonal ? (
                <Input
                  id="email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  disabled={loading}
                />
              ) : (
                <p className="font-medium">{profile?.email || "N/A"}</p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <Label htmlFor="phone">Telefone</Label>
              {isEditingPersonal ? (
                <Input
                  id="phone"
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  disabled={loading}
                />
              ) : (
                <p className="font-medium">{profile?.phone || "N/A"}</p>
              )}
            </div>
          </div>

          {isEditingPersonal && (
            <Button onClick={handleSavePersonal} disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Plano */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Seu Plano</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="font-semibold text-muted-foreground">
                Data de Vencimento
              </h3>
              <p className="font-medium">Data/Mês/Ano</p>
            </div>
            <div>
              <h3 className="font-semibold text-muted-foreground">
                Forma de Pagamento
              </h3>
              <p className="font-medium">Cartão - Crédito *0982</p>
            </div>
            <div>
              <h3 className="font-semibold text-muted-foreground">Plano</h3>
              <p className="font-medium">Premium</p>
            </div>
            <div>
              <h3 className="font-semibold text-muted-foreground">Valor</h3>
              <p className="font-medium">R$ 94,99/Mês</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <Button
          className="text-red-500 border border-red-500 hover:bg-red-500 hover:text-white transition"
          variant="outline"
          onClick={() => {
            if (
              confirm(
                "Tem certeza que deseja excluir sua conta? Essa ação é irreversível."
              )
            ) {
              deleteAccount();
            }
          }}
        >
          Excluir Conta
        </Button>
      </div>
    </main>
  );
}
