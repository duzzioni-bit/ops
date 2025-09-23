import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validação
const createPedidoSchema = z.object({
  cliente: z.string().min(1, "Cliente é obrigatório"),
  endereco: z.string().optional().nullable().transform(val => val || undefined),
  valor: z.number().min(0, "Valor deve ser positivo"),
  status: z.string().optional().default("novo").transform((val) => val?.toUpperCase() || "NOVO"),
  dataEntrega: z.string().transform((val) => new Date(val)),
  observacoes: z.string().optional().nullable().transform(val => val || undefined),
  orcamentoId: z.string().optional().nullable().transform(val => val || undefined),
  itens: z.array(z.object({
    produtoId: z.string(),
    quantidade: z.number().min(1),
    valorUnitario: z.number().min(0),
    valorTotal: z.number().min(0),
    observacoes: z.string().optional().nullable().transform(val => val || undefined),
  })).min(1, "Pelo menos um item é obrigatório"),
});

// GET - Listar pedidos
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = {};
    
    // Se não for admin, filtrar apenas pedidos do usuário
    if (session.user.role !== "ADMIN") {
      where.userId = session.user.id;
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    const pedidos = await prisma.pedido.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        orcamento: {
          select: {
            numero: true,
          },
        },
        itens: {
          include: {
            produto: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(pedidos);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar novo pedido
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('=== DEBUG PEDIDO ===');
    console.log('Dados recebidos:', JSON.stringify(body, null, 2));
    console.log('Usuário da sessão:', JSON.stringify({
      id: session.user.id,
      email: session.user.email,
      role: session.user.role
    }, null, 2));
    
    // Validação com tratamento robusto de erros
    let validatedData;
    try {
      console.log('Iniciando validação com Zod...');
      validatedData = createPedidoSchema.parse(body);
      console.log('✓ Validação Zod bem-sucedida');
      console.log('Dados validados:', JSON.stringify(validatedData, null, 2));
    } catch (zodError) {
      console.error('❌ Erro de validação Zod:', zodError);
      if (zodError instanceof z.ZodError) {
        console.error('Detalhes do erro Zod:', JSON.stringify(zodError.issues, null, 2));
        return NextResponse.json(
          { 
            error: "Erro de validação de dados", 
            details: zodError.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)
          },
          { status: 400 }
        );
      }
      console.error('Erro não é ZodError:', zodError);
      return NextResponse.json(
        { error: "Erro de validação desconhecido" },
        { status: 400 }
      );
    }

    // Validar se todos os produtos existem
    console.log('Validando produtos...');
    const produtoIds = validatedData.itens.map(item => item.produtoId);
    const produtosExistentes = await prisma.produto.findMany({
      where: {
        id: { in: produtoIds },
        ativo: true
      },
      select: { id: true, nome: true }
    });
    
    console.log('Produtos solicitados:', produtoIds);
    console.log('Produtos encontrados:', produtosExistentes.map(p => ({ id: p.id, nome: p.nome })));
    
    if (produtosExistentes.length !== produtoIds.length) {
      const produtosEncontradosIds = produtosExistentes.map(p => p.id);
      const produtosNaoEncontrados = produtoIds.filter(id => !produtosEncontradosIds.includes(id));
      console.error('Produtos não encontrados:', produtosNaoEncontrados);
      
      return NextResponse.json(
        { 
          error: "Produtos inválidos encontrados", 
          details: `Os seguintes produtos não foram encontrados ou estão inativos: ${produtosNaoEncontrados.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Validar se o usuário da sessão existe no banco
    console.log('Validando usuário da sessão...');
    console.log('Session user ID:', session.user.id);
    
    const usuarioExistente = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true }
    });
    
    console.log('Usuário encontrado:', usuarioExistente);
    
    if (!usuarioExistente) {
      console.error('Usuário da sessão não encontrado no banco:', session.user.id);
      return NextResponse.json(
        { 
          error: "Usuário inválido", 
          details: "O usuário da sessão não foi encontrado no banco de dados"
        },
        { status: 400 }
      );
    }

    // Gerar número do pedido único
    console.log('Gerando número do pedido...');
    let numero: string;
    let tentativas = 0;
    const maxTentativas = 10;
    
    do {
      const count = await prisma.pedido.count();
      const timestamp = Date.now().toString().slice(-3); // últimos 3 dígitos do timestamp
      numero = `PED-${new Date().getFullYear()}-${String(count + 1 + tentativas).padStart(3, "0")}-${timestamp}`;
      
      const numeroExiste = await prisma.pedido.findUnique({
        where: { numero }
      });
      
      if (!numeroExiste) break;
      tentativas++;
    } while (tentativas < maxTentativas);
    
    console.log('Número gerado:', numero);

    console.log('Criando pedido no banco...');
    
    // Log detalhado dos dados que serão enviados ao Prisma
    const dadosPedido = {
      numero,
      cliente: validatedData.cliente,
      endereco: validatedData.endereco,
      valor: validatedData.valor,
      status: validatedData.status,
      dataEntrega: validatedData.dataEntrega,
      observacoes: validatedData.observacoes,
      userId: session.user.id,
      orcamentoId: validatedData.orcamentoId,
    };
    
    const dadosItens = validatedData.itens.map(item => ({
      produtoId: item.produtoId,
      quantidade: item.quantidade,
      valorUnitario: item.valorUnitario,
      valorTotal: item.valorTotal,
      observacoes: item.observacoes,
    }));
    
    console.log('Dados do pedido para Prisma:', JSON.stringify(dadosPedido, null, 2));
    console.log('Dados dos itens para Prisma:', JSON.stringify(dadosItens, null, 2));
    
    // Criar pedido com itens em uma única transação
    console.log('Criando pedido com itens...');
    const pedido = await prisma.pedido.create({
      data: {
        ...dadosPedido,
        itens: {
          create: dadosItens
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        orcamento: {
          select: {
            numero: true,
          },
        },
        itens: {
          include: {
            produto: true,
          },
        },
      },
    });

    console.log('Pedido criado com sucesso:', pedido.id);
    return NextResponse.json(pedido, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Erro de validação Zod:", error.issues);
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("❌ Erro ao criar pedido:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : 'N/A');
    console.error("Tipo do erro:", typeof error);
    console.error("Construtor do erro:", error?.constructor?.name);
    
    // Log específico para erros do Prisma
    if (error && typeof error === 'object' && 'code' in error) {
      console.error("❌ Código do erro Prisma:", (error as any).code);
      console.error("❌ Meta do erro Prisma:", (error as any).meta);
      console.error("❌ Mensagem do erro Prisma:", (error as any).message);
    }
    
    return NextResponse.json(
      { 
        error: "Erro interno do servidor", 
        message: error instanceof Error ? error.message : "Erro desconhecido",
        prismaCode: error && typeof error === 'object' && 'code' in error ? (error as any).code : undefined,
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE - Excluir pedido
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const pedidoId = searchParams.get("id");

    if (!pedidoId) {
      return NextResponse.json(
        { error: "ID do pedido é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o pedido existe e se o usuário tem permissão
    const pedidoExistente = await prisma.pedido.findUnique({
      where: { id: pedidoId },
    });

    if (!pedidoExistente) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    // Se não for admin, verificar se é o dono do pedido
    if (session.user.role !== "ADMIN" && pedidoExistente.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Você não tem permissão para excluir este pedido" },
        { status: 403 }
      );
    }

    // Excluir o pedido (os itens serão excluídos automaticamente por causa do onDelete: Cascade)
    await prisma.pedido.delete({
      where: { id: pedidoId },
    });

    return NextResponse.json({ message: "Pedido excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir pedido:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
