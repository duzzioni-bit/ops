'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ProductSelector } from '@/components/forms/ProductSelector'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

interface ItemSelecionado {
  produtoId: string
  produto: any
  quantidade: number
  valorUnitario: number
  valorTotal: number
  observacoes?: string
}

export default function NovoOrcamentoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    cliente: '',
    dataVencimento: '',
    observacoes: ''
  })
  
  const [itens, setItens] = useState<ItemSelecionado[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (itens.length === 0) {
      alert('Adicione pelo menos um produto ao orçamento')
      return
    }

    setLoading(true)

    try {
      const valorTotal = itens.reduce((sum, item) => sum + item.valorTotal, 0)
      
      const orcamentoData = {
        cliente: formData.cliente,
        dataVencimento: formData.dataVencimento,
        observacoes: formData.observacoes,
        itens: itens.map(item => ({
          produto: typeof item.produto === 'string' ? item.produto : item.produto.nome,
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
          valorTotal: item.valorTotal,
          observacoes: item.observacoes
        }))
      }

      const response = await fetch('/api/orcamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orcamentoData)
      })

      if (response.ok) {
        router.push('/orcamentos')
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao criar orçamento')
      }
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error)
      alert('Erro ao salvar orçamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/orcamentos">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Novo Orçamento</h1>
            <p className="text-gray-600">Crie um novo orçamento para o cliente</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do Cliente</CardTitle>
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
                  <Label htmlFor="dataVencimento">Data de Vencimento *</Label>
                  <Input
                    id="dataVencimento"
                    type="date"
                    value={formData.dataVencimento}
                    onChange={(e) => setFormData({...formData, dataVencimento: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  placeholder="Observações gerais do orçamento"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Produtos */}
          <Card>
            <CardHeader>
              <CardTitle>Produtos e Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductSelector
                itens={itens}
                onChange={setItens}
              />
            </CardContent>
          </Card>

          {/* Resumo */}
          {itens.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Orçamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Quantidade de itens:</span>
                    <span>{itens.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Quantidade total de produtos:</span>
                    <span>{itens.reduce((sum, item) => sum + item.quantidade, 0)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                    <span>Valor Total:</span>
                    <span className="text-green-600">
                      R$ {itens.reduce((sum, item) => sum + item.valorTotal, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ações */}
          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={loading || itens.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Orçamento'}
            </Button>
            <Link href="/orcamentos">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
