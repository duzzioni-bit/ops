"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Receipt, Save, ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { formatCPF } from "@/lib/cpf-validation";
import { useToast } from "@/components/ui/toast";

interface ReciboForm {
  numero: string;
  valor: string;
  pagador: {
    nome: string;
    cpf: string;
  };
  recebedor: {
    nome: string;
    cpf: string;
  };
  referente: string;
  data: string;
  observacoes: string;
}

export default function NovoReciboPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showToast, ToastContainer } = useToast();
  const [formData, setFormData] = useState<ReciboForm>({
    numero: "",
    valor: "",
    pagador: {
      nome: "",
      cpf: "",
    },
    recebedor: {
      nome: "",
      cpf: "",
    },
    referente: "",
    data: new Date().toISOString().split('T')[0],
    observacoes: "",
  });

  const handleInputChange = (
    field: string,
    value: string,
    section?: 'pagador' | 'recebedor'
  ) => {
    // Formatar CPF automaticamente
    if (field === 'cpf') {
      value = formatCPF(value);
    }

    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const generateReciboNumber = async () => {
    try {
      const response = await fetch('/api/recibos/gerar-numero');
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, numero: data.numero }));
      } else {
        // Fallback para geração local se a API falhar
        const now = new Date();
        const timestamp = now.getTime().toString().slice(-4);
        const numero = `REC-${now.getFullYear()}-${timestamp}`;
        setFormData(prev => ({ ...prev, numero }));
      }
    } catch (error) {
      console.error('Erro ao gerar número:', error);
      // Fallback para geração local
      const now = new Date();
      const timestamp = now.getTime().toString().slice(-4);
      const numero = `REC-${now.getFullYear()}-${timestamp}`;
      setFormData(prev => ({ ...prev, numero }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        valor: parseFloat(formData.valor),
        pagador: {
          nome: formData.pagador.nome,
          cpf: formData.pagador.cpf || undefined,
        },
        recebedor: {
          nome: formData.recebedor.nome,
          cpf: formData.recebedor.cpf || undefined,
        },
        observacoes: formData.observacoes || undefined,
      };

      const response = await fetch('/api/recibos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const recibo = await response.json();
        showToast('Recibo criado com sucesso!', 'success');
        router.push(`/recibos/${recibo.id}`);
      } else {
        const error = await response.json();
        if (error.details && Array.isArray(error.details)) {
          showToast(`Erro de validação: ${error.details.join(', ')}`, 'error');
        } else {
          showToast(error.error || 'Erro ao criar recibo', 'error');
        }
      }
    } catch (error) {
      console.error('Erro ao criar recibo:', error);
      showToast('Erro ao criar recibo', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <ToastContainer />
      <div className="space-y-6">
        <PageHeader
          title="Novo Recibo"
          description="Criar um novo recibo de pagamento"
          icon={Receipt}
        />

        <div className="flex gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Básicos */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Básicos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numero">Número do Recibo *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="numero"
                      value={formData.numero}
                      onChange={(e) => handleInputChange('numero', e.target.value)}
                      placeholder="REC-2025-001"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateReciboNumber}
                    >
                      Gerar
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="valor">Valor (R$) *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.valor}
                    onChange={(e) => handleInputChange('valor', e.target.value)}
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data">Data do Pagamento *</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => handleInputChange('data', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="referente">Referente a *</Label>
                  <Input
                    id="referente"
                    value={formData.referente}
                    onChange={(e) => handleInputChange('referente', e.target.value)}
                    placeholder="Serviços de mão de obra..."
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados do Pagador */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do Pagador</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="pagadorNome">Nome Completo *</Label>
                <Input
                  id="pagadorNome"
                  value={formData.pagador.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value, 'pagador')}
                  placeholder="Nome completo do pagador"
                  required
                />
              </div>
              <div>
                <Label htmlFor="pagadorCpf">CPF</Label>
                <Input
                  id="pagadorCpf"
                  value={formData.pagador.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value, 'pagador')}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dados do Recebedor */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do Recebedor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recebedorNome">Nome Completo *</Label>
                <Input
                  id="recebedorNome"
                  value={formData.recebedor.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value, 'recebedor')}
                  placeholder="Nome completo do recebedor"
                  required
                />
              </div>
              <div>
                <Label htmlFor="recebedorCpf">CPF</Label>
                <Input
                  id="recebedorCpf"
                  value={formData.recebedor.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value, 'recebedor')}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          <Card>
            <CardHeader>
              <CardTitle>Observações Adicionais</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  placeholder="Observações adicionais..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Recibo'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
