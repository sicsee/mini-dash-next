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

    return () => {
      img.onload = null;
    };
  }, []);

  useEffect(() => {
    let timeoutId;
    if (backgroundLoaded && !animationStarted) {
      setAnimationStarted(true);
      timeoutId = setTimeout(() => setShowIntroAnimation(false), 500);
    }
    return () => clearTimeout(timeoutId);
  }, [backgroundLoaded, animationStarted]);

  const contentInitialClasses =
    !backgroundLoaded || !animationStarted ? "opacity-0" : "";

  return (
    <main className="min-h-screen bg-black text-white flex flex-col relative overflow-x-hidden">
      {showIntroAnimation && (
        <div
          className="fixed inset-0 bg-black z-50 animate-fade-out-bg"
          style={{ pointerEvents: "none" }}
        ></div>
      )}

      <HeaderLanding />
      <section className="flex flex-col items-center justify-center relative p-4 h-screen overflow-hidden px-4 sm:px-8 lg:px-16">
        <div
          className={`absolute inset-0 bg-no-repeat bg-cover bg-center ${contentInitialClasses} ${
            backgroundLoaded && animationStarted ? "animate-zoom-out-bg" : ""
          }`}
          style={{ backgroundImage: `url(/images/bg-land.png)` }}
        ></div>

        <div
          className={`max-w-3xl w-full relative z-10 flex items-center flex-col text-center transition-opacity duration-500 ${contentInitialClasses}`}
        >
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
    </main>
  );
}
