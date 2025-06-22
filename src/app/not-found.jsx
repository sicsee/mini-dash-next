export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-white space-y-5">
      <div className="flex items-center justify-center gap-5">
        <h1 className="text-6xl font-bold ">404</h1>
        <div className="w-0.5 h-15 bg-white"></div>
        <p className="text-xl">Página não encontrada</p>
      </div>
      <a href="/" className="text-blue-400 hover:underline">
        Voltar para a página inicial
      </a>
    </main>
  );
}
