"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default function HeaderLanding() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="flex sm:justify-between space-x-4 justify-center items-center px-6 md:px-20 py-4 bg-transparent absolute top-0 left-0 z-20 w-full">
      <div className="flex items-center gap-2">
        <Globe className="text-white size-8 md:size-9" />
        <h1 className="text-white font-bold hidden text-2xl md:block italic">
          Mini Dash
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <Button>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        ) : (
          <>
            <Button variant="secondary">
              <Link href="/login">Login</Link>
            </Button>
            <Button>
              <Link href="/signup">Criar Conta</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
