'use client'

import { AppLayout } from '@/components/layout/AppLayout'

export default function ProdutosPageSimple() {
  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
        <p className="text-gray-600">Página de produtos funcionando!</p>
        <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded">
          <p className="text-green-800">✅ Sistema funcionando corretamente!</p>
        </div>
      </div>
    </AppLayout>
  )
}

