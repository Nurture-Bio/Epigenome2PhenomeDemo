import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  useNodesState,
  useEdgesState,
  EdgeLabelRenderer,
  getSmoothStepPath,
  Handle,
  Position,
} from 'reactflow';
import dagre from 'dagre';
import { motion, useSpring, useTransform } from 'framer-motion';
import 'reactflow/dist/style.css';

import { ehrlichPathway } from '../../data/pathways';
import { cn } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../ui';

// =============================================================================
// UTILITIES
// =============================================================================

function getChromatinColor(value) {
  if (value > 0.6) return '#22c55e'; // green
  if (value > 0.3) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// =============================================================================
// DAGRE LAYOUT - Automatic graph positioning
// =============================================================================

function getLayoutedElements(nodes, edges, direction = 'TB') {
  const g = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 80, ranksep: 100 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 140, height: 50 });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    return { ...node, position: { x: pos.x - 70, y: pos.y - 25 } };
  });

  return { nodes: layoutedNodes, edges };
}

// =============================================================================
// CUSTOM NODE: Metabolite
// =============================================================================

const nodeStyles = {
  input:        'bg-blue-500/20 border-blue-400/50 shadow-blue-500/20',
  intermediate: 'bg-slate-700/50 border-slate-500/40',
  product:      'bg-yellow-500/20 border-yellow-400/50 shadow-yellow-500/20',
  productActive:'bg-green-500/25 border-green-400/60 shadow-green-500/30 shadow-lg',
  waste:        'bg-red-500/15 border-red-400/40',
};

function MetaboliteNode({ data }) {
  const { name, type, flux, isActive } = data;
  const style = isActive && type === 'product' ? 'productActive' : type;
  
  return (
    <div className={cn(
      'px-5 py-3 rounded-xl border-2 text-center min-w-[120px] transition-all duration-300',
      nodeStyles[style] || nodeStyles.intermediate
    )}>
      <Handle type="target" position={Position.Top} className="!bg-slate-500 !w-2 !h-2 !border-0" />
      <div className="text-[13px] font-medium text-slate-100">{name}</div>
      <div className="text-[11px] font-mono text-slate-400">{Math.round((flux || 0) * 100)}%</div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-500 !w-2 !h-2 !border-0" />
    </div>
  );
}

// =============================================================================
// ENZYME PILL (on edges)
// =============================================================================

function EnzymePill({ gene, chromatin, isBottleneck, intervention, onClick }) {
  const color = getChromatinColor(chromatin);
  const spring = useSpring(chromatin, { stiffness: 200, damping: 20 });
  const barWidth = useTransform(spring, v => `${v * 100}%`);
  
  useEffect(() => { spring.set(chromatin); }, [chromatin, spring]);

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      className={cn(
        'relative px-3 py-2 rounded-full cursor-pointer transition-all duration-200',
        'bg-slate-900/95 border-2 hover:scale-105',
        isBottleneck && 'ring-2 ring-red-500/70 ring-offset-2 ring-offset-slate-900'
      )}
      style={{ 
        borderColor: color,
        boxShadow: `0 0 ${12 + chromatin * 8}px ${color}40`
      }}
    >
      {/* Gene name */}
      <div className="text-[11px] font-mono font-bold mb-1.5 text-center" style={{ color }}>
        {gene}
      </div>
      
      {/* Chromatin bar */}
      <div className="w-14 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ width: barWidth, backgroundColor: color }} />
      </div>
      
      {/* Intervention badge */}
      {intervention && intervention !== 'normal' && (
        <div className={cn(
          'absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[11px] font-bold',
          'flex items-center justify-center border-2 border-slate-900',
          intervention === 'activate' ? 'bg-green-500' : 'bg-red-500'
        )}>
          {intervention === 'activate' ? '+' : '−'}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// CUSTOM EDGE: Animated flow with enzyme
// =============================================================================

function EnzymeEdge({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }) {
  const { gene, chromatin, isBottleneck, intervention, onToggle } = data || {};
  const color = getChromatinColor(chromatin ?? 0.5);
  const speed = chromatin > 0.6 ? '0.6s' : chromatin > 0.3 ? '1.5s' : '3s';

  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition,
    borderRadius: 8,
  });

  return (
    <>
      {/* Track */}
      <path d={path} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
      {/* Animated flow */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray="12 8"
        style={{ animation: `flowDown ${speed} linear infinite` }}
      />
      {/* Enzyme pill */}
      {gene && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <EnzymePill
              gene={gene}
              chromatin={chromatin}
              isBottleneck={isBottleneck}
              intervention={intervention}
              onClick={onToggle}
            />
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

const nodeTypes = { metabolite: MetaboliteNode };
const edgeTypes = { enzyme: EnzymeEdge };

// =============================================================================
// TRISTATE TOGGLE
// =============================================================================

function TriStateToggle({ value, onChange }) {
  const opts = [
    { val: 'repress',  label: '−', active: 'bg-red-500' },
    { val: 'normal',   label: '○', active: 'bg-slate-500' },
    { val: 'activate', label: '+', active: 'bg-green-500' },
  ];
  return (
    <div className="flex bg-slate-800 rounded-lg p-0.5 gap-0.5">
      {opts.map(({ val, label, active }) => (
        <button
          key={val}
          onClick={() => onChange(val)}
          className={cn(
            'w-8 h-8 rounded-md text-sm font-bold transition-all',
            value === val ? `${active} text-white` : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function FluxDynamicsPage({ pathway = ehrlichPathway }) {
  // Intervention state: { geneId: 'normal' | 'activate' | 'repress' }
  const [interventions, setInterventions] = useState(() => {
    const init = {};
    Object.keys(pathway.baselineChromatin).forEach(g => { init[g] = 'normal'; });
    return init;
  });

  const setIntervention = (gene, value) => {
    setInterventions(prev => ({ ...prev, [gene]: value }));
  };

  const resetInterventions = () => {
    const reset = {};
    Object.keys(pathway.baselineChromatin).forEach(g => { reset[g] = 'normal'; });
    setInterventions(reset);
  };

  // Compute chromatin states based on interventions
  const geneStates = useMemo(() => {
    const states = {};
    Object.entries(pathway.baselineChromatin).forEach(([gene, baseline]) => {
      let chromatin = baseline;
      const intervention = interventions[gene];
      if (intervention === 'activate') {
        chromatin = clamp(baseline + pathway.interventionEffects.activate, 0, 1);
      } else if (intervention === 'repress') {
        chromatin = clamp(baseline + pathway.interventionEffects.repress, 0, 1);
      }
      states[gene] = { baseline, chromatin, intervention };
    });
    return states;
  }, [interventions, pathway]);

  // Simple flux model: flux = product of upstream chromatin values
  const fluxState = useMemo(() => {
    const nodeFlux = { leu: 1.0 };
    let cumulative = 1.0;
    
    pathway.reactions.forEach(rxn => {
      if (rxn.gene && geneStates[rxn.gene]) {
        cumulative *= geneStates[rxn.gene].chromatin;
      }
      nodeFlux[rxn.to] = cumulative;
    });
    
    // Split at branch point
    const atf1 = geneStates.ATF1?.chromatin || 0.5;
    nodeFlux.iamac = (nodeFlux.iamoh || 0) * atf1;
    nodeFlux.waste = (nodeFlux.iamoh || 0) * (1 - atf1);
    
    return nodeFlux;
  }, [geneStates, pathway]);

  // Find bottleneck (lowest chromatin gene)
  const bottleneckGene = useMemo(() => {
    return Object.entries(geneStates).reduce((min, [gene, state]) => {
      if (!min || state.chromatin < geneStates[min].chromatin) return gene;
      return min;
    }, null);
  }, [geneStates]);

  const genes = Object.keys(pathway.baselineChromatin);
  const hasActiveInterventions = genes.some(g => interventions[g] !== 'normal');

  // Build React Flow nodes
  const initialNodes = useMemo(() => {
    return Object.entries(pathway.metabolites).map(([id, meta]) => ({
      id,
      type: 'metabolite',
      position: { x: 0, y: 0 }, // Will be set by dagre
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      data: {
        name: meta.name,
        type: meta.type,
        flux: fluxState[id] || 0,
        isActive: interventions.ATF1 === 'activate',
      },
    }));
  }, [pathway, fluxState, interventions.ATF1]);

  // Build React Flow edges
  const initialEdges = useMemo(() => {
    return pathway.reactions.map(rxn => ({
      id: rxn.id,
      source: rxn.from,
      target: rxn.to,
      type: 'enzyme',
      data: {
        gene: rxn.gene,
        chromatin: rxn.gene ? geneStates[rxn.gene]?.chromatin : 0.5,
        isBottleneck: rxn.gene === bottleneckGene,
        intervention: rxn.gene ? interventions[rxn.gene] : 'normal',
        onToggle: rxn.gene ? () => {
          const curr = interventions[rxn.gene];
          const next = curr === 'normal' ? 'activate' : curr === 'activate' ? 'repress' : 'normal';
          setIntervention(rxn.gene, next);
        } : null,
      },
    }));
  }, [pathway, geneStates, bottleneckGene, interventions]);

  // Apply dagre layout
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    return getLayoutedElements(initialNodes, initialEdges);
  }, [initialNodes, initialEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  // Results calculations
  const captureRate = fluxState.iamac / (fluxState.iamac + fluxState.waste) || 0;
  const baselineCapture = 0.06 / (0.06 + 0.94); // ATF1 baseline
  const foldChange = captureRate / baselineCapture || 1;

  // Animated progress bars
  const springCapture = useSpring(captureRate * 100, { stiffness: 120, damping: 20 });
  useEffect(() => { springCapture.set(captureRate * 100); }, [captureRate, springCapture]);
  const captureWidth = useTransform(springCapture, v => `${v}%`);

  return (
    <div className="grid grid-cols-[1fr_320px] gap-4 h-full min-h-0">
      {/* Pathway Graph */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-4 left-4 z-10">
          <div className="text-sm font-medium text-slate-300">{pathway.name}</div>
          <div className="text-[11px] text-slate-500">{pathway.description}</div>
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
        >
          <Background color="#334155" gap={24} size={1} />
        </ReactFlow>
      </Card>

      {/* Control Panel */}
      <div className="flex flex-col gap-4">
        {/* Interventions */}
        <Card>
          <CardHeader>
            <CardTitle>CRISPR Interventions</CardTitle>
            {hasActiveInterventions && (
              <button onClick={resetInterventions} className="text-[10px] text-slate-400 hover:text-slate-200">
                Reset
              </button>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {genes.map(gene => {
              const { baseline, chromatin, intervention } = geneStates[gene];
              const delta = Math.round((chromatin - baseline) * 100);
              const color = getChromatinColor(chromatin);
              
              return (
                <div key={gene} className={cn(
                  'flex items-center justify-between p-2.5 rounded-lg transition-colors',
                  intervention !== 'normal' ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'
                )}>
                  <div>
                    <div className="font-mono text-sm font-semibold" style={{ color }}>{gene}</div>
                    <div className="text-[10px] text-slate-500">
                      {intervention === 'normal' 
                        ? `${Math.round(baseline * 100)}% accessible`
                        : <>
                            {Math.round(baseline * 100)}% → {Math.round(chromatin * 100)}%
                            <span className={delta > 0 ? 'text-green-400' : 'text-red-400'}> ({delta > 0 ? '+' : ''}{delta}%)</span>
                          </>
                      }
                    </div>
                  </div>
                  <TriStateToggle value={intervention} onChange={(v) => setIntervention(gene, v)} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="flex-1 flex flex-col">
          <CardHeader><CardTitle>Flux Output</CardTitle></CardHeader>
          <CardContent className="flex-1">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3 bg-black/20 rounded-lg text-center">
                <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">Capture Rate</div>
                <div className="text-2xl font-semibold font-mono" style={{ color: getChromatinColor(geneStates.ATF1?.chromatin || 0) }}>
                  {Math.round(captureRate * 100)}%
                </div>
              </div>
              <div className="p-3 bg-black/20 rounded-lg text-center">
                <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">vs Baseline</div>
                <div className={cn('text-2xl font-semibold font-mono', foldChange > 1.5 ? 'text-green-400' : 'text-slate-400')}>
                  {foldChange.toFixed(1)}×
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-2">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                <span>Product Capture</span>
                <span>{Math.round(captureRate * 100)}%</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-green-400" 
                  style={{ width: captureWidth }} 
                />
              </div>
            </div>
          </CardContent>

          {/* Insight banner */}
          <div className={cn(
            'px-4 py-3 text-center text-[11px] border-t border-white/5',
            interventions.ATF1 === 'activate'
              ? 'bg-green-500/10 text-green-300'
              : 'bg-amber-500/10 text-amber-300'
          )}>
            {interventions.ATF1 === 'activate'
              ? '✓ ATF1 activation redirects flux to product'
              : `⚠ ${bottleneckGene} is the bottleneck — ${Math.round(geneStates[bottleneckGene]?.chromatin * 100)}% accessible`
            }
          </div>
        </Card>
      </div>
    </div>
  );
}
