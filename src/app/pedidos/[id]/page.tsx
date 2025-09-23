"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SimplePrintActions } from "@/components/print/SimplePrintActions";
import { ArrowLeft, Edit, Truck } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface PedidoDetalhes {
  id: string;
  numero: string;
  cliente: string;
  endereco?: string;
  valor: number;
  status: string;
  dataEntrega: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    email: string;
  };
  orcamento?: {
    numero: string;
  };
  itens: Array<{
    id: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
    observacoes?: string;
    produto: {
      id: string;
      codigo: string;
      nome: string;
      descricao?: string;
      categoria: string;
      unidade: string;
    };
  }>;
}

export default function PedidoDetalhesPage() {
  const params = useParams();
  const pedidoId = params.id as string;
  
  const [pedido, setPedido] = useState<PedidoDetalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPedido();
  }, [pedidoId]);

  const fetchPedido = async () => {
    try {
      const response = await fetch(`/api/pedidos/${pedidoId}`);
      if (response.ok) {
        const data = await response.json();
        setPedido(data);
      } else if (response.status === 404) {
        setError("Pedido não encontrado");
      } else {
        setError("Erro ao carregar pedido");
      }
    } catch (error) {
      console.error("Erro ao carregar pedido:", error);
      setError("Erro ao carregar pedido");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NOVO":
        return "bg-blue-100 text-blue-800";
      case "EM_PRODUCAO":
        return "bg-yellow-100 text-yellow-800";
      case "PRONTO":
        return "bg-green-100 text-green-800";
      case "ENTREGUE":
        return "bg-gray-100 text-gray-800";
      case "CANCELADO":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "NOVO":
        return "Novo";
      case "EM_PRODUCAO":
        return "Em Produção";
      case "PRONTO":
        return "Pronto";
      case "ENTREGUE":
        return "Entregue";
      case "CANCELADO":
        return "Cancelado";
      default:
        return status;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando pedido...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !pedido) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <Link href="/pedidos">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {error || "Pedido não encontrado"}
                </h3>
                <p className="text-gray-600 mb-4">
                  O pedido solicitado não foi encontrado ou você não tem permissão para visualizá-lo.
                </p>
                <Link href="/pedidos">
                  <Button>Voltar para Pedidos</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Link href="/pedidos">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Pedido {pedido.numero}
              </h1>
              <p className="text-gray-600">{pedido.cliente}</p>
            </div>
          </div>
          <Badge className={getStatusColor(pedido.status)}>
            {getStatusLabel(pedido.status)}
          </Badge>
        </div>

        {/* Informações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Cliente</p>
                <p className="text-lg">{pedido.cliente}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Vendedor</p>
                <p className="text-lg">{pedido.user?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Data do Pedido</p>
                <p className="text-lg">{formatDate(pedido.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Data de Entrega</p>
                <p className="text-lg">{formatDate(pedido.dataEntrega)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Valor Total</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(pedido.valor)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <Badge className={getStatusColor(pedido.status)}>
                  {getStatusLabel(pedido.status)}
                </Badge>
              </div>
              {pedido.endereco && (
                <div className="md:col-span-3">
                  <p className="text-sm font-medium text-gray-500">Endereço de Entrega</p>
                  <p className="text-lg">{pedido.endereco}</p>
                </div>
              )}
            </div>
            
            {pedido.orcamento && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Originado do orçamento:</strong> {pedido.orcamento.numero}
                </p>
              </div>
            )}

            {pedido.observacoes && (
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-500 mb-2">Observações</p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {pedido.observacoes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Itens do Pedido */}
        <Card>
          <CardHeader>
            <CardTitle>Itens do Pedido</CardTitle>
            <CardDescription>
              {pedido.itens.length} {pedido.itens.length === 1 ? 'item' : 'itens'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Produto</th>
                    <th className="text-right py-3 px-4">Qtd</th>
                    <th className="text-right py-3 px-4">Valor Unit.</th>
                    <th className="text-right py-3 px-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.itens.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{item.produto.nome}</p>
                          <p className="text-sm text-gray-500">
                            Código: {item.produto.codigo} | {item.produto.categoria}
                          </p>
                          {item.produto.descricao && (
                            <p className="text-sm text-gray-400">{item.produto.descricao}</p>
                          )}
                          {item.observacoes && (
                            <p className="text-sm text-blue-600 mt-1">
                              Obs: {item.observacoes}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="text-right py-3 px-4">
                        {item.quantidade} {item.produto.unidade}
                      </td>
                      <td className="text-right py-3 px-4">
                        {formatCurrency(item.valorUnitario)}
                      </td>
                      <td className="text-right py-3 px-4 font-medium">
                        {formatCurrency(item.valorTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300">
                    <td colSpan={3} className="text-right py-3 px-4 font-bold">
                      Total Geral:
                    </td>
                    <td className="text-right py-3 px-4 font-bold text-lg text-green-600">
                      {formatCurrency(pedido.valor)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              <SimplePrintActions
                data={{
                  tipo: 'pedido',
                  dados: {
                    numero: pedido.numero,
                    cliente: pedido.cliente,
                    endereco: pedido.endereco || undefined,
                    data: formatDate(pedido.createdAt),
                    status: getStatusLabel(pedido.status),
                    vendedor: pedido.user?.name || 'N/A',
                    observacoes: pedido.observacoes || undefined,
                    valor: pedido.valor,
                    itens: pedido.itens.map(item => ({
                      produto: item.produto.nome,
                      quantidade: item.quantidade,
                      valorUnitario: item.valorUnitario,
                      valorTotal: item.valorTotal,
                      observacoes: item.observacoes
                    }))
                  }
                }}
              />
              
              <Link href={`/pedidos/${pedido.id}/editar`}>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Pedido
                </Button>
              </Link>
              
              {(pedido.status === "PRONTO" || pedido.status === "EM_PRODUCAO") && (
                <Button>
                  <Truck className="mr-2 h-4 w-4" />
                  Marcar como Entregue
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
