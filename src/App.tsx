import { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Database, 
  BrainCircuit, 
  Layout, 
  Server, 
  Key,
  Terminal as TerminalIcon,
  ChevronUp,
  ChevronDown,
  Activity,
  Cpu,
  Network,
  ArrowRight
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
// FIX: Vi pekar alltid på Railway, oavsett var appen körs
const API_BASE_URL = "https://adorable-trust-long-term-memory-api.up.railway.app";

// FIX: Hämtar nyckeln säkert från Vercels miljövariabler
const API_KEY = import.meta.env.VITE_API_KEY || "";

const getTimestamp = () => {
  const now = new Date();
  const time = now.toLocaleTimeString('sv-SE', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
  const ms = now.getMilliseconds().toString().padStart(3, '0');
  return `${time}.${ms}`;
};

// --- KOMPONENT: Visualisering ---
const ProcessingVisualizer = ({ status }: { status: 'idle' | 'saving' | 'retrieving' | 'error' }) => {
  if (status === 'idle') return null;

  return (
    <div className="mb-8 p-6 rounded-2xl border border-blue-500/30 bg-blue-950/10 relative overflow-hidden animate-in fade-in slide-in-from-top-4">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div className="relative z-10 flex items-center justify-between gap-4">
        
        {/* Steg 1: Input */}
        <div className="flex flex-col items-center gap-2 opacity-50">
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-600">
            <span className="text-xs font-mono">TXT</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">INPUT</span>
        </div>

        <ArrowRight className={`text-slate-600 ${status === 'saving' ? 'animate-pulse text-blue-400' : ''}`} size={20} />

        {/* Steg 2: Embedding */}
        <div className={`flex flex-col items-center gap-2 transition-all duration-300 ${status === 'saving' ? 'scale-110 opacity-100' : 'opacity-50'}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-xl ${status === 'saving' ? 'bg-blue-600 border-blue-400 shadow-blue-500/20' : 'bg-slate-800 border-slate-600'}`}>
            <Cpu size={24} className="text-white" />
          </div>
          <span className="text-[10px] font-mono text-blue-300 font-bold">{status === 'saving' ? 'VECTORIZING...' : 'EMBEDDING'}</span>
        </div>

        <ArrowRight className={`text-slate-600 ${status === 'retrieving' ? 'animate-pulse text-green-400' : ''}`} size={20} />

        {/* Steg 3: Vector DB */}
        <div className={`flex flex-col items-center gap-2 transition-all duration-300 ${status === 'retrieving' ? 'scale-110 opacity-100' : 'opacity-50'}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-xl ${status === 'retrieving' ? 'bg-green-600 border-green-400 shadow-green-500/20' : 'bg-slate-800 border-slate-600'}`}>
            <Database size={24} className="text-white" />
          </div>
          <span className="text-[10px] font-mono text-green-300 font-bold">{status === 'retrieving' ? 'SEARCHING...' : 'VECTOR DB'}</span>
        </div>

      </div>
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState<'canvas' | 'config'>('canvas');
  const [userId, setUserId] = useState('demo-user-001');
  const [agentId, setAgentId] = useState('demo-agent-alpha');
  const [input, setInput] = useState('');
  
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Connected to Neural Core. I remember everything.', timestamp: Date.now() }
  ]);
  
  const [memoryNodes, setMemoryNodes] = useState<MemoryNode[]>([]);
  const [activeNodeIds, setActiveNodeIds] = useState<string[]>([]);
  
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 'init', timestamp: getTimestamp(), type: 'system', message: 'System initialized via Vercel Edge Network.' }
  ]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'retrieving' | 'error'>('idle');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const canvasEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);
  useEffect(() => {
    if (memoryNodes.length > 0) canvasEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

    if (!API_KEY) {
      addLog("Missing VITE_API_KEY in environment variables", 'error');
      alert("⚠️ Saknar API-nyckel! Lägg till VITE_API_KEY i Vercel Settings under Environment Variables.");
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
      
      // 1. STORE MEMORY
      const storeRes = await fetch(`${API_BASE_URL}/api/memory/store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
        body: JSON.stringify({ 
          sessionId: agentId, 
          text: userText,
          metadata: { userId }
        })
      });

      if (!storeRes.ok) {
        throw new Error(`Store failed: ${storeRes.status} ${storeRes.statusText}`);
      }

      const newMemoryNode: MemoryNode = { id: Date.now().toString(), content: userText, createdAt: Date.now() };
      setMemoryNodes(prev => [...prev, newMemoryNode]);
      addLog(`Vector stored in pgvector database`, 'success', `${(performance.now() - saveStart).toFixed(0)}ms`);

      // 2. SEARCH MEMORY
      setStatus('retrieving');
      addLog(`Initiating RAG retrieval sequence...`, 'system');
      const searchStart = performance.now();
      
      const searchRes = await fetch(`${API_BASE_URL}/api/memory/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
        body: JSON.stringify({ 
          sessionId: agentId, 
          query: userText, 
          limit: 3 
        })
      });

      if (!searchRes.ok) {
        throw new Error(`Search failed: ${searchRes.status} ${searchRes.statusText}`);
      }
      
      const data = await searchRes.json();
      const hits = (data.results || []).map((r: any) => ({
        id: r.id, 
        content: r.text || r.content,
        createdAt: r.createdAt ? new Date(r.createdAt).getTime() : Date.now(),
        similarity: r.similarity
      }));

      const searchLatency = (performance.now() - searchStart).toFixed(0);
      
      if (hits.length > 0) {
        addLog(`RAG: Found ${hits.length} relevant memories`, 'success', `${searchLatency}ms`);
        hits.forEach((h: MemoryNode) => addLog(`Linked: "${h.content.substring(0, 30)}..." [Sim: ${h.similarity?.toFixed(4)}]`, 'warning'));
      } else {
        addLog(`No relevant previous context found`, 'warning', `${searchLatency}ms`);
      }

      const hitIds = memoryNodes
        .filter(node => hits.some((hit: MemoryNode) => node.content === hit.content))
        .map(n => n.id);
      
      // Lägg till den nya om den dök upp
      hits.forEach((hit: MemoryNode) => {
         if (hit.content === userText) hitIds.push(newMemoryNode.id);
      });

      setActiveNodeIds(hitIds);

      setStatus('idle');
      const aiResponse = hits.length > 1 
        ? `I've stored that. It relates to ${hits.length - 1} other things you've told me.`
        : "Memory stored securely.";
        
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', content: aiResponse, timestamp: Date.now() }]);
      addLog(`Process complete.`, 'system', `${(performance.now() - startTotal).toFixed(0)}ms total`);

    } catch (error) {
      console.error(error);
      setStatus('error');
      addLog(`Critical Error: ${String(error)}`, 'error');
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', content: "Error: Could not reach memory core.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#050507] text-slate-200 font-sans overflow-hidden selection:bg-blue-500/30">
      <aside className="w-[380px] flex flex-col border-r border-[#27272a] bg-[#0a0a0c] z-20 shadow-2xl">
        <div className="p-5 border-b border-[#27272a] flex items-center justify-between bg-[#0a0a0c]">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-lg shadow-lg shadow-blue-900/20">
              <BrainCircuit size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold tracking-tight text-white">MemVault</h1>
              <p className="text-[10px] text-slate-500 font-mono">LONG TERM MEMORY API</p>
            </div>
          </div>
          <div className="flex bg-[#18181b] rounded-lg p-1 border border-[#27272a]">
            <button onClick={() => setActiveTab('canvas')} className={`p-1.5 rounded-md transition-all ${activeTab === 'canvas' ? 'bg-[#27272a] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><Layout size={16}/></button>
            <button onClick={() => setActiveTab('config')} className={`p-1.5 rounded-md transition-all ${activeTab === 'config' ? 'bg-[#27272a] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><Server size={16}/></button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col relative">
          {activeTab === 'config' ? (
             <div className="p-6 space-y-6">
                <div className="p-4 rounded-xl border bg-green-900/5 border-green-500/10">
                  <div className="flex items-center gap-2 mb-2 text-green-400">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-bold uppercase tracking-wider">System Online</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Connected to production Railway environment. Using OpenAI text-embedding-3-small and pgvector.
                  </p>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Agent Session ID</label>
                  <input type="text" value={agentId} onChange={e => setAgentId(e.target.value)} className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-3 text-sm font-mono text-blue-200 focus:border-blue-500/50 focus:outline-none transition-colors" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">User Identity</label>
                  <input type="text" value={userId} onChange={e => setUserId(e.target.value)} className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-3 text-sm font-mono text-slate-300 focus:border-blue-500/50 focus:outline-none transition-colors" />
                </div>
                {!API_KEY && (
                  <div className="text-red-400 text-xs flex items-center gap-2 border border-red-500/20 bg-red-900/10 p-3 rounded-lg mt-auto">
                    <Key size={14}/> 
                    <span>Missing API Key configuration.</span>
                  </div>
                )}
             </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-2`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/5 shadow-lg ${msg.role === 'assistant' ? 'bg-gradient-to-br from-blue-600 to-blue-700' : 'bg-[#27272a]'}`}>{msg.role === 'assistant' ? <BrainCircuit size={16} className="text-white/90" /> : <div className="text-xs font-bold text-slate-400">U</div>}</div>
                    <div className={`p-3.5 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#27272a] text-white rounded-tr-sm' : 'bg-[#18181b] border border-[#27272a] text-slate-300 rounded-tl-sm'}`}>{msg.content}</div>
                  </div>
                ))}
                {isLoading && <div className="flex gap-2 items-center text-xs text-blue-400 px-12 animate-pulse"><Activity size={12}/>Thinking...</div>}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 bg-[#0a0a0c] border-t border-[#27272a]">
                <form onSubmit={handleSendMessage} className="relative group">
                  <input value={input} onChange={e => setInput(e.target.value)} placeholder="Store a memory..." className="w-full bg-[#18181b] border border-[#27272a] group-focus-within:border-blue-500/50 rounded-xl pl-4 pr-12 py-3.5 text-sm focus:outline-none transition-colors placeholder:text-slate-600" disabled={isLoading}/>
                  <button type="submit" disabled={!input.trim() || isLoading} className="absolute right-2 top-2 p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-lg shadow-blue-900/20"><Send size={16} /></button>
                </form>
              </div>
            </>
          )}
        </div>
      </aside>
      <main className="flex-1 relative bg-[#050507] flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="h-16 border-b border-[#27272a] flex items-center justify-between px-8 bg-[#0a0a0c]">
           <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
              <Network size={16} className="text-slate-500"/>
              <span>Memory Graph</span>
           </div>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div> Active
                <div className="w-2 h-2 rounded-full bg-slate-700 ml-2"></div> Dormant
              </div>
              <div className="h-4 w-px bg-[#27272a]"></div>
              <div className="text-xs font-mono text-slate-500">NODES: <span className="text-white">{memoryNodes.length}</span></div>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto relative p-8 pb-32 bg-grid-pattern">
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #1d1d20 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.4 }}></div>
          
          {/* VISUALISERING */}
          <div className="max-w-5xl mx-auto">
            <ProcessingVisualizer status={status} />

            {memoryNodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-[#27272a] rounded-2xl bg-white/[0.02] text-center p-8 mt-8">
                 <div className="w-16 h-16 bg-[#18181b] rounded-full flex items-center justify-center mb-4 shadow-xl border border-[#27272a]">
                    <Database size={24} className="text-slate-600" />
                 </div>
                 <h3 className="text-slate-300 font-medium mb-1">Memory Bank Empty</h3>
                 <p className="text-slate-500 text-sm max-w-xs">Start chatting to create semantic vectors. Memories will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {memoryNodes.map((node) => {
                  const isActive = activeNodeIds.includes(node.id);
                  return (
                    <div key={node.id} className={`relative p-5 rounded-xl border transition-all duration-500 ease-out cursor-default backdrop-blur-sm ${isActive ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)] ring-1 ring-blue-500/20' : 'bg-[#18181b]/60 border-[#27272a] hover:border-slate-600'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] ${isActive ? 'bg-blue-400 text-blue-400' : 'bg-slate-700 text-transparent'}`}></div>
                          <span className="text-[10px] text-slate-500 font-mono opacity-70">#{node.id.slice(-4)}</span>
                        </div>
                        {node.similarity && isActive && (
                          <span className="text-[9px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20 font-mono">
                            {(node.similarity * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">{node.content}</p>
                    </div>
                  );
                })}
              </div>
            )}
            <div ref={canvasEndRef} />
          </div>
        </div>

        {/* LOGS */}
        <div className={`border-t border-[#27272a] bg-[#0a0a0c] transition-all duration-300 ease-in-out flex flex-col shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] ${isTerminalOpen ? 'h-64' : 'h-9'}`}>
          <div onClick={() => setIsTerminalOpen(!isTerminalOpen)} className="h-9 border-b border-[#27272a] bg-[#18181b] flex items-center justify-between px-4 cursor-pointer hover:bg-[#27272a] transition-colors select-none">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-400 tracking-wider">
              <TerminalIcon size={12} /> SYSTEM LOGS 
              {status !== 'idle' && <span className="flex items-center gap-1 ml-2 text-blue-400"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>PROCESSING</span>}
            </div>
            {isTerminalOpen ? <ChevronDown size={14} className="text-slate-500"/> : <ChevronUp size={14} className="text-slate-500"/>}
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-1 bg-[#050507]">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3 group hover:bg-white/[0.02] p-0.5 -mx-2 px-2 rounded">
                <span className="text-slate-600 shrink-0 opacity-50">[{log.timestamp}]</span>
                <span className={`shrink-0 w-16 font-bold ${log.type === 'info' ? 'text-blue-400' : log.type === 'success' ? 'text-emerald-400' : log.type === 'warning' ? 'text-amber-400' : log.type === 'error' ? 'text-red-400' : 'text-purple-400'}`}>{log.type.toUpperCase()}</span>
                <span className="text-slate-400">{log.message}</span>
                {log.latency && <span className="ml-auto text-slate-600 opacity-50">{log.latency}</span>}
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
