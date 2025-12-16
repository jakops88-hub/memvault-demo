"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Send,
  Database,
  BrainCircuit,
  Zap,
  Layout,
  Server,
  Terminal as TerminalIcon,
  ChevronUp,
  ChevronDown,
  Globe,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { NeuralGraph } from '@/components/NeuralGraph';

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
  const [activeTab, setActiveTab] = useState<'canvas' | 'config'>('canvas');
  const [userId, setUserId] = useState('demo-user-001');
  const [agentId, setAgentId] = useState('demo-agent-alpha');

  const [input, setInput] = useState('');
  const [lastQuery, setLastQuery] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Neural Core Online. Connected to Live Vector Database.', timestamp: Date.now() }
  ]);

  const [memoryNodes, setMemoryNodes] = useState<MemoryNode[]>([]);
  const [activeNodeIds, setActiveNodeIds] = useState<string[]>([]);

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 'init', timestamp: getTimestamp(), type: 'system', message: 'System initialized. Production Link Established.' }
  ]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'retrieving' | 'error'>('idle');

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
      addLog("Missing API key. Please login first.", 'error');
      return;
    }

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

      await fetch(`${API_BASE_URL}/api/memory/store`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ sessionId: agentId, text: userText, metadata: { userId } })
      });
      
      setMemoryNodes(prev => [...prev, newMemoryNode]);
      addLog(`Persisted to Vector DB`, 'success', `${(performance.now() - saveStart).toFixed(0)}ms`);

      setStatus('retrieving');
      addLog(`Calculating semantic distance...`, 'system');
      const searchStart = performance.now();

      const res = await fetch(`${API_BASE_URL}/api/memory/search`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ sessionId: agentId, query: userText, limit: 3 })
      });
      const data = await res.json();
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

    } catch (error) {
      console.error(error);
      setStatus('error');
      addLog(`Neural Link Failure: ${error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white text-slate-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[380px] flex flex-col border-r border-slate-200 bg-slate-50 z-20 shadow-lg">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
              <ArrowLeft size={18} className="text-slate-600" />
            </Link>
            <div className="bg-blue-600 p-2 rounded-lg">
              <BrainCircuit size={20} className="text-white" />
            </div>
            <h1 className="font-bold tracking-tight text-slate-900">
              MemVault <span className="text-[10px] text-blue-600 font-normal ml-1">Playground</span>
            </h1>
          </div>
          <div className="flex bg-slate-200 rounded-lg p-1">
            <button 
              onClick={() => setActiveTab('canvas')} 
              className={`p-1.5 rounded-md transition-colors ${activeTab === 'canvas' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Layout size={16}/>
            </button>
            <button 
              onClick={() => setActiveTab('config')} 
              className={`p-1.5 rounded-md transition-colors ${activeTab === 'config' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Server size={16}/>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col relative">
          {activeTab === 'config' ? (
            <div className="p-6 space-y-6">
              <div className="p-4 rounded-xl border bg-green-50 border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="text-green-600 animate-pulse" size={20}/>
                  <span className="text-xs font-bold uppercase text-green-700">Live Connection</span>
                </div>
                <p className="text-[10px] text-slate-600">Connected to Production Database.</p>
              </div>

              <div className="space-y-4">
                <label className="text-xs text-slate-500 uppercase font-semibold">Agent ID</label>
                <input 
                  type="text" 
                  value={agentId} 
                  onChange={e => setAgentId(e.target.value)} 
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs text-slate-500 uppercase font-semibold">User ID</label>
                <input 
                  type="text" 
                  value={userId} 
                  onChange={e => setUserId(e.target.value)} 
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'assistant' ? 'bg-blue-600' : 'bg-slate-300'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <BrainCircuit size={16} className="text-white" />
                      ) : (
                        <div className="text-xs font-bold text-slate-700">U</div>
                      )}
                    </div>
                    <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-slate-200 text-slate-800 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2 items-center text-xs text-slate-500 px-4">
                    <Zap size={12} className="animate-pulse text-yellow-500"/>
                    Thinking...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 bg-white border-t border-slate-200">
                <form onSubmit={handleSendMessage} className="relative">
                  <input 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    placeholder="Store a memory..." 
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    disabled={isLoading}
                  />
                  <button 
                    type="submit" 
                    disabled={!input.trim() || isLoading} 
                    className="absolute right-2 top-2 p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col overflow-hidden">
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-md border border-slate-200 px-4 py-2 rounded-full flex items-center gap-2 text-xs text-slate-700 shadow-lg">
            <Database size={12} className="text-blue-600" />
            <span className="font-semibold">Active Vectors: {memoryNodes.length}</span>
          </div>

          <NeuralGraph data={graphData} />
        </div>

        {/* Terminal */}
        <div className={`border-t border-slate-200 bg-white transition-all duration-300 ease-in-out flex flex-col z-20 shadow-2xl ${
          isTerminalOpen ? 'h-64' : 'h-12'
        }`}>
          <div 
            onClick={() => setIsTerminalOpen(!isTerminalOpen)} 
            className="h-12 border-b border-slate-200 bg-slate-50 flex items-center justify-between px-4 cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs font-mono text-slate-700">
              <TerminalIcon size={12} />
              <span className="font-bold">SYSTEM LOGS</span>
              {status !== 'idle' && (
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse ml-2"></span>
              )}
            </div>
            {isTerminalOpen ? (
              <ChevronDown size={14} className="text-slate-500"/>
            ) : (
              <ChevronUp size={14} className="text-slate-500"/>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1.5 bg-slate-50">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3 group hover:bg-slate-100 p-1 rounded px-2">
                <span className="text-slate-400 shrink-0 select-none">[{log.timestamp}]</span>
                <span className={`shrink-0 w-16 uppercase font-bold text-[10px] pt-0.5 ${
                  log.type === 'info' ? 'text-blue-600' : 
                  log.type === 'success' ? 'text-green-600' : 
                  log.type === 'warning' ? 'text-yellow-600' : 
                  log.type === 'error' ? 'text-red-600' : 
                  'text-slate-500'
                }`}>
                  {log.type}
                </span>
                <span className="text-slate-700 break-all">{log.message}</span>
                {log.latency && (
                  <span className="ml-auto text-slate-400 text-[10px] select-none">{log.latency}</span>
                )}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </main>
    </div>
  );
}
