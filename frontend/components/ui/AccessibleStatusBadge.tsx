'use client'

import { CheckCircleIcon, ClockIcon, AlertTriangleIcon, XCircleIcon } from 'lucide-react'

interface AccessibleStatusBadgeProps {
  status: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export function AccessibleStatusBadge({ 
  status, 
  size = 'md',
  showIcon = true 
}: AccessibleStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    const normalizedStatus = status.toLowerCase().replace('_', ' ')
    
    switch (normalizedStatus) {
      case 'pendente':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: ClockIcon,
          emoji: '⏳',
          label: 'Pendente - Aguardando análise ou resolução',
          text: 'Pendente'
        }
      case 'em progresso':
      case 'em_progresso':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: AlertTriangleIcon,
          emoji: '🔄',
          label: 'Em progresso - Sendo resolvido pela equipe responsável',
          text: 'Em Progresso'
        }
      case 'resolvido':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircleIcon,
          emoji: '✅',
          label: 'Resolvido - Problema solucionado com sucesso',
          text: 'Resolvido'
        }
      case 'rejeitado':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircleIcon,
          emoji: '❌',
          label: 'Rejeitado - Denúncia não procede ou não pode ser atendida',
          text: 'Rejeitado'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: ClockIcon,
          emoji: '❓',
          label: `Status: ${normalizedStatus}`,
          text: normalizedStatus
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border ${config.color} ${sizeClasses[size]}`}
      aria-label={config.label}
      title={config.label}
    >
      {showIcon && (
        <>
          <span className="mr-1" aria-hidden="true">{config.emoji}</span>
          <Icon className={`${iconSizes[size]} mr-1`} aria-hidden="true" />
        </>
      )}
      <span>{config.text}</span>
    </span>
  )
}
