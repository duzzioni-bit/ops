import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Apenas admins podem fazer upload do logo
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    console.log('FormData recebido:', [...formData.entries()]);
    
    const file = formData.get("file") as File;
    console.log('Arquivo extraído:', file ? {
      name: file.name,
      type: file.type,
      size: file.size
    } : 'null');

    if (!file) {
      console.log('Erro: Nenhum arquivo encontrado no FormData');
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido. Use JPG, PNG ou WebP." },
        { status: 400 }
      );
    }

    // Validar tamanho (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 5MB." },
        { status: 400 }
      );
    }

    // Criar diretório se não existir
    const uploadsDir = join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Diretório já existe ou erro ao criar
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const fileName = `logo-${timestamp}.${extension}`;
    const filePath = join(uploadsDir, fileName);

    // Salvar arquivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Salvar caminho do logo nas configurações
    const logoUrl = `/uploads/${fileName}`;
    
    await prisma.configuracao.upsert({
      where: { chave: "empresa_logo" },
      create: {
        chave: "empresa_logo",
        valor: logoUrl,
        tipo: "string",
        descricao: "Logo da empresa",
        categoria: "empresa"
      },
      update: {
        valor: logoUrl,
      }
    });

    return NextResponse.json({ 
      success: true, 
      logoUrl,
      message: "Logo atualizado com sucesso!" 
    });

  } catch (error) {
    console.error("Erro no upload do logo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
