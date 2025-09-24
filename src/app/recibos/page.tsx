"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Receipt, Eye, Printer } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function RecibosPage() {
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const loadRecibos = async (page = 1, searchTerm = search) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
      });

      const response = await fetch(`/api/recibos?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRecibos(data.recibos);
        setPagination(data.pagination);
      } else {
        console.error("Erro ao carregar recibos");
      }
    } catch (error) {
      console.error("Erro ao carregar recibos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecibos();
  }, []);

  const handleSearch = () => {
    loadRecibos(1, search);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este recibo?")) {
      return;
    }

    try {
      const response = await fetch(`/api/recibos/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadRecibos(pagination.page);
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

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Recibos"
          description="Gerencie os recibos de pagamento"
          icon={Receipt}
        />

        {/* Filtros e Ações */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex gap-2 flex-1">
                <Input
                  placeholder="Buscar por número, pagador, recebedor ou descrição..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} variant="outline">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              <Button onClick={() => window.location.href = '/recibos/novo'}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Recibo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Recibos */}
        <Card>
          <CardHeader>
            <CardTitle>Recibos ({pagination.total})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando recibos...</div>
            ) : recibos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum recibo encontrado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Pagador</TableHead>
                      <TableHead>Recebedor</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Referente</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recibos.map((recibo) => (
                      <TableRow key={recibo.id}>
                        <TableCell className="font-medium">
                          {recibo.numero}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{recibo.pagadorNome}</div>
                            {recibo.pagadorCpf && (
                              <div className="text-sm text-gray-500">
                                CPF: {recibo.pagadorCpf}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{recibo.recebedorNome}</div>
                            {recibo.recebedorCpf && (
                              <div className="text-sm text-gray-500">
                                CPF: {recibo.recebedorCpf}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {formatCurrency(recibo.valor)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(recibo.data)}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={recibo.referente}>
                            {recibo.referente}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.location.href = `/recibos/${recibo.id}`}
                              title="Visualizar recibo"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.location.href = `/recibos/${recibo.id}/imprimir`}
                              title="Imprimir recibo"
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.location.href = `/recibos/${recibo.id}/editar`}
                              title="Editar recibo"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(recibo.id)}
                              title="Excluir recibo"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Paginação */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => loadRecibos(pagination.page - 1)}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4">
                  Página {pagination.page} de {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => loadRecibos(pagination.page + 1)}
                >
                  Próxima
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
