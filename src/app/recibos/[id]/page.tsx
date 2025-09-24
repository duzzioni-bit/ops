"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Receipt, Edit, Trash2, ArrowLeft, Printer } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";

interface Recibo {
  id: string;
  numero: string;
  valor: number;
  pagadorNome: string;
  pagadorCpf?: string;
  recebedorNome: string;
  recebedorCpf?: string;
  referente: string;
  data: string;
  observacoes?: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function ReciboPage() {
  const params = useParams();
  const router = useRouter();
  const [recibo, setRecibo] = useState<Recibo | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRecibo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/recibos/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setRecibo(data);
      } else if (response.status === 404) {
        alert("Recibo não encontrado");
        router.push("/recibos");
      } else {
        console.error("Erro ao carregar recibo");
      }
    } catch (error) {
      console.error("Erro ao carregar recibo:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      loadRecibo();
    }
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este recibo?")) {
      return;
    }

    try {
      const response = await fetch(`/api/recibos/${params.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/recibos");
      } else {
        alert("Erro ao excluir recibo");
      }
    } catch (error) {
      console.error("Erro ao excluir recibo:", error);
      alert("Erro ao excluir recibo");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatCurrencyExtended = (value: number) => {
    const formatter = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return `${formatter.format(value)} (${numberToWords(value)})`;
  };

  // Função simples para converter número em palavras (valores até 999.999,99)
  const numberToWords = (value: number): string => {
    if (value >= 1000000) return "valor acima do limite";
    
    const units = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
    const teens = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
    const tens = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
    const hundreds = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

    const integerPart = Math.floor(value);
    const decimalPart = Math.round((value - integerPart) * 100);

    let result = "";

    if (integerPart === 0) {
      result = "zero";
    } else {
      if (integerPart >= 1000) {
        const thousands = Math.floor(integerPart / 1000);
        if (thousands === 1) {
          result += "mil";
        } else {
          result += convertHundreds(thousands) + " mil";
        }
        if (integerPart % 1000 > 0) {
          result += " e " + convertHundreds(integerPart % 1000);
        }
      } else {
        result = convertHundreds(integerPart);
      }
    }

    function convertHundreds(num: number): string {
      let words = "";
      
      if (num >= 100) {
        if (num === 100) {
          words += "cem";
        } else {
          words += hundreds[Math.floor(num / 100)];
        }
        
        if (num % 100 > 0) {
          words += " e ";
        }
      }
      
      const remainder = num % 100;
      if (remainder >= 20) {
        words += tens[Math.floor(remainder / 10)];
        if (remainder % 10 > 0) {
          words += " e " + units[remainder % 10];
        }
      } else if (remainder >= 10) {
        words += teens[remainder - 10];
      } else if (remainder > 0) {
        words += units[remainder];
      }
      
      return words;
    }

    result += integerPart === 1 ? " real" : " reais";

    if (decimalPart > 0) {
      result += " e " + convertHundreds(decimalPart);
      result += decimalPart === 1 ? " centavo" : " centavos";
    }

    return result;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-8">Carregando recibo...</div>
      </AppLayout>
    );
  }

  if (!recibo) {
    return (
      <AppLayout>
        <div className="text-center py-8">Recibo não encontrado.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title={`Recibo ${recibo.numero}`}
          subtitle={`Criado em ${formatDate(recibo.createdAt)}`}
        />

        <div className="flex gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/recibos/${recibo.id}/imprimir`)}
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/recibos/${recibo.id}/editar`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </Button>
        </div>

        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Número</label>
                <p className="text-lg font-semibold">{recibo.numero}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Valor</label>
                <p className="text-lg">
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {formatCurrency(recibo.valor)}
                  </Badge>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Data do Pagamento</label>
                <p className="text-lg">{formatDate(recibo.data)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Criado por</label>
                <p className="text-lg">{recibo.user.name}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Valor por extenso</label>
              <p className="text-lg italic">{formatCurrencyExtended(recibo.valor)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Referente a</label>
              <p className="text-lg">{recibo.referente}</p>
            </div>
          </CardContent>
        </Card>

        {/* Dados do Pagador */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Pagador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nome Completo</label>
                <p className="text-lg">{recibo.pagadorNome}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">CPF</label>
                <p className="text-lg">{recibo.pagadorCpf || "Não informado"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">RG</label>
                <p className="text-lg">{(recibo as any).pagadorRg || "Não informado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados do Recebedor */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Recebedor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nome Completo</label>
                <p className="text-lg">{recibo.recebedorNome}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">CPF</label>
                <p className="text-lg">{recibo.recebedorCpf || "Não informado"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">RG</label>
                <p className="text-lg">{(recibo as any).recebedorRg || "Não informado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Observações */}
        {recibo.observacoes && (
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg whitespace-pre-wrap">{recibo.observacoes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
