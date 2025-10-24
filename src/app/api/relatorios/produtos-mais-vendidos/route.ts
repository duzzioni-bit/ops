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

    const { searchParams } = new URL(request.url);
    const dias = parseInt(searchParams.get("dias") || "30");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Calcular data limite
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - dias);

    // Buscar itens de pedidos no período especificado
    const itensPedidos = await prisma.itemPedido.findMany({
      where: {
        pedido: {
          createdAt: {
            gte: dataLimite
          }
        }
      },
      include: {
        produto: {
          select: {
            id: true,
            nome: true,
            codigo: true,
            categoria: true,
            preco: true,
            unidade: true
          }
        },
        pedido: {
          select: {
            id: true,
            numero: true,
            cliente: true,
            status: true,
            createdAt: true
          }
        }
      }
    });

    // Agrupar por produto e calcular estatísticas
    const produtosMap = new Map();

    itensPedidos.forEach(item => {
      const produtoId = item.produto.id;
      
      if (!produtosMap.has(produtoId)) {
        produtosMap.set(produtoId, {
          id: produtoId,
          nome: item.produto.nome,
          codigo: item.produto.codigo,
          categoria: item.produto.categoria,
          precoBase: item.produto.preco,
          unidade: item.produto.unidade,
          totalQuantidade: 0,
          totalVendas: 0,
          totalReceita: 0,
          numeroVendas: 0,
          pedidos: new Set()
        });
      }

      const produto = produtosMap.get(produtoId);
      produto.totalQuantidade += item.quantidade;
      produto.totalReceita += item.valorTotal;
      produto.pedidos.add(item.pedido.id);
      produto.numeroVendas = produto.pedidos.size;
    });

    // Converter para array e ordenar por quantidade vendida
    const produtosMaisVendidos = Array.from(produtosMap.values())
      .map(produto => ({
        id: produto.id,
        nome: produto.nome,
        codigo: produto.codigo,
        categoria: produto.categoria,
        precoBase: produto.precoBase,
        unidade: produto.unidade,
        totalQuantidade: produto.totalQuantidade,
        totalReceita: produto.totalReceita,
        numeroVendas: produto.numeroVendas,
        precoMedio: produto.totalReceita / produto.totalQuantidade,
        participacao: 0 // Será calculado depois
      }))
      .sort((a, b) => b.totalQuantidade - a.totalQuantidade)
      .slice(0, limit);

    // Calcular participação percentual
    const totalGeralQuantidade = produtosMaisVendidos.reduce((sum, p) => sum + p.totalQuantidade, 0);
    const totalGeralReceita = produtosMaisVendidos.reduce((sum, p) => sum + p.totalReceita, 0);

    produtosMaisVendidos.forEach(produto => {
      produto.participacao = totalGeralQuantidade > 0 
        ? (produto.totalQuantidade / totalGeralQuantidade) * 100 
        : 0;
    });

    // Estatísticas gerais
    const estatisticas = {
      totalProdutos: produtosMap.size,
      totalQuantidadeVendida: totalGeralQuantidade,
      totalReceitaGerada: totalGeralReceita,
      periodoAnalise: dias,
      dataInicio: dataLimite.toISOString(),
      dataFim: new Date().toISOString()
    };

    return NextResponse.json({
      produtos: produtosMaisVendidos,
      estatisticas
    });

  } catch (error) {
    console.error("Erro ao buscar produtos mais vendidos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
















