// Tipos base
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'vendedor' | 'gerente';
}

export interface Orcamento {
  id: number;
  numero: string;
  cliente: string;
  valor: number;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'convertido';
  dataVencimento: string;
  vendedor: string;
  itens: ItemOrcamento[];
}

export interface ItemOrcamento {
  id: number;
  produto: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface Pedido {
  id: number;
  numero: string;
  orcamentoId?: number;
  cliente: string;
  valor: number;
  status: 'novo' | 'em_producao' | 'pronto' | 'entregue' | 'cancelado';
  dataEntrega: string;
  vendedor: string;
}

// Mock data
export const mockUsers: User[] = [
  { id: 1, name: 'João Silva', email: 'joao@example.com', role: 'admin' },
  { id: 2, name: 'Maria Santos', email: 'maria@example.com', role: 'vendedor' },
  { id: 3, name: 'Pedro Costa', email: 'pedro@example.com', role: 'gerente' },
];

export const mockOrcamentos: Orcamento[] = [
  {
    id: 1,
    numero: 'ORC-2024-001',
    cliente: 'Empresa ABC Ltda',
    valor: 15000,
    status: 'pendente',
    dataVencimento: '2024-12-31',
    vendedor: 'Maria Santos',
    itens: [
      { id: 1, produto: 'Produto A', quantidade: 10, valorUnitario: 1000, valorTotal: 10000 },
      { id: 2, produto: 'Produto B', quantidade: 5, valorUnitario: 1000, valorTotal: 5000 }
    ]
  },
  {
    id: 2,
    numero: 'ORC-2024-002',
    cliente: 'XYZ Comércio',
    valor: 25000,
    status: 'aprovado',
    dataVencimento: '2024-11-15',
    vendedor: 'João Silva',
    itens: [
      { id: 3, produto: 'Produto C', quantidade: 20, valorUnitario: 1250, valorTotal: 25000 }
    ]
  }
];

export const mockPedidos: Pedido[] = [
  {
    id: 1,
    numero: 'PED-2024-001',
    orcamentoId: 2,
    cliente: 'XYZ Comércio',
    valor: 25000,
    status: 'em_producao',
    dataEntrega: '2024-11-30',
    vendedor: 'João Silva'
  }
];

// Simular delay de rede
export const simulateDelay = (ms: number = 1000) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Funções para buscar dados mockados
export async function getMockUser(id: number): Promise<User | undefined> {
  await simulateDelay(500);
  return mockUsers.find(user => user.id === id);
}

export async function getMockOrcamentos(): Promise<Orcamento[]> {
  await simulateDelay(800);
  return mockOrcamentos;
}

export async function getMockPedidos(): Promise<Pedido[]> {
  await simulateDelay(700);
  return mockPedidos;
}

export async function getMockOrcamento(id: number): Promise<Orcamento | undefined> {
  await simulateDelay(500);
  return mockOrcamentos.find(orc => orc.id === id);
}

