"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductSelector } from "@/components/forms/ProductSelector";
import { Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ItemSelecionado {
  produtoId: string;
  produto: any;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  observacoes?: string;
}

export default function NovoPedidoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [itens, setItens] = useState<ItemSelecionado[]>([]);
  const [formData, setFormData] = useState({
    cliente: "",
    endereco: "",
    dataEntrega: "",
    observacoes: "",
    status: "novo" as "novo" | "em_producao" | "pronto" | "entregue" | "cancelado"
  });

  const valorTotal = itens.reduce((sum, item) => sum + item.valorTotal, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (itens.length === 0) {
      alert('Adicione pelo menos um produto ao pedido');
      return;
    }

    setLoading(true);

    try {
      const dadosPedido = {
        cliente: formData.cliente,
        endereco: formData.endereco || undefined,
        valor: valorTotal,
        status: formData.status,
        dataEntrega: formData.dataEntrega,
        observacoes: formData.observacoes || undefined,
        itens: itens.map(item => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
          valorTotal: item.valorTotal,
          observacoes: item.observacoes || undefined
        }))
      };

      console.log('Enviando dados do pedido:', JSON.stringify(dadosPedido, null, 2));

      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosPedido),
      });

      if (response.ok) {
        console.log('Pedido salvo com sucesso');
        router.push("/pedidos");
      } else {
        const error = await response.json();
        console.error('Erro do servidor:', error);
        alert(error.error || 'Erro ao salvar pedido');
      }
    } catch (error) {
      console.error("Erro ao salvar pedido:", error);
      alert('Erro ao salvar pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Novo Pedido</h1>
              <p className="text-gray-600">Crie um novo pedido</p>
            </div>
            <div className="flex space-x-2">
              <Link href="/pedidos">
                <Button variant="outline">Cancelar</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Pedido</CardTitle>
              <CardDescription>
                Informações do novo pedido
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cliente">Cliente *</Label>
                  <Input
                    id="cliente"
                    value={formData.cliente}
                    onChange={(e) => setFormData({...formData, cliente: e.target.value})}
                    placeholder="Nome ou razão social do cliente"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dataEntrega">Data de Entrega *</Label>
                  <Input
                    id="dataEntrega"
                    type="date"
                    value={formData.dataEntrega}
                    onChange={(e) => setFormData({...formData, dataEntrega: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="endereco">Endereço de Entrega</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                  placeholder="Endereço para entrega (opcional)"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Valor Total</Label>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(valorTotal)}
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status Inicial</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "novo" | "em_producao" | "pronto" | "entregue" | "cancelado") => 
                      setFormData({...formData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="novo">Novo</SelectItem>
                      <SelectItem value="em_producao">Em Produção</SelectItem>
                      <SelectItem value="pronto">Pronto</SelectItem>
                      <SelectItem value="entregue">Entregue</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  placeholder="Observações adicionais sobre o pedido..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Seleção de Produtos */}
          <ProductSelector
            itens={itens}
            onChange={setItens}
          />

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4">
            <Link href="/pedidos">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Pedido
                </>
              )}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </AppLayout>
  );
}
