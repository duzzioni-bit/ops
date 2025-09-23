"use client";

import { useState, useEffect } from "react";
import { LandingOrDashboard } from "@/components/auth/LandingOrDashboard";
import { AppLayout } from "@/components/layout/AppLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  FileText, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  Target,
  Users
} from "lucide-react";
import Link from "next/link";
// Removido import de dados mock - usando dados reais da API

// Tipos para os dados da API
interface Orcamento {
  id: string;
  numero: string;
  cliente: string;
  valor: number;
  status: string;
  dataVencimento: string;
  createdAt: string;
}

interface Pedido {
  id: string;
  numero: string;
  cliente: string;
  valor: number;
  status: string;
  createdAt: string;
  dataEntrega: string;
  orcamentoId?: string;
}

export default function Dashboard() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Buscar dados reais das APIs
        const [orcamentosResponse, pedidosResponse] = await Promise.all([
          fetch('/api/orcamentos'),
          fetch('/api/pedidos')
        ]);

        // Tratar respostas das APIs - se não autenticado (401), usar arrays vazios
        let orcamentosData = [];
        let pedidosData = [];

        if (orcamentosResponse.ok) {
          orcamentosData = await orcamentosResponse.json();
        } else if (orcamentosResponse.status !== 401) {
          console.error('Erro ao buscar orçamentos:', orcamentosResponse.status);
        }

        if (pedidosResponse.ok) {
          pedidosData = await pedidosResponse.json();
        } else if (pedidosResponse.status !== 401) {
          console.error('Erro ao buscar pedidos:', pedidosResponse.status);
        }

        setOrcamentos(orcamentosData || []);
        setPedidos(pedidosData || []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        // Em caso de erro, definir arrays vazios
        setOrcamentos([]);
        setPedidos([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "bg-yellow-100 text-yellow-800";
      case "aprovado":
        return "bg-green-100 text-green-800";
      case "rejeitado":
        return "bg-red-100 text-red-800";
      case "convertido":
        return "bg-blue-100 text-blue-800";
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

  const totalOrcamentos = orcamentos.length;
  const totalVendasConfirmadas = pedidos.length; // Pedidos = Vendas Confirmadas
  const valorTotalOrcamentos = orcamentos.reduce((total, orc) => total + (orc.valor || 0), 0);
  const faturamentoConfirmado = pedidos.reduce((total, ped) => total + (ped.valor || 0), 0); // Faturamento real
  
  // Taxa de conversão baseada em pedidos que têm orcamentoId (convertidos de orçamentos)
  const pedidosConvertidos = pedidos.filter(p => p.orcamentoId || p.numero?.includes('ORC')).length;
  const taxaConversao = totalOrcamentos > 0 ? ((pedidosConvertidos / totalOrcamentos) * 100).toFixed(0) : 0;
  const ticketMedio = totalVendasConfirmadas > 0 ? faturamentoConfirmado / totalVendasConfirmadas : 0;

  console.log('Dashboard Data:', {
    totalOrcamentos,
    totalVendasConfirmadas, 
    faturamentoConfirmado,
    pedidos: pedidos.map(p => ({ numero: p.numero, valor: p.valor, status: p.status }))
  });

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const DashboardContent = () => (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600">Visão geral de orçamentos e vendas confirmadas (pedidos)</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/orcamentos/novo">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Orçamento
              </Button>
            </Link>
            <Link href="/pedidos/novo">
              <Button className="bg-green-600 hover:bg-green-700">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova Venda
              </Button>
            </Link>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <MetricCard
            title="ORÇAMENTOS ATIVOS"
            value={totalOrcamentos}
            change={totalOrcamentos > 0 ? "Ativo" : "Nenhum"}
            changeType={totalOrcamentos > 0 ? "positive" : "neutral"}
            trend={totalOrcamentos > 0 ? "up" : "neutral"}
            icon={FileText}
            iconColor="text-blue-600"
          />
          <MetricCard
            title="VENDAS CONFIRMADAS"
            value={totalVendasConfirmadas}
            change={totalVendasConfirmadas > 0 ? `${totalVendasConfirmadas} vendas` : "Nenhuma"}
            changeType={totalVendasConfirmadas > 0 ? "positive" : "neutral"}
            trend={totalVendasConfirmadas > 0 ? "up" : "neutral"}
            icon={CheckCircle}
            iconColor="text-green-600"
          />
          <MetricCard
            title="FATURAMENTO REAL"
            value={formatCurrency(faturamentoConfirmado)}
            change={faturamentoConfirmado > 0 ? "Confirmado" : "Aguardando vendas"}
            changeType={faturamentoConfirmado > 0 ? "positive" : "neutral"}
            trend={faturamentoConfirmado > 0 ? "up" : "neutral"}
            icon={DollarSign}
            iconColor="text-green-600"
          />
          <MetricCard
            title="TICKET MÉDIO"
            value={formatCurrency(ticketMedio)}
            change={ticketMedio > 0 ? "Por venda" : "Sem dados"}
            changeType={ticketMedio > 0 ? "positive" : "neutral"}
            trend={ticketMedio > 0 ? "up" : "neutral"}
            icon={Target}
            iconColor="text-purple-600"
          />
          <MetricCard
            title="TAXA DE CONVERSÃO"
            value={`${taxaConversao}%`}
            change={totalOrcamentos > 0 ? "Orç. → Vendas" : "Sem dados"}
            changeType={Number(taxaConversao) > 0 ? "positive" : "neutral"}
            trend={Number(taxaConversao) > 0 ? "up" : "neutral"}
            icon={TrendingUp}
            iconColor="text-orange-600"
          />
        </div>

        {/* Gráficos de Faturamento */}
        {pedidos.length > 0 ? (
          <RevenueChart pedidos={pedidos.map(p => ({
            id: p.id,
            valor: p.valor,
            createdAt: p.createdAt,
            status: p.status
          }))} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Análise de Faturamento
              </CardTitle>
              <CardDescription>
                Gráficos de faturamento aparecerão aqui quando houver vendas confirmadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="p-4 rounded-full bg-gray-100 mb-4">
                  <TrendingUp className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Nenhuma venda confirmada ainda
                </h3>
                <p className="text-gray-500 mb-4">
                  Crie sua primeira venda para ver os gráficos de faturamento
                </p>
                <Link href="/pedidos/novo">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Criar Primeira Venda
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orçamentos Recentes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg font-semibold">Novos Orçamentos Solicitados</CardTitle>
                <CardDescription>Últimos orçamentos criados no sistema</CardDescription>
              </div>
              <Badge variant="secondary" className="text-blue-600 bg-blue-50">
                {totalOrcamentos} total
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orcamentos.slice(0, 5).map((orcamento) => (
                      <TableRow key={orcamento.id}>
                        <TableCell className="font-medium">{orcamento.numero}</TableCell>
                        <TableCell>{orcamento.cliente}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrency(orcamento.valor)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(orcamento.status)}>
                            {orcamento.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/orcamentos/${orcamento.id}`}>
                            <Button variant="ghost" size="sm">
                              Ver detalhes
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="flex justify-center pt-4">
                  <Link href="/orcamentos">
                    <Button variant="outline" className="w-full">
                      Ver todos os orçamentos
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status das Vendas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg font-semibold">Status das Vendas Confirmadas</CardTitle>
                <CardDescription>Acompanhamento em tempo real</CardDescription>
              </div>
              <Badge variant="secondary" className="text-green-600 bg-green-50">
                {totalVendasConfirmadas} vendas
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-blue-50">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Em Produção</p>
                      <p className="text-lg font-bold text-gray-900">
                        {pedidos.filter(p => p.status === "em_producao").length}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Entregues</p>
                      <p className="text-lg font-bold text-gray-900">
                        {pedidos.filter(p => p.status === "entregue").length}
                      </p>
                    </div>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Venda</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pedidos.slice(0, 3).map((pedido) => (
                      <TableRow key={pedido.id}>
                        <TableCell className="font-medium">{pedido.numero}</TableCell>
                        <TableCell>{pedido.cliente}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(pedido.status)}>
                            {pedido.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {formatCurrency(pedido.valor)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex justify-center pt-4">
                  <Link href="/pedidos">
                    <Button variant="outline" className="w-full">
                      Ver todas as vendas
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );

  return (
    <LandingOrDashboard>
      <DashboardContent />
    </LandingOrDashboard>
  );
}