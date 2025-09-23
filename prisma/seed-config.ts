import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedConfiguracoes() {
  console.log('🔧 Criando configurações iniciais...')

  // Configurações da empresa
  const empresaConfigs = [
    {
      chave: 'empresa_nome',
      valor: 'Minha Empresa LTDA',
      tipo: 'string',
      descricao: 'Nome da empresa',
      categoria: 'empresa'
    },
    {
      chave: 'empresa_cnpj',
      valor: '00.000.000/0000-00',
      tipo: 'string',
      descricao: 'CNPJ da empresa',
      categoria: 'empresa'
    },
    {
      chave: 'empresa_endereco',
      valor: 'Rua das Empresas, 123\nCentro - Cidade/Estado\nCEP: 00000-000',
      tipo: 'string',
      descricao: 'Endereço completo da empresa',
      categoria: 'empresa'
    },
    {
      chave: 'empresa_telefone',
      valor: '(11) 9999-9999',
      tipo: 'string',
      descricao: 'Telefone da empresa',
      categoria: 'empresa'
    },
    {
      chave: 'empresa_email',
      valor: 'contato@minhaempresa.com',
      tipo: 'string',
      descricao: 'E-mail da empresa',
      categoria: 'empresa'
    },
    {
      chave: 'empresa_site',
      valor: 'www.minhaempresa.com',
      tipo: 'string',
      descricao: 'Website da empresa',
      categoria: 'empresa'
    }
  ]

  // Configurações de recursos
  const recursosConfigs = [
    {
      chave: 'permitir_orcamentos',
      valor: 'true',
      tipo: 'boolean',
      descricao: 'Permite a criação de orçamentos',
      categoria: 'recursos'
    },
    {
      chave: 'permitir_pedidos',
      valor: 'true',
      tipo: 'boolean',
      descricao: 'Permite a criação de pedidos',
      categoria: 'recursos'
    },
    {
      chave: 'mostrar_precos',
      valor: 'true',
      tipo: 'boolean',
      descricao: 'Exibe valores nos documentos',
      categoria: 'recursos'
    },
    {
      chave: 'enviar_notificacoes',
      valor: 'true',
      tipo: 'boolean',
      descricao: 'Envia notificações por e-mail',
      categoria: 'recursos'
    },
    {
      chave: 'backup_automatico',
      valor: 'false',
      tipo: 'boolean',
      descricao: 'Backup diário dos dados',
      categoria: 'recursos'
    },
    {
      chave: 'modo_debug',
      valor: 'false',
      tipo: 'boolean',
      descricao: 'Logs detalhados para desenvolvedores',
      categoria: 'recursos'
    }
  ]

  // Criar configurações
  for (const config of [...empresaConfigs, ...recursosConfigs]) {
    await prisma.configuracao.upsert({
      where: { chave: config.chave },
      create: config,
      update: {}
    })
  }

  console.log('✅ Configurações criadas com sucesso!')
}

seedConfiguracoes()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

