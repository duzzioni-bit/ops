import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Contar recibos do usuário
    const count = await prisma.recibo.count({
      where: { userId: session.user.id }
    });

    // Gerar número único
    const currentYear = new Date().getFullYear();
    const sequencial = String(count + 1).padStart(3, "0");
    const timestamp = Date.now().toString().slice(-4);
    
    const numero = `REC-${currentYear}-${sequencial}-${timestamp}`;

    return NextResponse.json({ numero });
  } catch (error) {
    console.error("Erro ao gerar número do recibo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

















