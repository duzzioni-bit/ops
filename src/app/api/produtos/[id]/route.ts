import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validação para atualização
const updateProdutoSchema = z.object({
  codigo: z.string().min(1, "Código é obrigatório"),
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string(),
  preco: z.number().min(0, "Preço deve ser positivo"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  unidade: z.string().min(1, "Unidade é obrigatória"),
  ativo: z.boolean().default(true),
});

// PUT - Atualizar produto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin ou gerente
    if (session.user.role !== 'ADMIN' && session.user.role !== 'GERENTE') {
      return NextResponse.json(
        { error: 'Permissão insuficiente' },
        { status: 403 }
      );
    }

    const { id: produtoId } = await params;
    const body = await request.json();
    
    const data = updateProdutoSchema.parse(body);

    // Verificar se o produto existe
    const existingProduto = await prisma.produto.findUnique({
      where: { id: produtoId }
    });

    if (!existingProduto) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o código já existe em outro produto
    if (data.codigo !== existingProduto.codigo) {
      const codeExists = await prisma.produto.findFirst({
        where: { 
          codigo: data.codigo,
          id: { not: produtoId }
        }
      });

      if (codeExists) {
        return NextResponse.json(
          { error: 'Código do produto já existe' },
          { status: 400 }
        );
      }
    }

    // Atualizar produto
    const produto = await prisma.produto.update({
      where: { id: produtoId },
      data
    });

    return NextResponse.json(produto);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET - Buscar produto por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id: produtoId } = await params;

    const produto = await prisma.produto.findUnique({
      where: { id: produtoId }
    });

    if (!produto) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(produto);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

