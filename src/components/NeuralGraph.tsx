import { useState, useRef, useEffect, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

// --- TYPER ---
interface GraphNode {
  id: string;
  text: string;
  type: 'query' | 'memory';
  val: number;
  timestamp?: string;
  x?: number; // Koordinater som ForceGraph lägger till
  y?: number;
}

interface GraphLink {
  source: string | GraphNode; // Kan vara ID eller objekt efter initiering
  target: string | GraphNode;
  similarity: number;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Mörkare start-data
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
  const frameRef = useRef<number>(0); // För animering

  // Hantera fönsterstorlek
  useEffect(() => {
    const updateDim = () => setDimensions({ w: window.innerWidth, h: window.innerHeight });
    updateDim();
    window.addEventListener('resize', updateDim);
    return () => window.removeEventListener('resize', updateDim);
  }, []);

  // Auto-zoom när ny data kommer
  useEffect(() => {
    if (graphRef.current) {
        // Vänta lite så fysikmotorn hinner stabilisera sig
        setTimeout(() => {
            graphRef.current.zoomToFit(600, 70); // Zooma in snyggt
        }, 200);
    }
  }, [data]);

  // --- ULTRA-CYBERPUNK NODE MÅLARE ---
  const paintNode = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isQuery = node.type === 'query';
    const isHover = node === hoverNode;
    
    // Bas-storlek
    const baseRadius = node.val ? node.val : 12;
    // Pulserande effekt (använder tiden för att ändra storlek lite)
    const pulse = Math.sin(Date.now() / (isQuery ? 400 : 800)) * 2; 
    const r = (baseRadius + pulse) / globalScale; // Skala ner baserat på zoom

    // FÄRGPALETT
    // Query: Neon Cyan / Memory: Neon Purple
    const coreColor = isQuery ? '#e6ffff' : '#f0dbff'; // Ljus vit/blå kärna
    const innerGlow = isQuery ? '#00fff2' : '#bd00ff'; // Stark mellanfärg
    const outerHalo = isQuery ? 'rgba(0, 255, 242, 0.6)' : 'rgba(189, 0, 255, 0.6)'; // Mjuk yttre gloria
    
    const x = node.x || 0;
    const y = node.y || 0;

    // LAGER 1: Yttre Gloria (Stor, mjuk "bloom")
    ctx.beginPath();
    ctx.arc(x, y, r * 3.5, 0, 2 * Math.PI, false);
    // Använd radiell gradient för mjukare ljus
    const gradientHalo = ctx.createRadialGradient(x, y, r, x, y, r * 3.5);
    gradientHalo.addColorStop(0, outerHalo);
    gradientHalo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradientHalo;
    ctx.fill();

    // LAGER 2: Inre Glöd (Intensiv)
    ctx.beginPath();
    ctx.arc(x, y, r * 1.8, 0, 2 * Math.PI, false);
    ctx.fillStyle = innerGlow;
    // Lägg till skugga för extra "pop"
    ctx.shadowColor = innerGlow;
    ctx.shadowBlur = 20 / globalScale;
    ctx.fill();
    ctx.shadowBlur = 0; // Återställ skugga

    // LAGER 3: Kärnan (Ljus och het)
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
      ctx.setLineDash([5 / globalScale, 5 / globalScale]); // Streckad linje
      ctx.stroke();
      ctx.setLineDash([]); // Återställ
    }

    // INTERAKTION: Textetikett vid hover (ritad direkt på canvas)
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
    
    if (typeof source === 'string' || typeof target === 'string') return; // Data inte redo än

    const score = link.similarity || 0;
    
    // FÄRG & BREDD BASERAT PÅ STYRKA
    let linkColor, glowWidth;
    if (score > 0.85) { // Stark match (Grön energi)
        linkColor = '#00ff66';
        glowWidth = 4;
    } else if (score > 0.70) { // Medel (Cyan energi)
        linkColor = '#00fff2';
        glowWidth = 2;
    } else { // Svag (Mörkblå/Lila)
        linkColor = '#4d4dff';
        glowWidth = 1;
    }

    const baseWidth = (glowWidth / globalScale) / 2;

    // RITA SOM ENERGISTRÅLE (Två lager)
    
    // Lager 1: Glöden (Bred och diffus)
    ctx.beginPath();
    ctx.moveTo(source.x || 0, source.y || 0);
    ctx.lineTo(target.x || 0, target.y || 0);
    ctx.strokeStyle = linkColor;
    ctx.lineWidth = baseWidth * 4; // Mycket bredare
    ctx.globalAlpha = 0.2 * score; // Mer transparent
    ctx.stroke();

    // Lager 2: Kärnan (Tunn och ljus)
    ctx.beginPath();
    ctx.moveTo(source.x || 0, source.y || 0);
    ctx.lineTo(target.x || 0, target.y || 0);
    ctx.strokeStyle = '#ffffff'; // Alltid vit kärna
    ctx.lineWidth = baseWidth;
    ctx.globalAlpha = 0.8 * score; // Mindre transparent
    ctx.stroke();

    // Återställ alpha
    ctx.globalAlpha = 1;
  }, []);


  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, background: 'transparent' }}>
      
      {/* HOVER X-RAY CARD */}
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
        backgroundColor="transparent" // Låt CSS-bakgrunden synas igenom
        
        // Fysikinställningar för att få det att kännas "rymdigt"
        d3Force={['charge', 'link', 'center']}
        cooldownTicks={100}
        onEngineStop={() => graphRef.current.zoomToFit(400)} // Zooma in när det laddat klart

        // --- Custom Rendering ---
        nodeCanvasObject={paintNode}
        linkCanvasObject={paintLink}
        linkCanvasObjectMode={() => 'replace'} // Ersätt standardlinjerna helt

        // Interaction
        onNodeHover={(node: any) => {
          setHoverNode(node || null);
          document.body.style.cursor = node ? 'crosshair' : 'default'; // Coolare markör
        }}
        
        // Partikel-effekter på länkarna (Datapaket som rör sig)
        linkDirectionalParticles={(link: any) => link.similarity > 0.8 ? 4 : link.similarity > 0.5 ? 2 : 0}
        linkDirectionalParticleSpeed={(link: any) => link.similarity * 0.01}
        linkDirectionalParticleWidth={4}
        linkDirectionalParticleColor={() => '#ffffff'}
      />
    </div>
  );
};

export default NeuralGraph;
