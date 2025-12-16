"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  BrainCircuit,
  TerminalIcon,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  Activity,
  Clock,
  TrendingUp,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { NeuralGraph } from '../../components/NeuralGraph';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface MemoryNode {
  id: string;
  content: string;
  createdAt: number;
  similarity?: number;
}

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  message: string;
  latency?: string;
}

interface GraphNodeType {
  id: string;
  text: string;
  type: 'query' | 'memory';
  val: number;
  timestamp: string;
}

interface GraphLinkType {
  source: string;
  target: string;
  similarity: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

const getTimestamp = () => {
  const now = new Date();
  const time = now.toLocaleTimeString('sv-SE', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
  const ms = now.getMilliseconds().toString().padStart(3, '0');
  return `${time}.${ms}`;
};

export default function PlaygroundPage() {
  const [userId] = useState('demo-user-001');
  const [agentId] = useState('demo-agent-alpha');
  const [searchQuery, setSearchQuery] = useState('');

  const [input, setInput] = useState('');
  const [lastQuery, setLastQuery] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Neural Core Online. Connected to Live Vector Database.', timestamp: Date.now() }
  ]);

  const [memoryNodes, setMemoryNodes] = useState<MemoryNode[]>([]);
  const [activeNodeIds, setActiveNodeIds] = useState<string[]>([]);
  const [totalApiCalls, setTotalApiCalls] = useState(0);
  const [avgSimilarity, setAvgSimilarity] = useState(0);

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 'init', timestamp: getTimestamp(), type: 'system', message: 'System initialized. Production Link Established.' }
  ]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [, setStatus] = useState<'idle' | 'saving' | 'retrieving' | 'error'>('idle');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);
  useEffect(() => logsEndRef.current?.scrollIntoView({ behavior: "smooth" }), [logs, isTerminalOpen]);

  const graphData = useMemo(() => {
    const nodes: GraphNodeType[] = memoryNodes.map(m => ({
      id: m.id,
      text: m.content,
      type: 'memory' as const,
      val: activeNodeIds.includes(m.id) ? 20 : 10,
      timestamp: new Date(m.createdAt).toLocaleTimeString()
    }));

    if (lastQuery) {
      nodes.push({
        id: 'active-query',
        text: lastQuery,
        type: 'query' as const,
        val: 25,
        timestamp: getTimestamp()
      });
    }

    const links: GraphLinkType[] = [];
    if (lastQuery && activeNodeIds.length > 0) {
      activeNodeIds.forEach(targetId => {
        const targetNode = memoryNodes.find(n => n.id === targetId);
        links.push({
          source: 'active-query',
          target: targetId,
          similarity: targetNode?.similarity || 0.5
        });
      });
    }
    return { nodes, links };
  }, [memoryNodes, activeNodeIds, lastQuery]);

  const filteredNodes = memoryNodes.filter(node => 
    searchQuery === '' || 
    node.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addLog = (message: string, type: LogEntry['type'] = 'info', latency?: string) => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: getTimestamp(),
      type,
      message,
      latency
    }]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const apiKey = localStorage.getItem('memvault_api_key');
    if (!apiKey) {
      addLog("❌ Missing API key. Please login first.", 'error');
      console.error('No API key found in localStorage');
      return;
    }

    console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');
    const userText = input;
    setLastQuery(userText);

    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userText, timestamp: Date.now() }]);
    setInput('');
    setIsLoading(true);
    setActiveNodeIds([]);
    setStatus('saving');

    addLog(`Input signal received: "${userText.substring(0, 20)}..."`, 'info');

    try {
      const saveStart = performance.now();
      const newMemoryId = Date.now().toString();
      const newMemoryNode: MemoryNode = { id: newMemoryId, content: userText, createdAt: Date.now() };

      console.log('Sending to:', `${API_BASE_URL}/api/memory/store`);
      console.log('Headers:', { Authorization: `Bearer ${apiKey.substring(0, 10)}...` });

      const storeResponse = await fetch(`${API_BASE_URL}/api/memory/store`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ sessionId: agentId, text: userText, metadata: { userId } })
      });

      if (!storeResponse.ok) {
        const errorText = await storeResponse.text();
        console.error('Store failed:', storeResponse.status, errorText);
        throw new Error(`Failed to store memory: ${storeResponse.status} - ${errorText}`);
      }
      
      setMemoryNodes(prev => [...prev, newMemoryNode]);
      addLog(`Persisted to Vector DB`, 'success', `${(performance.now() - saveStart).toFixed(0)}ms`);

      setStatus('retrieving');
      addLog(`Calculating semantic distance...`, 'system');
      const searchStart = performance.now();

      const searchResponse = await fetch(`${API_BASE_URL}/api/memory/search`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ sessionId: agentId, query: userText, limit: 3 })
      });

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error('Search failed:', searchResponse.status, errorText);
        throw new Error(`Failed to search memories: ${searchResponse.status} - ${errorText}`);
      }

      const data = await searchResponse.json();
      const hits: MemoryNode[] = (data.results || []).map((r: any) => ({
        id: r.id || `temp-${Date.now()}`,
        content: r.text || r.content,
        createdAt: r.createdAt ? new Date(r.createdAt).getTime() : Date.now(),
        similarity: r.similarity
      }));

      const searchLatency = (performance.now() - searchStart).toFixed(0);

      if (hits.length > 0) {
        addLog(`Identified ${hits.length} semantic matches`, 'success', `${searchLatency}ms`);
        const hitIds = memoryNodes
          .filter(node => hits.some(hit => node.content.includes(hit.content) || hit.content.includes(node.content)))
          .map(n => n.id);

        setMemoryNodes(prev => prev.map(n => {
            const hit = hits.find(h => h.content === n.content);
            return hit ? { ...n, similarity: hit.similarity } : n;
        }));

        setActiveNodeIds(hitIds);
      } else {
        addLog(`No strong semantic links found`, 'warning', `${searchLatency}ms`);
      }

      setStatus('idle');
      const aiResponse = hits.length > 0
        ? `I found ${hits.length} relevant memories connected to this thought.`
        : "Memory stored. No immediate connections found.";

      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', content: aiResponse, timestamp: Date.now() }]);

      // Update metrics
      setTotalApiCalls(prev => prev + 2);
      if (hits.length > 0) {
        const avgScore = hits.reduce((sum, h) => sum + (h.similarity || 0), 0) / hits.length;
        setAvgSimilarity(avgScore);
      }

    } catch (error) {
      console.error('Playground error:', error);
      setStatus('error');
      const errorMessage = error instanceof Error ? error.message : String(error);
      addLog(`❌ Neural Link Failure: ${errorMessage}`, 'error');
      
      setMessages(prev => [...prev, { 
        id: (Date.now()+1).toString(), 
        role: 'assistant', 
        content: `Error: ${errorMessage}`, 
        timestamp: Date.now() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white text-slate-800 font-sans overflow-hidden">
      {/* Left Sidebar - Memory List */}
      <aside className="w-[320px] flex flex-col border-r border-slate-200 bg-white shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft size={18} className="text-slate-600" />
            </Link>
            <div className="bg-blue-600 p-2 rounded-lg">
              <BrainCircuit size={20} className="text-white" />
            </div>
            <h1 className="font-bold tracking-tight text-slate-900">
              Playground
            </h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-slate-500">STORED MEMORIES</p>
            <Badge variant="secondary" className="text-xs">
              {filteredNodes.length}
            </Badge>
          </div>
          {filteredNodes.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No memories yet. Start by sending a message.</p>
          ) : (
            filteredNodes.map((node) => (
              <div
                key={node.id}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  activeNodeIds.includes(node.id) 
                    ? 'bg-blue-50 border-blue-300' 
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => setActiveNodeIds([node.id])}
              >
                <p className="text-xs text-slate-700 line-clamp-2 mb-1">{node.content}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <Clock size={10} />
                  <span>{new Date(node.createdAt).toLocaleTimeString()}</span>
                  {node.similarity !== undefined && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                      {(node.similarity * 100).toFixed(0)}% match
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Metrics Dashboard */}
        <div className="border-b border-slate-200 bg-slate-50 p-4">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-slate-500 flex items-center gap-2">
                  <Activity size={14} className="text-blue-600" />
                  Total Memories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-slate-900">{memoryNodes.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-slate-500 flex items-center gap-2">
                  <TrendingUp size={14} className="text-green-600" />
                  API Calls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-slate-900">{totalApiCalls}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-slate-500 flex items-center gap-2">
                  <Activity size={14} className="text-purple-600" />
                  Avg Similarity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-slate-900">
                  {avgSimilarity > 0 ? `${(avgSimilarity * 100).toFixed(0)}%` : '-'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-slate-500 flex items-center gap-2">
                  <Clock size={14} className="text-orange-600" />
                  Active Nodes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-slate-900">{activeNodeIds.length}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Graph Visualization */}
        <div className="flex-1 relative bg-white">
          <NeuralGraph data={graphData} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 bg-white p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter a memory or query..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading} className="px-6">
              {isLoading ? 'Processing...' : 'Send'}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Sidebar - Logs Terminal */}
      <aside className="w-[380px] flex flex-col border-l border-slate-200 bg-slate-50 z-20 shadow-lg">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TerminalIcon size={16} className="text-slate-600" />
            <span className="font-medium text-sm text-slate-700">System Logs</span>
          </div>
          <button 
            onClick={() => setIsTerminalOpen(!isTerminalOpen)}
            className="p-1.5 hover:bg-slate-200 rounded transition-colors"
          >
            {isTerminalOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>

        {isTerminalOpen && (
          <div className="flex-1 overflow-y-auto bg-slate-900 text-slate-100 p-4 font-mono text-xs leading-relaxed">
            {logs.map((log) => (
              <div key={log.id} className="mb-1 flex items-start gap-2">
                <span className="text-slate-500">[{log.timestamp}]</span>
                <span className={
                  log.type === 'error' ? 'text-red-400' : 
                  log.type === 'success' ? 'text-green-400' : 
                  log.type === 'system' ? 'text-blue-400' : 
                  'text-slate-300'
                }>
                  {log.message}
                </span>
                {log.latency && <span className="text-yellow-400 ml-auto">{log.latency}</span>}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </aside>
    </div>
  );
}
