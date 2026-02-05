import { useCallback, useEffect, useRef, useState } from 'react';
import { epigenomeLayers } from '../../data';
import { useSelectionStore } from '../../stores';
import { cn } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent, DataRow, InfoBox, Button, Select, ComparisonBar } from '../ui';

// AI convergence data
const aiTextChunks = [
  { text: 'Integrating 4 epigenomic layers...', isBullet: false },
  { text: 'Plenty of isoamyl alcohol precursor available', isBullet: true },
  { text: 'ATF1 is epigenetically silenced (B compartment, H3K27me3+)', isBullet: true },
  { text: 'Only 6% of cells can transcribe the esterification enzyme', isBullet: true },
  { text: 'Banana flavor pathway blocked at the final step', isBullet: true },
  { text: 'Opening ATF1 chromatin → ~4× more isoamyl acetate', isBullet: true },
];

const aiInsights = [
  { icon: '🍌', label: 'Flavor Target', value: 'Isoamyl acetate (banana ester)' },
  { icon: '🔒', label: 'Bottleneck', value: 'ATF1 promoter is 94% closed' },
  { icon: '📈', label: 'Potential', value: '+4× banana flavor if opened' },
  { icon: '→', label: 'Next', value: 'Simulate ATF1 activation in Flux Dynamics' },
];

// RNA-seq data
const rnaSeqData = {
  gene: 'ATF1',
  systematicName: 'YOR377W',
  description: 'Alcohol acetyltransferase — final step in isoamyl acetate biosynthesis',
  comparison: [
    { gene: 'BAT2', tpm: 892, pct: 94 },
    { gene: 'ARO10', tpm: 567, pct: 78 },
    { gene: 'ADH6', tpm: 423, pct: 65 },
    { gene: 'ATF1', tpm: 14, pct: 8, highlight: true },
  ],
  finding: 'ATF1 transcript is in the bottom 8th percentile under mid-brew conditions — starved for mRNA.',
  implication: 'Low transcription limits enzyme availability, capping ester production regardless of precursor flux.',
};

// Layer visualization data
const layerVisData = {
  'Hi-C': { 
    description: '3D chromatin conformation at the ATF1 locus',
    metrics: [
      { name: 'Compartment', value: 'B', detail: 'Inactive', color: '#f59e0b', type: 'repressive' },
      { name: 'PC1 Score', value: '-0.42', detail: 'Eigenvector', color: '#f59e0b', type: 'repressive' },
      { name: 'TAD Boundary', value: '0.3', detail: 'Weak insulation', color: '#64748b', type: 'neutral' },
      { name: 'Enhancer Loops', value: '0', detail: 'None detected', color: '#ef4444', type: 'repressive' },
    ],
    finding: 'ATF1 resides in a transcriptionally inactive B compartment with no detectable promoter-enhancer loops.',
    implication: 'The locus is spatially segregated from active chromatin hubs, limiting transcription factor access.',
  },
  'ATAC-seq': {
    description: 'Chromatin accessibility at the ATF1 promoter region',
    comparison: [
      { gene: 'BAT2', pct: 93, role: 'Upstream' },
      { gene: 'ARO10', pct: 78, role: 'Upstream' },
      { gene: 'ADH6', pct: 69, role: 'Upstream' },
      { gene: 'ATF1', pct: 6, role: 'Bottleneck', highlight: true },
    ],
    finding: 'ATF1 promoter shows only 6% chromatin accessibility — the bottleneck in the entire ester biosynthesis pathway.',
    implication: 'Nucleosome compaction at the ATF1 promoter prevents RNA polymerase binding.',
  },
  'ChIP-seq': {
    description: 'Histone modification landscape at the ATF1 promoter',
    marks: [
      { name: 'H3K27me3', value: 4.7, type: 'repressive', color: '#ef4444' },
      { name: 'H3K9me3', value: 2.1, type: 'repressive', color: '#f59e0b' },
      { name: 'H3K27ac', value: 0.4, type: 'active', color: '#22c55e' },
      { name: 'H3K4me3', value: 0.6, type: 'active', color: '#22c55e' },
    ],
    finding: 'ATF1 shows strong H3K27me3 (4.7×) and depleted H3K27ac (0.4×) — a classic Polycomb-repressed signature.',
    implication: 'The promoter is marked for silencing; dCas9-VPR could recruit activating acetyltransferases.',
  },
};

export function EpigenomePage() {
  const { 
    selectedLayer, selectLayer, layerLoadStates, setLayerLoading, setLayerLoaded,
    convergenceState, setConverging, setConverged, convergenceTypingComplete, setConvergenceTypingComplete,
  } = useSelectionStore();

  const handleLoadLayer = useCallback((source) => {
    setLayerLoading(source);
    setTimeout(() => setLayerLoaded(source), 1000 + Math.random() * 1000);
  }, [setLayerLoading, setLayerLoaded]);

  const allLayersLoaded = Object.values(layerLoadStates).every(s => s === 'loaded');
  const anyLayerIdle = Object.values(layerLoadStates).some(s => s === 'idle');

  const handleLoadAll = useCallback(() => {
    epigenomeLayers.filter(l => layerLoadStates[l.source] === 'idle').forEach((layer, i) => {
      setTimeout(() => {
        setLayerLoading(layer.source);
        setTimeout(() => setLayerLoaded(layer.source), 1000 + Math.random() * 1000);
      }, i * 500);
    });
  }, [layerLoadStates, setLayerLoading, setLayerLoaded]);

  const handleConvergeClick = useCallback(() => {
    if (!allLayersLoaded) return;
    if (convergenceState === 'idle') {
      setConverging();
      setTimeout(() => setConverged(), 2000 + Math.random() * 1000);
    } else if (convergenceState === 'converged') {
      selectLayer('convergence');
    }
  }, [allLayersLoaded, convergenceState, setConverging, setConverged, selectLayer]);

  const handleLayerClick = (layer) => {
    const state = layerLoadStates[layer.source];
    if (state === 'idle') handleLoadLayer(layer.source);
    else if (state === 'loaded') selectLayer(layer.source);
  };

  const isSelectedLoaded = selectedLayer && layerLoadStates[selectedLayer] === 'loaded';
  const selectedData = selectedLayer === 'RNA-seq' ? rnaSeqData : layerVisData[selectedLayer];

  // Typewriter effect
  const [visibleChunks, setVisibleChunks] = useState(convergenceTypingComplete ? aiTextChunks.length : 0);
  const [typingDone, setTypingDone] = useState(convergenceTypingComplete);
  const [visibleInsights, setVisibleInsights] = useState(convergenceTypingComplete ? aiInsights.length : 0);
  const typewriterStarted = useRef(convergenceTypingComplete);

  useEffect(() => {
    if (convergenceTypingComplete) return;
    if (selectedLayer === 'convergence' && convergenceState === 'converged' && !typewriterStarted.current) {
      typewriterStarted.current = true;
      setVisibleChunks(0);
      setTypingDone(false);
      setVisibleInsights(0);
      
      let currentChunk = 0;
      const interval = setInterval(() => {
        currentChunk++;
        setVisibleChunks(currentChunk);
        if (currentChunk >= aiTextChunks.length) {
          clearInterval(interval);
          setTimeout(() => {
            setTypingDone(true);
            let insightIdx = 0;
            const insightInterval = setInterval(() => {
              insightIdx++;
              setVisibleInsights(insightIdx);
              if (insightIdx >= aiInsights.length) {
                clearInterval(insightInterval);
                setConvergenceTypingComplete();
              }
            }, 400);
          }, 500);
        }
      }, 600);
      return () => clearInterval(interval);
    }
  }, [selectedLayer, convergenceState, convergenceTypingComplete, setConvergenceTypingComplete]);

  return (
    <div className="grid grid-cols-[340px_1fr] gap-4 h-full min-h-0">
      {/* Left Panel */}
      <Card className="flex flex-col overflow-hidden">
        <CardHeader><CardTitle>Multi-omic Data Integration</CardTitle></CardHeader>
        <CardContent className="flex-1 overflow-auto flex flex-col gap-3">
          {/* Target Gene */}
          <Select defaultValue="ATF1">
            <option value="ATF1">ATF1 — Alcohol acetyltransferase</option>
          </Select>

          <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded text-[11px] text-amber-300">
            📍 Glucose-limited anaerobic (mid-brew)
          </div>

          {anyLayerIdle && (
            <Button variant="secondary" onClick={handleLoadAll} className="w-full">
              Load All Layers
            </Button>
          )}

          {/* Layer Stack */}
          <div className="flex flex-col gap-2">
            {epigenomeLayers.map((layer) => {
              const isSelected = selectedLayer === layer.source;
              const state = layerLoadStates[layer.source];
              
              return (
                <div 
                  key={layer.name}
                  onClick={() => handleLayerClick(layer)}
                  className={cn(
                    'p-3 rounded-lg border-l-4 cursor-pointer transition-all',
                    'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04]',
                    isSelected && 'bg-white/[0.06]'
                  )}
                  style={{ borderLeftColor: layer.color }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="text-[13px] font-medium text-slate-200">{layer.name}</div>
                      <div className="text-[10px] text-slate-500">{layer.source}</div>
                    </div>
                    <div
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-medium',
                        state === 'loaded' ? 'text-green-400' : 'text-slate-500'
                      )}
                      style={{ 
                        background: state === 'loaded' ? `${layer.color}20` : 'rgba(100,100,100,0.15)', 
                        color: state === 'loaded' ? layer.color : undefined 
                      }}
                    >
                      {state === 'idle' && 'Load'}
                      {state === 'loading' && <span className="animate-spin">⟳</span>}
                      {state === 'loaded' && '✓'}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400">{layer.question}</div>
                </div>
              );
            })}
          </div>

          {/* Convergence Card */}
          <div 
            onClick={handleConvergeClick}
            className={cn(
              'p-3 rounded-lg border-l-4 cursor-pointer transition-all',
              'bg-white/[0.02] border border-white/[0.06]',
              selectedLayer === 'convergence' && 'bg-white/[0.06]',
              !allLayersLoaded && 'opacity-50 cursor-not-allowed'
            )}
            style={{ borderLeftColor: '#a78bfa' }}
          >
            <div className="flex justify-between items-start mb-1">
              <div>
                <div className="text-[13px] font-medium text-slate-200">✨ AI Convergence</div>
                <div className="text-[10px] text-slate-500">Multi-omic Integration</div>
              </div>
              <div
                className="px-2 py-0.5 rounded text-[10px] font-medium"
                style={{ 
                  background: convergenceState === 'converged' ? 'rgba(167, 139, 250, 0.2)' : 'rgba(100,100,100,0.15)', 
                  color: convergenceState === 'converged' ? '#a78bfa' : '#64748b' 
                }}
              >
                {convergenceState === 'idle' && (allLayersLoaded ? 'Run' : '—')}
                {convergenceState === 'converging' && <span className="animate-spin">⟳</span>}
                {convergenceState === 'converged' && '✓'}
              </div>
            </div>
            <div className="text-[11px] text-slate-400">
              {allLayersLoaded ? 'Synthesize findings into actionable insight' : 'Load all layers first'}
            </div>
          </div>

          {/* Summary */}
          <DataRow 
            label="Layers loaded" 
            value={`${Object.values(layerLoadStates).filter(s => s === 'loaded').length} / 4`} 
          />
        </CardContent>
      </Card>

      {/* Right Panel */}
      <Card className="flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle>
            {selectedLayer === 'convergence' ? 'AI Analysis Result' : isSelectedLoaded ? `${selectedLayer} Analysis` : 'Layer Visualization'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          {selectedLayer === 'convergence' && convergenceState === 'converged' ? (
            <ConvergenceResult 
              visibleChunks={visibleChunks} 
              typingDone={typingDone} 
              visibleInsights={visibleInsights} 
            />
          ) : isSelectedLoaded ? (
            <LayerVisualization selectedLayer={selectedLayer} selectedData={selectedData} />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-xs">
              Load a data layer to begin analysis
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ConvergenceResult({ visibleChunks, typingDone, visibleInsights }) {
  return (
    <div>
      <div className="p-4 bg-violet-500/[0.08] border border-violet-500/20 rounded-lg mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">✨</span>
          <span className="text-[11px] font-semibold text-violet-400 uppercase tracking-wide">AI Analysis</span>
        </div>
        <div className="space-y-2">
          {aiTextChunks.slice(0, visibleChunks).map((chunk, i) => (
            <div key={i} className={cn('text-[13px]', chunk.isBullet ? 'text-slate-300 pl-4' : 'text-slate-400')}>
              {chunk.isBullet && <span className="text-violet-400 mr-2">•</span>}
              {chunk.text}
            </div>
          ))}
          {!typingDone && <span className="text-violet-400 animate-pulse">|</span>}
        </div>
      </div>

      {typingDone && (
        <div className="grid grid-cols-2 gap-3">
          {aiInsights.slice(0, visibleInsights).map((insight, i) => (
            <div key={i} className="p-3 bg-black/30 rounded-lg flex gap-3">
              <span className="text-xl">{insight.icon}</span>
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wide">{insight.label}</div>
                <div className="text-[12px] text-slate-200">{insight.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LayerVisualization({ selectedLayer, selectedData }) {
  return (
    <>
      <div className="mb-4">
        <div className="text-xl font-light text-slate-200">ATF1</div>
        <div className="text-[11px] font-mono text-slate-500">YOR377W</div>
        <div className="text-[12px] text-slate-400 mt-1">{selectedData?.description}</div>
      </div>

      {selectedLayer === 'RNA-seq' && (
        <>
          <div className="mb-4">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3">Pathway Gene Expression</div>
            {rnaSeqData.comparison.map((gene) => (
              <ComparisonBar 
                key={gene.gene} 
                gene={gene.gene} 
                value={gene.pct} 
                unit="% TPM"
                isBottleneck={gene.highlight} 
              />
            ))}
          </div>
          <InfoBox label="Key Finding" variant="blue" className="mb-3">{rnaSeqData.finding}</InfoBox>
          <InfoBox icon="💡" variant="purple">{rnaSeqData.implication}</InfoBox>
        </>
      )}

      {selectedLayer === 'ATAC-seq' && (
        <>
          <div className="mb-4">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3">Pathway Gene Accessibility</div>
            {selectedData.comparison.map((gene) => (
              <ComparisonBar 
                key={gene.gene} 
                gene={gene.gene} 
                value={gene.pct}
                role={gene.role}
                isBottleneck={gene.highlight} 
              />
            ))}
          </div>
          <InfoBox label="Key Finding" variant="blue" className="mb-3">{selectedData.finding}</InfoBox>
          <InfoBox icon="🔒" variant="purple">{selectedData.implication}</InfoBox>
        </>
      )}

      {selectedLayer === 'Hi-C' && (
        <>
          <div className="mb-4">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3">3D Chromatin Architecture</div>
            {selectedData.metrics.map((m) => (
              <div key={m.name} className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                <span className="text-[11px] text-slate-400">
                  {m.name}
                  <span className={cn('ml-1', m.type === 'repressive' ? 'text-red-400' : 'text-slate-500')}>
                    ({m.detail})
                  </span>
                </span>
                <span className="font-mono text-[11px]" style={{ color: m.color }}>{m.value}</span>
              </div>
            ))}
          </div>
          <InfoBox label="Key Finding" variant="blue" className="mb-3">{selectedData.finding}</InfoBox>
          <InfoBox icon="🧬" variant="purple">{selectedData.implication}</InfoBox>
        </>
      )}

      {selectedLayer === 'ChIP-seq' && (
        <>
          <div className="mb-4">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3">Histone Mark Enrichment</div>
            {selectedData.marks.map((mark) => (
              <div key={mark.name} className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px]">
                    {mark.name}
                    <span className={mark.type === 'repressive' ? 'text-red-400' : 'text-green-400'}>
                      {mark.type === 'repressive' ? ' (repressive)' : ' (active)'}
                    </span>
                  </span>
                  <span className="font-mono text-[11px]" style={{ color: mark.color }}>
                    {mark.value}× {mark.value > 1 ? '↑' : '↓'}
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded overflow-hidden">
                  <div 
                    className="h-full rounded transition-all"
                    style={{ 
                      width: `${Math.min(mark.value * 20, 100)}%`, 
                      background: `linear-gradient(90deg, ${mark.color}80, ${mark.color})` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <InfoBox label="Key Finding" variant="blue" className="mb-3">{selectedData.finding}</InfoBox>
          <InfoBox icon="🎯" variant="purple">{selectedData.implication}</InfoBox>
        </>
      )}
    </>
  );
}
