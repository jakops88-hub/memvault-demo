'use client'

import { useState } from 'react'
import { Memory, SearchBudget } from '@/types/memvault'
import { memoryApi } from '@/lib/api'
import { MemoryCard } from '@/components/MemoryCard'
import { SearchBudgetSelector } from '@/components/SearchBudgetSelector'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function MemVaultSearchDemo() {
  const [query, setQuery] = useState('')
  const [budget, setBudget] = useState<SearchBudget>('mid')
  const [memories, setMemories] = useState<Memory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTime, setSearchTime] = useState<number | null>(null)

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsLoading(true)
    setError(null)
    setSearchTime(null)

    try {
      const startTime = performance.now()
      
      const response = await memoryApi.recall({
        query: query.trim(),
        budget,
        limit: 10,
      })

      const endTime = performance.now()
      setSearchTime(Math.round(endTime - startTime))

      if (response.success && response.memories) {
        setMemories(response.memories)
      } else {
        setError('No memories found')
        setMemories([])
      }
    } catch (err) {
      console.error('Search failed:', err)
      setError(err instanceof Error ? err.message : 'Search failed')
      setMemories([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">MemVault Search</h1>
          <p className="text-slate-400">
            Temporal Graph Memory with intelligent budget control
          </p>
        </div>

        {/* Search Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Search Memories</CardTitle>
              <SearchBudgetSelector value={budget} onChange={setBudget} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search for memories..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleSearch}
                disabled={isLoading || !query.trim()}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {searchTime !== null && (
              <p className="text-sm text-muted-foreground">
                Search completed in {searchTime}ms using{' '}
                <span className="font-semibold">{budget}</span> budget
              </p>
            )}
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {memories.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                Results ({memories.length})
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {memories.map((memory) => (
                <MemoryCard key={memory.id} memory={memory} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && memories.length === 0 && query && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No memories found. Try a different search query.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
