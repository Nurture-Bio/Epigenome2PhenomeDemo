import { useCallback, useEffect, useRef, useState } from 'react';
import { aiActions, aiInsights, aiTextChunks } from '../../../convergence_answer';
import { epigenomeLayers } from '../../data';
import { cn } from '../../lib/utils';
import { useSelectionStore } from '../../stores';
import { ActionCard, Button, Card, CardHeader, ComboBox, DataRow, EmptyState, MetricBar } from '../ui';

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
            <ComboBox defaultValue="ATF1" options={['ATF1','ATF2','EHT1','BAT1','BAT2'].map(v => ({ value: v, label: v }))} />
            <ComboBox defaultValue="mid-brew" options={[
              { value: 'mid-brew',   label: 'Mid-brew' },
              { value: 'early-log',  label: 'Early-log' },
              { value: 'late-log',   label: 'Late-log' },
              { value: 'stationary', label: 'Stationary' },
              { value: 'ethanol',    label: 'Ethanol' },
            ]} />
          </div>

          {/* Load All */}
          <Button
            variant="secondary"
            onClick={handleLoadAll}
            disabled={!anyLayerIdle}
            className="w-full mb-4"
          >
            Load All Layers
          </Button>

          {/* Layer Stack */}
          <div className="flex flex-col gap-3 mb-6">
            {epigenomeLayers.map((layer) => {
              const isSelected = selectedLayer === layer.source;
              const state = layerLoadStates[layer.source];
              return (
                <ActionCard
                  key={layer.name}
                  selected={isSelected}
                  accentColor={layer.color}
                  onClick={() => handleLayerClick(layer)}
                  className="p-3.5 px-4"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <div>
                      <span className="type-title">{layer.name}</span>
                      <span className="type-sm text-text-secondary ml-2">{layer.source}</span>
                    </div>
                    <div
                      className="py-1 px-2.5 rounded type-caption font-semibold min-w-[32px] text-center"
                      style={{
                        background: state === 'loaded' ? `${layer.color}20` : 'var(--surface-selected)',
                        color: state === 'loaded' ? layer.color : 'var(--text-secondary)'
                      }}
                    >
                      {state === 'idle' && 'Load'}
                      {state === 'loading' && <span className="inline-flex items-center"><span className="inline-block w-2.5 h-2.5 border-2 border-border-subtle border-t-[var(--color-accent)] rounded-full animate-spin" /></span>}
                      {state === 'loaded' && '✓'}
                    </div>
                  </div>
                  <div className="type-sm text-text-secondary">{layer.question}</div>
                </ActionCard>
            );
            })}
          </div>

          {/* Convergence Card */}
          <ActionCard
            selected={selectedLayer === 'convergence'}
            accentColor="var(--color-purple)"
            disabled={!allLayersLoaded}
            onClick={handleConvergeClick}
            className="p-3.5 px-4"
          >
            <div className="flex justify-between items-center mb-1.5">
              <div>
                <span className="type-title">AI Convergence</span>
                <span className="type-sm text-text-secondary ml-2">Multi-omic Integration</span>
              </div>
              <div
                className="py-1 px-2.5 rounded type-caption font-semibold min-w-[32px] text-center"
                style={{
                  background: convergenceState === 'converged' ? 'color-mix(in srgb, var(--color-purple) 20%, transparent)' : 'var(--surface-selected)',
                  color: convergenceState === 'converged' ? 'var(--color-purple)' : 'var(--text-secondary)'
                }}
              >
                {convergenceState === 'idle' && (allLayersLoaded ? 'Run' : '—')}
                {convergenceState === 'converging' && <span className="inline-flex items-center"><span className="inline-block w-2.5 h-2.5 border-2 border-border-subtle border-t-[var(--color-accent)] rounded-full animate-spin" /></span>}
                {convergenceState === 'converged' && '✓'}
              </div>
            </div>
            <div className="type-sm text-text-secondary">
              {allLayersLoaded ? 'Synthesize findings into actionable insight' : 'Load all layers first'}
            </div>
          </ActionCard>

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
      <div className="callout p-4" style={{ '--callout-color': 'var(--color-purple)' }}>
        <div className="mb-3 pb-3 border-b" style={{ borderColor: 'color-mix(in srgb, var(--color-purple) 20%, transparent)' }}>
          <span className="type-label mb-0" style={{ color: 'var(--color-purple)' }}>AI Analysis</span>
        </div>
        <div className="type-body leading-relaxed min-h-[120px]">
          {aiTextChunks.slice(0, visibleChunks).map((chunk, i) => (
            <div key={i} className={chunk.isBullet ? 'flex gap-2 mb-1.5 pl-1' : 'text-text-secondary mb-3'}>
              {chunk.isBullet && <span className="shrink-0" style={{ color: 'var(--color-success)' }}>•</span>}
              {chunk.text}
            </div>
          ))}
          {!typingDone && <span className="inline-block animate-[blink_0.8s_infinite] ml-0.5" style={{ color: 'var(--color-purple)' }}>|</span>}
        </div>
      </div>

      {/* Insights */}
      {typingDone && (
        <div className="grid grid-cols-2 gap-3">
          {aiInsights.slice(0, visibleInsights).map((insight, i) => (
            <div key={i} className="p-3.5 bg-surface-hover border border-border-subtle animate-[fadeInUp_0.3s_ease]">
              <div className="type-label mb-1">{insight.label}</div>
              <div className="type-body leading-snug">{insight.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Action card */}
      {typingDone && visibleInsights >= aiInsights.length && (
        <div className="mt-4 callout animate-[fadeInUp_0.4s_ease]" style={{ '--callout-color': 'var(--color-purple)' }}>
          <div className="mb-3">
            <span className="type-label mb-0" style={{ color: 'var(--color-purple)' }}>Recommended Intervention</span>
          </div>
          {aiActions.map((a, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="type-body leading-relaxed font-semibold">{a.action}</div>
              <div className="type-body leading-relaxed pl-3 border-l-2" style={{ borderColor: 'color-mix(in srgb, var(--color-purple) 30%, transparent)' }}>
                <span className="font-semibold" style={{ color: 'var(--color-purple)' }}>Because: </span>
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
          <ImplicationBox text={rnaSeqData.implication} />
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
          <ImplicationBox text={selectedData.implication} />
        </>
      )}

      {/* Hi-C */}
      {selectedLayer === 'Hi-C' && (
        <>
          <div className="mb-5">
            <div className="type-label">3D Chromatin Architecture</div>
            {selectedData.metrics.map((m) => (
              <div key={m.name} className="py-3 border-b border-border-subtle last:border-b-0">
                <div className="flex justify-between items-center">
                  <span className="type-body">
                    {m.name}
                    <span className="type-caption ml-1" style={{ color: m.type === 'repressive' ? 'var(--color-danger)' : m.type === 'neutral' ? 'var(--text-muted)' : 'var(--color-success)' }}>
                      {' '}({m.detail})
                    </span>
                  </span>
                  <span className="type-title font-mono" style={{ color: m.type === 'repressive' ? 'var(--color-danger)' : m.type === 'neutral' ? 'var(--text-muted)' : 'var(--color-success)' }}>{m.value}</span>
                </div>
              </div>
            ))}
          </div>
          <FindingBox finding={selectedData.finding} />
          <ImplicationBox text={selectedData.implication} />
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
                    <span className="type-caption ml-1" style={{ color: mark.type === 'repressive' ? 'var(--color-danger)' : 'var(--color-success)' }}>
                      {mark.type === 'repressive' ? ' (repressive)' : ' (active)'}
                    </span>
                  </span>
                  <span className="type-title font-mono" style={{ color: mark.type === 'repressive' ? 'var(--color-danger)' : 'var(--color-success)' }}>
                    {mark.value}× {mark.value > 1 ? '↑' : '↓'}
                  </span>
                </div>
                <MetricBar
                  value={Math.min(mark.value * 20, 100)}
                  variant={mark.type === 'repressive' ? 'danger' : 'success'}
                  baseline={20}
                />
              </div>
            ))}
          </div>
          <FindingBox finding={selectedData.finding} />
          <ImplicationBox text={selectedData.implication} />
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
              <span className="font-mono" style={item.highlight ? { color: 'var(--color-danger)', fontWeight: 600 } : undefined}>{item[labelKey]}</span>
              {subtitleKey && <span className="type-caption ml-1"> ({item[subtitleKey]})</span>}
            </span>
            <span className="type-title font-mono" style={{ color: item.highlight ? 'var(--color-danger)' : 'var(--color-success)' }}>
              {item[valueKey]}{valueSuffix}
            </span>
          </div>
          <div className="relative">
            <MetricBar
              value={item[pctKey]}
              variant={item.highlight ? 'danger' : 'success'}
            />
            {item.highlight && (
              <span className="absolute right-0 -top-5 type-badge tracking-[0.5px]" style={{ color: 'var(--color-danger)' }}>BOTTLENECK</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function FindingBox({ finding }) {
  return (
    <div className="callout mb-4" style={{ '--callout-color': 'var(--color-accent)' }}>
      <div className="type-label mb-1.5" style={{ color: 'var(--color-accent)' }}>Key Finding</div>
      <div className="type-body leading-relaxed">{finding}</div>
    </div>
  );
}

function ImplicationBox({ text }) {
  return (
    <div className="callout" style={{ '--callout-color': 'var(--color-purple)' }}>
      <div className="type-body leading-relaxed">{text}</div>
    </div>
  );
}
