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
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

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
  itens: Array<{
    id: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
    observacoes?: string;
    produto: {
      id: string;
      nome: string;
      codigo: string;
    };
  }>;
}

interface EditarPedidoProps {
  params: Promise<{ id: string }>;
}

export default function EditarPedidoPage({ params }: EditarPedidoProps) {
  const router = useRouter();
  const [pedido, setPedido] = useState<PedidoDetalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    cliente: "",
    endereco: "",
    status: "",
    dataEntrega: "",
    observacoes: "",
  });

  useEffect(() => {
    async function loadPedido() {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/pedidos/${resolvedParams.id}`);
        
        if (response.ok) {
          const data: PedidoDetalhes = await response.json();
          setPedido(data);
          setFormData({
            cliente: data.cliente,
            endereco: data.endereco || "",
            status: data.status,
            dataEntrega: new Date(data.dataEntrega).toISOString().split('T')[0],
            observacoes: data.observacoes || "",
          });
        } else {
          setError("Pedido não encontrado");
        }
      } catch (err) {
        console.error("Erro ao carregar pedido:", err);
        setError("Erro ao carregar pedido");
      } finally {
        setLoading(false);
      }
    }

    loadPedido();
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
    if (!pedido) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/pedidos/${pedido.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cliente: formData.cliente,
          endereco: formData.endereco || undefined,
          status: formData.status.toUpperCase(),
          dataEntrega: formData.dataEntrega,
          observacoes: formData.observacoes || undefined,
        }),
      });

      if (response.ok) {
        router.push(`/pedidos/${pedido.id}`);
      } else {
        const error = await response.json();
        setError(error.error || 'Erro ao salvar pedido');
      }
    } catch (err) {
      console.error('Erro ao salvar pedido:', err);
      setError('Erro ao salvar pedido');
    } finally {
      setSaving(false);
    }
  };

  const getStatusOptions = () => [
    { value: "NOVO", label: "Novo" },
    { value: "EM_PRODUCAO", label: "Em Produção" },
    { value: "PRONTO", label: "Pronto" },
    { value: "ENTREGUE", label: "Entregue" },
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

  if (error || !pedido) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-red-600">{error || "Pedido não encontrado"}</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader 
          title={`Editar Pedido ${pedido.numero}`}
          subtitle="Altere as informações do pedido"
        />

        <div className="flex items-center gap-4 mb-6">
          <Link href={`/pedidos/${pedido.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Pedido</CardTitle>
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
                  <Label htmlFor="dataEntrega">Data de Entrega *</Label>
                  <Input
                    id="dataEntrega"
                    name="dataEntrega"
                    type="date"
                    value={formData.dataEntrega}
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

              <div className="flex justify-end space-x-2">
                <Link href={`/pedidos/${pedido.id}`}>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={saving}>
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
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

