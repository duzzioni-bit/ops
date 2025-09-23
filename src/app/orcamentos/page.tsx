'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, PlusCircle, Eye, Edit, Trash2 } from 'lucide-react'
import { SimplePrintActions } from '@/components/print/SimplePrintActions'
import { PageHeader } from '@/components/ui/page-header'
import Link from 'next/link'

interface Orcamento {
  id: string
  numero: string
  cliente: string
  valor: number
  status: string
  dataVencimento: string
  observacoes?: string
  createdAt: string
  user?: {
    name: string
    email: string
  }
  itens: any[]
}

export default function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrcamentos()
  }, [])

  const fetchOrcamentos = async () => {
    try {
      const response = await fetch('/api/orcamentos')
      if (response.ok) {
        const data = await response.json()
        setOrcamentos(data)
      }
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'PENDENTE': 'bg-yellow-100 text-yellow-800',
      'APROVADO': 'bg-green-100 text-green-800',
      'REJEITADO': 'bg-red-100 text-red-800',
      'CONVERTIDO': 'bg-blue-100 text-blue-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      'PENDENTE': 'Pendente',
      'APROVADO': 'Aprovado',
      'REJEITADO': 'Rejeitado',
      'CONVERTIDO': 'Convertido'
    }
    return labels[status as keyof typeof labels] || status
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleConvertToPedido = async (orcamentoId: string, numeroOrcamento: string) => {
    if (!confirm(`Tem certeza que deseja converter o orçamento ${numeroOrcamento} em pedido?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/orcamentos/${orcamentoId}/converter`, {
        method: 'POST',
      });

      if (response.ok) {
        const novoPedido = await response.json();
        alert(`Orçamento convertido com sucesso! Pedido ${novoPedido.numero} criado.`);
        // Atualizar a lista de orçamentos
        fetchOrcamentos();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao converter orçamento');
      }
    } catch (err) {
      console.error('Erro ao converter orçamento:', err);
      alert('Erro ao converter orçamento');
    }
  };

  const handleDeleteOrcamento = async (orcamentoId: string, numeroOrcamento: string) => {
    if (!confirm(`Tem certeza que deseja excluir o orçamento ${numeroOrcamento}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/orcamentos/${orcamentoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Orçamento excluído com sucesso!');
        // Atualizar a lista de orçamentos
        fetchOrcamentos();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao excluir orçamento');
      }
    } catch (err) {
      console.error('Erro ao excluir orçamento:', err);
      alert('Erro ao excluir orçamento');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando orçamentos...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <PageHeader 
          title="Orçamentos" 
          subtitle="Gerencie todos os seus orçamentos"
        >
          <Link href="/orcamentos/novo">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Novo Orçamento
            </Button>
          </Link>
        </PageHeader>

        {/* Main Content */}
        <div>
        {orcamentos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum orçamento encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  Comece criando seu primeiro orçamento
                </p>
                <Link href="/orcamentos/novo">
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Criar Orçamento
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orcamentos.map((orcamento) => (
              <Card key={orcamento.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{orcamento.numero}</CardTitle>
                      <CardDescription className="text-base">
                        {orcamento.cliente}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(orcamento.status)}>
                      {getStatusLabel(orcamento.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Valor</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(orcamento.valor)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Vendedor</p>
                      <p className="text-sm">{orcamento.user?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Vencimento</p>
                      <p className="text-sm">{orcamento.dataVencimento}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Itens</p>
                      <p className="text-sm">{orcamento.itens.length} produto(s)</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <SimplePrintActions
                      data={{
                        tipo: 'orcamento',
                        dados: {
                          numero: orcamento.numero,
                          cliente: orcamento.cliente,
                          data: new Date().toLocaleDateString('pt-BR'),
                          dataVencimento: orcamento.dataVencimento,
                          status: orcamento.status.toUpperCase(),
                          vendedor: orcamento.user?.name || 'N/A',
                          observacoes: orcamento.observacoes || undefined,
                          valor: orcamento.valor,
                          itens: orcamento.itens || []
                        }
                      }}
                      className="mr-2"
                    />
                    
                    <Link href={`/orcamentos/${orcamento.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </Button>
                    </Link>
                    <Link href={`/orcamentos/${orcamento.id}/editar`}>
                      <Button size="sm" variant="outline">
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                    </Link>
                    {orcamento.status === "APROVADO" && (
                      <Button size="sm" onClick={() => handleConvertToPedido(orcamento.id, orcamento.numero)}>
                        Converter em Pedido
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteOrcamento(orcamento.id, orcamento.numero)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>
    </AppLayout>
  );
}
