"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { IoMdClose } from "react-icons/io";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const bgBlack = "/images/bg-black.jpg";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !firstName) {
      toast.error("Por favor, preencha todos os campos obrigatórios.", {
        duration: 3000,
        style: {
          backgroundColor: "red",
          color: "white",
          fontFamily: "Poppins",
          border: "none",
        },
      });
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName || null,
          },
        },
      });

      if (authError) {
        toast.error("Erro no cadastro de usuário: " + authError.message, {
          duration: 4000,
          style: {
            backgroundColor: "red",
            color: "white",
            fontFamily: "Poppins",
            border: "none",
          },
        });
        return;
      }

      if (
        authData.user &&
        authData.user.identities &&
        authData.user.identities.length === 0
      ) {
        toast.info("Verifique seu e-mail para confirmar a conta.", {
          duration: 5000,
        });
        router.push("/check-email"); // Crie essa página se quiser
      } else {
        toast.success("Cadastro feito com sucesso! Redirecionando...", {
          duration: 3000,
          style: { fontFamily: "Poppins", fontWeight: "bolder" },
        });
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Erro geral no cadastro:", err);
      setError("Ocorreu um erro inesperado. Tente novamente.");
      toast.error("Erro inesperado: " + err.message, {
        duration: 5000,
        style: {
          backgroundColor: "red",
          color: "white",
          fontFamily: "Poppins",
          border: "none",
        },
      });
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error("Erro no login com Google: " + error.message);
    } else {
      toast.success("Login com Google iniciado!");
    }
  };

  return (
    <main className="md:min-h-screen flex flex-col md:flex-row overflow-hidden">
      <section
        className="bg-no-repeat bg-cover bg-center  relative flex-1 items-center justify-center text-white p-10 overflow-hidden m-2 rounded-xl hidden md:flex"
        style={{ backgroundImage: `url('${bgBlack}')` }}
      >
        <div className="absolute -top-10 -right-10 h-56 w-56 rounded-full blur-[100px] opacity-70 z-0" />
        <div className="absolute -bottom-20 left-0 h-56 w-56 rounded-full blur-[100px] opacity-70 z-0" />
        <div className="z-10 max-w-md text-left">
          <h1 className="text-4xl md:text-5xl font-light mb-4">Bem-vindo.</h1>
          <p className="text-lg md:text-xl">
            Comece sua jornada agora mesmo com nosso sistema de gestão!
          </p>
        </div>
        <div className="absolute top-6 left-6 z-20">
          <Link href="/">
            <h1 className="text-white font-bold text-2xl italic">
              Mini Dash <span className="text-white font-bold text-3xl">.</span>
            </h1>
          </Link>
        </div>
      </section>

      <section className="flex-1 flex items-center justify-center p-6 bg-background mt-10 sm:mt-0">
        <div className="w-full max-w-md space-y-6">
          <Card className="w-full shadow-2xl border-none rounded-2xl">
            <div className="flex justify-end px-10">
              <Link href="/">
                <IoMdClose
                  size={35}
                  className="font-thin text-black dark:text-white transition-all ease-linear"
                />
              </Link>
            </div>
            <CardHeader className="text-3xl font-bold text-center text-zinc-800 dark:text-white">
              Crie sua conta
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="inline-flex gap-5">
                  <div>
                    <label className="italic font-medium text-sm text-zinc-600 dark:text-zinc-300">
                      Nome
                    </label>

                    <Input
                      type="text"
                      placeholder="Primeiro Nome"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="italic font-medium text-sm text-zinc-600 dark:text-zinc-300">
                      Sobrenome
                    </label>
                    <Input
                      type="text"
                      placeholder="Sobrenome"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="italic font-medium text-sm text-zinc-600 dark:text-zinc-300">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="italic font-medium text-sm text-zinc-600 dark:text-zinc-300">
                    Senha
                  </label>
                  <Input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 mt-5 text-sm cursor-pointer"
                >
                  Criar conta
                </Button>
                <div className="flex items-center gap-6">
                  <Separator />
                  <span className="text-xs text-muted-foreground">ou</span>
                  <Separator />
                </div>

                <Button
                  className="w-full flex items-center justify-center gap-3 mt-5 text-sm cursor-pointer"
                  onClick={handleGoogleLogin}
                >
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    className="h-5 w-5"
                  />
                  Entrar com Google
                </Button>
                <p className="text-sm text-center text-zinc-500 dark:text-zinc-400">
                  Já tem uma conta?{" "}
                  <Link
                    href="/login"
                    className="text-azul-claro underline hover:opacity-90"
                  >
                    Faça login
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
