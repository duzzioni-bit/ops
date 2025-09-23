import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validação para criação de produto
const createProdutoSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  preco: z.number().min(0, 'Preço deve ser maior que zero'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  unidade: z.string().default('un'),
  ativo: z.boolean().default(true)
})

// GET /api/produtos
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const ativo = searchParams.get('ativo')
    const categoria = searchParams.get('categoria')
    const search = searchParams.get('search')

    const where: any = {}
    
    if (ativo !== null) {
      where.ativo = ativo === 'true'
    }
    
    if (categoria) {
      where.categoria = categoria
    }
    
    if (search) {
      where.OR = [
        { nome: { contains: search } },
        { codigo: { contains: search } },
        { descricao: { contains: search } }
      ]
    }

    const produtos = await prisma.produto.findMany({
      where,
      orderBy: [
        { ativo: 'desc' },
        { nome: 'asc' }
      ]
    })

    return NextResponse.json(produtos)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/produtos
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é admin ou gerente
    if (session.user.role !== 'ADMIN' && session.user.role !== 'GERENTE') {
      return NextResponse.json(
        { error: 'Permissão insuficiente' },
        { status: 403 }
      )
    }

    const body = await request.json()
    console.log('📦 Dados recebidos para criar produto:', JSON.stringify(body, null, 2))
    
    const data = createProdutoSchema.parse(body)
    console.log('✅ Dados validados com Zod:', JSON.stringify(data, null, 2))

    // Verificar se o código já existe
    console.log('🔍 Verificando se código já existe:', data.codigo)
    const existingProduto = await prisma.produto.findUnique({
      where: { codigo: data.codigo }
    })

    if (existingProduto) {
      console.log('❌ Código já existe:', existingProduto.codigo)
      return NextResponse.json(
        { error: 'Código do produto já existe' },
        { status: 400 }
      )
    }

    console.log('💾 Criando produto no banco de dados...')
    const produto = await prisma.produto.create({
      data
    })
    console.log('✅ Produto criado com sucesso:', produto.id, produto.nome)

    return NextResponse.json(produto, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir produto
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Apenas admins podem excluir produtos
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Você não tem permissão para excluir produtos" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const produtoId = searchParams.get("id");

    if (!produtoId) {
      return NextResponse.json(
        { error: "ID do produto é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o produto existe
    const produtoExistente = await prisma.produto.findUnique({
      where: { id: produtoId },
    });

    if (!produtoExistente) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o produto está sendo usado em pedidos ou orçamentos
    const produtoEmUso = await prisma.itemPedido.findFirst({
      where: { produtoId: produtoId },
    });

    if (produtoEmUso) {
      return NextResponse.json(
        { error: "Não é possível excluir o produto pois ele está sendo usado em pedidos" },
        { status: 400 }
      );
    }

    // Verificar se está em orçamentos
    const produtoEmOrcamento = await prisma.itemOrcamento.findFirst({
      where: { produtoId: produtoId },
    });

    if (produtoEmOrcamento) {
      return NextResponse.json(
        { error: "Não é possível excluir o produto pois ele está sendo usado em orçamentos" },
        { status: 400 }
      );
    }

    // Excluir o produto
    await prisma.produto.delete({
      where: { id: produtoId },
    });

    return NextResponse.json({ message: "Produto excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
