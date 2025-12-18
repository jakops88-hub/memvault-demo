'use client'

import { SearchBudget } from '@/types/memvault'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Settings2, Zap, Gauge, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBudgetSelectorProps {
  value: SearchBudget
  onChange: (budget: SearchBudget) => void
  className?: string
}

const budgetConfig: Record<SearchBudget, {
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}> = {
  low: {
    label: 'Low',
    description: 'Fast, Vector only',
    icon: Zap,
    color: 'text-green-500',
  },
  mid: {
    label: 'Mid',
    description: 'Balanced, Re-ranking',
    icon: Gauge,
    color: 'text-yellow-500',
  },
  high: {
    label: 'High',
    description: 'Deep, Graph Traversal',
    icon: TrendingUp,
    color: 'text-red-500',
  },
}

export function SearchBudgetSelector({ value, onChange, className }: SearchBudgetSelectorProps) {
  const currentConfig = budgetConfig[value]
  const CurrentIcon = currentConfig.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn('gap-2', className)}>
          <CurrentIcon className={cn('h-4 w-4', currentConfig.color)} />
          <span className="hidden sm:inline">Search Depth:</span>
          <span className="font-semibold">{currentConfig.label}</span>
          <Settings2 className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Search Budget</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(Object.keys(budgetConfig) as SearchBudget[]).map((budget) => {
          const config = budgetConfig[budget]
          const Icon = config.icon
          const isSelected = budget === value

          return (
            <DropdownMenuItem
              key={budget}
              onClick={() => onChange(budget)}
              className={cn(
                'flex items-start gap-3 cursor-pointer',
                isSelected && 'bg-accent'
              )}
            >
              <Icon className={cn('h-4 w-4 mt-0.5', config.color)} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{config.label}</span>
                  {isSelected && (
                    <span className="text-xs text-muted-foreground">(active)</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {config.description}
                </p>
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
