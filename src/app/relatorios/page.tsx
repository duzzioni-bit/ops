"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { ExportButton } from "@/components/reports/ExportButton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { 
  FileText, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Users,
  Package,
  Target,
  Clock
} from "lucide-react";

interface Orcamento {
  id: string;
  numero: string;
  cliente: string;
  valor: number;
  status: string;
  createdAt: string;
  dataVencimento: string;
}

interface Pedido {
  id: string;
  numero: string;
  cliente: string;
  valor: number;
  status: string;
  createdAt: string;
  dataEntrega: string;
}

interface Produto {
  id: string;
  nome: string;
  codigo: string;
  categoria: string;
  preco: number;
}

interface ProdutoMaisVendido {
  id: string;
  nome: string;
  codigo: string;
  categoria: string;
  precoBase: number;
  unidade: string;
  totalQuantidade: number;
  totalReceita: number;
  numeroVendas: number;
  precoMedio: number;
  participacao: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function RelatoriosPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtosMaisVendidos, setProdutosMaisVendidos] = useState<ProdutoMaisVendido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroData, setFiltroData] = useState("30"); // últimos 30 dias
  const [filtroStatus, setFiltroStatus] = useState("todos");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadProdutosMaisVendidos();
  }, [filtroData]);

  const loadData = async () => {
    try {
      const [orcamentosRes, pedidosRes, produtosRes] = await Promise.all([
        fetch('/api/orcamentos'),
        fetch('/api/pedidos'),
        fetch('/api/produtos')
      ]);

      const [orcamentosData, pedidosData, produtosData] = await Promise.all([
        orcamentosRes.json(),
        pedidosRes.json(),
        produtosRes.json()
      ]);

      setOrcamentos(orcamentosData || []);
      setPedidos(pedidosData || []);
      setProdutos(produtosData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProdutosMaisVendidos = async () => {
    try {
      const response = await fetch(`/api/relatorios/produtos-mais-vendidos?dias=${filtroData}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setProdutosMaisVendidos(data.produtos || []);
      }
    } catch (error) {
      console.error("Erro ao carregar produtos mais vendidos:", error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Filtrar dados por período
  const filtrarPorPeriodo = (data: any[]) => {
    const dias = parseInt(filtroData);
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - dias);
    
    return data.filter(item => new Date(item.createdAt) >= dataLimite);
  };

  // Dados filtrados
  const orcamentosFiltrados = filtrarPorPeriodo(orcamentos);
  const pedidosFiltrados = filtrarPorPeriodo(pedidos);

  // Métricas gerais
  const totalOrcamentos = orcamentosFiltrados.length;
  const totalPedidos = pedidosFiltrados.length;
  const faturamentoTotal = pedidosFiltrados.reduce((sum, p) => sum + p.valor, 0);
  const valorOrcamentos = orcamentosFiltrados.reduce((sum, o) => sum + o.valor, 0);
  const taxaConversao = totalOrcamentos > 0 ? (totalPedidos / totalOrcamentos * 100).toFixed(1) : "0";

  // Dados para gráficos
  const dadosStatusOrcamentos = [
    { name: 'Pendente', value: orcamentosFiltrados.filter(o => o.status === 'PENDENTE').length, color: '#FFBB28' },
    { name: 'Aprovado', value: orcamentosFiltrados.filter(o => o.status === 'APROVADO').length, color: '#00C49F' },
    { name: 'Rejeitado', value: orcamentosFiltrados.filter(o => o.status === 'REJEITADO').length, color: '#FF8042' },
    { name: 'Convertido', value: orcamentosFiltrados.filter(o => o.status === 'CONVERTIDO').length, color: '#0088FE' },
  ].filter(item => item.value > 0);

  const dadosStatusPedidos = [
    { name: 'Novo', value: pedidosFiltrados.filter(p => p.status === 'NOVO').length, color: '#0088FE' },
    { name: 'Em Produção', value: pedidosFiltrados.filter(p => p.status === 'EM_PRODUCAO').length, color: '#FFBB28' },
    { name: 'Pronto', value: pedidosFiltrados.filter(p => p.status === 'PRONTO').length, color: '#00C49F' },
    { name: 'Entregue', value: pedidosFiltrados.filter(p => p.status === 'ENTREGUE').length, color: '#82CA9D' },
    { name: 'Cancelado', value: pedidosFiltrados.filter(p => p.status === 'CANCELADO').length, color: '#FF8042' },
  ].filter(item => item.value > 0);

  // Faturamento por mês
  const faturamentoPorMes = () => {
    const meses = {};
    pedidosFiltrados.forEach(pedido => {
      const data = new Date(pedido.createdAt);
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      const nomeMs = data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      
      if (!meses[chave]) {
        meses[chave] = { mes: nomeMs, valor: 0, vendas: 0 };
      }
      meses[chave].valor += pedido.valor;
      meses[chave].vendas += 1;
    });

    return Object.values(meses).sort((a: any, b: any) => a.mes.localeCompare(b.mes));
  };

  // Top clientes
  const topClientes = () => {
    const clientes = {};
    [...orcamentosFiltrados, ...pedidosFiltrados].forEach(item => {
      if (!clientes[item.cliente]) {
        clientes[item.cliente] = { nome: item.cliente, orcamentos: 0, pedidos: 0, valorTotal: 0 };
      }
      
      if ('dataVencimento' in item) {
        clientes[item.cliente].orcamentos += 1;
      } else {
        clientes[item.cliente].pedidos += 1;
      }
      clientes[item.cliente].valorTotal += item.valor;
    });

    return Object.values(clientes)
      .sort((a: any, b: any) => b.valorTotal - a.valorTotal)
      .slice(0, 10);
  };

  // Dados para gráfico de produtos mais vendidos
  const dadosGraficoProdutos = produtosMaisVendidos.slice(0, 10).map(produto => ({
    nome: produto.nome.length > 15 ? produto.nome.substring(0, 15) + '...' : produto.nome,
    quantidade: produto.totalQuantidade,
    receita: produto.totalReceita,
    participacao: produto.participacao
  }));

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">Carregando relatórios...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader 
          title="Relatórios e Análises"
          subtitle="Análise completa de vendas, orçamentos e performance"
        />

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium">Período</label>
                <Select value={filtroData} onValueChange={setFiltroData}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="90">Últimos 3 meses</SelectItem>
                    <SelectItem value="180">Últimos 6 meses</SelectItem>
                    <SelectItem value="365">Último ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium">Status</label>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pendente">Pendentes</SelectItem>
                    <SelectItem value="aprovado">Aprovados</SelectItem>
                    <SelectItem value="entregue">Entregues</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ExportButton 
                data={[...orcamentosFiltrados, ...pedidosFiltrados]}
                filename={`relatorio_${filtroData}dias`}
                title="Relatório Geral"
              />
            </div>
          </CardContent>
        </Card>

        {/* Métricas Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orçamentos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrcamentos}</div>
              <p className="text-xs text-muted-foreground">
                Valor: {formatCurrency(valorOrcamentos)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalPedidos}</div>
              <p className="text-xs text-muted-foreground">
                Pedidos confirmados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(faturamentoTotal)}</div>
              <p className="text-xs text-muted-foreground">
                Vendas confirmadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa Conversão</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{taxaConversao}%</div>
              <p className="text-xs text-muted-foreground">
                Orçamentos → Vendas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(totalPedidos > 0 ? faturamentoTotal / totalPedidos : 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Por venda
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs com diferentes relatórios */}
        <Tabs defaultValue="vendas" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="vendas">Vendas</TabsTrigger>
            <TabsTrigger value="orcamentos">Orçamentos</TabsTrigger>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
          </TabsList>

          <TabsContent value="vendas" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Faturamento por Mês */}
              <Card>
                <CardHeader>
                  <CardTitle>Faturamento Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={faturamentoPorMes()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis tickFormatter={(value) => `R$ ${value}`} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Area type="monotone" dataKey="valor" stroke="#0088FE" fill="#0088FE" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Status dos Pedidos */}
              <Card>
                <CardHeader>
                  <CardTitle>Status das Vendas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dadosStatusPedidos}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dadosStatusPedidos.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orcamentos" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status dos Orçamentos */}
              <Card>
                <CardHeader>
                  <CardTitle>Status dos Orçamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dadosStatusOrcamentos}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dadosStatusOrcamentos.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Lista de Orçamentos */}
              <Card>
                <CardHeader>
                  <CardTitle>Orçamentos Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orcamentosFiltrados.slice(0, 5).map((orcamento) => (
                        <TableRow key={orcamento.id}>
                          <TableCell>{orcamento.numero}</TableCell>
                          <TableCell>{orcamento.cliente}</TableCell>
                          <TableCell>{formatCurrency(orcamento.valor)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{orcamento.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clientes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Clientes</CardTitle>
                <CardDescription>Clientes com maior volume de negócios</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Orçamentos</TableHead>
                      <TableHead>Vendas</TableHead>
                      <TableHead>Valor Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topClientes().map((cliente: any, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{cliente.nome}</TableCell>
                        <TableCell>{cliente.orcamentos}</TableCell>
                        <TableCell>{cliente.pedidos}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrency(cliente.valorTotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="produtos" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico Top 10 Produtos */}
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Produtos Mais Vendidos</CardTitle>
                  <CardDescription>Quantidade vendida por produto</CardDescription>
                </CardHeader>
                <CardContent>
                  {dadosGraficoProdutos.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dadosGraficoProdutos} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis 
                          type="category" 
                          dataKey="nome" 
                          width={100}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                          formatter={(value: number, name: string) => [
                            name === "quantidade" ? `${value} unidades` : formatCurrency(value),
                            name === "quantidade" ? "Quantidade" : "Receita"
                          ]}
                        />
                        <Bar dataKey="quantidade" fill="#0088FE" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <p className="text-gray-500">Nenhum dado de vendas disponível</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Gráfico de Participação */}
              <Card>
                <CardHeader>
                  <CardTitle>Participação no Faturamento</CardTitle>
                  <CardDescription>% de participação na receita total</CardDescription>
                </CardHeader>
                <CardContent>
                  {dadosGraficoProdutos.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={dadosGraficoProdutos}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ nome, participacao }) => `${nome} ${participacao.toFixed(1)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="participacao"
                        >
                          {dadosGraficoProdutos.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [`${value.toFixed(1)}%`, "Participação"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <p className="text-gray-500">Nenhum dado de participação disponível</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Tabela Detalhada */}
            <Card>
              <CardHeader>
                <CardTitle>Ranking Detalhado de Produtos</CardTitle>
                <CardDescription>
                  Análise completa dos produtos mais vendidos nos últimos {filtroData} dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                {produtosMaisVendidos.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Qtd Vendida</TableHead>
                        <TableHead>Nº Vendas</TableHead>
                        <TableHead>Preço Médio</TableHead>
                        <TableHead>Receita Total</TableHead>
                        <TableHead>Participação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {produtosMaisVendidos.map((produto, index) => (
                        <TableRow key={produto.id}>
                          <TableCell className="font-bold text-blue-600">
                            #{index + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div>
                              <p className="font-semibold">{produto.nome}</p>
                              <p className="text-xs text-gray-500">Cód: {produto.codigo}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{produto.categoria}</Badge>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {produto.totalQuantidade} {produto.unidade}
                          </TableCell>
                          <TableCell>{produto.numeroVendas}</TableCell>
                          <TableCell>{formatCurrency(produto.precoMedio)}</TableCell>
                          <TableCell className="font-semibold text-green-600">
                            {formatCurrency(produto.totalReceita)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-12 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${Math.min(produto.participacao, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">
                                {produto.participacao.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">
                      Nenhum produto vendido no período selecionado
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
