"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { triggerCompanyInfoUpdate } from '@/hooks/useCompanyConfig'

interface LogoUploadProps {
  currentLogo?: string | null
  onUploadSuccess?: (logoUrl: string) => void
}

export function LogoUpload({ currentLogo, onUploadSuccess }: LogoUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogo || null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (!file) return

    // Validações
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de arquivo não permitido. Use JPG, PNG ou WebP.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo 5MB.')
      return
    }

    // Salvar arquivo selecionado
    setSelectedFile(file)

    // Preview local
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Selecione um arquivo primeiro.')
      return
    }

    setIsUploading(true)
    try {
      console.log('Enviando arquivo:', selectedFile.name, selectedFile.type, selectedFile.size)
      
      const formData = new FormData()
      formData.append('file', selectedFile)

      console.log('FormData criado, enviando para API...')

      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        body: formData
      })

      console.log('Resposta da API:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Upload bem-sucedido:', data)
        setPreviewUrl(data.logoUrl)
        onUploadSuccess?.(data.logoUrl)
        
        // Trigger global update
        triggerCompanyInfoUpdate()
        
        alert('Logo atualizado com sucesso!')
        setSelectedFile(null) // Limpar arquivo selecionado
      } else {
        const error = await response.json()
        console.error('Erro da API:', error)
        alert(error.error || 'Erro ao fazer upload do logo')
        setPreviewUrl(currentLogo || null)
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      alert('Erro ao fazer upload do logo')
      setPreviewUrl(currentLogo || null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const removeLogo = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {/* Preview atual */}
      {previewUrl && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Image 
                  src={previewUrl} 
                  alt="Logo da empresa" 
                  width={200}
                  height={64}
                  className="h-16 w-auto max-w-[200px] object-contain border rounded"
                />
                <div>
                  <p className="font-medium">Logo atual</p>
                  <p className="text-sm text-gray-500">
                    Clique em &ldquo;Selecionar novo logo&rdquo; para alterar
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={removeLogo}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Área de upload */}
      <Card
        className={`transition-colors cursor-pointer ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-dashed hover:border-blue-400 hover:bg-blue-50/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <CardContent className="p-8">
          <div className="text-center">
            {isUploading ? (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
                <div>
                  <p className="text-lg font-medium">Fazendo upload...</p>
                  <p className="text-sm text-gray-500">Aguarde enquanto processamos seu logo</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  {previewUrl ? (
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  ) : (
                    <Upload className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-lg font-medium">
                    {previewUrl ? 'Selecionar novo logo' : 'Selecionar logo da empresa'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Arraste e solte uma imagem aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    JPG, PNG ou WebP • Máximo 5MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botão de Upload */}
      {selectedFile && !isUploading && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <ImageIcon className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">{selectedFile.name}</p>
                <p className="text-sm text-blue-600">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                setSelectedFile(null)
                setPreviewUrl(currentLogo || null)
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
              }}
              variant="outline"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="mr-2 h-4 w-4" />
            Enviar Logo
          </Button>
        </div>
      )}

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  )
}
