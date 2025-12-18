import { Memory } from '@/types/memvault'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { MemoryBadge } from '@/components/MemoryBadge'
import { Calendar, MapPin, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MemoryCardProps {
  memory: Memory
  className?: string
  showSimilarity?: boolean
}

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffMinutes < 60) {
    return `${diffMinutes} minutes ago`
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`
  } else if (diffDays < 30) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString()
  }
}

export function MemoryCard({ memory, className, showSimilarity = true }: MemoryCardProps) {
  return (
    <Card className={cn('hover:border-blue-500/50 transition-colors', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <MemoryBadge type={memory.fact_type} />
          {showSimilarity && memory.similarity !== undefined && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Sparkles className="h-3 w-3 text-yellow-500" />
              <span className="font-mono">{(memory.similarity * 100).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed text-foreground">
          {memory.text}
        </p>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {memory.occurred_at && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatRelativeTime(memory.occurred_at)}</span>
            </div>
          )}

          {memory.context && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="font-mono text-xs">{memory.context}</span>
            </div>
          )}
        </div>

        {memory.entities && memory.entities.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {memory.entities.map((entity, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-300 border border-slate-700"
              >
                {entity}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
