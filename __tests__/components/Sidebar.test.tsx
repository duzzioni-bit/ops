import { render, screen, fireEvent } from '@testing-library/react'
import { Sidebar } from '@/components/layout/Sidebar'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

describe('Sidebar', () => {
  it('renders navigation items', () => {
    render(<Sidebar />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Orçamentos')).toBeInTheDocument()
    expect(screen.getByText('Pedidos')).toBeInTheDocument()
    expect(screen.getByText('Relatórios')).toBeInTheDocument()
    expect(screen.getByText('Usuários')).toBeInTheDocument()
    expect(screen.getByText('Configurações')).toBeInTheDocument()
  })

  it('displays user information', () => {
    render(<Sidebar />)

    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('can be collapsed', () => {
    render(<Sidebar />)

    const collapseButton = screen.getByRole('button')
    fireEvent.click(collapseButton)

    // When collapsed, user info should be hidden
    expect(screen.queryByText('Test User')).not.toBeInTheDocument()
  })

  it('has logout functionality', () => {
    const mockSignOut = jest.fn()
    require('next-auth/react').signOut = mockSignOut

    render(<Sidebar />)

    const logoutButton = screen.getByText('Sair')
    fireEvent.click(logoutButton)

    expect(mockSignOut).toHaveBeenCalled()
  })
})

