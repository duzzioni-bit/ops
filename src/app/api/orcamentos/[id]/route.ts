import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// GET - Buscar orçamento por ID
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

    const { id: orcamentoId } = await params;

    const where: any = { id: orcamentoId };
    
    // Se não for admin, filtrar apenas orçamentos do usuário
    if (session.user.role !== "ADMIN") {
      where.userId = session.user.id;
    }

    const orcamento = await prisma.orcamento.findFirst({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        itens: {
          include: {
            produtoRef: true,
          },
        },
      },
    });

    if (!orcamento) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(orcamento);
  } catch (error) {
    console.error("Erro ao buscar orçamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar orçamento
const updateOrcamentoSchema = z.object({
  cliente: z.string().min(1, "Cliente é obrigatório"),
  endereco: z.string().optional().nullable().transform(val => val || undefined),
  status: z.enum(["PENDENTE", "APROVADO", "REJEITADO", "CONVERTIDO"]).optional().default("PENDENTE"),
  dataVencimento: z.string().transform((val) => new Date(val)),
  observacoes: z.string().optional().nullable().transform(val => val || undefined),
  valor: z.number().optional(),
  itens: z.array(z.object({
    produtoId: z.string().optional(),
    produto: z.string().min(1, "Produto é obrigatório"),
    quantidade: z.number().min(1, "Quantidade deve ser maior que 0"),
    valorUnitario: z.number().min(0, "Valor unitário deve ser positivo"),
    valorTotal: z.number().min(0, "Valor total deve ser positivo"),
    observacoes: z.string().optional().nullable().transform(val => val || undefined),
  })).optional(),
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

    const { id: orcamentoId } = await params;
    const body = await request.json();

    // Validar dados
    const validatedData = updateOrcamentoSchema.parse(body);

    // Verificar se o orçamento existe e se o usuário tem permissão
    const where: any = { id: orcamentoId };
    
    if (session.user.role !== "ADMIN") {
      where.userId = session.user.id;
    }

    const existingOrcamento = await prisma.orcamento.findFirst({
      where,
    });

    if (!existingOrcamento) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar orçamento com itens se fornecidos
    let updatedOrcamento;
    
    if (validatedData.itens && validatedData.itens.length > 0) {
      // Usar transação para atualizar orçamento e itens
      updatedOrcamento = await prisma.$transaction(async (tx) => {
        // Atualizar dados básicos do orçamento
        const orcamentoAtualizado = await tx.orcamento.update({
          where: { id: orcamentoId },
          data: {
            cliente: validatedData.cliente,
            endereco: validatedData.endereco,
            status: validatedData.status,
            dataVencimento: validatedData.dataVencimento,
            observacoes: validatedData.observacoes,
            valor: validatedData.valor || (validatedData.itens?.reduce((total, item) => total + item.valorTotal, 0) ?? 0),
          },
        });

        // Remover itens existentes
        await tx.itemOrcamento.deleteMany({
          where: { orcamentoId: orcamentoId },
        });

        // Criar novos itens
        if (validatedData.itens) {
          await tx.itemOrcamento.createMany({
            data: validatedData.itens.map(item => ({
            orcamentoId: orcamentoId,
            produtoId: item.produtoId || undefined,
            produto: item.produto,
            quantidade: item.quantidade,
            valorUnitario: item.valorUnitario,
            valorTotal: item.valorTotal,
            observacoes: item.observacoes,
          })),
          });
        }

        // Buscar orçamento completo com itens
        return await tx.orcamento.findUnique({
          where: { id: orcamentoId },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            itens: {
              include: {
                produtoRef: true,
              },
            },
          },
        });
      });
    } else {
      // Atualizar apenas dados básicos se não há itens
      updatedOrcamento = await prisma.orcamento.update({
        where: { id: orcamentoId },
        data: {
          cliente: validatedData.cliente,
          endereco: validatedData.endereco,
          status: validatedData.status,
          dataVencimento: validatedData.dataVencimento,
          observacoes: validatedData.observacoes,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          itens: {
            include: {
              produtoRef: true,
            },
          },
        },
      });
    }

    return NextResponse.json(updatedOrcamento);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar orçamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir orçamento
export async function DELETE(
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

    const { id: orcamentoId } = await params;

    // Verificar se o orçamento existe e se o usuário tem permissão
    const where: any = { id: orcamentoId };
    
    if (session.user.role !== "ADMIN") {
      where.userId = session.user.id;
    }

    const existingOrcamento = await prisma.orcamento.findFirst({
      where,
    });

    if (!existingOrcamento) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o orçamento já foi convertido em pedido
    const pedidoRelacionado = await prisma.pedido.findFirst({
      where: { orcamentoId: orcamentoId },
    });

    if (pedidoRelacionado) {
      return NextResponse.json(
        { error: "Não é possível excluir um orçamento que já foi convertido em pedido" },
        { status: 400 }
      );
    }

    // Excluir itens do orçamento primeiro
    await prisma.itemOrcamento.deleteMany({
      where: { orcamentoId: orcamentoId },
    });

    // Excluir orçamento
    await prisma.orcamento.delete({
      where: { id: orcamentoId },
    });

    return NextResponse.json({ message: "Orçamento excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir orçamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
