import { useCallback, useEffect, useRef, useState } from 'react';
import { epigenomeLayers } from '../../data';
import { useSelectionStore } from '../../stores';
import { cn } from '../../lib/utils';
import { Card, CardHeader, CardContent, DataRow, EmptyState } from '../ui';

const aiTextChunks = [
  { text: 'ATF1 bottleneck is epigenetic silencing: closed chromatin, high nucleosomes, depleted active marks, compartment B localization', isBullet: false },
  { text: 'Upstream pathway genes show 69-93% accessibility while ATF1 has 6% — differential chromatin states within same pathway', isBullet: true },
  { text: 'ATF1 lacks enhancer loops and shows 3.2x nucleosome density with 0.4-0.6x active histone marks — coordinated repression', isBullet: true },
  { text: 'B compartment localization (-0.42 PC1) places ATF1 in heterochromatin-like environment despite pathway activity', isBullet: true },
];

const aiInsights = [
  { icon: '🔒', label: 'Chromatin Lock', value: 'ATF1 promoter is chromatinized' },
  { icon: '⚖️', label: 'Pathway Imbalance', value: '15x expression gap vs upstream' },
  { icon: '🎯', label: 'CRISPRa Target', value: 'Closed but reversible state' },
];

const aiActions = [
  { action: 'Deploy dCas9-VPR CRISPRa targeting ATF1 promoter region to recruit transcriptional machinery and chromatin remodeling activity', because: '6% accessibility and 3.2x nucleosome density indicate reversible chromatin silencing that CRISPRa can overcome by forced recruitment of activating complexes' },
];

const rnaSeqData = {
  gene: 'ATF1',
  systematicName: 'YOR377W',
  description: 'Alcohol acetyltransferase — final step in isoamyl acetate biosynthesis',
  tpm: 14,
  percentile: 8,
  status: 'Very Low',
  color: '#ef4444',
  comparison: [
    { gene: 'BAT2', tpm: 892, pct: 94 },
    { gene: 'ARO10', tpm: 567, pct: 78 },
    { gene: 'ADH6', tpm: 423, pct: 65 },
    { gene: 'ATF1', tpm: 14, pct: 8, highlight: true },
  ],
  finding: 'ATF1 transcript is in the bottom 8th percentile under mid-brew conditions — starved for mRNA.',
  implication: 'Low transcription limits enzyme availability, capping ester production regardless of precursor flux.',
};

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
    metric: 'Accessibility',
    value: 6,
    unit: '% open chromatin',
    status: 'Closed Chromatin',
    statusType: 'danger',
    color: '#f472b6',
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
    metric: 'Nucleosome density',
    value: 3.2,
    unit: 'fold enrichment',
    status: 'Chromatin Compaction',
    statusType: 'danger',
    color: '#06b6d4',
    description: 'Histone modification landscape at the ATF1 promoter',
    marks: [
      { name: 'Nucleosome density', value: 3.2, baseline: 1.0, type: 'repressive', color: '#ef4444' },
      { name: 'H3K4me3', value: 0.6, baseline: 1.0, type: 'active', color: '#22c55e' },
      { name: 'H3K9ac', value: 0.5, baseline: 1.0, type: 'active', color: '#22c55e' },
      { name: 'H4K16ac', value: 0.4, baseline: 1.0, type: 'active', color: '#22c55e' },
    ],
    finding: 'ATF1 shows high nucleosome density (3.2×) and depleted H3K4me3/acetylation — a tightly closed promoter.',
    implication: 'The promoter is nucleosome-occluded; activation could recruit acetyltransferases to open chromatin.',
  },
};

// Drop-down arrow SVG for custom selects
const selectArrow = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M3 4.5L6 7.5L9 4.5'/%3E%3C/svg%3E")`;

export function GeneTopologyPage() {
  const {
    selectedLayer,
    selectLayer,
    layerLoadStates,
    setLayerLoading,
    setLayerLoaded,
    convergenceState,
    setConverging,
    setConverged,
    convergenceTypingComplete,
    setConvergenceTypingComplete,
  } = useSelectionStore();

  const handleLoadLayer = useCallback((source) => {
    setLayerLoading(source);
    const delay = 1000 + Math.random() * 1000;
    setTimeout(() => setLayerLoaded(source), delay);
  }, [setLayerLoading, setLayerLoaded]);

  const allLayersLoaded = Object.values(layerLoadStates).every(s => s === 'loaded');
  const anyLayerIdle = Object.values(layerLoadStates).some(s => s === 'idle');

  const handleLoadAll = useCallback(() => {
    const idleLayers = epigenomeLayers.filter(l => layerLoadStates[l.source] === 'idle');
    idleLayers.forEach((layer, i) => {
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
      setConverged();
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

  // Typewriter
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
    <div className="grid grid-cols-2 gap-8 h-full">
      {/* Left Panel */}
      <Card>
        <CardHeader>Multi-omic Data Integration</CardHeader>
        <div className="p-5">
          {/* Selectors */}
          <div className="flex gap-2 items-center mb-4">
            <select
              defaultValue="ATF1"
              className="bg-black/30 border border-white/15 rounded py-1.5 px-2.5 pr-7 type-select cursor-pointer appearance-none outline-none hover:border-white/25 focus:border-green-500/50"
              style={{ backgroundImage: selectArrow, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
            >
              <option>ATF1</option><option>ATF2</option><option>EHT1</option><option>BAT1</option><option>BAT2</option>
            </select>
            <select
              defaultValue="mid-brew"
              className="bg-black/30 border border-white/15 rounded py-1.5 px-2.5 pr-7 type-select cursor-pointer appearance-none outline-none hover:border-white/25 focus:border-green-500/50"
              style={{ backgroundImage: selectArrow, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
            >
              <option value="mid-brew">Mid-brew</option><option value="early-log">Early-log</option><option value="late-log">Late-log</option><option value="stationary">Stationary</option><option value="ethanol">Ethanol</option>
            </select>
          </div>

          {/* Load All */}
          <button
            onClick={handleLoadAll}
            disabled={!anyLayerIdle}
            className="w-full py-2.5 px-4 bg-gradient-to-br from-blue-500/15 to-violet-500/15 border border-violet-500/25 rounded-md text-violet-400 text-xs font-semibold cursor-pointer transition-colors mb-4 hover:from-blue-500/25 hover:to-violet-500/25 hover:border-violet-500/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-blue-500/15 disabled:hover:to-violet-500/15 disabled:hover:border-violet-500/25"
          >
            Load All Layers
          </button>

          {/* Layer Stack */}
          <div className="flex flex-col gap-3 mb-6">
            {epigenomeLayers.map((layer) => {
              const isSelected = selectedLayer === layer.source;
              const state = layerLoadStates[layer.source];
              return (
                <div
                  key={layer.name}
                  onClick={() => handleLayerClick(layer)}
                  className={cn(
                    'bg-white/[0.02] border border-white/[0.08] border-l-[3px] rounded-lg p-3.5 px-4 cursor-pointer relative z-[1] transition-all duration-150',
                    !isSelected && 'hover:shadow-[inset_0_0_0_100px_rgba(255,255,255,0.04)]',
                    isSelected && 'shadow-[0_0_0_1px_rgba(255,255,255,0.1),_0_4px_12px_rgba(0,0,0,0.4)] bg-white/[0.04]',
                  )}
                  style={{ borderLeftColor: layer.color }}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <div>
                      <span className="type-title">{layer.name}</span>
                      <span className="type-sm text-slate-500 ml-2">{layer.source}</span>
                    </div>
                    <div
                      className="py-1 px-2.5 rounded type-caption font-semibold min-w-[32px] text-center"
                      style={{
                        background: state === 'loaded' ? `${layer.color}20` : 'rgba(100,100,100,0.15)',
                        color: state === 'loaded' ? layer.color : '#64748b'
                      }}
                    >
                      {state === 'idle' && 'Load'}
                      {state === 'loading' && <span className="inline-flex items-center"><span className="inline-block w-2.5 h-2.5 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" /></span>}
                      {state === 'loaded' && '✓'}
                    </div>
                  </div>
                  <div className="type-sm text-slate-500">{layer.question}</div>
                </div>
              );
            })}
          </div>

          {/* Convergence Card */}
          <div
            onClick={handleConvergeClick}
            className={cn(
              'bg-gradient-to-br from-blue-500/5 to-violet-500/5 border border-violet-500/15 border-l-[3px] rounded-lg p-3.5 px-4 cursor-pointer relative z-[1] transition-all duration-150',
              selectedLayer !== 'convergence' && 'hover:shadow-[inset_0_0_0_100px_rgba(255,255,255,0.04)]',
              selectedLayer === 'convergence' && 'shadow-[0_0_0_1px_rgba(255,255,255,0.1),_0_4px_12px_rgba(0,0,0,0.4)] bg-white/[0.04]',
              !allLayersLoaded && 'opacity-50 cursor-not-allowed',
            )}
            style={{ borderLeftColor: '#a78bfa' }}
          >
            <div className="flex justify-between items-center mb-1.5">
              <div>
                <span className="type-title">✨ AI Convergence</span>
                <span className="type-sm text-slate-500 ml-2">Multi-omic Integration</span>
              </div>
              <div
                className="py-1 px-2.5 rounded type-caption font-semibold min-w-[32px] text-center"
                style={{
                  background: convergenceState === 'converged' ? 'rgba(167, 139, 250, 0.2)' : 'rgba(100,100,100,0.15)',
                  color: convergenceState === 'converged' ? '#a78bfa' : '#64748b'
                }}
              >
                {convergenceState === 'idle' && (allLayersLoaded ? 'Run' : '—')}
                {convergenceState === 'converging' && <span className="inline-flex items-center"><span className="inline-block w-2.5 h-2.5 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" /></span>}
                {convergenceState === 'converged' && '✓'}
              </div>
            </div>
            <div className="type-sm text-slate-500">
              {allLayersLoaded ? 'Synthesize findings into actionable insight' : 'Load all layers first'}
            </div>
          </div>

          {/* Summary */}
          <div className="mt-4">
            <DataRow
              label="Layers loaded"
              value={`${Object.values(layerLoadStates).filter(s => s === 'loaded').length} / 4`}
            />
          </div>
        </div>
      </Card>

      {/* Right Panel: Visualization */}
      <Card>
        <CardHeader>
          {selectedLayer === 'convergence' ? 'AI Analysis Result' : isSelectedLoaded ? `${selectedLayer} Analysis` : 'Layer Visualization'}
        </CardHeader>
        <div className="p-5">
          {selectedLayer === 'convergence' && convergenceState === 'converged' ? (
            <ConvergenceView
              visibleChunks={visibleChunks}
              typingDone={typingDone}
              visibleInsights={visibleInsights}
            />
          ) : isSelectedLoaded ? (
            <LayerVisualization selectedLayer={selectedLayer} selectedData={selectedData} />
          ) : (
            <EmptyState>Layer analysis will appear here</EmptyState>
          )}
        </div>
      </Card>
    </div>
  );
}

function ConvergenceView({ visibleChunks, typingDone, visibleInsights }) {
  return (
    <div className="flex flex-col gap-5">
      {/* AI typing box */}
      <div className="bg-violet-500/[0.08] border border-violet-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-violet-500/15">
          <span className="text-base">✨</span>
          <span className="type-label mb-0 text-violet-400">AI Analysis</span>
        </div>
        <div className="type-body leading-relaxed min-h-[120px]">
          {aiTextChunks.slice(0, visibleChunks).map((chunk, i) => (
            <div key={i} className={chunk.isBullet ? 'flex gap-2 mb-1.5 pl-1' : 'text-slate-400 mb-3'}>
              {chunk.isBullet && <span className="text-green-500 shrink-0">•</span>}
              {chunk.text}
            </div>
          ))}
          {!typingDone && <span className="inline-block text-violet-400 animate-[blink_0.8s_infinite] ml-0.5">|</span>}
        </div>
      </div>

      {/* Insights */}
      {typingDone && (
        <div className="grid grid-cols-2 gap-3">
          {aiInsights.slice(0, visibleInsights).map((insight, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-lg animate-[fadeInUp_0.3s_ease]">
              <span className="text-lg shrink-0">{insight.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="type-label mb-1">{insight.label}</div>
                <div className="type-body leading-snug">{insight.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action card */}
      {typingDone && visibleInsights >= aiInsights.length && (
        <div className="mt-4 p-4 bg-violet-400/[0.06] border border-violet-400/20 rounded-[10px] animate-[fadeInUp_0.4s_ease]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">⚡</span>
            <span className="type-label mb-0 text-violet-400">Recommended Intervention</span>
          </div>
          {aiActions.map((a, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="type-body leading-relaxed font-semibold">{a.action}</div>
              <div className="type-sm leading-relaxed pl-3 border-l-2 border-violet-400/30">
                <span className="font-semibold text-violet-400">Because: </span>
                {a.because}
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
      {/* Gene header */}
      <div className="mb-6">
        <div className="type-heading mb-1">ATF1</div>
        <div className="type-mono mb-2">YOR377W</div>
        <div className="type-sm">{selectedData?.description}</div>
      </div>

      {/* RNA-seq */}
      {selectedLayer === 'RNA-seq' && (
        <>
          <BarSection
            title="Pathway Gene Expression"
            items={rnaSeqData.comparison}
            labelKey="gene"
            valueKey="tpm"
            pctKey="pct"
            valueSuffix=" TPM"
          />
          <FindingBox finding={rnaSeqData.finding} />
          <ImplicationBox icon="💡" text={rnaSeqData.implication} />
        </>
      )}

      {/* ATAC-seq */}
      {selectedLayer === 'ATAC-seq' && (
        <>
          <BarSection
            title="Pathway Gene Accessibility"
            items={selectedData.comparison}
            labelKey="gene"
            subtitleKey="role"
            valueKey="pct"
            pctKey="pct"
            valueSuffix="%"
          />
          <FindingBox finding={selectedData.finding} />
          <ImplicationBox icon="🔒" text={selectedData.implication} />
        </>
      )}

      {/* Hi-C */}
      {selectedLayer === 'Hi-C' && (
        <>
          <div className="mb-5">
            <div className="type-label">3D Chromatin Architecture</div>
            {selectedData.metrics.map((m) => (
              <div key={m.name} className="py-3 border-b border-white/[0.06] last:border-b-0">
                <div className="flex justify-between items-center">
                  <span className="type-body">
                    {m.name}
                    <span className="type-caption ml-1" style={{ color: m.type === 'repressive' ? '#ef4444' : m.type === 'neutral' ? '#64748b' : '#22c55e' }}>
                      {' '}({m.detail})
                    </span>
                  </span>
                  <span className="type-title font-mono" style={{ color: m.color }}>{m.value}</span>
                </div>
              </div>
            ))}
          </div>
          <FindingBox finding={selectedData.finding} />
          <ImplicationBox icon="🧬" text={selectedData.implication} />
        </>
      )}

      {/* ChIP-seq */}
      {selectedLayer === 'ChIP-seq' && (
        <>
          <div className="mb-5">
            <div className="type-label">Histone Mark Enrichment</div>
            {selectedData.marks.map((mark) => (
              <div key={mark.name} className="mb-3.5">
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="type-body">
                    {mark.name}
                    <span className="type-caption ml-1" style={{ color: mark.type === 'repressive' ? '#ef4444' : '#22c55e' }}>
                      {mark.type === 'repressive' ? ' (repressive)' : ' (active)'}
                    </span>
                  </span>
                  <span className="type-title font-mono" style={{ color: mark.color }}>
                    {mark.value}× {mark.value > 1 ? '↑' : '↓'}
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded overflow-hidden relative">
                  <div className="absolute top-0 bottom-0 w-0.5 bg-white/30" style={{ left: '20%' }} />
                  <div
                    className="h-full rounded transition-[width] duration-500"
                    style={{
                      width: `${Math.min(mark.value * 20, 100)}%`,
                      background: `linear-gradient(90deg, ${mark.color}80, ${mark.color})`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <FindingBox finding={selectedData.finding} />
          <ImplicationBox icon="🎯" text={selectedData.implication} />
        </>
      )}
    </>
  );
}

function BarSection({ title, items, labelKey, subtitleKey, valueKey, pctKey, valueSuffix }) {
  return (
    <div className="mb-5">
      <div className="type-label">{title}</div>
      {items.map((item) => (
        <div key={item[labelKey]} className="mb-3.5">
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="type-body">
              <span className={cn('font-mono', item.highlight && 'text-red-500 font-semibold')}>{item[labelKey]}</span>
              {subtitleKey && <span className="type-caption ml-1"> ({item[subtitleKey]})</span>}
            </span>
            <span className="type-title font-mono" style={{ color: item.highlight ? '#ef4444' : '#22c55e' }}>
              {item[valueKey]}{valueSuffix}
            </span>
          </div>
          <div className="h-2 bg-slate-800 rounded overflow-hidden relative">
            <div
              className="h-full rounded transition-[width] duration-500"
              style={{
                width: `${item[pctKey]}%`,
                background: item.highlight
                  ? 'linear-gradient(90deg, #dc262680, #ef4444)'
                  : 'linear-gradient(90deg, #15803d80, #22c55e)'
              }}
            />
            {item.highlight && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 type-badge text-red-300 tracking-[0.5px]">BOTTLENECK</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function FindingBox({ finding }) {
  return (
    <div className="p-4 bg-blue-500/[0.08] border border-blue-500/20 rounded-lg mb-4">
      <div className="type-label mb-2 text-blue-400">Key Finding</div>
      <div className="type-body leading-relaxed">{finding}</div>
    </div>
  );
}

function ImplicationBox({ icon, text }) {
  return (
    <div className="flex gap-3 p-3.5 bg-violet-500/[0.08] border border-violet-500/20 rounded-lg">
      <span className="text-lg">{icon}</span>
      <div className="type-sm leading-relaxed">{text}</div>
    </div>
  );
}
