"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { SimplePrintActions } from "@/components/print/SimplePrintActions";
import { ArrowLeft, Edit, Truck, Trash2 } from "lucide-react";
import Link from "next/link";

interface OrcamentoDetalhes {
  id: string;
  numero: string;
  cliente: string;
  endereco?: string;
  valor: number;
  status: string;
  dataVencimento: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    email: string;
  };
  itens: Array<{
    id: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
    observacoes?: string;
    produto?: string; // Campo legado para compatibilidade
    produtoRef?: {
      id: string;
      nome: string;
      codigo: string;
    };
  }>;
}

interface DetalhesOrcamentoProps {
  params: Promise<{ id: string }>;
}

export default function DetalhesOrcamentoPage({ params }: DetalhesOrcamentoProps) {
  const router = useRouter();
  const [orcamento, setOrcamento] = useState<OrcamentoDetalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrcamento() {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/orcamentos/${resolvedParams.id}`);
        
        if (response.ok) {
          const data: OrcamentoDetalhes = await response.json();
          setOrcamento(data);
        } else {
          setError("Orçamento não encontrado");
        }
      } catch (err) {
        console.error("Erro ao carregar orçamento:", err);
        setError("Erro ao carregar orçamento");
      } finally {
        setLoading(false);
      }
    }

    loadOrcamento();
  }, [params]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      PENDENTE: "Pendente",
      APROVADO: "Aprovado",
      REJEITADO: "Rejeitado",
      CANCELADO: "Cancelado"
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      PENDENTE: "bg-yellow-100 text-yellow-800",
      APROVADO: "bg-green-100 text-green-800",
      REJEITADO: "bg-red-100 text-red-800",
      CANCELADO: "bg-gray-100 text-gray-800"
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  const handleConvertToPedido = async () => {
    if (!orcamento) return;

    if (!confirm(`Tem certeza que deseja converter o orçamento ${orcamento.numero} em pedido?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/orcamentos/${orcamento.id}/converter`, {
        method: 'POST',
      });

      if (response.ok) {
        const novoPedido = await response.json();
        alert(`Orçamento convertido com sucesso! Pedido ${novoPedido.numero} criado.`);
        router.push(`/pedidos/${novoPedido.id}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao converter orçamento');
      }
    } catch (err) {
      console.error('Erro ao converter orçamento:', err);
      alert('Erro ao converter orçamento');
    }
  };

  const handleDeleteOrcamento = async () => {
    if (!orcamento) return;

    if (!confirm(`Tem certeza que deseja excluir o orçamento ${orcamento.numero}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/orcamentos/${orcamento.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Orçamento excluído com sucesso!');
        router.push('/orcamentos');
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
        <div className="flex items-center justify-center h-64">
          <div className="text-center">Carregando...</div>
        </div>
      </AppLayout>
    );
  }

  if (error || !orcamento) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-red-600">{error || "Orçamento não encontrado"}</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader 
          title={`Orçamento ${orcamento.numero}`}
          subtitle={`Cliente: ${orcamento.cliente}`}
        />

        <div className="flex items-center gap-4 mb-6">
          <Link href="/orcamentos">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Detalhes do Orçamento
              <Badge className={getStatusColor(orcamento.status)}>
                {getStatusLabel(orcamento.status)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Cliente</p>
                <p className="text-lg">{orcamento.cliente}</p>
              </div>
              {orcamento.endereco && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Endereço</p>
                  <p className="text-lg">{orcamento.endereco}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Vendedor</p>
                <p className="text-lg">{orcamento.user?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Data de Criação</p>
                <p className="text-lg">{formatDate(orcamento.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Vencimento</p>
                <p className="text-lg">{formatDate(orcamento.dataVencimento)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Valor Total</p>
                <p className="text-lg font-semibold text-green-600">
                  R$ {orcamento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {orcamento.observacoes && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Observações</p>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm">{orcamento.observacoes}</p>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-4">Itens do Orçamento</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Produto</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Código</th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 border-b">Qtd</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 border-b">Valor Unit.</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 border-b">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orcamento.itens.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="px-4 py-2 text-sm">{item.produtoRef?.nome || item.produto || 'Produto não encontrado'}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{item.produtoRef?.codigo || 'N/A'}</td>
                        <td className="px-4 py-2 text-sm text-center">{item.quantidade}</td>
                        <td className="px-4 py-2 text-sm text-right">
                          R$ {item.valorUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-2 text-sm text-right font-medium">
                          R$ {item.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <SimplePrintActions
                data={{
                  tipo: 'orçamento',
                  dados: {
                    numero: orcamento.numero,
                    cliente: orcamento.cliente,
                    endereco: orcamento.endereco || undefined,
                    data: formatDate(orcamento.createdAt),
                    dataVencimento: formatDate(orcamento.dataVencimento),
                    status: getStatusLabel(orcamento.status),
                    vendedor: orcamento.user?.name || 'N/A',
                    observacoes: orcamento.observacoes || undefined,
                    valor: orcamento.valor,
                    itens: orcamento.itens.map(item => ({
                      produto: item.produtoRef?.nome || item.produto || 'Produto não encontrado',
                      quantidade: item.quantidade,
                      valorUnitario: item.valorUnitario,
                      valorTotal: item.valorTotal,
                      observacoes: item.observacoes
                    }))
                  }
                }}
              />
              
              <Link href={`/orcamentos/${orcamento.id}/editar`}>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Orçamento
                </Button>
              </Link>
              
              {orcamento.status === "APROVADO" && (
                <Button onClick={handleConvertToPedido}>
                  <Truck className="mr-2 h-4 w-4" />
                  Converter em Pedido
                </Button>
              )}

              <Button 
                variant="outline" 
                onClick={handleDeleteOrcamento}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Orçamento
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
