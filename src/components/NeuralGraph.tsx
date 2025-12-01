import React, { useState, useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

interface GraphNode {
  id: string;
  text: string;
  type: 'query' | 'memory';
  val: number;
  timestamp?: string;
}

interface GraphLink {
  source: string;
  target: string;
  similarity: number;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const INITIAL_DATA: GraphData = {
  nodes: [
    { id: 'query', text: 'System Ready. Waiting for input...', type: 'query', val: 20 }
  ],
  links: []
};

const NeuralGraph = ({ data = INITIAL_DATA }: { data?: GraphData }) => {
  const graphRef = useRef<any>();
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  const [dimensions, setDimensions] = useState({ w: 800, h: 600 });

  useEffect(() => {
    setDimensions({ w: window.innerWidth, h: window.innerHeight });
    const handleResize = () => setDimensions({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, background: '#050505' }}>
      
      {/* HOVER CARD */}
      {hoverNode && (
        <div className="graph-tooltip" style={{ 
            position: 'absolute', 
            top: '12%', 
            left: '50%', 
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 1000
        }}>
          <div className="tooltip-header">
            {hoverNode.type === 'query' ? 'ACTIVE SIGNAL' : 'MEMORY NODE'}
          </div>
          <div className="tooltip-body">
            "{hoverNode.text}"
          </div>
          {hoverNode.timestamp && (
            <div className="tooltip-meta">Captured: {hoverNode.timestamp}</div>
          )}
        </div>
      )}

      <ForceGraph2D
        ref={graphRef}
        graphData={data}
        width={dimensions.w}
        height={dimensions.h}
        backgroundColor="#050505"
        
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const isQuery = node.type === 'query';
          const isHover = node === hoverNode;
          
          const color = isQuery ? '#00ffff' : (isHover ? '#ffffff' : '#bd00ff'); 
          const glowColor = isQuery ? 'rgba(0, 255, 255, 0.4)' : 'rgba(189, 0, 255, 0.4)';
          const r = node.val ? node.val / 2 : 4;

          // Glow
          ctx.beginPath();
          ctx.arc(node.x, node.y, r * 2, 0, 2 * Math.PI, false);
          ctx.fillStyle = glowColor;
          ctx.fill();

          // Core
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
          ctx.fillStyle = color;
          ctx.fill();

          // Hover Ring
          if (isHover) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, r * 2.2, 0, 2 * Math.PI, false);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1 / globalScale;
            ctx.stroke();
          }
        }}

        linkColor={(link: any) => {
          const score = link.similarity || 0;
          if (score > 0.85) return '#00ff00';
          if (score > 0.70) return '#00ffff';
          return '#333';
        }}
        linkWidth={(link: any) => (link.similarity || 0.1) * 2}
        
        onNodeHover={(node: any) => {
          setHoverNode(node || null);
          document.body.style.cursor = node ? 'pointer' : 'default';
        }}
      />
    </div>
  );
};

export default NeuralGraph;
