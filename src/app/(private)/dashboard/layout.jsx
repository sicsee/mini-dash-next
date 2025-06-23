import { Sidebar } from "@/components/Sidebar";

export default function DashLayout({ children }) {
  return (
    <div className="flex-col sm:flex">
      <Sidebar />
      <main className="sm:ml-14 p-4.5 flex flex-col transition-all bg-background">
        {children}
      </main>
    </div>
  );
}
