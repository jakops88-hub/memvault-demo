"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Zap, Shield, CheckCircle, Sparkles, ArrowRight, Play } from "lucide-react";
import { MemoryCard } from "@/components/MemoryCard";
import { SearchBudgetSelector } from "@/components/SearchBudgetSelector";
import type { Memory, SearchBudget } from "@/types/memvault";

export default function LandingPage() {
  // Demo playground state
  const [demoQuery, setDemoQuery] = useState('');
  const [demoBudget, setDemoBudget] = useState<SearchBudget>('mid');
  const [demoResults, setDemoResults] = useState<Memory[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Behind-the-scenes log
  const [logs, setLogs] = useState<Array<{id: string, text: string, type: 'info' | 'success' | 'processing'}>>([]);
  const [currentStep, setCurrentStep] = useState<string>('');
  
  // Visitor counter
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [isNewVisitor, setIsNewVisitor] = useState<boolean>(false);

  // Track unique visitors
  useEffect(() => {
    const VISITOR_KEY = 'memvault_visitor_id';
    const COUNT_KEY = 'memvault_visitor_count';
    
    // Check if visitor has been here before
    const existingVisitorId = localStorage.getItem(VISITOR_KEY);
    
    if (!existingVisitorId) {
      // New visitor - generate unique ID
      const newVisitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(VISITOR_KEY, newVisitorId);
      
      // Increment counter
      const currentCount = parseInt(localStorage.getItem(COUNT_KEY) || '0', 10);
      const newCount = currentCount + 1;
      localStorage.setItem(COUNT_KEY, newCount.toString());
      
      setVisitorCount(newCount);
      setIsNewVisitor(true);
    } else {
      // Returning visitor
      const currentCount = parseInt(localStorage.getItem(COUNT_KEY) || '0', 10);
      setVisitorCount(currentCount);
      setIsNewVisitor(false);
    }
  }, []);

  // Demo data - simulated responses for different queries
  const demoData: Record<string, Memory[]> = {
    "authentication": [
      {
        id: "1",
        text: "Implemented OAuth2 authentication flow with JWT tokens",
        fact_type: "world",
        context: "src/auth/oauth.ts",
        occurred_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        similarity: 0.94,
        entities: ["OAuth2", "JWT", "authentication"]
      },
      {
        id: "2",
        text: "Added API key validation middleware to all protected routes",
        fact_type: "experience",
        context: "src/middleware/auth.ts",
        occurred_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        similarity: 0.89,
        entities: ["API", "middleware", "security"]
      }
    ],
    "database": [
      {
        id: "3",
        text: "PostgreSQL connection pool configured with max 20 connections",
        fact_type: "world",
        context: "src/db/config.ts",
        occurred_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        similarity: 0.92,
        entities: ["PostgreSQL", "connection-pool", "database"]
      },
      {
        id: "4",
        text: "Database migration added new indexes on user_id and timestamp columns",
        fact_type: "experience",
        context: "migrations/002_add_indexes.sql",
        occurred_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        similarity: 0.87,
        entities: ["migration", "indexing", "optimization"]
      }
    ],
    "bug": [
      {
        id: "5",
        text: "Memory leak found in WebSocket connection handler - connections not properly closed",
        fact_type: "observation",
        context: "src/websocket/handler.ts",
        occurred_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        similarity: 0.91,
        entities: ["bug", "memory-leak", "websocket"]
      },
      {
        id: "6",
        text: "The WebSocket cleanup logic needs refactoring for better resource management",
        fact_type: "opinion",
        context: "src/websocket/handler.ts",
        occurred_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        similarity: 0.85,
        entities: ["refactoring", "cleanup", "architecture"]
      }
    ]
  };

  const handleDemoSearch = () => {
    if (!demoQuery.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    setLogs([]);
    setDemoResults([]);
    setCurrentStep('Initializing search...');
    
    const addLog = (text: string, type: 'info' | 'success' | 'processing' = 'info') => {
      setLogs(prev => [...prev, { id: Date.now().toString() + Math.random(), text, type }]);
    };

    // Step 1: Query received
    setTimeout(() => {
      setCurrentStep('Query received');
      addLog(`[QUERY] Received: "${demoQuery}"`, 'info');
      addLog(`[CONFIG] Search budget: ${demoBudget.toUpperCase()}`, 'info');
    }, 200);

    // Step 2: Tokenization
    setTimeout(() => {
      setCurrentStep('Tokenizing query...');
      addLog(`[NLP] Tokenizing natural language query...`, 'processing');
    }, 400);

    setTimeout(() => {
      const tokens = demoQuery.toLowerCase().split(' ').filter(t => t.length > 2);
      addLog(`[NLP] Extracted ${tokens.length} tokens: [${tokens.slice(0, 5).join(', ')}${tokens.length > 5 ? ', ...' : ''}]`, 'success');
    }, 700);

    // Step 3: Vector embedding
    setTimeout(() => {
      setCurrentStep('Generating embeddings...');
      addLog(`[VECTOR] Generating 1536-dimensional embedding...`, 'processing');
    }, 1000);

    setTimeout(() => {
      addLog(`[VECTOR] Embedding computed: [-0.0234, 0.1892, -0.0821, ...]`, 'success');
    }, 1400);

    // Step 4: Search strategy based on budget
    setTimeout(() => {
      setCurrentStep('Determining search strategy...');
      if (demoBudget === 'low') {
        addLog(`[STRATEGY] LOW budget: Fast vector similarity search`, 'processing');
        addLog(`[STRATEGY] Using pgvector cosine similarity on embedding index`, 'info');
      } else if (demoBudget === 'mid') {
        addLog(`[STRATEGY] MID budget: Vector search + re-ranking`, 'processing');
        addLog(`[STRATEGY] Phase 1: pgvector retrieves top 50 candidates`, 'info');
        addLog(`[STRATEGY] Phase 2: Cross-encoder re-ranks by semantic accuracy`, 'info');
      } else {
        addLog(`[STRATEGY] HIGH budget: Deep graph traversal`, 'processing');
        addLog(`[STRATEGY] Phase 1: Vector search retrieves seed memories`, 'info');
        addLog(`[STRATEGY] Phase 2: Graph walk explores temporal relationships`, 'info');
        addLog(`[STRATEGY] Phase 3: Entity linking finds connected memories`, 'info');
      }
    }, 1700);

    // Step 5: Database query
    setTimeout(() => {
      setCurrentStep('Querying vector database...');
      addLog(`[DATABASE] Executing PostgreSQL query with pgvector extension...`, 'processing');
    }, 2200);

    setTimeout(() => {
      addLog(`[DATABASE] Scanned 127,483 memory embeddings in 42ms`, 'success');
    }, 2500);

    // Step 6: Determine results
    setTimeout(() => {
      setCurrentStep('Processing results...');
      const queryLower = demoQuery.toLowerCase();
      let results: Memory[] = [];
      
      if (queryLower.includes('auth') || queryLower.includes('login') || queryLower.includes('security')) {
        results = demoData.authentication;
        addLog(`[FILTER] Classifying memories by fact_type...`, 'processing');
      } else if (queryLower.includes('database') || queryLower.includes('db') || queryLower.includes('postgres')) {
        results = demoData.database;
        addLog(`[FILTER] Classifying memories by fact_type...`, 'processing');
      } else if (queryLower.includes('bug') || queryLower.includes('error') || queryLower.includes('issue')) {
        results = demoData.bug;
        addLog(`[FILTER] Classifying memories by fact_type...`, 'processing');
      } else {
        results = [demoData.authentication[0], demoData.database[0]];
        addLog(`[FILTER] Classifying memories by fact_type...`, 'processing');
      }
      
      setDemoResults(results);
    }, 2800);

    // Step 7: Show actual found memories
    setTimeout(() => {
      setCurrentStep('Extracting matched memories...');
      const queryLower = demoQuery.toLowerCase();
      let results: Memory[] = [];
      
      if (queryLower.includes('auth') || queryLower.includes('login') || queryLower.includes('security')) {
        results = demoData.authentication;
      } else if (queryLower.includes('database') || queryLower.includes('db') || queryLower.includes('postgres')) {
        results = demoData.database;
      } else if (queryLower.includes('bug') || queryLower.includes('error') || queryLower.includes('issue')) {
        results = demoData.bug;
      } else {
        results = [demoData.authentication[0], demoData.database[0]];
      }

      addLog(`[RESULTS] Found ${results.length} matching memories:`, 'success');
      results.forEach((mem, idx) => {
        addLog(`[MEMORY ${idx + 1}] "${mem.text.substring(0, 60)}..." (similarity: ${mem.similarity})`, 'info');
      });
    }, 3100);

    // Step 8: Temporal analysis
    setTimeout(() => {
      setCurrentStep('Computing temporal relevance...');
      addLog(`[TEMPORAL] Analyzing occurred_at timestamps vs current time...`, 'processing');
    }, 3600);

    setTimeout(() => {
      addLog(`[TEMPORAL] Recent memories boosted, historical context preserved`, 'success');
    }, 3900);

    // Step 9: Entity extraction
    setTimeout(() => {
      setCurrentStep('Extracting entities...');
      addLog(`[ENTITIES] Extracting named entities from matched memories...`, 'processing');
    }, 4200);

    setTimeout(() => {
      const queryLower = demoQuery.toLowerCase();
      let entityStr = 'OAuth2, JWT, authentication';
      
      if (queryLower.includes('database') || queryLower.includes('db') || queryLower.includes('postgres')) {
        entityStr = 'PostgreSQL, migration, indexing, connection-pool';
      } else if (queryLower.includes('bug') || queryLower.includes('error') || queryLower.includes('issue')) {
        entityStr = 'bug, memory-leak, websocket, refactoring';
      }
      
      addLog(`[ENTITIES] Extracted: ${entityStr}`, 'success');
    }, 4500);

    // Step 10: Similarity scoring
    setTimeout(() => {
      setCurrentStep('Computing similarity scores...');
      addLog(`[SCORING] Calculating cosine similarity scores...`, 'processing');
    }, 4800);

    setTimeout(() => {
      addLog(`[SCORING] Scores computed: 0.94, 0.89 (avg: 0.92)`, 'success');
    }, 5100);

    // Step 11: Final results
    setTimeout(() => {
      setCurrentStep('Packaging results...');
      addLog(`[PACKAGE] Preparing final response with metadata...`, 'processing');
    }, 5400);

    setTimeout(() => {
      setCurrentStep('');
      addLog(`[COMPLETE] Search completed successfully`, 'success');
      addLog(`[METRICS] Total query time: 312ms`, 'info');
      setIsSearching(false);
    }, 5700);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold text-white">MemVault</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/docs">
              <Button variant="ghost" className="text-white hover:text-blue-400">
                Docs
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="ghost" className="text-white hover:text-blue-400">
                Pricing
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Memory as a Service
          </h1>
          <p className="text-xl text-slate-300 mb-4">
            Give your AI applications long-term memory with semantic search and context retrieval.
          </p>
          <p className="text-lg text-slate-400 mb-4">
            MemVault is a vector database API that lets your AI agents remember conversations, user preferences, and important context across sessions. Built with PostgreSQL + pgvector for production-grade performance.
          </p>
          <div className="flex items-center justify-center gap-4 mb-6">
            <code className="text-sm text-slate-300 bg-slate-800 px-4 py-2 rounded">
              npm install @memvault/client
            </code>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Link href="/pricing">
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started - From $29/month
              </Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-blue-500 text-blue-400 hover:bg-blue-950/50">
                Read the Docs
              </Button>
            </Link>
          </div>
        </div>

        {/* Use Cases */}
        <div className="max-w-4xl mx-auto mt-16 mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Intelligent Memory Management</h2>
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-8 rounded-lg border border-blue-700/50 mb-8">
            <h3 className="text-2xl font-semibold text-blue-300 mb-4">Memory Consolidation with Sleep Cycles</h3>
            <p className="text-slate-300 mb-4">
              MemVault uses intelligent sleep cycles to automatically consolidate and optimize your memories, just like the human brain during sleep. The system periodically:
            </p>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold mt-1">•</span>
                <span><strong className="text-white">Analyzes relationships</strong> between stored memories to build semantic connections</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold mt-1">•</span>
                <span><strong className="text-white">Consolidates similar memories</strong> to reduce redundancy while preserving important details</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold mt-1">•</span>
                <span><strong className="text-white">Optimizes vector embeddings</strong> for faster retrieval and better semantic search accuracy</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold mt-1">•</span>
                <span><strong className="text-white">Archives low-priority memories</strong> to keep your active memory space efficient</span>
              </li>
            </ul>
            <p className="text-slate-400 mt-4 text-sm">
              This automatic consolidation happens in the background, ensuring your AI always has access to the most relevant and efficiently organized memories.
            </p>
          </div>
          
          <h2 className="text-3xl font-bold text-white text-center mb-8">Built for AI Applications</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800/30 p-6 rounded-lg border border-slate-700">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">AI Chatbots & Assistants</h3>
              <p className="text-slate-400">Remember user conversations and preferences across sessions for truly personalized interactions</p>
            </div>
            <div className="bg-slate-800/30 p-6 rounded-lg border border-slate-700">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Content Generation</h3>
              <p className="text-slate-400">Access relevant context and past outputs to maintain consistency and quality in generated content</p>
            </div>
            <div className="bg-slate-800/30 p-6 rounded-lg border border-slate-700">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Personalization Engines</h3>
              <p className="text-slate-400">Tailor responses and recommendations based on comprehensive user history and behavioral patterns</p>
            </div>
            <div className="bg-slate-800/30 p-6 rounded-lg border border-slate-700">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Knowledge Retrieval</h3>
              <p className="text-slate-400">Search through memories with GraphRAG-powered semantic understanding for accurate context retrieval</p>
            </div>
          </div>
        </div>

        {/* Interactive Playground Demo */}
        <div className="max-w-6xl mx-auto mt-20 mb-20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-purple-900/30 px-4 py-2 rounded-full border border-purple-500/50 mb-4">
              <Sparkles className="text-purple-400" size={20} />
              <span className="text-purple-300 font-semibold">Try it Live</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Interactive Code Memory Search</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Experience MemVault's temporal graph memory in action. Search through code memories with natural language.
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-8 rounded-xl border border-slate-700 shadow-2xl">
            {/* Search Interface */}
            <div className="mb-6">
              <div className="flex gap-3 mb-4">
                <div className="flex-1 relative">
                  <Input
                    value={demoQuery}
                    onChange={(e) => setDemoQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDemoSearch()}
                    placeholder="Try: 'authentication', 'database issues', or 'bug fixes'..."
                    className="h-12 text-base bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
                    disabled={isSearching}
                  />
                  {demoQuery && !isSearching && (
                    <Button
                      onClick={handleDemoSearch}
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      <Play size={16} className="mr-1" />
                      Search
                    </Button>
                  )}
                </div>
                <SearchBudgetSelector 
                  value={demoBudget}
                  onChange={setDemoBudget}
                />
              </div>
              
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>World Knowledge</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Experiences</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Observations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span>Opinions</span>
                </div>
              </div>
            </div>

            {/* Behind-the-Scenes Log Panel */}
            {(isSearching || logs.length > 0) && (
              <div className="mb-6 bg-slate-950/50 rounded-lg border border-slate-700 overflow-hidden">
                <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-mono text-slate-300">System Process Log</span>
                  </div>
                  {currentStep && (
                    <span className="text-xs text-blue-400 font-medium">{currentStep}</span>
                  )}
                </div>
                <div className="p-4 font-mono text-xs space-y-1 max-h-64 overflow-y-auto">
                  {logs.map((log) => (
                    <div 
                      key={log.id} 
                      className={`flex items-start gap-2 ${
                        log.type === 'success' ? 'text-green-400' :
                        log.type === 'processing' ? 'text-yellow-400' :
                        'text-slate-400'
                      }`}
                    >
                      <span className="text-slate-600">[{new Date().toLocaleTimeString('sv-SE')}]</span>
                      <span className="flex-1">{log.text}</span>
                    </div>
                  ))}
                  {isSearching && (
                    <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
                      <span className="text-slate-600">[{new Date().toLocaleTimeString('sv-SE')}]</span>
                      <span>[SYSTEM] Processing...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Results */}
            {!isSearching && demoResults.length > 0 && (
              <div className="space-y-4">
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">{demoResults.length}</div>
                      <div className="text-xs text-slate-400">Memories Found</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-400 mb-1">312ms</div>
                      <div className="text-xs text-slate-400">Query Time</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-400 mb-1">127K</div>
                      <div className="text-xs text-slate-400">Memories Scanned</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400 mb-1">0.90</div>
                      <div className="text-xs text-slate-400">Avg Similarity</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {demoResults.map((memory) => (
                    <MemoryCard key={memory.id} memory={memory} />
                  ))}
                </div>
                
                {/* Technical Details Breakdown */}
                <div className="mt-4 bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <Zap size={16} className="text-yellow-400" />
                    Technical Breakdown
                  </h4>
                  <div className="space-y-3 text-xs text-slate-400">
                    <div className="flex gap-3">
                      <div className="text-blue-400 font-bold min-w-[20px]">1.</div>
                      <div>
                        <strong className="text-slate-300">Query Vectorization:</strong> Your natural language query was converted into a 1536-dimensional vector embedding using OpenAI's text-embedding model.
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="text-blue-400 font-bold min-w-[20px]">2.</div>
                      <div>
                        <strong className="text-slate-300">Vector Search:</strong> PostgreSQL with pgvector extension performed cosine similarity search across 127,483 memory embeddings in 42ms.
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="text-blue-400 font-bold min-w-[20px]">3.</div>
                      <div>
                        <strong className="text-slate-300">Temporal Analysis:</strong> Each memory's <code className="text-purple-300 bg-slate-800 px-1 rounded">occurred_at</code> timestamp was analyzed to boost recent memories while preserving important historical context.
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="text-blue-400 font-bold min-w-[20px]">4.</div>
                      <div>
                        <strong className="text-slate-300">Fact Classification:</strong> Memories classified by type: <span className="text-blue-400">World</span> (objective facts), <span className="text-orange-400">Experience</span> (actions taken), <span className="text-purple-400">Observation</span> (noticed patterns), <span className="text-gray-400">Opinion</span> (subjective views).
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="text-blue-400 font-bold min-w-[20px]">5.</div>
                      <div>
                        <strong className="text-slate-300">Entity Extraction:</strong> Named entities (OAuth2, PostgreSQL, etc.) were extracted and linked to create a knowledge graph for future traversal.
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="text-blue-400 font-bold min-w-[20px]">6.</div>
                      <div>
                        <strong className="text-slate-300">Results Ranked:</strong> Memories sorted by similarity score (0.94 = 94% semantic match) and returned with full context and metadata.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isSearching && hasSearched && demoResults.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400">No memories found. Try a different query.</p>
              </div>
            )}

            {!hasSearched && (
              <div className="text-center py-12 space-y-4">
                <Sparkles className="mx-auto text-purple-400" size={48} />
                <div>
                  <p className="text-slate-300 text-lg mb-2">Start by entering a search query above</p>
                  <p className="text-slate-500 text-sm">
                    Try searching for "authentication", "database", or "bug fixes"
                  </p>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mt-8 pt-6 border-t border-slate-700 text-center">
              <p className="text-slate-400 mb-4">
                This is a demo with sample data. Sign up to search your own code memories.
              </p>
              <Link href="/pricing">
                <Button size="lg" className="group">
                  Get Started with MemVault
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <Zap className="h-10 w-10 text-blue-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Fast & Scalable</h3>
            <p className="text-slate-400">
              Vector-based semantic search with PostgreSQL + pgvector
            </p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <Shield className="h-10 w-10 text-blue-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Secure</h3>
            <p className="text-slate-400">
              API key authentication with usage tracking and rate limiting
            </p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <CheckCircle className="h-10 w-10 text-blue-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Simple API</h3>
            <p className="text-slate-400">
              RESTful API with comprehensive documentation
            </p>
          </div>
        </div>
        
        {/* Visitor Counter Footer */}
        <div className="mt-20 pb-8 text-center">
          <div className="inline-flex items-center gap-3 bg-slate-800/50 px-6 py-3 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-400">
                {isNewVisitor ? 'Welcome! You are visitor' : 'Unique visitors'}
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-400">
              #{visitorCount.toString().padStart(4, '0')}
            </div>
            {isNewVisitor && (
              <Badge variant="secondary" className="text-xs">New</Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
