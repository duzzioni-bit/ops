import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validação
const createOrcamentoSchema = z.object({
  cliente: z.string().min(1, "Cliente é obrigatório"),
  dataVencimento: z.string().transform((val) => new Date(val)),
  observacoes: z.string().optional(),
  itens: z.array(z.object({
    produto: z.string().min(1, "Produto é obrigatório"),
    quantidade: z.number().min(1, "Quantidade deve ser maior que 0"),
    valorUnitario: z.number().min(0, "Valor unitário deve ser positivo"),
  })).min(1, "Pelo menos um item é obrigatório"),
});

// GET - Listar orçamentos
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
    
    // Se não for admin, filtrar apenas orçamentos do usuário
    if (session.user.role !== "ADMIN") {
      where.userId = session.user.id;
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    const orcamentos = await prisma.orcamento.findMany({
      where,
      include: {
        itens: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orcamentos);
  } catch (error) {
    console.error("Erro ao buscar orçamentos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar novo orçamento
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
    const validatedData = createOrcamentoSchema.parse(body);

    // Calcular valor total
    const valorTotal = validatedData.itens.reduce(
      (total, item) => total + (item.quantidade * item.valorUnitario),
      0
    );

    // Gerar número do orçamento único
    let numero: string;
    let tentativas = 0;
    const maxTentativas = 10;
    
    do {
      const count = await prisma.orcamento.count();
      const timestamp = Date.now().toString().slice(-3);
      numero = `ORC-${new Date().getFullYear()}-${String(count + 1 + tentativas).padStart(3, "0")}-${timestamp}`;
      
      const numeroExiste = await prisma.orcamento.findUnique({
        where: { numero }
      });
      
      if (!numeroExiste) break;
      tentativas++;
    } while (tentativas < maxTentativas);

    const orcamento = await prisma.orcamento.create({
      data: {
        numero,
        cliente: validatedData.cliente,
        valor: valorTotal,
        dataVencimento: validatedData.dataVencimento,
        observacoes: validatedData.observacoes,
        userId: session.user.id,
        itens: {
          create: validatedData.itens.map(item => ({
            produto: item.produto,
            quantidade: item.quantidade,
            valorUnitario: item.valorUnitario,
            valorTotal: item.quantidade * item.valorUnitario,
          })),
        },
      },
      include: {
        itens: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(orcamento, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Erro ao criar orçamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
