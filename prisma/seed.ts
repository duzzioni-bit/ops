import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuários de exemplo
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@sistema.com' },
    update: {},
    create: {
      email: 'admin@sistema.com',
      name: 'Administrador',
      role: 'ADMIN',
    },
  })

  const vendedorUser = await prisma.user.upsert({
    where: { email: 'maria@sistema.com' },
    update: {},
    create: {
      email: 'maria@sistema.com',
      name: 'Maria Santos',
      role: 'VENDEDOR',
    },
  })

  const gerenteUser = await prisma.user.upsert({
    where: { email: 'joao@sistema.com' },
    update: {},
    create: {
      email: 'joao@sistema.com',
      name: 'João Silva',
      role: 'GERENTE',
    },
  })

  // Criar orçamentos de exemplo
  const orcamento1 = await prisma.orcamento.create({
    data: {
      numero: 'ORC-2024-001',
      cliente: 'Empresa ABC Ltda',
      valor: 15000,
      status: 'PENDENTE',
      dataVencimento: new Date('2024-12-31'),
      userId: vendedorUser.id,
      itens: {
        create: [
          {
            produto: 'Produto A',
            quantidade: 10,
            valorUnitario: 1000,
            valorTotal: 10000,
          },
          {
            produto: 'Produto B',
            quantidade: 5,
            valorUnitario: 1000,
            valorTotal: 5000,
          },
        ],
      },
    },
  })

  const orcamento2 = await prisma.orcamento.create({
    data: {
      numero: 'ORC-2024-002',
      cliente: 'XYZ Comércio',
      valor: 25000,
      status: 'APROVADO',
      dataVencimento: new Date('2024-11-15'),
      userId: gerenteUser.id,
      itens: {
        create: [
          {
            produto: 'Produto C',
            quantidade: 20,
            valorUnitario: 1250,
            valorTotal: 25000,
          },
        ],
      },
    },
  })

  // Criar pedidos de exemplo
  const pedido1 = await prisma.pedido.create({
    data: {
      numero: 'PED-2024-001',
      cliente: 'XYZ Comércio',
      valor: 25000,
      status: 'EM_PRODUCAO',
      dataEntrega: new Date('2024-11-30'),
      userId: gerenteUser.id,
      orcamentoId: orcamento2.id,
    },
  })

  // Criar produtos
  console.log('📦 Criando produtos...')
  const produtos = await Promise.all([
    prisma.produto.create({
      data: {
        codigo: 'COMP001',
        nome: 'Computador Desktop',
        descricao: 'Computador completo para escritório',
        preco: 2500.00,
        categoria: 'Informática',
        unidade: 'un'
      }
    }),
    prisma.produto.create({
      data: {
        codigo: 'MOB001',
        nome: 'Mesa de Escritório',
        descricao: 'Mesa de madeira para escritório',
        preco: 450.00,
        categoria: 'Móveis',
        unidade: 'un'
      }
    }),
    prisma.produto.create({
      data: {
        codigo: 'CAD001',
        nome: 'Cadeira Ergonômica',
        descricao: 'Cadeira ergonômica para escritório',
        preco: 350.00,
        categoria: 'Móveis',
        unidade: 'un'
      }
    }),
    prisma.produto.create({
      data: {
        codigo: 'IMP001',
        nome: 'Impressora Multifuncional',
        descricao: 'Impressora, scanner e copiadora',
        preco: 800.00,
        categoria: 'Eletrônicos',
        unidade: 'un'
      }
    }),
    prisma.produto.create({
      data: {
        codigo: 'INST001',
        nome: 'Instalação de Rede',
        descricao: 'Serviço de instalação de rede estruturada',
        preco: 150.00,
        categoria: 'Serviços',
        unidade: 'h'
      }
    }),
    prisma.produto.create({
      data: {
        codigo: 'CAB001',
        nome: 'Cabo de Rede Cat6',
        descricao: 'Cabo de rede categoria 6',
        preco: 5.50,
        categoria: 'Informática',
        unidade: 'm'
      }
    })
  ])

  console.log('✅ Seed concluído!')
  console.log('👤 Usuários criados:', { adminUser, vendedorUser, gerenteUser })
  console.log('📋 Orçamentos criados:', { orcamento1, orcamento2 })
  console.log('🛒 Pedidos criados:', { pedido1 })
  console.log('📦 Produtos criados:', produtos.length)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
