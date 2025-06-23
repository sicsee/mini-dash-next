"use client";
import React from "react";
import Link from "next/link";
import { IoMdClose } from "react-icons/io";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const bgBlack = "/images/bg-black.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Erro no login: " + error.message, {
        duration: 3000,
        style: {
          backgroundColor: "red",
          color: "white",
          fontFamily: "Poppins",
          fontWeight: "bolder",
          border: "none",
        },
      });
    } else {
      toast.success("Login feito com sucesso!", {
        duration: 3000,
        style: {
          fontFamily: "Poppins",
          fontWeight: "bolder",
        },
      });
      router.push("/dashboard");
    }
  };

  return (
    <main className="md:min-h-screen flex flex-col md:flex-row overflow-hidden">
      <section className="flex-1 flex items-center justify-center p-6 bg-background mt-20 sm:mt-0">
        <div className="w-full max-w-md space-y-6">
          <Card className="w-full shadow-2xl border-none rounded-2xl">
            <div className="flex justify-end px-10">
              <Link href="/">
                <IoMdClose
                  size={35}
                  className="font-thin text-black dark:text-white hover:text-zinc-400 dark:hover:text-zinc-400 transition-all ease-linear"
                />
              </Link>
            </div>
            <CardHeader className="text-3xl font-bold text-center text-zinc-800 dark:text-white">
              Entre na sua conta
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="italic font-medium text-sm text-zinc-600 dark:text-zinc-300">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="p-2 border rounded"
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
                    className="p-2 border rounded"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 mt-5 text-sm cursor-pointer"
                >
                  Entrar
                </Button>
                <div className="flex items-center gap-6">
                  <Separator />
                  <span className="text-xs text-muted-foreground">ou</span>
                  <Separator />
                </div>

                <p className="text-sm text-center text-zinc-500 dark:text-zinc-400">
                  Não tem uma conta?{" "}
                  <Link
                    href="/signup"
                    className="text-azul-claro underline hover:opacity-90"
                  >
                    Faça o cadastro
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
      <section
        className="bg-no-repeat bg-cover bg-center  relative flex-1 items-center justify-center text-white p-10 overflow-hidden m-2 rounded-xl hidden md:flex"
        style={{ backgroundImage: `url('${bgBlack}')` }}
      >
        <div className="z-10 max-w-md text-left">
          <h1 className="text-4xl md:text-5xl font-light mb-4 text-center">
            Entre na sua conta.
          </h1>
          <p className="text-lg md:text-xl">
            Acesse seu painel e gerencie sua conta de forma rápida e segura!
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
    </main>
  );
}
