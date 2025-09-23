"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Plus, Eye, Edit, Truck, Trash2 } from "lucide-react";
import { SimplePrintActions } from "@/components/print/SimplePrintActions";
import Link from "next/link";

interface Pedido {
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
  };
  itens?: Array<{
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
    observacoes?: string;
    produto: {
      nome: string;
      codigo: string;
    };
  }>;
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      const response = await fetch('/api/pedidos');
      if (response.ok) {
        const data = await response.json();
        setPedidos(data);
      } else {
        console.error('Erro ao carregar pedidos');
      }
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "novo":
        return "bg-blue-100 text-blue-800";
      case "em_producao":
        return "bg-yellow-100 text-yellow-800";
      case "pronto":
        return "bg-green-100 text-green-800";
      case "entregue":
        return "bg-gray-100 text-gray-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "novo":
        return "Novo";
      case "em_producao":
        return "Em Produção";
      case "pronto":
        return "Pronto";
      case "entregue":
        return "Entregue";
      case "cancelado":
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

  const handleDeletePedido = async (pedidoId: string, numeroPedido: string) => {
    if (!confirm(`Tem certeza que deseja excluir o pedido ${numeroPedido}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/pedidos?id=${pedidoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Pedido excluído com sucesso!');
        fetchPedidos(); // Recarregar lista
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao excluir pedido');
      }
    } catch (error) {
      console.error('Erro ao excluir pedido:', error);
      alert('Erro ao excluir pedido');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando pedidos...</p>
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
          title="Pedidos" 
          subtitle="Acompanhe todos os seus pedidos"
        >
          <Link href="/pedidos/novo">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Novo Pedido
            </Button>
          </Link>
        </PageHeader>

        {/* Main Content */}
        <div>
        {pedidos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum pedido encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  Comece criando seu primeiro pedido
                </p>
                <Link href="/pedidos/novo">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Pedido
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <Card key={pedido.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{pedido.numero}</CardTitle>
                      <CardDescription className="text-base">
                        {pedido.cliente}
                      </CardDescription>
                      {pedido.orcamentoId && (
                        <p className="text-sm text-blue-600">
                          Originado do orçamento #{pedido.orcamentoId}
                        </p>
                      )}
                    </div>
                    <Badge className={getStatusColor(pedido.status)}>
                      {getStatusLabel(pedido.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Valor</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(pedido.valor)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Vendedor</p>
                      <p className="text-sm">{pedido.user?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Entrega</p>
                      <p className="text-sm">{pedido.dataEntrega}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <p className="text-sm">{getStatusLabel(pedido.status)}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <SimplePrintActions
                      data={{
                        tipo: 'pedido',
                        dados: {
                          numero: pedido.numero,
                          cliente: pedido.cliente,
                          endereco: pedido.endereco || undefined,
                          data: new Date(pedido.createdAt).toLocaleDateString('pt-BR'),
                          status: getStatusLabel(pedido.status),
                          vendedor: pedido.user?.name || 'N/A',
                          observacoes: pedido.observacoes || undefined,
                          valor: pedido.valor,
                          itens: (pedido.itens || []).map(item => ({
                            produto: item.produto.nome,
                            quantidade: item.quantidade,
                            valorUnitario: item.valorUnitario,
                            valorTotal: item.valorTotal,
                            observacoes: item.observacoes
                          }))
                        }
                      }}
                      className="mr-2"
                    />
                    <Link href={`/pedidos/${pedido.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </Button>
                    </Link>
                    <Link href={`/pedidos/${pedido.id}/editar`}>
                      <Button size="sm" variant="outline">
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeletePedido(pedido.id, pedido.numero)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                    {(pedido.status === "pronto" || pedido.status === "em_producao") && (
                      <Button size="sm">
                        <Truck className="mr-2 h-4 w-4" />
                        Marcar como Entregue
                      </Button>
                    )}
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
