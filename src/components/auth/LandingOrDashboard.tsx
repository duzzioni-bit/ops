"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import LandingPage from "@/app/landing/page";

interface LandingOrDashboardProps {
  children: React.ReactNode;
}

export function LandingOrDashboard({ children }: LandingOrDashboardProps) {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Evitar hidration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Mostrar loading enquanto verifica sessão
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, mostrar landing page
  if (!session) {
    return <LandingPage />;
  }

  // Se está autenticado, mostrar dashboard
  return <>{children}</>;
}

















