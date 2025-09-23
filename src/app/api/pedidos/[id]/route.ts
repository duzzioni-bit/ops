import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// GET - Buscar pedido por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id: pedidoId } = await params;

    const where: any = { id: pedidoId };
    
    // Se não for admin, filtrar apenas pedidos do usuário
    if (session.user.role !== "ADMIN") {
      where.userId = session.user.id;
    }

    const pedido = await prisma.pedido.findFirst({
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
    });

    if (!pedido) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(pedido);
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar pedido
const updatePedidoSchema = z.object({
  cliente: z.string().min(1, "Cliente é obrigatório"),
  endereco: z.string().optional().nullable().transform(val => val || undefined),
  status: z.string().optional().default("NOVO").transform((val) => val?.toUpperCase() || "NOVO"),
  dataEntrega: z.string().transform((val) => new Date(val)),
  observacoes: z.string().optional().nullable().transform(val => val || undefined),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id: pedidoId } = await params;
    const body = await request.json();

    // Validar dados
    const validatedData = updatePedidoSchema.parse(body);

    // Verificar se o pedido existe e se o usuário tem permissão
    const where: any = { id: pedidoId };
    
    if (session.user.role !== "ADMIN") {
      where.userId = session.user.id;
    }

    const existingPedido = await prisma.pedido.findFirst({
      where,
    });

    if (!existingPedido) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar pedido
    const updatedPedido = await prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        cliente: validatedData.cliente,
        endereco: validatedData.endereco,
        status: validatedData.status,
        dataEntrega: validatedData.dataEntrega,
        observacoes: validatedData.observacoes,
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

    return NextResponse.json(updatedPedido);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar pedido:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
