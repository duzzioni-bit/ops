"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Image, Building2, Settings, ToggleLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { LogoUpload } from "@/components/ui/logo-upload";

interface Configuracao {
  id: string;
  chave: string;
  valor: string;
  tipo: string;
  descricao?: string;
  categoria: string;
  createdAt: string;
  updatedAt: string;
}

export default function ConfiguracoesPage() {
  const [configuracoes, setConfiguracoes] = useState<Configuracao[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Estados para dados da empresa
  const [dadosEmpresa, setDadosEmpresa] = useState({
    nome: "",
    cnpj: "",
    endereco: "",
    telefone: "",
    email: "",
    site: "",
    logo: ""
  });

  // Estados para configurações de recursos
  const [recursos, setRecursos] = useState({
    permitir_orcamentos: true,
    permitir_pedidos: true,
    mostrar_precos: true,
    enviar_notificacoes: true,
    backup_automatico: false,
    modo_debug: false
  });

  useEffect(() => {
    fetchConfiguracoes();
  }, []);

  const fetchConfiguracoes = async () => {
    try {
      const response = await fetch('/api/configuracoes');
      if (response.ok) {
        const data = await response.json();
        setConfiguracoes(data);
        
        // Mapear configurações para os estados
        data.forEach((config: Configuracao) => {
          if (config.categoria === 'empresa') {
            setDadosEmpresa(prev => ({
              ...prev,
              [config.chave.replace('empresa_', '')]: config.valor
            }));
          } else if (config.categoria === 'recursos') {
            setRecursos(prev => ({
              ...prev,
              [config.chave]: config.valor === 'true'
            }));
          }
        });
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    } finally {
      setLoading(false);
    }
  };

  const salvarConfiguracao = async (chave: string, valor: string, categoria: string, descricao?: string) => {
    try {
      const response = await fetch('/api/configuracoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chave,
          valor,
          categoria,
          descricao,
          tipo: typeof valor === 'boolean' ? 'boolean' : 'string'
        }),
      });

      if (response.ok) {
        await fetchConfiguracoes();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      return false;
    }
  };

  const handleSalvarEmpresa = async () => {
    setSaving(true);
    try {
      const promises = Object.entries(dadosEmpresa).map(([key, value]) => {
        if (key !== 'logo') {
          return salvarConfiguracao(
            `empresa_${key}`,
            value,
            'empresa',
            `${key.charAt(0).toUpperCase() + key.slice(1)} da empresa`
          );
        }
      }).filter(Boolean);

      await Promise.all(promises);
      setMessage("Dados da empresa salvos com sucesso!");
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage("Erro ao salvar dados da empresa");
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSalvarRecursos = async () => {
    setSaving(true);
    try {
      const promises = Object.entries(recursos).map(([key, value]) =>
        salvarConfiguracao(
          key,
          value.toString(),
          'recursos',
          `Recurso: ${key.replace(/_/g, ' ')}`
        )
      );

      await Promise.all(promises);
      setMessage("Configurações de recursos salvas com sucesso!");
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage("Erro ao salvar configurações de recursos");
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando configurações...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <PageHeader 
          title="Configurações" 
          subtitle="Gerencie as configurações do sistema"
        />

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg ${message.includes('sucesso') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        <Tabs defaultValue="empresa" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="empresa" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Empresa</span>
            </TabsTrigger>
            <TabsTrigger value="recursos" className="flex items-center space-x-2">
              <ToggleLeft className="h-4 w-4" />
              <span>Recursos</span>
            </TabsTrigger>
            <TabsTrigger value="sistema" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Sistema</span>
            </TabsTrigger>
          </TabsList>

          {/* Dados da Empresa */}
          <TabsContent value="empresa">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Logo da Empresa */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Image className="h-5 w-5" />
                    <span>Logo da Empresa</span>
                  </CardTitle>
                  <CardDescription>
                    Faça upload do logo que aparecerá nos pedidos e orçamentos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LogoUpload 
                    currentLogo={dadosEmpresa.logo}
                    onUploadSuccess={(logoUrl) => {
                      setDadosEmpresa(prev => ({ ...prev, logo: logoUrl }));
                    }}
                  />
                </CardContent>
              </Card>

              {/* Dados da Empresa */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Empresa</CardTitle>
                  <CardDescription>
                    Dados que aparecerão nos documentos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome da Empresa</Label>
                    <Input
                      id="nome"
                      value={dadosEmpresa.nome}
                      onChange={(e) => setDadosEmpresa(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Razão social da empresa"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      value={dadosEmpresa.cnpj}
                      onChange={(e) => setDadosEmpresa(prev => ({ ...prev, cnpj: e.target.value }))}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="endereco">Endereço</Label>
                    <Textarea
                      id="endereco"
                      value={dadosEmpresa.endereco}
                      onChange={(e) => setDadosEmpresa(prev => ({ ...prev, endereco: e.target.value }))}
                      placeholder="Endereço completo da empresa"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={dadosEmpresa.telefone}
                        onChange={(e) => setDadosEmpresa(prev => ({ ...prev, telefone: e.target.value }))}
                        placeholder="(00) 0000-0000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={dadosEmpresa.email}
                        onChange={(e) => setDadosEmpresa(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="contato@empresa.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="site">Website</Label>
                    <Input
                      id="site"
                      value={dadosEmpresa.site}
                      onChange={(e) => setDadosEmpresa(prev => ({ ...prev, site: e.target.value }))}
                      placeholder="www.empresa.com"
                    />
                  </div>

                  <Button onClick={handleSalvarEmpresa} disabled={saving} className="w-full">
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Dados da Empresa
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recursos do Sistema */}
          <TabsContent value="recursos">
            <Card>
              <CardHeader>
                <CardTitle>Recursos do Sistema</CardTitle>
                <CardDescription>
                  Ative ou desative funcionalidades do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between space-x-4">
                    <div className="space-y-1">
                      <Label htmlFor="permitir_orcamentos">Permitir Orçamentos</Label>
                      <p className="text-sm text-gray-500">Habilita a criação de orçamentos</p>
                    </div>
                    <Switch
                      id="permitir_orcamentos"
                      checked={recursos.permitir_orcamentos}
                      onCheckedChange={(checked) => setRecursos(prev => ({ ...prev, permitir_orcamentos: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-4">
                    <div className="space-y-1">
                      <Label htmlFor="permitir_pedidos">Permitir Pedidos</Label>
                      <p className="text-sm text-gray-500">Habilita a criação de pedidos</p>
                    </div>
                    <Switch
                      id="permitir_pedidos"
                      checked={recursos.permitir_pedidos}
                      onCheckedChange={(checked) => setRecursos(prev => ({ ...prev, permitir_pedidos: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-4">
                    <div className="space-y-1">
                      <Label htmlFor="mostrar_precos">Mostrar Preços</Label>
                      <p className="text-sm text-gray-500">Exibe valores nos documentos</p>
                    </div>
                    <Switch
                      id="mostrar_precos"
                      checked={recursos.mostrar_precos}
                      onCheckedChange={(checked) => setRecursos(prev => ({ ...prev, mostrar_precos: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-4">
                    <div className="space-y-1">
                      <Label htmlFor="enviar_notificacoes">Notificações</Label>
                      <p className="text-sm text-gray-500">Envia notificações por e-mail</p>
                    </div>
                    <Switch
                      id="enviar_notificacoes"
                      checked={recursos.enviar_notificacoes}
                      onCheckedChange={(checked) => setRecursos(prev => ({ ...prev, enviar_notificacoes: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-4">
                    <div className="space-y-1">
                      <Label htmlFor="backup_automatico">Backup Automático</Label>
                      <p className="text-sm text-gray-500">Backup diário dos dados</p>
                    </div>
                    <Switch
                      id="backup_automatico"
                      checked={recursos.backup_automatico}
                      onCheckedChange={(checked) => setRecursos(prev => ({ ...prev, backup_automatico: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-4">
                    <div className="space-y-1">
                      <Label htmlFor="modo_debug">Modo Debug</Label>
                      <p className="text-sm text-gray-500">Logs detalhados para desenvolvedores</p>
                    </div>
                    <Switch
                      id="modo_debug"
                      checked={recursos.modo_debug}
                      onCheckedChange={(checked) => setRecursos(prev => ({ ...prev, modo_debug: checked }))}
                    />
                  </div>
                </div>

                <Button onClick={handleSalvarRecursos} disabled={saving} className="w-full">
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Configurações de Recursos
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sistema */}
          <TabsContent value="sistema">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Sistema</CardTitle>
                <CardDescription>
                  Dados técnicos e configurações avançadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Versão do Sistema</Label>
                    <Badge variant="outline">v1.0.0</Badge>
                  </div>
                  <div>
                    <Label>Total de Configurações</Label>
                    <Badge variant="outline">{configuracoes.length}</Badge>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Todas as Configurações</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {configuracoes.map((config) => (
                      <div key={config.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{config.chave}</p>
                          <p className="text-sm text-gray-500">{config.descricao || "Sem descrição"}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">{config.categoria}</Badge>
                          <p className="text-sm text-gray-500 mt-1">
                            {config.tipo === 'boolean' ? (config.valor === 'true' ? 'Ativo' : 'Inativo') : config.valor}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
