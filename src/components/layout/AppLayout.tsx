"use client";

import { Sidebar } from "./Sidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

interface AppLayoutProps {
  children: React.ReactNode;
  requiredRole?: "ADMIN" | "GERENTE" | "VENDEDOR";
}

export function AppLayout({ children, requiredRole }: AppLayoutProps) {
  return (
    <ProtectedRoute requiredRole={requiredRole}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
