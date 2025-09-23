"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Receipt, ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface CompanyConfig {
  nomeEmpresa: string;
  logoUrl?: string;
}

export default function ImprimirReciboPage() {
  const params = useParams();
  const router = useRouter();
  const [recibo, setRecibo] = useState<Recibo | null>(null);
  const [companyConfig, setCompanyConfig] = useState<CompanyConfig>({
    nomeEmpresa: "Empresa",
  });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados do recibo
      const reciboResponse = await fetch(`/api/recibos/${params.id}`);
      if (reciboResponse.ok) {
        const reciboData = await reciboResponse.json();
        setRecibo(reciboData);
      } else {
        alert("Recibo não encontrado");
        router.push("/recibos");
        return;
      }

      // Carregar configurações da empresa
      const configResponse = await fetch("/api/configuracoes?categoria=empresa");
      if (configResponse.ok) {
        const configData = await configResponse.json();
        const config: CompanyConfig = {
          nomeEmpresa: "Empresa",
        };

        configData.forEach((item: any) => {
          if (item.chave === "nome_empresa") {
            config.nomeEmpresa = item.valor;
          } else if (item.chave === "logo_url") {
            config.logoUrl = item.valor;
          }
        });

        setCompanyConfig(config);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      loadData();
    }
  }, [params.id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

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

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  if (!recibo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Recibo não encontrado.</div>
      </div>
    );
  }

  // Componente de Recibo Individual
  const ReciboTemplate = ({ viaNumero }: { viaNumero: number }) => (
    <div className="bg-white border-2 border-gray-800 p-4 mb-4 print:mb-2 print:p-3" style={{ width: '210mm', minHeight: '140mm' }}>
      {/* Cabeçalho */}
      <div className="border-b border-gray-800 pb-3 mb-4">
        <div className="text-center bg-gray-100 py-1 px-2 mb-2">
          <h1 className="text-sm font-bold">Recibo de pagamento de mão de obra</h1>
        </div>
        
        <div className="grid grid-cols-4 gap-0 border border-gray-800">
          <div className="border-r border-gray-800 p-1 bg-gray-200">
            <div className="text-center">
              {companyConfig.logoUrl ? (
                <img 
                  src={companyConfig.logoUrl} 
                  alt="Logo" 
                  className="h-8 w-auto mx-auto mb-1"
                />
              ) : (
                <div className="h-8 flex items-center justify-center mb-1">
                  <span className="text-xs font-bold">{companyConfig.nomeEmpresa}</span>
                </div>
              )}
              <div className="text-xs font-semibold">Empresa</div>
            </div>
          </div>
          <div className="border-r border-gray-800 p-1 bg-gray-200 text-center">
            <div className="text-sm font-bold">RECIBO</div>
          </div>
          <div className="border-r border-gray-800 p-1 bg-gray-200 text-center">
            <div className="text-xs mb-1">Nº</div>
            <div className="text-xs font-bold">{recibo.numero}</div>
          </div>
          <div className="p-1 bg-gray-200 text-center">
            <div className="text-xs mb-1">Valor R$</div>
            <div className="text-xs font-bold">{formatCurrency(recibo.valor)}</div>
          </div>
        </div>
      </div>

      {/* Corpo do Recibo */}
      <div className="space-y-2 text-xs leading-tight">
        <div className="flex flex-wrap items-center gap-1">
          <span>Eu,</span>
          <span className="font-semibold underline">{recibo.recebedorNome}</span>
          <span>inscrito(a) no CPF sob o nº</span>
          <span className="underline min-w-[100px] inline-block">
            {recibo.recebedorCpf || "___________________"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <span>recebi de</span>
          <span className="font-semibold underline">{recibo.pagadorNome}</span>
          <span>inscrito(a) no CPF sob o nº</span>
          <span className="underline min-w-[100px] inline-block">
            {recibo.pagadorCpf || "___________________"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <span>a importância de R$</span>
          <span className="font-semibold underline min-w-[150px] inline-block">
            {formatCurrency(recibo.valor)}
          </span>
        </div>

        <div className="border border-gray-400 p-2 min-h-[40px] flex items-center">
          <span className="italic text-xs">({numberToWords(recibo.valor)})</span>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <span>referente ao pagamento de serviços de mão de obra relativos a</span>
          <span className="font-semibold underline flex-1 min-w-[200px] inline-block">
            {recibo.referente}
          </span>
        </div>

        {recibo.observacoes && (
          <div className="border-t border-gray-400 pt-1">
            <div className="text-xs text-gray-600 mb-1">Observações:</div>
            <div className="text-xs">{recibo.observacoes}</div>
          </div>
        )}

        <div className="pt-2">
          <div className="flex items-center gap-2">
            <span>Data:</span>
            <span className="underline min-w-[60px] inline-block text-center">
              {formatDate(recibo.data).split('/')[0]}
            </span>
            <span>de</span>
            <span className="underline min-w-[80px] inline-block text-center">
              {formatDate(recibo.data).split('/')[1] === '01' ? 'Janeiro' :
               formatDate(recibo.data).split('/')[1] === '02' ? 'Fevereiro' :
               formatDate(recibo.data).split('/')[1] === '03' ? 'Março' :
               formatDate(recibo.data).split('/')[1] === '04' ? 'Abril' :
               formatDate(recibo.data).split('/')[1] === '05' ? 'Maio' :
               formatDate(recibo.data).split('/')[1] === '06' ? 'Junho' :
               formatDate(recibo.data).split('/')[1] === '07' ? 'Julho' :
               formatDate(recibo.data).split('/')[1] === '08' ? 'Agosto' :
               formatDate(recibo.data).split('/')[1] === '09' ? 'Setembro' :
               formatDate(recibo.data).split('/')[1] === '10' ? 'Outubro' :
               formatDate(recibo.data).split('/')[1] === '11' ? 'Novembro' :
               formatDate(recibo.data).split('/')[1] === '12' ? 'Dezembro' : ''}
            </span>
            <span>de</span>
            <span className="underline min-w-[60px] inline-block text-center">
              {formatDate(recibo.data).split('/')[2]}
            </span>
          </div>
        </div>

        <div className="pt-4">
          <div>Assinatura</div>
          <div className="border-b border-gray-800 mt-4 w-full h-0"></div>
        </div>
      </div>

      {/* Via */}
      <div className="text-center mt-2 text-xs text-gray-500">
        {viaNumero}ª VIA
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Botões de ação - ocultos na impressão */}
      <div className="print:hidden bg-gray-100 p-4 space-x-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Imprimir
        </Button>
      </div>

      {/* Conteúdo para impressão */}
      <div className="print:block print:mx-0 print:my-0 mx-auto max-w-4xl p-4">
        {/* 1ª Via */}
        <ReciboTemplate viaNumero={1} />
        
        {/* 2ª Via */}
        <ReciboTemplate viaNumero={2} />
      </div>

      {/* Estilos específicos para impressão */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0.5cm;
          }
          
          body {
            font-size: 10px !important;
            line-height: 1.2 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:block {
            display: block !important;
          }
          
          .print\\:mx-0 {
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          
          .print\\:my-0 {
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }
          
          .print\\:mb-2 {
            margin-bottom: 0.5rem !important;
          }
          
          .print\\:p-3 {
            padding: 0.75rem !important;
          }
          
          /* Garantir que os recibos caibam em A4 */
          .recibo-container {
            width: 100% !important;
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          .recibo-item {
            width: 100% !important;
            max-width: 210mm !important;
            height: auto !important;
            min-height: 120mm !important;
            margin-bottom: 0.5rem !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
