'use client'

import React, { useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Printer, Download } from 'lucide-react'

interface PrintData {
  tipo: string
  dados: {
    numero: string
    cliente: string
    endereco?: string
    data: string
    dataVencimento?: string
    dataEntrega?: string
    status: string
    vendedor?: string
    observacoes?: string
    valor: number
    itens: Array<{
      produto: string
      quantidade: number
      valorUnitario: number
      valorTotal: number
      observacoes?: string
    }>
  }
}

interface SimplePrintActionsProps {
  data: PrintData
  className?: string
}

export function SimplePrintActions({ data, className }: SimplePrintActionsProps) {
  const printContentRef = useRef<HTMLDivElement>(null)

  const generatePrintableHtml = useCallback(async () => {
    const { tipo, dados } = data
    const title = `${tipo.toUpperCase()} ${dados.numero}`
    
    // Buscar configurações da empresa
    let empresaNome = 'Ops - Orçamentos e Pedidos';
    let empresaLogo = '';
    let empresaEndereco = '';
    let empresaTelefone = '';
    let empresaEmail = '';
    let empresaWebsite = '';

    try {
      const response = await fetch('/api/configuracoes?categoria=empresa');
      if (response.ok) {
        const configs = await response.json();
        configs.forEach((config: any) => {
          switch (config.chave) {
            case 'empresa_nome':
              empresaNome = config.valor || empresaNome;
              break;
            case 'empresa_logo':
              empresaLogo = config.valor || '';
              break;
            case 'empresa_endereco':
              empresaEndereco = config.valor || '';
              break;
            case 'empresa_telefone':
              empresaTelefone = config.valor || '';
              break;
            case 'empresa_email':
              empresaEmail = config.valor || '';
              break;
            case 'empresa_website':
              empresaWebsite = config.valor || '';
              break;
          }
        });
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
    }

    const itemsHtml = dados.itens.map(item => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.produto}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.quantidade}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.valorUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
      </tr>
    `).join('')

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                color: #333; 
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                line-height: 1.3;
              }
              .container { 
                max-width: 800px; 
                margin: 0 auto; 
                padding: 20px; 
                border: 1px solid #eee; 
                box-shadow: 0 0 10px rgba(0,0,0,0.05);
                flex: 1;
                display: flex;
                flex-direction: column;
              }
              .header { 
                display: flex; 
                align-items: flex-start; 
                justify-content: space-between; 
                border-bottom: 2px solid #0056b3; 
                padding-bottom: 20px; 
                margin-bottom: 30px; 
              }
              .header-left { 
                flex: 0 0 auto;
                margin-right: 20px;
              }
              .logo { 
                max-height: 90px; 
                max-width: 140px; 
                object-fit: contain;
              }
              .header-right {
                flex: 1;
                text-align: right;
              }
              .company-name { 
                margin: 0; 
                color: #0056b3; 
                font-size: 22px; 
                font-weight: bold;
                margin-bottom: 8px;
              }
              .company-details { 
                margin: 2px 0; 
                font-size: 13px; 
                color: #666; 
                line-height: 1.4;
              }
              .document-title { 
                text-align: center; 
                font-size: 18px; 
                font-weight: bold; 
                color: #0056b3; 
                margin: 20px 0; 
                text-transform: uppercase;
              }
              .info-grid { 
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-bottom: 15px;
                background: #f8f9fa;
                padding: 12px;
                border-radius: 5px;
              }
              .info-item { 
                margin-bottom: 8px; 
              }
              .label { 
                font-weight: bold; 
                color: #333; 
              }
              .observations {
                margin-bottom: 20px;
                padding: 15px;
                background: #f8f9fa;
                border-left: 4px solid #0056b3;
                border-radius: 0 5px 5px 0;
              }
              .observations-title {
                font-weight: bold;
                margin-bottom: 8px;
                color: #0056b3;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 15px 0;
                flex: 1;
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: left; 
                font-size: 12px;
              }
              th { 
                background-color: #f5f5f5;
                font-weight: bold;
                color: #333;
              }
              .total { 
                text-align: right; 
                font-weight: bold; 
                margin-top: 20px; 
                font-size: 16px;
                color: #0056b3;
                padding: 10px;
                background: #f8f9fa;
                border-radius: 5px;
              }
              .content {
                flex: 1;
              }
              .footer { 
                margin-top: auto;
                padding-top: 30px;
                border-top: 1px solid #ddd;
                text-align: center;
              }
              .footer-letterhead {
                font-weight: bold;
                color: #0056b3;
                font-size: 14px;
                margin-bottom: 5px;
              }
              .footer-details {
                font-size: 11px;
                color: #666;
                line-height: 1.3;
                margin-bottom: 10px;
              }
              .document-info {
                font-size: 9px;
                color: #999;
                padding-top: 10px;
                border-top: 1px solid #eee;
              }
              @media print {
                  @page {
                    size: A4;
                    margin: 1cm;
                  }
                  * {
                    box-sizing: border-box;
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                  body { 
                    margin: 0; 
                    padding: 0;
                    font-size: 10px;
                    background: white !important;
                    page-break-inside: avoid;
                    line-height: 1.2;
                  }
                  .container { 
                    box-shadow: none; 
                    border: none;
                    padding: 0;
                    max-width: none;
                    width: 100%;
                    page-break-inside: avoid;
                    display: block !important;
                    height: auto !important;
                    overflow: visible !important;
                  }
                  .content {
                    page-break-inside: avoid;
                  }
                  .no-print { 
                    display: none !important; 
                  }
                  .header {
                    margin-bottom: 20px;
                    page-break-inside: avoid;
                    page-break-after: avoid;
                  }
                  .logo {
                    max-height: 60px;
                    max-width: 100px;
                    display: block !important;
                    page-break-inside: avoid;
                  }
                  table {
                    page-break-inside: auto;
                  }
                  tr {
                    page-break-inside: avoid;
                    page-break-after: auto;
                  }
                  .footer {
                    page-break-inside: avoid;
                    page-break-before: avoid;
                  }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="content">
                  <div class="header">
                      <div class="header-left">
                          ${empresaLogo ? `<img src="${window.location.origin}${empresaLogo}" alt="Logo da Empresa" class="logo" crossorigin="anonymous" />` : ''}
                      </div>
                      <div class="header-right">
                          <h1 class="company-name">${empresaNome}</h1>
                          ${empresaTelefone ? `<div class="company-details">Tel: ${empresaTelefone}</div>` : ''}
                          ${empresaEmail ? `<div class="company-details">Email: ${empresaEmail}</div>` : ''}
                          ${empresaWebsite ? `<div class="company-details">Site: ${empresaWebsite}</div>` : ''}
                      </div>
                  </div>
                  
                  <div class="document-title">${tipo.toUpperCase()}</div>
                  
                  <div class="info-grid">
                      <div>
                          <div class="info-item"><span class="label">Cliente:</span> ${dados.cliente}</div>
                          ${dados.endereco ? `<div class="info-item"><span class="label">Endereço:</span> ${dados.endereco}</div>` : ''}
                          ${dados.vendedor ? `<div class="info-item"><span class="label">Vendedor:</span> ${dados.vendedor}</div>` : ''}
                      </div>
                      <div>
                          <div class="info-item"><span class="label">Data:</span> ${dados.data}</div>
                          ${dados.dataVencimento ? `<div class="info-item"><span class="label">Vencimento:</span> ${dados.dataVencimento}</div>` : ''}
                          ${tipo.toLowerCase() === 'orçamento' ? `<div class="info-item"><span class="label">Status:</span> ${dados.status}</div>` : ''}
                      </div>
                  </div>
                  
                  ${dados.observacoes ? `
                      <div class="observations">
                          <div class="observations-title">Observações:</div>
                          <div>${dados.observacoes}</div>
                      </div>
                  ` : ''}

                  <table>
                      <thead>
                          <tr>
                              <th>Produto</th>
                              <th style="text-align: center; width: 80px;">Qtd.</th>
                              <th style="text-align: right; width: 100px;">Valor Unit.</th>
                              <th style="text-align: right; width: 100px;">Total</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${itemsHtml}
                      </tbody>
                  </table>
                  
                  <div class="total">Valor Total: ${dados.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
              </div>
              
              <div class="footer">
                  <div class="footer-letterhead">${empresaNome}</div>
                  <div class="footer-details">
                      ${empresaEndereco ? empresaEndereco.replace(/\n/g, ' • ') : ''}
                      ${empresaTelefone && empresaEndereco ? ' • ' : ''}${empresaTelefone || ''}
                      ${empresaEmail && (empresaEndereco || empresaTelefone) ? ' • ' : ''}${empresaEmail || ''}
                  </div>
                  <div class="document-info">
                      ${tipo.toUpperCase()} ${dados.numero || ''} • Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
                  </div>
              </div>
          </div>
      </body>
      </html>
    `
  }, [data])

  const handlePrint = useCallback(async () => {
    // Usar a mesma função do "Salvar PDF" que está funcionando
    const htmlContent = await generatePrintableHtml()
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // Aguardar imagens carregarem (mesmo método do PDF)
      printWindow.addEventListener('load', () => {
        setTimeout(() => {
          printWindow.focus()
          printWindow.print()
        }, 500)
      })
    }
  }, [generatePrintableHtml])

  const handleDownloadPdf = useCallback(async () => {
    const htmlContent = await generatePrintableHtml()
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // Aguardar imagens carregarem
      printWindow.addEventListener('load', () => {
        setTimeout(() => {
          printWindow.focus()
          printWindow.print()
        }, 500)
      })
    }
  }, [generatePrintableHtml])

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button size="sm" variant="outline" onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" />
        Imprimir
      </Button>
      <Button size="sm" variant="outline" onClick={handleDownloadPdf}>
        <Download className="mr-2 h-4 w-4" />
        Salvar PDF
      </Button>
    </div>
  )
}