import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { validateCPF } from "@/lib/cpf-validation";

const createReciboSchema = z.object({
  numero: z.string().min(1, "Número do recibo é obrigatório"),
  valor: z.number().min(0.01, "Valor deve ser maior que zero"),
  pagador: z.object({
    nome: z.string().min(1, "Nome do pagador é obrigatório"),
    cpf: z.string().optional().refine((cpf) => !cpf || validateCPF(cpf), {
      message: "CPF inválido",
    }),
  }),
  recebedor: z.object({
    nome: z.string().min(1, "Nome do recebedor é obrigatório"),
    cpf: z.string().optional().refine((cpf) => !cpf || validateCPF(cpf), {
      message: "CPF inválido",
    }),
  }),
  referente: z.string().min(1, "Descrição do serviço é obrigatória"),
  data: z.string().transform((val) => new Date(val)),
  observacoes: z.string().optional(),
});

// GET - Listar recibos
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
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const where: any = {
      userId: session.user.id,
    };

    if (search) {
      where.OR = [
        { numero: { contains: search, mode: 'insensitive' } },
        { pagadorNome: { contains: search, mode: 'insensitive' } },
        { recebedorNome: { contains: search, mode: 'insensitive' } },
        { referente: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [recibos, total] = await Promise.all([
      prisma.recibo.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
      prisma.recibo.count({ where }),
    ]);

    return NextResponse.json({
      recibos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar recibos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar novo recibo
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
    const validatedData = createReciboSchema.parse(body);

    // Verificar se o número já existe
    const existingRecibo = await prisma.recibo.findFirst({
      where: {
        numero: validatedData.numero,
        userId: session.user.id,
      },
    });

    if (existingRecibo) {
      return NextResponse.json(
        { error: "Número de recibo já existe" },
        { status: 409 }
      );
    }

    const recibo = await prisma.recibo.create({
      data: {
        numero: validatedData.numero,
        valor: validatedData.valor,
        pagadorNome: validatedData.pagador.nome,
        pagadorCpf: validatedData.pagador.cpf,
        recebedorNome: validatedData.recebedor.nome,
        recebedorCpf: validatedData.recebedor.cpf,
        referente: validatedData.referente,
        data: validatedData.data,
        observacoes: validatedData.observacoes,
        userId: session.user.id,
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(recibo, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(issue => {
        const field = issue.path.join('.');
        return `${field}: ${issue.message}`;
      });
      return NextResponse.json(
        { error: "Dados inválidos", details: errorMessages },
        { status: 400 }
      );
    }
    
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        { error: "Erro de referência: usuário não encontrado" },
        { status: 400 }
      );
    }
    
    console.error("Erro ao criar recibo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
