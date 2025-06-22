"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import HeaderLanding from "@/components/header";

export default function Home() {
  const [showIntroAnimation, setShowIntroAnimation] = useState(true);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = "/images/bg-land.png";

    const handleLoad = () => setBackgroundLoaded(true);
    img.onload = handleLoad;
    if (img.complete) handleLoad();
  }, []);

  useEffect(() => {
    let timeoutId;
    if (backgroundLoaded && !animationStarted) {
      setAnimationStarted(true);
      timeoutId = setTimeout(() => setShowIntroAnimation(false), 500);
      return () => clearTimeout(timeoutId);
    }
  }, [backgroundLoaded, animationStarted]);

  const contentInitialClasses =
    !backgroundLoaded || !animationStarted ? "opacity-0-initial" : "";

  return (
    <main className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      {showIntroAnimation && (
        <div
          className="fixed inset-0 bg-black z-50 animate-fade-out-bg"
          style={{ pointerEvents: "none" }}
        ></div>
      )}

      <HeaderLanding />

      <section className="flex flex-col items-center justify-center relative p-4 h-screen overflow-hidden">
        <div
          className={`absolute inset-0 bg-no-repeat bg-cover bg-center ${contentInitialClasses} ${
            backgroundLoaded && animationStarted ? "animate-zoom-out-bg" : ""
          }`}
          style={{ backgroundImage: `url(/images/bg-land.png)` }}
        ></div>

        <div className="max-w-3xl w-full relative z-10 flex items-center flex-col text-center">
          <h2
            className={`text-4xl md:text-6xl font-bold mb-6 text-white font-bodoni ${
              animationStarted
                ? "animate-slide-in-bottom animate-delay-900"
                : ""
            }`}
          >
            Mini Dash
          </h2>
          <p
            className={`text-lg text-zinc-100 mb-8 max-w-xl mx-auto ${
              animationStarted
                ? "animate-slide-in-bottom animate-delay-900"
                : ""
            }`}
          >
            Um sistema simples e eficaz de gerenciamento de vendas e produtos
            com um dashboard completo.
          </p>
          {user ? (
            <Button
              asChild
              className={` ${
                animationStarted
                  ? "animate-slide-in-bottom animate-delay-900 "
                  : ""
              }`}
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button
              asChild
              className={` ${
                animationStarted
                  ? "animate-slide-in-bottom animate-delay-900 "
                  : ""
              }`}
            >
              <Link href="/signup">Criar Conta</Link>
            </Button>
          )}
        </div>
      </section>

      <section className="p-8 flex flex-col text-center space-y-10 mt-5 items-center relative">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium sm:font-bold">
            Visão Clara, Decisões Inteligentes
          </h1>
          <p className="text-sm sm:text-base text-zinc-400">
            Seu Dashboard Completo em Um Piscar de Olhos
          </p>
        </div>

        <p className="text-base sm:text-lg text-center w-full max-w-4xl">
          Explore o poder do Mini Dash com nosso painel intuitivo. Tenha dados
          de vendas, estoque e clientes centralizados para decisões rápidas e
          eficazes, tudo em um só lugar.
        </p>

        <div className="relative -mr-56 overflow-hidden px-2 sm:mr-0 mt-10">
          <div
            aria-hidden="true"
            className="bg-gradient-to-b from-transparent via-black/50 to-black absolute inset-0 z-10"
          ></div>
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border bg-gradient-to-br from-black/80 to-black/60 shadow-lg">
            <img
              alt="Dashboard"
              className="border border-border/50 rounded-xl"
              src="/images/Dash.png"
            />
          </div>
        </div>
      </section>

      <footer className="text-center py-8 text-sm text-zinc-800 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-700 mt-10">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-4">
          <Link href="/sobre" className="hover:underline">
            Sobre
          </Link>
          <Link href="/contato" className="hover:underline">
            Contato
          </Link>
          <Link href="/termos" className="hover:underline">
            Termos de Uso
          </Link>
        </div>
        <p>
          © {new Date().getFullYear()} Mini Dash. Todos os direitos reservados.
        </p>
      </footer>
    </main>
  );
}
