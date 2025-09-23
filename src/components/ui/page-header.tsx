import { useCompanyLogo } from '@/hooks/useCompanyConfig'
import { Loader2 } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  const { companyInfo, loading } = useCompanyLogo()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        {loading ? (
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        ) : companyInfo.logo ? (
          <img 
            src={companyInfo.logo} 
            alt="Logo da empresa" 
            className="h-12 w-auto max-w-[120px] object-contain"
          />
        ) : null}
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-gray-600">{subtitle}</p>
          )}
        </div>
      </div>
      
      {children && (
        <div className="flex flex-col sm:flex-row gap-2">
          {children}
        </div>
      )}
    </div>
  )
}
