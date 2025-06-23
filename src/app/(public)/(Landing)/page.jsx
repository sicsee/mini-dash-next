"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import HeaderLanding from "@/components/header"; // Certifique-se de que este componente é responsivo
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Importe os componentes de card se estiver usando ShadCN/UI

export default function Home() {
  const [showIntroAnimation, setShowIntroAnimation] = useState(true);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);
  const [user, setUser] = useState(null);

  // Efeito para verificar o status do usuário ao carregar a página
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    getUser();
  }, []);

  // Efeito para pré-carregar a imagem de fundo
  useEffect(() => {
    const img = new Image();
    img.src = "/images/bg-land.png";

    const handleLoad = () => setBackgroundLoaded(true);
    img.onload = handleLoad;
    if (img.complete) handleLoad();

    // Cleanup para evitar vazamentos de memória caso o componente seja desmontado
    return () => {
      img.onload = null;
    };
  }, []);

  // Efeito para iniciar as animações após o background carregar
  useEffect(() => {
    let timeoutId;
    if (backgroundLoaded && !animationStarted) {
      setAnimationStarted(true);
      timeoutId = setTimeout(() => setShowIntroAnimation(false), 500); // Ajuste este tempo se necessário
    }
    return () => clearTimeout(timeoutId);
  }, [backgroundLoaded, animationStarted]);

  // Classes para controlar a opacidade inicial dos elementos de conteúdo
  const contentInitialClasses =
    !backgroundLoaded || !animationStarted ? "opacity-0" : "";

  return (
    <main className="min-h-screen bg-black text-white flex flex-col relative overflow-x-hidden">
      {/* Overlay de introdução com animação de fade-out */}
      {showIntroAnimation && (
        <div
          className="fixed inset-0 bg-black z-50 animate-fade-out-bg"
          style={{ pointerEvents: "none" }}
        ></div>
      )}
      {/* Header da Landing Page */}
      <HeaderLanding />
      {/* Seção Hero - Banner Principal */}
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
      {/* Seção de Destaque - Dashboard */}
      <section className="p-8 flex flex-col text-center space-y-10 mt-16 items-center relative">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium sm:font-bold">
            Visão Clara, Decisões Inteligentes
          </h1>
          <p className="text-sm sm:text-base text-zinc-400">
            Seu Dashboard Completo em Um Piscar de Olhos
          </p>
        </div>

        <p className="text-base sm:text-lg text-center w-full max-w-4xl px-4">
          Explore o poder do Mini Dash com nosso painel intuitivo. Tenha dados
          de vendas, estoque e clientes centralizados para decisões rápidas e
          eficazes, tudo em um só lugar.
        </p>

        <div className="relative overflow-hidden px-4 sm:px-0 lg:px-4 mt-10 w-full flex justify-center">
          <div
            aria-hidden="true"
            className="bg-gradient-to-b from-transparent via-black/50 to-black absolute inset-0 z-10"
          ></div>
          <div className="relative mx-auto w-full md:w-5/6 lg:w-4/5 xl:w-3/4 max-w-6xl overflow-hidden rounded-2xl border bg-gradient-to-br from-black/80 to-black/60 shadow-lg">
            <img
              alt="Dashboard"
              className="border border-border/50 rounded-xl w-full h-auto"
              src="/images/Dash.png"
            />
          </div>
        </div>
      </section>

      {/* Seção de Recursos Principais */}
      <section className="py-16 px-4 sm:px-8 lg:px-16 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-12">
          Recursos que Impulsionam Seu Negócio
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="bg-zinc-900 border-zinc-700 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-semibold mb-2">
                Gestão de Vendas Simplificada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-zinc-300">
                Acompanhe suas vendas em tempo real, gerencie pedidos e obtenha
                insights valiosos sobre o desempenho do seu negócio.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-700 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-semibold mb-2">
                Controle de Estoque Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-zinc-300">
                Mantenha seu estoque sempre atualizado, receba alertas de baixa
                quantidade e otimize suas compras.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-700 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-semibold mb-2">
                Cadastro de Produtos Detalhado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-zinc-300">
                Cadastre seus produtos com todas as informações necessárias,
                categorias e imagens para uma organização impecável.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-700 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-semibold mb-2">
                Gestão de Clientes Centralizada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-zinc-300">
                Tenha um histórico completo de seus clientes, facilitando o
                atendimento e a criação de estratégias de fidelização.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-700 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-semibold mb-2">
                Relatórios Completos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-zinc-300">
                Gere relatórios detalhados sobre vendas, produtos e clientes
                para tomar decisões baseadas em dados concretos.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-700 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-semibold mb-2">
                Interface Intuitiva
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-zinc-300">
                Desfrute de um sistema fácil de usar, projetado para otimizar
                sua produtividade sem curva de aprendizado.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* Seção Como Funciona */}
      <section className="py-16 px-4 sm:px-8 lg:px-16 text-center bg-zinc-950">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-12">
          Comece a Usar o Mini Dash em 3 Passos Simples
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="flex flex-col items-center p-6 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg">
            <div className="text-5xl font-bold text-blue-400 mb-4">1</div>
            <h3 className="text-xl font-semibold mb-2">
              Crie sua Conta Gratuita
            </h3>
            <p className="text-zinc-300">
              É rápido e fácil. Em poucos segundos, você estará pronto para
              começar.
            </p>
          </div>
          <div className="flex flex-col items-center p-6 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg">
            <div className="text-5xl font-bold text-blue-400 mb-4">2</div>
            <h3 className="text-xl font-semibold mb-2">
              Configure Seu Negócio
            </h3>
            <p className="text-zinc-300">
              Adicione seus produtos, clientes e comece a registrar suas vendas.
            </p>
          </div>
          <div className="flex flex-col items-center p-6 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg">
            <div className="text-5xl font-bold text-blue-400 mb-4">3</div>
            <h3 className="text-xl font-semibold mb-2">
              Acompanhe Seu Crescimento
            </h3>
            <p className="text-zinc-300">
              Utilize o dashboard para tomar decisões inteligentes e ver seu
              negócio prosperar.
            </p>
          </div>
        </div>
      </section>
      {/* Seção de Depoimentos */}
      <section className="py-16 px-4 sm:px-8 lg:px-16 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-12">
          O Que Nossos Usuários Dizem
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="bg-zinc-900 border-zinc-700 text-white p-6 rounded-lg shadow-lg">
            <CardContent className="text-zinc-300 italic mb-4">
              "O Mini Dash transformou a forma como eu gerencio minhas vendas. É
              incrivelmente intuitivo e me poupa muito tempo!"
            </CardContent>
            <CardDescription className="text-zinc-400 font-semibold">
              - Ana Paula, Dona de E-commerce
            </CardDescription>
          </Card>
          <Card className="bg-zinc-900 border-zinc-700 text-white p-6 rounded-lg shadow-lg">
            <CardContent className="text-zinc-300 italic mb-4">
              "Finalmente um sistema de gestão simples e eficiente! Os
              relatórios são claros e me ajudam a entender melhor meu negócio."
            </CardContent>
            <CardDescription className="text-zinc-400 font-semibold">
              - Ricardo Mendes, Varejista Local
            </CardDescription>
          </Card>
        </div>
      </section>
      {/* Seção de FAQ (Perguntas Frequentes) */}
      <section className="py-16 px-4 sm:px-8 lg:px-16 bg-zinc-950">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-12">
          Perguntas Frequentes
        </h2>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Item de FAQ 1 */}
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">
              O Mini Dash é gratuito?
            </h3>
            <p className="text-zinc-300">
              Sim, o Mini Dash oferece um plano gratuito com funcionalidades
              essenciais para pequenos negócios. Planos pagos com recursos
              avançados estarão disponíveis em breve.
            </p>
          </div>
          {/* Item de FAQ 2 */}
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">
              Preciso de conhecimentos técnicos para usar?
            </h3>
            <p className="text-zinc-300">
              Não! O Mini Dash foi projetado para ser extremamente intuitivo e
              fácil de usar, mesmo para quem não tem experiência com sistemas de
              gestão.
            </p>
          </div>
          {/* Item de FAQ 3 */}
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">
              Meus dados estão seguros?
            </h3>
            <p className="text-zinc-300">
              Sim, a segurança dos seus dados é nossa prioridade. Utilizamos
              tecnologias de ponta e o Supabase para garantir a proteção de
              todas as suas informações.
            </p>
          </div>
        </div>
      </section>
      {/* CTA Final */}
      <section className="py-16 px-4 sm:px-8 lg:px-16 text-center bg-black">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
          Pronto para Transformar Seu Negócio?
        </h2>
        <p className="text-lg text-zinc-100 mb-8 max-w-2xl mx-auto">
          Comece hoje mesmo a gerenciar suas vendas e produtos de forma
          inteligente com o Mini Dash.
        </p>
        {user ? (
          <Button asChild size="lg">
            <Link href="/dashboard">Ir para o Dashboard</Link>
          </Button>
        ) : (
          <Button asChild size="lg">
            <Link href="/signup">Criar Minha Conta Grátis</Link>
          </Button>
        )}
      </section>
      {/* Rodapé */}
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
