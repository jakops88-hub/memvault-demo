import { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Database, 
  BrainCircuit, 
  Zap, 
  Layout, 
  Server, 
  ToggleRight, 
  ToggleLeft,
  Key,
  Terminal as TerminalIcon,
  ChevronUp,
  ChevronDown,
  Activity
} from 'lucide-react';

// --- TYPER ---
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

// --- KONFIGURATION ---

// 1. Avgör om vi kör lokalt
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// 2. API URL: Peka direkt på Railway i produktion
const API_BASE_URL = isLocal
  ? "" 
  : "https://adorable-trust-long-term-memory-api.up.railway.app";

// 3. API KEY: Hämtas från Vercel Environment Variables (SÄKERT)
// FIX: Tog bort 'process.env' checken som kraschade bygget. Vite använder import.meta.env.
const API_KEY = import.meta.env.VITE_API_KEY || "";

// --- MOCK DATA ---
const INITIAL_MEMORY_NODES: MemoryNode[] = [
  { id: 'm1', content: "MemVault is a Long Term Memory API for AI Agents.", createdAt: Date.now() },
  { id: 'm2', content: "The project uses Node.js, Express and Vector Databases.", createdAt: Date.now() },
  { id: 'm3', content: "User prefers dark, modern UI designs.", createdAt: Date.now() },
];

const getTimestamp = () => {
  const now = new Date();
  const time = now.toLocaleTimeString('sv-SE', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
  const ms = now.getMilliseconds().toString().padStart(3, '0');
  return `${time}.${ms}`;
};

const mockSearch = async (query: string, nodes: MemoryNode[]): Promise<MemoryNode[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const lowerQuery = query.toLowerCase();
  return nodes.filter(node => 
    lowerQuery.split(' ').some(word => word.length > 3 && node.content.toLowerCase().includes(word))
  ).map(node => ({ ...node, similarity: 0.8 + Math.random() * 0.2 }));
};

function App() {
  const [useDemoMode, setUseDemoMode] = useState(true);
  const [activeTab, setActiveTab] = useState<'canvas' | 'config'>('canvas');
  
  const [userId, setUserId] = useState('demo-user-001');
  const [agentId, setAgentId] = useState('demo-agent-alpha');
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Ready. Visualizing data flow in the terminal below.', timestamp: Date.now() }
  ]);
  
  const [memoryNodes, setMemoryNodes] = useState<MemoryNode[]>(INITIAL_MEMORY_NODES);
  const [activeNodeIds, setActiveNodeIds] = useState<string[]>([]);
  
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 'init', timestamp: getTimestamp(), type: 'system', message: 'System initialized. Waiting for input stream...' }
  ]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'retrieving' | 'error'>('idle');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const canvasEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);
  useEffect(() => {
    if (memoryNodes.length > INITIAL_MEMORY_NODES.length) canvasEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [memoryNodes]);
  useEffect(() => logsEndRef.current?.scrollIntoView({ behavior: "smooth" }), [logs, isTerminalOpen]);

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

    if (!useDemoMode && !API_KEY) {
      addLog("Missing VITE_API_KEY in environment variables", 'error');
      alert("⚠️ Ingen API-nyckel hittades! Lägg till VITE_API_KEY i Vercel Settings.");
      return;
    }

    const userText = input;
    const startTotal = performance.now();
    
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userText, timestamp: Date.now() }]);
    setInput('');
    setIsLoading(true);
    setActiveNodeIds([]);
    setStatus('saving');

    addLog(`Received input: "${userText.substring(0, 20)}..."`, 'info');
    addLog(`Vectorizing content for Agent: ${agentId}...`, 'system');

    try {
      const saveStart = performance.now();
      const newMemoryId = Date.now().toString();
      const newMemoryNode: MemoryNode = { id: newMemoryId, content: userText, createdAt: Date.now() };

      if (useDemoMode) {
        await new Promise(r => setTimeout(r, 600));
        setMemoryNodes(prev => [...prev, newMemoryNode]);
        addLog(`Memory vector stored in local index`, 'success', `${(performance.now() - saveStart).toFixed(0)}ms`);
      } else {
        addLog(`POST /api/memory/store - Storing to Vector DB...`, 'info');
        
        // FIX: Uppdaterad URL till /store och korrekt payload (sessionId & text)
        await fetch(`${API_BASE_URL}/api/memory/store`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
          body: JSON.stringify({ 
            sessionId: agentId, 
            text: userText,
            metadata: { userId }
          })
        });

        setMemoryNodes(prev => [...prev, newMemoryNode]);
        addLog(`Memory successfully persisted to Railway`, 'success', `${(performance.now() - saveStart).toFixed(0)}ms`);
      }

      setStatus('retrieving');
      addLog(`Initiating RAG retrieval sequence...`, 'system');
      const searchStart = performance.now();
      let hits: MemoryNode[] = [];

      if (useDemoMode) {
        hits = await mockSearch(userText, memoryNodes);
      } else {
        addLog(`POST /api/memory/search - Calculating Cosine Similarity...`, 'info');
        
        // FIX: Uppdaterad URL till /search och korrekt payload (sessionId)
        const res = await fetch(`${API_BASE_URL}/api/memory/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
          body: JSON.stringify({ 
            sessionId: agentId, 
            query: userText, 
            limit: 3 
          })
        });
        
        const data = await res.json();
        // Mappar API-svaret till vår interna MemoryNode-struktur
        hits = (data.results || []).map((r: any) => ({
          id: r.id || `temp-${Date.now()}-${Math.random()}`,
          content: r.text || r.content, // Hanterar både text och content om APIet ändras
          createdAt: r.createdAt ? new Date(r.createdAt).getTime() : Date.now(),
          similarity: r.similarity
        }));
      }

      const searchLatency = (performance.now() - searchStart).toFixed(0);
      
      if (hits.length > 0) {
        addLog(`Found ${hits.length} context matches (Sim > 0.8)`, 'success', `${searchLatency}ms`);
        hits.forEach(h => addLog(`Linked Context: "${h.content.substring(0, 30)}..." [Score: ${h.similarity?.toFixed(4)}]`, 'warning'));
      } else {
        addLog(`No relevant previous context found`, 'warning', `${searchLatency}ms`);
      }

      const hitIds = memoryNodes
        .filter(node => hits.some(hit => node.content.includes(hit.content) || hit.content.includes(node.content)))
        .map(n => n.id);
      setActiveNodeIds(hitIds);

      setStatus('idle');
      const aiResponse = hits.length > 0 
        ? `I recalled ${hits.length} related memories.`
        : "Stored new memory.";
        
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', content: aiResponse, timestamp: Date.now() }]);
      addLog(`Response synthesized and delivered.`, 'system', `${(performance.now() - startTotal).toFixed(0)}ms total`);

    } catch (error) {
      console.error(error);
      setStatus('error');
      addLog(`Critical Error: ${error}`, 'error');
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', content: "Error connecting to memory core.", timestamp: Date.now() }]);
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
            <h1 className="font-bold tracking-tight">MemVault</h1>
          </div>
          <div className="flex bg-black/20 rounded-lg p-1">
            <button onClick={() => setActiveTab('canvas')} className={`p-1.5 rounded-md ${activeTab === 'canvas' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}><Layout size={16}/></button>
            <button onClick={() => setActiveTab('config')} className={`p-1.5 rounded-md ${activeTab === 'config' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}><Server size={16}/></button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col relative">
          {activeTab === 'config' ? (
             <div className="p-6 space-y-6">
                <div className={`p-4 rounded-xl border ${useDemoMode ? 'bg-purple-900/10 border-purple-500/20' : 'bg-green-900/10 border-green-500/20'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase">{useDemoMode ? 'Demo Mode' : 'Live API'}</span>
                    <button onClick={() => setUseDemoMode(!useDemoMode)}>
                      {useDemoMode ? <ToggleRight className="text-purple-400" size={24}/> : <ToggleLeft className="text-green-400" size={24}/>}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">{useDemoMode ? "Simulated environment." : "Connected to Railway."}</p>
                </div>
                <div className="space-y-4">
                  <label className="text-xs text-slate-500 uppercase">Agent ID</label>
                  <input type="text" value={agentId} onChange={e => setAgentId(e.target.value)} className="w-full bg-black/20 border border-[#27272a] rounded p-2 text-sm font-mono" />
                </div>
                <div className="space-y-4">
                  <label className="text-xs text-slate-500 uppercase">User ID</label>
                  <input type="text" value={userId} onChange={e => setUserId(e.target.value)} className="w-full bg-black/20 border border-[#27272a] rounded p-2 text-sm font-mono" />
                </div>
                {!useDemoMode && !API_KEY && (
                  <div className="text-red-400 text-xs flex items-center gap-2 border border-red-500/20 bg-red-900/10 p-2 rounded">
                    <Key size={14}/> 
                    <span>Missing <b>VITE_API_KEY</b> in Vercel Settings</span>
                  </div>
                )}
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
                {isLoading && <div className="flex gap-2 items-center text-xs text-slate-500 px-4"><Zap size={12} className="animate-pulse text-yellow-500"/>Processing...</div>}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 bg-[#18181b] border-t border-[#27272a]">
                <form onSubmit={handleSendMessage} className="relative">
                  <input value={input} onChange={e => setInput(e.target.value)} placeholder="Message MemVault..." className="w-full bg-[#09090b] border border-[#27272a] rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-blue-500" disabled={isLoading}/>
                  <button type="submit" disabled={!input.trim() || isLoading} className="absolute right-2 top-2 p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-500"><Send size={14} /></button>
                </form>
              </div>
            </>
          )}
        </div>
      </aside>
      <main className="flex-1 relative bg-[#09090b] flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto relative p-8 pb-32">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          <div className="flex items-center justify-between mb-6">
             <div className="bg-black/40 backdrop-blur-md border border-white/5 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs text-slate-400">
                <Database size={12} /><span>Memory Nodes: {memoryNodes.length}</span>
             </div>
             <div className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-2 border bg-black/40 backdrop-blur-md ${status === 'idle' ? 'border-transparent text-slate-600' : 'border-blue-500/30 text-blue-400'}`}>
                {status !== 'idle' && <Activity size={12} className="animate-pulse" />}
                {status.toUpperCase()}
             </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 max-w-7xl mx-auto">
            {memoryNodes.map((node) => {
              const isActive = activeNodeIds.includes(node.id);
              return (
                <div key={node.id} className={`relative group p-5 rounded-xl border transition-all duration-500 ease-out cursor-default ${isActive ? 'bg-blue-900/10 border-blue-500/50 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] scale-[1.02] z-10' : 'bg-[#18181b]/40 border-[#27272a] hover:border-slate-600 hover:bg-[#18181b]'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`}></div>
                      <span className="text-[10px] text-slate-500 font-mono uppercase">Node {node.id.slice(-4)}</span>
                    </div>
                    {isActive && <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 rounded animate-in fade-in">RETRIEVED</span>}
                  </div>
                  <p className={`text-sm leading-relaxed ${isActive ? 'text-white' : 'text-slate-400'}`}>{node.content}</p>
                  <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center opacity-50 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-slate-600">{new Date(node.createdAt).toLocaleTimeString()}</span>
                    {isActive && <Zap size={10} className="text-blue-400" />}
                  </div>
                </div>
              );
            })}
            <div ref={canvasEndRef} />
          </div>
        </div>
        <div className={`border-t border-[#27272a] bg-[#0c0c0e] transition-all duration-300 ease-in-out flex flex-col ${isTerminalOpen ? 'h-64' : 'h-10'}`}>
          <div onClick={() => setIsTerminalOpen(!isTerminalOpen)} className="h-10 border-b border-[#27272a] bg-[#18181b] flex items-center justify-between px-4 cursor-pointer hover:bg-[#27272a] transition-colors">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400"><TerminalIcon size={12} /><span className="font-bold">SYSTEM TERMINAL</span>{status !== 'idle' && <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse ml-2"></span>}</div>
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
