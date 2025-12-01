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
  Globe
} from 'lucide-react'; // Activity borttagen
import NeuralGraph from './components/NeuralGraph';

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

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = isLocal ? "" : "https://adorable-trust-long-term-memory-api.up.railway.app";
const API_KEY = import.meta.env.VITE_API_KEY || "";

const getTimestamp = () => {
  const now = new Date();
  const time = now.toLocaleTimeString('sv-SE', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
  const ms = now.getMilliseconds().toString().padStart(3, '0');
  return `${time}.${ms}`;
};

function App() {
  // Rensat bort useDemoMode helt
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
      type: 'memory',
      val: activeNodeIds.includes(m.id) ? 20 : 10,
      timestamp: new Date(m.createdAt).toLocaleTimeString()
    }));

    if (lastQuery) {
      nodes.push({
        id: 'active-query',
        text: lastQuery,
        type: 'query',
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

    if (!API_KEY) {
      addLog("Missing VITE_API_KEY", 'error');
      alert("⚠️ Ingen API-nyckel hittades! Lägg till VITE_API_KEY i Vercel Settings.");
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

      // Direkt API-anrop (ingen demo-check)
      await fetch(`${API_BASE_URL}/api/memory/store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
        body: JSON.stringify({ sessionId: agentId, text: userText, metadata: { userId } })
      });
      setMemoryNodes(prev => [...prev, newMemoryNode]);
      addLog(`Persisted to Vector DB`, 'success', `${(performance.now() - saveStart).toFixed(0)}ms`);

      setStatus('retrieving');
      addLog(`Calculating semantic distance...`, 'system');
      const searchStart = performance.now();
      
      const res = await fetch(`${API_BASE_URL}/api/memory/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
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
    <div className="flex h-screen bg-[#09090b] text-slate-200 font-sans overflow-hidden">
      <aside className="w-[380px] flex flex-col border-r border-[#27272a] bg-[#18181b] z-20 shadow-2xl">
        <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BrainCircuit size={20} className="text-white" />
            </div>
            <h1 className="font-bold tracking-tight">MemVault <span className="text-[10px] text-blue-400 font-normal ml-1">V.2.0</span></h1>
          </div>
          <div className="flex bg-black/20 rounded-lg p-1">
            <button onClick={() => setActiveTab('canvas')} className={`p-1.5 rounded-md ${activeTab === 'canvas' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}><Layout size={16}/></button>
            <button onClick={() => setActiveTab('config')} className={`p-1.5 rounded-md ${activeTab === 'config' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}><Server size={16}/></button>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col relative">
          {activeTab === 'config' ? (
             <div className="p-6 space-y-6">
                <div className="p-4 rounded-xl border bg-green-900/10 border-green-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Globe className="text-green-400 animate-pulse" size={20}/>
                    <span className="text-xs font-bold uppercase text-green-400">Live Connection</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Connected to Railway Production DB.</p>
                </div>

                <div className="space-y-4">
                  <label className="text-xs text-slate-500 uppercase">Agent ID</label>
                  <input type="text" value={agentId} onChange={e => setAgentId(e.target.value)} className="w-full bg-black/20 border border-[#27272a] rounded p-2 text-sm font-mono" />
                </div>
                <div className="space-y-4">
                  <label className="text-xs text-slate-500 uppercase">User ID</label>
                  <input type="text" value={userId} onChange={e => setUserId(e.target.value)} className="w-full bg-black/20 border border-[#27272a] rounded p-2 text-sm font-mono" />
                </div>
             </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-blue-600' : 'bg-slate-700'}`}>{msg.role === 'assistant' ? <BrainCircuit size={16} /> : <div className="text-xs font-bold">U</div>}</div>
                    <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-[#27272a] text-slate-300 rounded-tl-none'}`}>{msg.content}</div>
                  </div>
                ))}
                {isLoading && <div className="flex gap-2 items-center text-xs text-slate-500 px-4"><Zap size={12} className="animate-pulse text-yellow-500"/>Thinking...</div>}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 bg-[#18181b] border-t border-[#27272a]">
                <form onSubmit={handleSendMessage} className="relative">
                  <input value={input} onChange={e => setInput(e.target.value)} placeholder="Store a memory..." className="w-full bg-[#09090b] border border-[#27272a] rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-blue-500" disabled={isLoading}/>
                  <button type="submit" disabled={!input.trim() || isLoading} className="absolute right-2 top-2 p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-500"><Send size={14} /></button>
                </form>
              </div>
            </>
          )}
        </div>
      </aside>

      <main className="flex-1 relative bg-[#09090b] flex flex-col overflow-hidden">
        <div className="flex-1 relative overflow-hidden">
            <div className="absolute top-4 left-4 z-10 bg-black/40 backdrop-blur-md border border-white/5 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs text-slate-400">
                <Database size={12} /><span>Active Vectors: {memoryNodes.length}</span>
            </div>
            
            <NeuralGraph data={graphData} />
            
        </div>

        <div className={`border-t border-[#27272a] bg-[#0c0c0e] transition-all duration-300 ease-in-out flex flex-col z-20 ${isTerminalOpen ? 'h-64' : 'h-10'}`}>
          <div onClick={() => setIsTerminalOpen(!isTerminalOpen)} className="h-10 border-b border-[#27272a] bg-[#18181b] flex items-center justify-between px-4 cursor-pointer hover:bg-[#27272a] transition-colors">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400"><TerminalIcon size={12} /><span className="font-bold">SYSTEM LOGS</span>{status !== 'idle' && <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse ml-2"></span>}</div>
            {isTerminalOpen ? <ChevronDown size={14} className="text-slate-500"/> : <ChevronUp size={14} className="text-slate-500"/>}
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1.5 bg-black/50">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3 group hover:bg-white/5 p-0.5 rounded px-2">
                <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
                <span className={`shrink-0 w-16 uppercase font-bold text-[10px] pt-0.5 ${log.type === 'info' ? 'text-blue-400' : log.type === 'success' ? 'text-green-400' : log.type === 'warning' ? 'text-yellow-400' : log.type === 'error' ? 'text-red-400' : 'text-slate-500'}`}>{log.type}</span>
                <span className="text-slate-300 break-all">{log.message}</span>
                {log.latency && <span className="ml-auto text-slate-600 text-[10px] select-none">{log.latency}</span>}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
