'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Edit, Trash2, Package, Grid, List, Table as TableIcon } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'

interface Produto {
  id: string
  codigo: string
  nome: string
  descricao?: string
  preco: number
  categoria: string
  unidade: string
  ativo: boolean
  createdAt: string
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Produto | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    preco: '',
    categoria: '',
    unidade: 'un',
    ativo: true
  })

  const categorias = [
    'Eletrônicos',
    'Móveis',
    'Decoração',
    'Escritório',
    'Informática',
    'Serviços',
    'Outros'
  ]

  const unidades = [
    { value: 'un', label: 'Unidade' },
    { value: 'kg', label: 'Quilograma' },
    { value: 'm', label: 'Metro' },
    { value: 'm2', label: 'Metro²' },
    { value: 'm3', label: 'Metro³' },
    { value: 'h', label: 'Hora' },
    { value: 'pç', label: 'Peça' }
  ]

  useEffect(() => {
    fetchProdutos()
  }, [])

  const fetchProdutos = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory && selectedCategory !== 'all') params.append('categoria', selectedCategory)
      
      const response = await fetch(`/api/produtos?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setProdutos(data)
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchProdutos()
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm, selectedCategory])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingProduct ? `/api/produtos/${editingProduct.id}` : '/api/produtos';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          preco: parseFloat(formData.preco)
        })
      })

      if (response.ok) {
        resetForm()
        fetchProdutos()
        alert(editingProduct ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!')
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao salvar produto')
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      alert('Erro ao salvar produto')
    } finally {
      setLoading(false)
    }
  }

  const filteredProdutos = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEditProduto = (produto: Produto) => {
    setEditingProduct(produto);
    setFormData({
      codigo: produto.codigo,
      nome: produto.nome,
      descricao: produto.descricao || '',
      preco: produto.preco.toString(),
      categoria: produto.categoria,
      unidade: produto.unidade,
      ativo: produto.ativo
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      codigo: '',
      nome: '',
      descricao: '',
      preco: '',
      categoria: '',
      unidade: 'un',
      ativo: true
    });
    setShowForm(false);
  };

  const handleDeleteProduto = async (produtoId: string, nomeProduto: string) => {
    if (!confirm(`Tem certeza que deseja excluir o produto "${nomeProduto}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/produtos?id=${produtoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Produto excluído com sucesso!');
        fetchProdutos(); // Recarregar lista
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao excluir produto');
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir produto');
    }
  }

  return (
    <AppLayout>
      <div className="p-6">
        <PageHeader 
          title="Produtos" 
          subtitle="Gerencie o catálogo de produtos"
        >
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </PageHeader>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categorias.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Toggle de Visualização */}
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none border-r"
                  title="Visualização em cards"
                >
                  <Grid className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Cards</span>
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="rounded-none"
                  title="Visualização em tabela"
                >
                  <TableIcon className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Tabela</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulário */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="codigo">Código *</Label>
                    <Input
                      id="codigo"
                      value={formData.codigo}
                      onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                      placeholder="Ex: PROD001"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      placeholder="Nome do produto"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="preco">Preço *</Label>
                    <Input
                      id="preco"
                      type="number"
                      step="0.01"
                      value={formData.preco}
                      onChange={(e) => setFormData({...formData, preco: e.target.value})}
                      placeholder="0,00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="unidade">Unidade</Label>
                    <Select value={formData.unidade} onValueChange={(value) => setFormData({...formData, unidade: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {unidades.map(unidade => (
                          <SelectItem key={unidade.value} value={unidade.value}>{unidade.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    placeholder="Descrição detalhada do produto"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar Produto'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista de Produtos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Produtos Cadastrados ({filteredProdutos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando produtos...</div>
            ) : filteredProdutos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum produto encontrado.
              </div>
            ) : viewMode === 'grid' ? (
              /* Visualização em Grid (Cards) */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProdutos.map((produto) => (
                  <Card key={produto.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{produto.nome}</h3>
                          <p className="text-sm text-gray-600">Código: {produto.codigo}</p>
                        </div>
                        <Badge variant={produto.ativo ? "default" : "secondary"}>
                          {produto.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      
                      {produto.descricao && (
                        <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                          {produto.descricao}
                        </p>
                      )}
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Categoria:</span>
                          <span>{produto.categoria}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Unidade:</span>
                          <span>{produto.unidade}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Preço:</span>
                          <span className="font-semibold text-lg text-green-600">
                            R$ {produto.preco.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditProduto(produto)}
                          title="Editar produto"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteProduto(produto.id, produto.nome)}
                          title="Excluir produto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* Visualização em Tabela */
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProdutos.map((produto) => (
                      <TableRow key={produto.id}>
                        <TableCell className="font-medium">{produto.codigo}</TableCell>
                        <TableCell className="font-semibold">{produto.nome}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{produto.categoria}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          R$ {produto.preco.toFixed(2)}
                        </TableCell>
                        <TableCell>{produto.unidade}</TableCell>
                        <TableCell>
                          <Badge variant={produto.ativo ? "default" : "secondary"}>
                            {produto.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {produto.descricao ? (
                            <span className="text-sm text-gray-600 line-clamp-2" title={produto.descricao}>
                              {produto.descricao.length > 50 
                                ? `${produto.descricao.substring(0, 50)}...` 
                                : produto.descricao
                              }
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditProduto(produto)}
                              title="Editar produto"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteProduto(produto.id, produto.nome)}
                              title="Excluir produto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
