import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const updateUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  email: z.string().email("Email inválido").optional(),
  role: z.enum(["ADMIN", "GERENTE", "VENDEDOR"]).optional(),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional(),
});

// GET - Buscar usuário por ID
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

    const { id: userId } = await params;

    // Usuários podem ver seus próprios dados, ADMIN pode ver qualquer usuário
    if (session.user.role !== "ADMIN" && session.user.id !== userId) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      );
    }

    const usuario = await prisma.user.findUnique({
      where: { id: userId },
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
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar usuário
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

    const { id: userId } = await params;
    const body = await request.json();

    // Usuários podem editar seus próprios dados (exceto role), ADMIN pode editar qualquer usuário
    const isOwnProfile = session.user.id === userId;
    const isAdmin = session.user.role === "ADMIN";

    if (!isAdmin && !isOwnProfile) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      );
    }

    // Se não for admin, remover role dos dados para não permitir auto-promoção
    if (!isAdmin && body.role) {
      delete body.role;
    }

    const validatedData = updateUserSchema.parse(body);

    // Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Se email está sendo alterado, verificar se já existe
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Este email já está em uso" },
          { status: 400 }
        );
      }
    }

    // Preparar dados para atualização
    const updateData: any = {};
    
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.email) updateData.email = validatedData.email;
    if (validatedData.role && isAdmin) updateData.role = validatedData.role;

    // Hash da nova senha se fornecida
    if (validatedData.password) {
      // Nota: Para implementação completa, seria necessário adicionar campo password ao schema
      // updateData.password = await bcrypt.hash(validatedData.password, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}


