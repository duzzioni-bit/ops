"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { ProductSelector } from "@/components/forms/ProductSelector";
import { ArrowLeft, Save, Package } from "lucide-react";
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
    produtoId?: string;
    produtoRef?: {
      id: string;
      nome: string;
      codigo: string;
      preco: number;
      categoria: string;
      unidade: string;
      descricao?: string;
      ativo: boolean;
    };
  }>;
}

interface EditarOrcamentoProps {
  params: Promise<{ id: string }>;
}

export default function EditarOrcamentoPage({ params }: EditarOrcamentoProps) {
  const router = useRouter();
  const [orcamento, setOrcamento] = useState<OrcamentoDetalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    cliente: "",
    endereco: "",
    status: "",
    dataVencimento: "",
    observacoes: "",
  });

  // Estado para produtos - interface compatível com ProductSelector
  interface ItemSelecionado {
    produtoId: string;
    produto: {
      id: string;
      codigo: string;
      nome: string;
      descricao?: string;
      preco: number;
      categoria: string;
      unidade: string;
      ativo: boolean;
    };
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
    observacoes?: string;
  }

  const [itensSelecionados, setItensSelecionados] = useState<ItemSelecionado[]>([]);

  useEffect(() => {
    async function loadOrcamento() {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/orcamentos/${resolvedParams.id}`);
        
        if (response.ok) {
          const data: OrcamentoDetalhes = await response.json();
          setOrcamento(data);
          setFormData({
            cliente: data.cliente,
            endereco: data.endereco || "",
            status: data.status,
            dataVencimento: new Date(data.dataVencimento).toISOString().split('T')[0],
            observacoes: data.observacoes || "",
          });

          // Converter itens do orçamento para o formato do ProductSelector
          const itensConvertidos: ItemSelecionado[] = data.itens.map(item => ({
            produtoId: item.produtoId || item.produtoRef?.id || "",
            produto: item.produtoRef ? {
              id: item.produtoRef.id,
              codigo: item.produtoRef.codigo,
              nome: item.produtoRef.nome,
              descricao: item.produtoRef.descricao,
              preco: item.produtoRef.preco,
              categoria: item.produtoRef.categoria,
              unidade: item.produtoRef.unidade,
              ativo: item.produtoRef.ativo
            } : {
              // Fallback para itens legados sem produtoRef
              id: "",
              codigo: "",
              nome: item.produto || "Produto não encontrado",
              preco: item.valorUnitario,
              categoria: "Indefinida",
              unidade: "un",
              ativo: true
            },
            quantidade: item.quantidade,
            valorUnitario: item.valorUnitario,
            valorTotal: item.valorTotal,
            observacoes: item.observacoes
          }));
          
          setItensSelecionados(itensConvertidos);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orcamento) return;

    // Validar se há pelo menos um item
    if (itensSelecionados.length === 0) {
      setError('É necessário adicionar pelo menos um produto ao orçamento');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Calcular valor total
      const valorTotal = itensSelecionados.reduce((total, item) => total + item.valorTotal, 0);

      const response = await fetch(`/api/orcamentos/${orcamento.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cliente: formData.cliente,
          endereco: formData.endereco || undefined,
          status: formData.status.toUpperCase(),
          dataVencimento: formData.dataVencimento,
          observacoes: formData.observacoes || undefined,
          valor: valorTotal,
          itens: itensSelecionados.map(item => ({
            produtoId: item.produtoId,
            produto: item.produto.nome, // Para compatibilidade com campo legado
            quantidade: item.quantidade,
            valorUnitario: item.valorUnitario,
            valorTotal: item.valorTotal,
            observacoes: item.observacoes
          }))
        }),
      });

      if (response.ok) {
        router.push(`/orcamentos/${orcamento.id}`);
      } else {
        const error = await response.json();
        setError(error.error || 'Erro ao salvar orçamento');
      }
    } catch (err) {
      console.error('Erro ao salvar orçamento:', err);
      setError('Erro ao salvar orçamento');
    } finally {
      setSaving(false);
    }
  };

  const getStatusOptions = () => [
    { value: "PENDENTE", label: "Pendente" },
    { value: "APROVADO", label: "Aprovado" },
    { value: "REJEITADO", label: "Rejeitado" },
    { value: "CANCELADO", label: "Cancelado" },
  ];

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
          title={`Editar Orçamento ${orcamento.numero}`}
          subtitle="Altere as informações do orçamento"
        />

        <div className="flex items-center gap-4 mb-6">
          <Link href={`/orcamentos/${orcamento.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Orçamento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cliente">Cliente *</Label>
                  <Input
                    id="cliente"
                    name="cliente"
                    value={formData.cliente}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={handleSelectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {getStatusOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dataVencimento">Data de Vencimento *</Label>
                  <Input
                    id="dataVencimento"
                    name="dataVencimento"
                    type="date"
                    value={formData.dataVencimento}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Seção de Produtos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Produtos do Orçamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProductSelector
              itens={itensSelecionados}
              onChange={setItensSelecionados}
            />
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit}>
              <div className="flex justify-end space-x-2">
                <Link href={`/orcamentos/${orcamento.id}`}>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={saving || itensSelecionados.length === 0}>
                  {saving ? (
                    <>Salvando...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
              
              {itensSelecionados.length === 0 && (
                <p className="text-sm text-red-600 text-center mt-2">
                  Adicione pelo menos um produto para salvar o orçamento
                </p>
              )}
              
              {itensSelecionados.length > 0 && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-green-700 font-semibold">Valor Total do Orçamento:</span>
                    <span className="text-2xl font-bold text-green-600">
                      R$ {itensSelecionados.reduce((total, item) => total + item.valorTotal, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
