import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

// Schema de validação
const createUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  role: z.enum(["ADMIN", "GERENTE", "VENDEDOR"]),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const updateUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  email: z.string().email("Email inválido").optional(),
  role: z.enum(["ADMIN", "GERENTE", "VENDEDOR"]).optional(),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional(),
});

// GET - Listar usuários
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Apenas ADMIN pode listar usuários
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem gerenciar usuários." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role");

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role && role !== "all") {
      where.role = role.toUpperCase();
    }

    const usuarios = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orcamentos: true,
            pedidos: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar novo usuário
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Apenas ADMIN pode criar usuários
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem criar usuários." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está em uso" },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    const usuario = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        role: validatedData.role,
        // Nota: NextAuth não usa campo password no schema padrão
        // Para implementação completa, seria necessário adicionar campo password ao schema
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(usuario, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir usuário
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Apenas ADMIN pode excluir usuários
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem excluir usuários." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { error: "ID do usuário é obrigatório" },
        { status: 400 }
      );
    }

    // Não permitir que o admin exclua a si mesmo
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Você não pode excluir sua própria conta" },
        { status: 400 }
      );
    }

    // Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            orcamentos: true,
            pedidos: true,
          },
        },
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se usuário tem orçamentos ou pedidos
    if (existingUser._count.orcamentos > 0 || existingUser._count.pedidos > 0) {
      return NextResponse.json(
        { 
          error: "Não é possível excluir usuário com orçamentos ou pedidos associados",
          details: `Este usuário possui ${existingUser._count.orcamentos} orçamentos e ${existingUser._count.pedidos} pedidos.`
        },
        { status: 400 }
      );
    }

    // Excluir contas e sessões primeiro
    await prisma.account.deleteMany({
      where: { userId: userId },
    });

    await prisma.session.deleteMany({
      where: { userId: userId },
    });

    // Excluir usuário
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "Usuário excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}


