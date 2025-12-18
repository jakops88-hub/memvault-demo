// MemVault Domain Types

export type MemoryType = 'world' | 'experience' | 'observation' | 'opinion';

export type SearchBudget = 'low' | 'mid' | 'high';

export interface Memory {
  id: string;
  text: string;           // The content
  fact_type: MemoryType;  // CRITICAL: Used for UI styling
  context?: string;       // File path or Module name
  occurred_at: string;    // ISO Date - When the event happened (not when saved!)
  similarity?: number;    // Search score
  entities?: string[];    // Tagged concepts
  metadata?: Record<string, unknown>; // Additional metadata
}

export interface MemorySearchRequest {
  query: string;
  budget: SearchBudget;
  bank_id?: string;
  limit?: number;
}

export interface MemorySearchResponse {
  success: boolean;
  memories: Memory[];
  query_time_ms?: number;
  budget_used?: SearchBudget;
}

// Graph visualization types
export interface GraphNode {
  id: string;
  text: string;
  type: 'query' | 'memory';
  val?: number;
  fact_type?: MemoryType;
  occurred_at?: string;
  similarity?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  value?: number;
}
