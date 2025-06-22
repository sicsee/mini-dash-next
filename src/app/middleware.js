// middleware.js
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  // Lista de rotas protegidas
  const protectedRoutes = ['/dashboard']; // Adicione outras rotas protegidas aqui
  const loginRoute = '/login';

  // Verifica se a rota atual é protegida
  const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route));

  // Se a rota for protegida e não houver sessão, redirecione para o login
  if (isProtectedRoute && !session) {
    // Redireciona para a página de login
    const redirectUrl = new URL(loginRoute, req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Para todas as outras requisições (não protegidas ou autenticadas), continue
  return res;
}

// Configura quais rotas o middleware deve ser executado
export const config = {
  matcher: [
    '/dashboard/:path*', // Aplica o middleware a /dashboard e suas sub-rotas
    '/login', // Você pode adicionar /login aqui para redirecionar usuários logados
    '/signup', // Você pode adicionar /signup aqui para redirecionar usuários logados
  ],
};