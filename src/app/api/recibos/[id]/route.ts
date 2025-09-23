import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { validateCPF } from "@/lib/cpf-validation";

const updateReciboSchema = z.object({
  numero: z.string().min(1, "Número do recibo é obrigatório").optional(),
  valor: z.number().min(0.01, "Valor deve ser maior que zero").optional(),
  pagador: z.object({
    nome: z.string().min(1, "Nome do pagador é obrigatório"),
    cpf: z.string().optional().refine((cpf) => !cpf || validateCPF(cpf), {
      message: "CPF inválido",
    }),
  }).optional(),
  recebedor: z.object({
    nome: z.string().min(1, "Nome do recebedor é obrigatório"),
    cpf: z.string().optional().refine((cpf) => !cpf || validateCPF(cpf), {
      message: "CPF inválido",
    }),
  }).optional(),
  referente: z.string().min(1, "Descrição do serviço é obrigatória").optional(),
  data: z.string().transform((val) => new Date(val)).optional(),
  observacoes: z.string().optional(),
});

// GET - Buscar recibo por ID
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

    const { id } = await params;

    const recibo = await prisma.recibo.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    if (!recibo) {
      return NextResponse.json(
        { error: "Recibo não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(recibo);
  } catch (error) {
    console.error("Erro ao buscar recibo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar recibo
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

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateReciboSchema.parse(body);

    // Verificar se o recibo existe e pertence ao usuário
    const existingRecibo = await prisma.recibo.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingRecibo) {
      return NextResponse.json(
        { error: "Recibo não encontrado" },
        { status: 404 }
      );
    }

    // Se o número foi alterado, verificar se não existe outro com o mesmo número
    if (validatedData.numero && validatedData.numero !== existingRecibo.numero) {
      const duplicateRecibo = await prisma.recibo.findFirst({
        where: {
          numero: validatedData.numero,
          userId: session.user.id,
          id: { not: id },
        },
      });

      if (duplicateRecibo) {
        return NextResponse.json(
          { error: "Número de recibo já existe" },
          { status: 409 }
        );
      }
    }

    const updateData: any = {};

    if (validatedData.numero) updateData.numero = validatedData.numero;
    if (validatedData.valor) updateData.valor = validatedData.valor;
    if (validatedData.referente) updateData.referente = validatedData.referente;
    if (validatedData.data) updateData.data = validatedData.data;
    if (validatedData.observacoes !== undefined) updateData.observacoes = validatedData.observacoes;

    if (validatedData.pagador) {
      updateData.pagadorNome = validatedData.pagador.nome;
      updateData.pagadorCpf = validatedData.pagador.cpf;
    }

    if (validatedData.recebedor) {
      updateData.recebedorNome = validatedData.recebedor.nome;
      updateData.recebedorCpf = validatedData.recebedor.cpf;
    }

    const updatedRecibo = await prisma.recibo.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(updatedRecibo);
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
    console.error("Erro ao atualizar recibo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir recibo
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

    const { id } = await params;

    const existingRecibo = await prisma.recibo.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingRecibo) {
      return NextResponse.json(
        { error: "Recibo não encontrado" },
        { status: 404 }
      );
    }

    await prisma.recibo.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Recibo excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir recibo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
