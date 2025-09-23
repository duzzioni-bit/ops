import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/orcamentos/route'

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => ({
    user: {
      id: 'user-1',
      email: 'test@example.com',
      role: 'ADMIN',
    },
  })),
}))

// Mock Prisma
const mockPrisma = {
  orcamento: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
}

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

describe('/api/orcamentos', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return orçamentos for authenticated user', async () => {
      const mockOrcamentos = [
        {
          id: '1',
          numero: 'ORC-2024-001',
          cliente: 'Empresa ABC',
          valor: 15000,
          status: 'PENDENTE',
          itens: [],
          user: { name: 'Test User', email: 'test@example.com' },
        },
      ]

      mockPrisma.orcamento.findMany.mockResolvedValue(mockOrcamentos)

      const request = new NextRequest('http://localhost:3000/api/orcamentos')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockOrcamentos)
      expect(mockPrisma.orcamento.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          itens: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    })

    it('should filter by status when provided', async () => {
      mockPrisma.orcamento.findMany.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/orcamentos?status=aprovado')
      await GET(request)

      expect(mockPrisma.orcamento.findMany).toHaveBeenCalledWith({
        where: { status: 'APROVADO' },
        include: {
          itens: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    })
  })

  describe('POST', () => {
    it('should create new orçamento with valid data', async () => {
      const mockOrcamento = {
        id: '1',
        numero: 'ORC-2024-001',
        cliente: 'Nova Empresa',
        valor: 10000,
        itens: [],
        user: { name: 'Test User', email: 'test@example.com' },
      }

      mockPrisma.orcamento.count.mockResolvedValue(0)
      mockPrisma.orcamento.create.mockResolvedValue(mockOrcamento)

      const requestData = {
        cliente: 'Nova Empresa',
        dataVencimento: '2024-12-31',
        itens: [
          {
            produto: 'Produto Teste',
            quantidade: 2,
            valorUnitario: 5000,
          },
        ],
      }

      const request = new NextRequest('http://localhost:3000/api/orcamentos', {
        method: 'POST',
        body: JSON.stringify(requestData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual(mockOrcamento)
      expect(mockPrisma.orcamento.create).toHaveBeenCalled()
    })

    it('should return 400 for invalid data', async () => {
      const requestData = {
        // Missing required fields
        cliente: '',
        itens: [],
      }

      const request = new NextRequest('http://localhost:3000/api/orcamentos', {
        method: 'POST',
        body: JSON.stringify(requestData),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })
  })
})

