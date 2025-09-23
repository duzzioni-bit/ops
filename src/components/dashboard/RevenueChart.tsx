"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Calendar, DollarSign } from "lucide-react";

interface RevenueData {
  period: string;
  faturamento: number;
  vendas: number;
  meta?: number;
}

interface RevenueChartProps {
  pedidos: Array<{
    id: string;
    valor: number;
    createdAt: string;
    status: string;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function RevenueChart({ pedidos }: RevenueChartProps) {
  const [weeklyData, setWeeklyData] = useState<RevenueData[]>([]);
  const [monthlyData, setMonthlyData] = useState<RevenueData[]>([]);
  const [yearlyData, setYearlyData] = useState<RevenueData[]>([]);
  const [statusData, setStatusData] = useState<Array<{name: string, value: number}>>([]);

  useEffect(() => {
    processRevenueData();
  }, [pedidos]);

  const processRevenueData = () => {
    // Processar dados semanais (últimas 8 semanas)
    const weeklyMap = new Map<string, { faturamento: number; vendas: number }>();
    const monthlyMap = new Map<string, { faturamento: number; vendas: number }>();
    const yearlyMap = new Map<string, { faturamento: number; vendas: number }>();
    const statusMap = new Map<string, number>();

    const now = new Date();
    const currentYear = now.getFullYear();

    // Inicializar últimas 8 semanas
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      const weekKey = `Sem ${Math.ceil((weekStart.getDate()) / 7)}-${(weekStart.getMonth() + 1).toString().padStart(2, '0')}`;
      weeklyMap.set(weekKey, { faturamento: 0, vendas: 0 });
    }

    // Inicializar últimos 12 meses
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(currentYear, now.getMonth() - i, 1);
      const monthKey = monthDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      monthlyMap.set(monthKey, { faturamento: 0, vendas: 0 });
    }

    // Inicializar últimos 3 anos
    for (let i = 2; i >= 0; i--) {
      const year = (currentYear - i).toString();
      yearlyMap.set(year, { faturamento: 0, vendas: 0 });
    }

    // Processar pedidos
    pedidos.forEach(pedido => {
      const date = new Date(pedido.createdAt);
      const valor = pedido.valor;

      // Status
      const status = pedido.status.replace('_', ' ').toLowerCase();
      statusMap.set(status, (statusMap.get(status) || 0) + valor);

      // Semanas (últimas 8 semanas)
      const weeksDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 7));
      if (weeksDiff >= 0 && weeksDiff < 8) {
        const weekNum = Math.ceil(date.getDate() / 7);
        const weekKey = `Sem ${weekNum}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        if (weeklyMap.has(weekKey)) {
          const current = weeklyMap.get(weekKey)!;
          weeklyMap.set(weekKey, {
            faturamento: current.faturamento + valor,
            vendas: current.vendas + 1
          });
        }
      }

      // Meses (últimos 12 meses)
      const monthsDiff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
      if (monthsDiff >= 0 && monthsDiff < 12) {
        const monthKey = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        if (monthlyMap.has(monthKey)) {
          const current = monthlyMap.get(monthKey)!;
          monthlyMap.set(monthKey, {
            faturamento: current.faturamento + valor,
            vendas: current.vendas + 1
          });
        }
      }

      // Anos (últimos 3 anos)
      const year = date.getFullYear().toString();
      if (yearlyMap.has(year)) {
        const current = yearlyMap.get(year)!;
        yearlyMap.set(year, {
          faturamento: current.faturamento + valor,
          vendas: current.vendas + 1
        });
      }
    });

    // Converter para arrays
    setWeeklyData(Array.from(weeklyMap.entries()).map(([period, data]) => ({
      period,
      faturamento: data.faturamento,
      vendas: data.vendas
    })));

    setMonthlyData(Array.from(monthlyMap.entries()).map(([period, data]) => ({
      period,
      faturamento: data.faturamento,
      vendas: data.vendas,
      meta: 50000 // Meta mensal exemplo
    })));

    setYearlyData(Array.from(yearlyMap.entries()).map(([period, data]) => ({
      period,
      faturamento: data.faturamento,
      vendas: data.vendas,
      meta: 600000 // Meta anual exemplo
    })));

    setStatusData(Array.from(statusMap.entries()).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    })));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getTrend = (data: RevenueData[]) => {
    if (data.length < 2) return { trend: "neutral", percentage: 0 };
    
    const current = data[data.length - 1]?.faturamento || 0;
    const previous = data[data.length - 2]?.faturamento || 0;
    
    if (previous === 0) return { trend: "neutral", percentage: 0 };
    
    const percentage = ((current - previous) / previous) * 100;
    return {
      trend: percentage > 0 ? "up" : percentage < 0 ? "down" : "neutral",
      percentage: Math.abs(percentage)
    };
  };

  const monthlyTrend = getTrend(monthlyData);
  const totalFaturamento = pedidos.reduce((sum, pedido) => sum + pedido.valor, 0);
  const totalVendas = pedidos.length;

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalFaturamento)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {monthlyTrend.trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : monthlyTrend.trend === "down" ? (
                <TrendingDown className="h-3 w-3 text-red-500" />
              ) : null}
              <span className={monthlyTrend.trend === "up" ? "text-green-500" : monthlyTrend.trend === "down" ? "text-red-500" : ""}>
                {monthlyTrend.percentage.toFixed(1)}% vs mês anterior
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalVendas}</div>
            <p className="text-xs text-muted-foreground">
              Pedidos confirmados
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
              {formatCurrency(totalVendas > 0 ? totalFaturamento / totalVendas : 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Por venda
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Análise de Faturamento
          </CardTitle>
          <CardDescription>
            Acompanhe a evolução das vendas confirmadas (pedidos) por período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monthly" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="weekly">Semanal</TabsTrigger>
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
              <TabsTrigger value="yearly">Anual</TabsTrigger>
              <TabsTrigger value="status">Por Status</TabsTrigger>
            </TabsList>

            <TabsContent value="weekly" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Faturamento Semanal</h3>
                <Badge variant="outline">Últimas 8 semanas</Badge>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), "Faturamento"]}
                    labelFormatter={(label) => `Período: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="faturamento" 
                    stroke="#0088FE" 
                    strokeWidth={2}
                    dot={{ fill: "#0088FE", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="monthly" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Faturamento Mensal</h3>
                <Badge variant="outline">Últimos 12 meses</Badge>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === "meta" ? formatCurrency(value) : formatCurrency(value), 
                      name === "meta" ? "Meta" : "Faturamento"
                    ]}
                    labelFormatter={(label) => `Mês: ${label}`}
                  />
                  <Bar dataKey="faturamento" fill="#00C49F" />
                  <Bar dataKey="meta" fill="#FF8042" opacity={0.3} />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="yearly" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Faturamento Anual</h3>
                <Badge variant="outline">Últimos 3 anos</Badge>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatCurrency(value), 
                      name === "meta" ? "Meta Anual" : "Faturamento"
                    ]}
                    labelFormatter={(label) => `Ano: ${label}`}
                  />
                  <Bar dataKey="faturamento" fill="#8884D8" />
                  <Bar dataKey="meta" fill="#FFBB28" opacity={0.3} />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="status" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Faturamento por Status</h3>
                <Badge variant="outline">Distribuição atual</Badge>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

