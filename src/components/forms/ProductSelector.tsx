'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QuickAddProductModal } from './QuickAddProductModal'
import { Search, Plus, X } from 'lucide-react'

interface Produto {
  id: string
  codigo: string
  nome: string
  descricao?: string
  preco: number
  categoria: string
  unidade: string
  ativo: boolean
}

interface ItemSelecionado {
  produtoId: string
  produto: Produto
  quantidade: number
  valorUnitario: number
  valorTotal: number
  observacoes?: string
}

interface ProductSelectorProps {
  itens: ItemSelecionado[]
  onChange: (itens: ItemSelecionado[]) => void
  className?: string
}

export function ProductSelector({ itens, onChange, className }: ProductSelectorProps) {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null)
  const [quantidade, setQuantidade] = useState(1)
  const [valorUnitario, setValorUnitario] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [showQuickAddModal, setShowQuickAddModal] = useState(false)

  useEffect(() => {
    fetchProdutos()
  }, [])

  const fetchProdutos = async () => {
    try {
      const params = new URLSearchParams()
      params.append('ativo', 'true')
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`/api/produtos?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setProdutos(data)
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    }
  }

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchProdutos()
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm])

  const adicionarItem = () => {
    if (!selectedProduto) return

    const valorUnit = parseFloat(valorUnitario) || selectedProduto.preco
    const valorTotal = quantidade * valorUnit

    const novoItem: ItemSelecionado = {
      produtoId: selectedProduto.id,
      produto: selectedProduto,
      quantidade,
      valorUnitario: valorUnit,
      valorTotal,
      observacoes: observacoes || undefined
    }

    onChange([...itens, novoItem])
    
    // Reset form
    setSelectedProduto(null)
    setQuantidade(1)
    setValorUnitario('')
    setObservacoes('')
    setShowAddForm(false)
  }

  const removerItem = (index: number) => {
    const novosItens = itens.filter((_, i) => i !== index)
    onChange(novosItens)
  }

  const handleProductAdded = (novoProduto: Produto) => {
    // Atualizar lista de produtos
    fetchProdutos()
    // Selecionar automaticamente o novo produto
    setSelectedProduto(novoProduto)
    setValorUnitario(novoProduto.preco.toString())
  }

  const atualizarQuantidade = (index: number, novaQuantidade: number) => {
    const novosItens = itens.map((item, i) => {
      if (i === index) {
        const valorTotal = novaQuantidade * item.valorUnitario
        return { ...item, quantidade: novaQuantidade, valorTotal }
      }
      return item
    })
    onChange(novosItens)
  }

  const atualizarValorUnitario = (index: number, novoValor: number) => {
    const novosItens = itens.map((item, i) => {
      if (i === index) {
        const valorTotal = item.quantidade * novoValor
        return { ...item, valorUnitario: novoValor, valorTotal }
      }
      return item
    })
    onChange(novosItens)
  }

  const totalGeral = itens.reduce((sum, item) => sum + item.valorTotal, 0)

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <Label className="text-base font-semibold">Produtos</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowQuickAddModal(true)}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Produto
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Produto
          </Button>
        </div>
      </div>

      {/* Formulário de adição */}
      {showAddForm && (
        <Card className="mb-4">
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Adicionar Produto</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Busca de produtos */}
            <div>
              <Label>Buscar Produto</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Digite o nome ou código do produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Seleção de produto */}
            {produtos.length > 0 && (
              <div>
                <Label>Selecionar Produto</Label>
                <div className="grid gap-2 max-h-48 overflow-y-auto">
                  {produtos.map((produto) => (
                    <div
                      key={produto.id}
                      className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                        selectedProduto?.id === produto.id ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        setSelectedProduto(produto)
                        setValorUnitario(produto.preco.toString())
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{produto.nome}</p>
                          <p className="text-sm text-gray-600">Código: {produto.codigo}</p>
                          <Badge variant="secondary" className="mt-1">
                            {produto.categoria}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            R$ {produto.preco.toFixed(2)}/{produto.unidade}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detalhes do item */}
            {selectedProduto && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <Label>Valor Unitário</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={valorUnitario}
                    onChange={(e) => setValorUnitario(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Total</Label>
                  <Input
                    value={`R$ ${(quantidade * (parseFloat(valorUnitario) || 0)).toFixed(2)}`}
                    disabled
                  />
                </div>
              </div>
            )}

            {selectedProduto && (
              <div>
                <Label>Observações</Label>
                <Input
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Observações opcionais..."
                />
              </div>
            )}

            {selectedProduto && (
              <Button type="button" onClick={adicionarItem} className="w-full">
                Adicionar Item
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lista de itens selecionados */}
      {itens.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {itens.map((item, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{item.produto.nome}</h4>
                      <p className="text-sm text-gray-600">Código: {item.produto.codigo}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removerItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <div>
                      <Label className="text-xs">Quantidade</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantidade}
                        onChange={(e) => atualizarQuantidade(index, parseInt(e.target.value) || 1)}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Valor Unit.</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.valorUnitario}
                        onChange={(e) => atualizarValorUnitario(index, parseFloat(e.target.value) || 0)}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Unidade</Label>
                      <Input
                        value={item.produto.unidade}
                        disabled
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Total</Label>
                      <Input
                        value={`R$ ${item.valorTotal.toFixed(2)}`}
                        disabled
                        className="text-sm font-semibold"
                      />
                    </div>
                  </div>
                  
                  {item.observacoes && (
                    <p className="text-sm text-gray-600 mt-2">
                      Obs: {item.observacoes}
                    </p>
                  )}
                </div>
              ))}
              
              <div className="flex justify-between items-center pt-4 border-t font-semibold">
                <span>Total Geral:</span>
                <span className="text-lg text-green-600">R$ {totalGeral.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de criação rápida de produto */}
      <QuickAddProductModal
        isOpen={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        onProductAdded={handleProductAdded}
      />
    </div>
  )
}
