import { useState, useRef, useEffect, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

// --- TYPER ---
interface GraphNode {
  id: string;
  text: string;
  type: 'query' | 'memory';
  val: number;
  timestamp?: string;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  similarity: number;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const INITIAL_DATA: GraphData = {
  nodes: [
    { id: 'system-core', text: 'NEURAL CORE: OFFLINE. AWAITING DATA STREAM.', type: 'memory', val: 30 }
  ],
  links: []
};

const NeuralGraph = ({ data = INITIAL_DATA }: { data?: GraphData }) => {
  const graphRef = useRef<any>();
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  const [dimensions, setDimensions] = useState({ w: 800, h: 600 });

  // Hantera fönsterstorlek
  useEffect(() => {
    // Sätt initial storlek säkert
    if (typeof window !== 'undefined') {
      setDimensions({ w: window.innerWidth, h: window.innerHeight });
      
      const updateDim = () => setDimensions({ w: window.innerWidth, h: window.innerHeight });
      window.addEventListener('resize', updateDim);
      return () => window.removeEventListener('resize', updateDim);
    }
  }, []);

  // Auto-zoom när ny data kommer
  useEffect(() => {
    if (graphRef.current) {
        setTimeout(() => {
            graphRef.current.zoomToFit(600, 70); 
        }, 200);
    }
  }, [data]);

  // --- ULTRA-CYBERPUNK NODE MÅLARE ---
  const paintNode = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isQuery = node.type === 'query';
    const isHover = node === hoverNode;
    
    const baseRadius = node.val ? node.val : 12;
    const pulse = Math.sin(Date.now() / (isQuery ? 400 : 800)) * 2; 
    const r = (baseRadius + pulse) / globalScale; 

    const coreColor = isQuery ? '#e6ffff' : '#f0dbff'; 
    const innerGlow = isQuery ? '#00fff2' : '#bd00ff'; 
    const outerHalo = isQuery ? 'rgba(0, 255, 242, 0.6)' : 'rgba(189, 0, 255, 0.6)'; 
    
    const x = node.x || 0;
    const y = node.y || 0;

    // LAGER 1: Yttre Gloria
    ctx.beginPath();
    ctx.arc(x, y, r * 3.5, 0, 2 * Math.PI, false);
    const gradientHalo = ctx.createRadialGradient(x, y, r, x, y, r * 3.5);
    gradientHalo.addColorStop(0, outerHalo);
    gradientHalo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradientHalo;
    ctx.fill();

    // LAGER 2: Inre Glöd
    ctx.beginPath();
    ctx.arc(x, y, r * 1.8, 0, 2 * Math.PI, false);
    ctx.fillStyle = innerGlow;
    ctx.shadowColor = innerGlow;
    ctx.shadowBlur = 20 / globalScale;
    ctx.fill();
    ctx.shadowBlur = 0; 

    // LAGER 3: Kärnan
    ctx.beginPath();
    ctx.arc(x, y, r * 0.8, 0, 2 * Math.PI, false);
    ctx.fillStyle = coreColor;
    ctx.fill();

    // INTERAKTION: Hover-ring
    if (isHover) {
      ctx.beginPath();
      ctx.arc(x, y, r * 4, 0, 2 * Math.PI, false);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5 / globalScale;
      ctx.setLineDash([5 / globalScale, 5 / globalScale]); 
      ctx.stroke();
      ctx.setLineDash([]); 
    }

    // TEXT ETIKETT
    if (isHover && globalScale > 1.5) {
        const label = node.type.toUpperCase();
        ctx.font = `${10 / globalScale}px "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = innerGlow;
        ctx.fillText(label, x, y + r * 4.5);
    }
  }, [hoverNode]);

  // --- ULTRA-CYBERPUNK LÄNK MÅLARE ---
  const paintLink = useCallback((link: GraphLink, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const source = link.source as GraphNode;
    const target = link.target as GraphNode;
    
    if (typeof source === 'string' || typeof target === 'string') return; 

    const score = link.similarity || 0;
    
    let linkColor, glowWidth;
    if (score > 0.85) { 
        linkColor = '#00ff66';
        glowWidth = 4;
    } else if (score > 0.70) { 
        linkColor = '#00fff2';
        glowWidth = 2;
    } else { 
        linkColor = '#4d4dff';
        glowWidth = 1;
    }

    const baseWidth = (glowWidth / globalScale) / 2;

    // Lager 1: Glöden
    ctx.beginPath();
    ctx.moveTo(source.x || 0, source.y || 0);
    ctx.lineTo(target.x || 0, target.y || 0);
    ctx.strokeStyle = linkColor;
    ctx.lineWidth = baseWidth * 4; 
    ctx.globalAlpha = 0.2 * score; 
    ctx.stroke();

    // Lager 2: Kärnan
    ctx.beginPath();
    ctx.moveTo(source.x || 0, source.y || 0);
    ctx.lineTo(target.x || 0, target.y || 0);
    ctx.strokeStyle = '#ffffff'; 
    ctx.lineWidth = baseWidth;
    ctx.globalAlpha = 0.8 * score; 
    ctx.stroke();

    ctx.globalAlpha = 1;
  }, []);


  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, background: 'transparent' }}>
      
      {hoverNode && (
        <div className="graph-tooltip" style={{ 
            position: 'absolute', 
            top: '15%', 
            left: '50%', 
            transform: 'translateX(-50%)',
            zIndex: 2000
        }}>
          <div className="tooltip-header">
            {hoverNode.type === 'query' ? '>>> ACTIVE INPUT SIGNAL <<<' : '>>> MEMORY NODE DETECTED <<<'}
          </div>
          <div className="tooltip-body">
            "{hoverNode.text}"
          </div>
          {hoverNode.timestamp && (
            <div className="tooltip-meta">Time Signature: {hoverNode.timestamp}</div>
          )}
        </div>
      )}

      <ForceGraph2D
        ref={graphRef}
        graphData={data}
        width={dimensions.w}
        height={dimensions.h}
        backgroundColor="transparent" 
        
        cooldownTicks={100}
        onEngineStop={() => graphRef.current?.zoomToFit(400)} 

        nodeCanvasObject={paintNode}
        linkCanvasObject={paintLink}
        linkCanvasObjectMode={() => 'replace'}

        onNodeHover={(node: any) => {
          setHoverNode(node || null);
          document.body.style.cursor = node ? 'crosshair' : 'default'; 
        }}
        
        linkDirectionalParticles={(link: any) => link.similarity > 0.8 ? 4 : link.similarity > 0.5 ? 2 : 0}
        linkDirectionalParticleSpeed={(link: any) => link.similarity * 0.01}
        linkDirectionalParticleWidth={4}
        linkDirectionalParticleColor={() => '#ffffff'}
      />
    </div>
  );
};

export default NeuralGraph;
