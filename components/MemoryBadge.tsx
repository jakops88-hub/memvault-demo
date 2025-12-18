import { MemoryType } from '@/types/memvault'
import { Badge } from '@/components/ui/badge'
import { FileCode, Activity, Brain, Quote } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MemoryBadgeProps {
  type: MemoryType
  className?: string
  showIcon?: boolean
}

const memoryTypeConfig: Record<MemoryType, {
  label: string
  icon: React.ComponentType<{ className?: string }>
  className: string
}> = {
  world: {
    label: 'World',
    icon: FileCode,
    className: 'bg-blue-500 hover:bg-blue-600 text-white border-blue-600',
  },
  experience: {
    label: 'Experience',
    icon: Activity,
    className: 'bg-orange-500 hover:bg-orange-600 text-white border-orange-600',
  },
  observation: {
    label: 'Observation',
    icon: Brain,
    className: 'bg-purple-500 hover:bg-purple-600 text-white border-purple-600',
  },
  opinion: {
    label: 'Opinion',
    icon: Quote,
    className: 'bg-slate-500 hover:bg-slate-600 text-white border-slate-600',
  },
}

export function MemoryBadge({ type, className, showIcon = true }: MemoryBadgeProps) {
  const config = memoryTypeConfig[type]
  const Icon = config.icon

  return (
    <Badge className={cn(config.className, className)}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  )
}

export function getMemoryTypeColor(type: MemoryType): string {
  return memoryTypeConfig[type].className
}
