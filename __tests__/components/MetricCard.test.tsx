import { render, screen } from '@testing-library/react'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { FileText } from 'lucide-react'

describe('MetricCard', () => {
  it('renders metric card with correct data', () => {
    render(
      <MetricCard
        title="Orçamentos Ativos"
        value="12"
        change="+20%"
        changeType="positive"
        trend="up"
        icon={FileText}
        iconColor="text-blue-600"
      />
    )

    expect(screen.getByText('Orçamentos Ativos')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('+20%')).toBeInTheDocument()
  })

  it('renders metric card without change', () => {
    render(
      <MetricCard
        title="Total Pedidos"
        value="8"
        icon={FileText}
      />
    )

    expect(screen.getByText('Total Pedidos')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.queryByText('%')).not.toBeInTheDocument()
  })

  it('applies correct styling for negative change', () => {
    render(
      <MetricCard
        title="Test Metric"
        value="5"
        change="-10%"
        changeType="negative"
        trend="down"
        icon={FileText}
      />
    )

    const changeElement = screen.getByText('-10%')
    expect(changeElement).toHaveClass('text-red-600')
  })
})

