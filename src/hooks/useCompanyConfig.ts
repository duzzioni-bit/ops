import { useState, useEffect, useCallback } from 'react'

interface CompanyInfo {
  logo: string | null
  name: string
}

// Store global para forçar atualizações
let globalUpdateCounter = 0
const listeners: Array<() => void> = []

export function triggerCompanyInfoUpdate() {
  globalUpdateCounter++
  listeners.forEach(listener => listener())
}

export function useCompanyLogo() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    logo: null,
    name: 'Ops - Orçamentos e Pedidos'
  })
  const [loading, setLoading] = useState(true)
  const [updateCounter, setUpdateCounter] = useState(0)

  const fetchCompanyInfo = useCallback(async () => {
    try {
      const response = await fetch('/api/configuracoes?categoria=empresa', {
        cache: 'no-cache'
      })
      if (response.ok) {
        const configs = await response.json()
        
        const logoConfig = configs.find((c: any) => c.chave === 'empresa_logo')
        const nameConfig = configs.find((c: any) => c.chave === 'empresa_nome')
        
        setCompanyInfo({
          logo: logoConfig?.valor || null,
          name: nameConfig?.valor || 'Ops - Orçamentos e Pedidos'
        })
      }
    } catch (error) {
      console.error('Erro ao buscar informações da empresa:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCompanyInfo()
  }, [fetchCompanyInfo, updateCounter])

  useEffect(() => {
    const updateListener = () => {
      setUpdateCounter(globalUpdateCounter)
    }
    
    listeners.push(updateListener)
    
    return () => {
      const index = listeners.indexOf(updateListener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  return { companyInfo, loading, refetch: fetchCompanyInfo }
}

