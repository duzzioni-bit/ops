import { prisma } from "@/lib/prisma";

export interface Configuracao {
  id: string;
  chave: string;
  valor: string;
  tipo: string;
  descricao?: string | null;
  categoria: string;
}

// Cache simples para configurações
let configCache: Map<string, string> = new Map();
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export async function getConfiguracao(chave: string): Promise<string | null> {
  // Verificar cache
  const now = Date.now();
  if (configCache.has(chave) && (now - cacheTimestamp) < CACHE_TTL) {
    return configCache.get(chave) || null;
  }

  try {
    const config = await prisma.configuracao.findUnique({
      where: { chave }
    });

    const valor = config?.valor || null;
    
    // Atualizar cache
    if (valor !== null) {
      configCache.set(chave, valor);
      cacheTimestamp = now;
    }

    return valor;
  } catch (error) {
    console.error(`Erro ao buscar configuração ${chave}:`, error);
    return null;
  }
}

export async function getConfiguracoesPorCategoria(categoria: string): Promise<Configuracao[]> {
  try {
    const configs = await prisma.configuracao.findMany({
      where: { categoria },
      orderBy: { chave: 'asc' }
    });

    return configs;
  } catch (error) {
    console.error(`Erro ao buscar configurações da categoria ${categoria}:`, error);
    return [];
  }
}

export async function salvarConfiguracao(
  chave: string, 
  valor: string, 
  categoria: string = 'geral',
  tipo: string = 'string',
  descricao?: string
): Promise<boolean> {
  try {
    await prisma.configuracao.upsert({
      where: { chave },
      create: {
        chave,
        valor,
        tipo,
        categoria,
        descricao
      },
      update: {
        valor,
        tipo,
        categoria,
        descricao
      }
    });

    // Limpar cache
    configCache.delete(chave);
    
    return true;
  } catch (error) {
    console.error(`Erro ao salvar configuração ${chave}:`, error);
    return false;
  }
}

// Funções de conveniência
export async function getEmpresaNome(): Promise<string> {
  return await getConfiguracao('empresa_nome') || 'Minha Empresa';
}

export async function getEmpresaLogo(): Promise<string | null> {
  return await getConfiguracao('empresa_logo');
}

export async function isRecursoAtivo(recurso: string): Promise<boolean> {
  const valor = await getConfiguracao(recurso);
  return valor === 'true';
}

