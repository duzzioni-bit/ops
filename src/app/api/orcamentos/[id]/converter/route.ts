import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Converter orçamento em pedido
export async function POST(
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

    // Buscar o orçamento com seus itens
    const orcamento = await prisma.orcamento.findFirst({
      where: { 
        id: orcamentoId,
        ...(session.user.role !== "ADMIN" ? { userId: session.user.id } : {})
      },
      include: {
        itens: true,
      },
    });

    if (!orcamento) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o orçamento está aprovado
    if (orcamento.status !== "APROVADO") {
      return NextResponse.json(
        { error: "Só é possível converter orçamentos aprovados em pedidos" },
        { status: 400 }
      );
    }

    // Verificar se já foi convertido
    const pedidoExistente = await prisma.pedido.findFirst({
      where: { orcamentoId: orcamentoId },
    });

    if (pedidoExistente) {
      return NextResponse.json(
        { error: "Este orçamento já foi convertido em pedido" },
        { status: 400 }
      );
    }

    // Gerar número do pedido
    const count = await prisma.pedido.count();
    const numero = `PED-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;

    // Criar pedido usando uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar o pedido
      const novoPedido = await tx.pedido.create({
        data: {
          numero,
          cliente: orcamento.cliente,
          endereco: orcamento.endereco,
          valor: orcamento.valor,
          status: "NOVO",
          dataEntrega: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias a partir de hoje
          observacoes: `Convertido do orçamento ${orcamento.numero}. ${orcamento.observacoes || ''}`.trim(),
          userId: session.user.id,
          orcamentoId: orcamento.id,
        },
      });

      // Criar os itens do pedido
      for (const item of orcamento.itens) {
        // Tentar encontrar o produto pelo nome
        const produto = await tx.produto.findFirst({
          where: {
            nome: item.produto
          }
        });

        if (produto) {
          await tx.itemPedido.create({
            data: {
              pedidoId: novoPedido.id,
              produtoId: produto.id,
              quantidade: item.quantidade,
              valorUnitario: item.valorUnitario,
              valorTotal: item.valorTotal,
              observacoes: item.observacoes,
            },
          });
        }
      }

      // Atualizar status do orçamento para CONVERTIDO
      await tx.orcamento.update({
        where: { id: orcamento.id },
        data: { status: "CONVERTIDO" },
      });

      return novoPedido;
    });

    // Buscar o pedido completo para retornar
    const pedidoCompleto = await prisma.pedido.findUnique({
      where: { id: result.id },
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
        itens: true,
      },
    });

    return NextResponse.json(pedidoCompleto);
  } catch (error) {
    console.error("Erro ao converter orçamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
