import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validação
const configSchema = z.object({
  chave: z.string().min(1, "Chave é obrigatória"),
  valor: z.string(),
  tipo: z.enum(["string", "boolean", "number", "json"]).default("string"),
  descricao: z.string().optional(),
  categoria: z.enum(["geral", "empresa", "sistema", "recursos"]).default("geral"),
});

// GET - Listar configurações
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Apenas admins podem ver configurações
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get("categoria");

    const where: any = {};
    if (categoria) {
      where.categoria = categoria;
    }

    const configuracoes = await prisma.configuracao.findMany({
      where,
      orderBy: [
        { categoria: "asc" },
        { chave: "asc" }
      ]
    });

    return NextResponse.json(configuracoes);
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar ou atualizar configuração
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Apenas admins podem modificar configurações
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = configSchema.parse(body);

    // Verificar se a configuração já existe
    const existingConfig = await prisma.configuracao.findUnique({
      where: { chave: validatedData.chave }
    });

    let configuracao;
    if (existingConfig) {
      // Atualizar existente
      configuracao = await prisma.configuracao.update({
        where: { chave: validatedData.chave },
        data: {
          valor: validatedData.valor,
          tipo: validatedData.tipo,
          descricao: validatedData.descricao,
          categoria: validatedData.categoria,
        }
      });
    } else {
      // Criar nova
      configuracao = await prisma.configuracao.create({
        data: validatedData
      });
    }

    return NextResponse.json(configuracao, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Erro ao salvar configuração:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

