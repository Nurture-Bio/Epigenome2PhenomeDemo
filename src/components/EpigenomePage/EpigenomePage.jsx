import { useCallback, useEffect, useRef, useState } from 'react';
import { epigenomeLayers } from '../../data';
import { useSelectionStore } from '../../stores';
import sharedStyles from '../../styles/shared.module.css';
import styles from './EpigenomePage.module.css';

// AI convergence response - bullet points for typewriter, then insights after
const aiTextChunks = [
  { text: 'Integrating 4 epigenomic layers...', isBullet: false },
  { text: 'Plenty of isoamyl alcohol precursor available', isBullet: true },
  { text: 'ATF1 is epigenetically silenced (B compartment, high nucleosome occupancy)', isBullet: true },
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

// Fake RNA-seq expression data for ATF1 gene (glucose-limited anaerobic / mid-brew)
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

// Detailed visualization data for each layer - telling the ATF1 repression story
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

export function EpigenomePage() {
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
    setTimeout(() => {
      setLayerLoaded(source);
    }, delay);
  }, [setLayerLoading, setLayerLoaded]);

  const allLayersLoaded = Object.values(layerLoadStates).every(s => s === 'loaded');
  const anyLayerIdle = Object.values(layerLoadStates).some(s => s === 'idle');

  const handleLoadAll = useCallback(() => {
    const idleLayers = epigenomeLayers.filter(l => layerLoadStates[l.source] === 'idle');
    idleLayers.forEach((layer, i) => {
      setTimeout(() => {
        setLayerLoading(layer.source);
        setTimeout(() => {
          setLayerLoaded(layer.source);
        }, 1000 + Math.random() * 1000);
      }, i * 500);
    });
  }, [layerLoadStates, setLayerLoading, setLayerLoaded]);

  const handleConvergeClick = useCallback(() => {
    if (!allLayersLoaded) return;
    if (convergenceState === 'idle') {
      setConverging();
      setTimeout(() => {
        setConverged();
      }, 2000 + Math.random() * 1000);
    } else if (convergenceState === 'converged') {
      // Select to view in right panel
      selectLayer('convergence');
    }
  }, [allLayersLoaded, convergenceState, setConverging, setConverged, selectLayer]);

  const handleLayerClick = (layer) => {
    const state = layerLoadStates[layer.source];
    if (state === 'idle') {
      handleLoadLayer(layer.source);
    } else if (state === 'loaded') {
      selectLayer(layer.source);
    }
  };

  const isSelectedLoaded = selectedLayer && layerLoadStates[selectedLayer] === 'loaded';
  const selectedData = selectedLayer === 'RNA-seq' ? rnaSeqData : layerVisData[selectedLayer];

  // Typewriter effect for AI convergence (only runs once)
  const [visibleChunks, setVisibleChunks] = useState(convergenceTypingComplete ? aiTextChunks.length : 0);
  const [typingDone, setTypingDone] = useState(convergenceTypingComplete);
  const [visibleInsights, setVisibleInsights] = useState(convergenceTypingComplete ? aiInsights.length : 0);
  const typewriterStarted = useRef(convergenceTypingComplete);

  useEffect(() => {
    // Skip animation if already completed
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
            // Start showing insights sequentially
            let insightIdx = 0;
            const insightInterval = setInterval(() => {
              insightIdx++;
              setVisibleInsights(insightIdx);
              if (insightIdx >= aiInsights.length) {
                clearInterval(insightInterval);
                // Mark as complete in store
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
    <div className={styles.container}>
      {/* Left Panel: Multi-omic Data Layers */}
      <div className={sharedStyles.panel}>
        <div className={sharedStyles.panelHeader}>Multi-omic Data Integration</div>
        <div className={styles.content}>
          {/* Target Gene Dropdown */}
          <div className={styles.targetDropdown}>
            <select className={styles.targetSelect} defaultValue="ATF1">
              <option value="ATF1">ATF1 — Alcohol acetyltransferase</option>
            </select>
          </div>

          <div className={styles.conditionTag}>
            📍 Glucose-limited anaerobic (mid-brew)
          </div>

          {/* Load All button */}
          {anyLayerIdle && (
            <button className={styles.loadAllBtn} onClick={handleLoadAll}>
              Load All Layers
            </button>
          )}

          {/* Layer Stack */}
          <div className={styles.layerList}>
            {epigenomeLayers.map((layer) => {
              const isSelected = selectedLayer === layer.source;
              const state = layerLoadStates[layer.source];
              
              return (
                <div 
                  key={layer.name}
                  className={`${styles.layerCard} ${sharedStyles.selectable} ${isSelected ? sharedStyles.selected : ''}`}
                  style={{ borderLeftColor: layer.color }}
                  onClick={() => handleLayerClick(layer)}
                >
                  <div className={styles.layerCardHeader}>
                    <div>
                      <span className={styles.layerName}>{layer.name}</span>
                      <span className={styles.layerSource}>{layer.source}</span>
                    </div>
                    <div
                      className={`${styles.layerBadge}`}
                      style={{ 
                        background: state === 'loaded' ? `${layer.color}20` : 'rgba(100,100,100,0.15)', 
                        color: state === 'loaded' ? layer.color : '#64748b' 
                      }}
                    >
                      {state === 'idle' && 'Load'}
                      {state === 'loading' && (
                        <span className={styles.loadingText}>
                          <span className={styles.spinner}></span>
                        </span>
                      )}
                      {state === 'loaded' && '✓'}
                    </div>
                  </div>
                  <div className={styles.layerQuestion}>{layer.question}</div>
                </div>
              );
            })}
          </div>

          {/* Convergence Card - appears after layers */}
          <div 
            className={`${styles.layerCard} ${styles.convergenceCard} ${sharedStyles.selectable} ${selectedLayer === 'convergence' ? sharedStyles.selected : ''} ${!allLayersLoaded ? styles.disabled : ''}`}
            style={{ borderLeftColor: '#a78bfa' }}
            onClick={handleConvergeClick}
          >
            <div className={styles.layerCardHeader}>
              <div>
                <span className={styles.layerName}>✨ AI Convergence</span>
                <span className={styles.layerSource}>Multi-omic Integration</span>
              </div>
              <div
                className={styles.layerBadge}
                style={{ 
                  background: convergenceState === 'converged' ? 'rgba(167, 139, 250, 0.2)' : 'rgba(100,100,100,0.15)', 
                  color: convergenceState === 'converged' ? '#a78bfa' : '#64748b' 
                }}
              >
                {convergenceState === 'idle' && (allLayersLoaded ? 'Run' : '—')}
                {convergenceState === 'converging' && (
                  <span className={styles.loadingText}>
                    <span className={styles.spinner}></span>
                  </span>
                )}
                {convergenceState === 'converged' && '✓'}
              </div>
            </div>
            <div className={styles.layerQuestion}>
              {allLayersLoaded ? 'Synthesize findings into actionable insight' : 'Load all layers first'}
            </div>
          </div>

          {/* Summary stats */}
          <div className={styles.summaryRow}>
            <div className={sharedStyles.dataRow}>
              <span className={sharedStyles.dataLabel}>Layers loaded</span>
              <span className={sharedStyles.dataValue}>
                {Object.values(layerLoadStates).filter(s => s === 'loaded').length} / 4
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Visualization */}
      <div className={sharedStyles.panel}>
        <div className={sharedStyles.panelHeader}>
          {selectedLayer === 'convergence' ? 'AI Analysis Result' : isSelectedLoaded ? `${selectedLayer} Analysis` : 'Layer Visualization'}
        </div>
        <div className={styles.content}>
          {selectedLayer === 'convergence' && convergenceState === 'converged' ? (
            // Convergence result with typewriter effect
            <div className={styles.convergenceResult}>
              {/* AI typing box */}
              <div className={styles.aiTypingBox}>
                <div className={styles.aiHeader}>
                  <span className={styles.aiIcon}>✨</span>
                  <span className={styles.aiLabel}>AI Analysis</span>
                </div>
                <div className={styles.aiText}>
                  {aiTextChunks.slice(0, visibleChunks).map((chunk, i) => (
                    <div key={i} className={chunk.isBullet ? styles.aiBullet : styles.aiIntro}>
                      {chunk.isBullet && <span className={styles.bulletIcon}>•</span>}
                      {chunk.text}
                    </div>
                  ))}
                  {!typingDone && <span className={styles.cursor}>|</span>}
                </div>
              </div>

              {/* Insights appear sequentially after typing stops */}
              {typingDone && (
                <div className={styles.insightsGrid}>
                  {aiInsights.slice(0, visibleInsights).map((insight, i) => (
                    <div key={i} className={styles.insightCard}>
                      <span className={styles.insightIcon}>{insight.icon}</span>
                      <div className={styles.insightContent}>
                        <div className={styles.insightLabel}>{insight.label}</div>
                        <div className={styles.insightValue}>{insight.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : isSelectedLoaded ? (
            <>
              {/* Gene header - same for all */}
              <div className={styles.geneHeader}>
                <div className={styles.geneNameLarge}>ATF1</div>
                <div className={styles.geneSystematic}>YOR377W</div>
                <div className={styles.geneDesc}>{selectedData?.description}</div>
              </div>

              {/* RNA-seq visualization */}
              {selectedLayer === 'RNA-seq' && (
                <>
                  <div className={styles.marksSection}>
                    <div className={styles.marksTitle}>Pathway Gene Expression</div>
                    {rnaSeqData.comparison.map((gene) => (
                      <div key={gene.gene} className={styles.markRow}>
                        <div className={styles.markHeader}>
                          <span className={styles.markName}>
                            <span className={`font-mono ${gene.highlight ? styles.highlightGene : ''}`}>{gene.gene}</span>
                          </span>
                          <span className={`font-mono ${styles.markValue}`} style={{ color: gene.highlight ? '#ef4444' : '#22c55e' }}>
                            {gene.tpm} TPM
                          </span>
                        </div>
                        <div className={styles.markBar}>
                          <div 
                            className={styles.markFill}
                            style={{ 
                              width: `${gene.pct}%`, 
                              background: gene.highlight 
                                ? 'linear-gradient(90deg, #dc262680, #ef4444)' 
                                : 'linear-gradient(90deg, #15803d80, #22c55e)' 
                            }}
                          />
                          {gene.highlight && <span className={styles.bottleneckLabel}>BOTTLENECK</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.findingBox}>
                    <div className={styles.findingLabel}>Key Finding</div>
                    <div className={styles.findingText}>{rnaSeqData.finding}</div>
                  </div>

                  <div className={styles.implicationBox}>
                    <div className={styles.implicationIcon}>💡</div>
                    <div className={styles.implicationText}>{rnaSeqData.implication}</div>
                  </div>
                </>
              )}

              {/* ATAC-seq visualization */}
              {selectedLayer === 'ATAC-seq' && (
                <>
                  <div className={styles.marksSection}>
                    <div className={styles.marksTitle}>Pathway Gene Accessibility</div>
                    {selectedData.comparison.map((gene) => (
                      <div key={gene.gene} className={styles.markRow}>
                        <div className={styles.markHeader}>
                          <span className={styles.markName}>
                            <span className={`font-mono ${gene.highlight ? styles.highlightGene : ''}`}>{gene.gene}</span>
                            <span className={styles.markType} style={{ color: '#64748b' }}> ({gene.role})</span>
                          </span>
                          <span className={`font-mono ${styles.markValue}`} style={{ color: gene.highlight ? '#ef4444' : '#22c55e' }}>
                            {gene.pct}%
                          </span>
                        </div>
                        <div className={styles.markBar}>
                          <div 
                            className={styles.markFill}
                            style={{ 
                              width: `${gene.pct}%`, 
                              background: gene.highlight 
                                ? 'linear-gradient(90deg, #dc262680, #ef4444)' 
                                : 'linear-gradient(90deg, #15803d80, #22c55e)' 
                            }}
                          />
                          {gene.highlight && <span className={styles.bottleneckLabel}>BOTTLENECK</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.findingBox}>
                    <div className={styles.findingLabel}>Key Finding</div>
                    <div className={styles.findingText}>{selectedData.finding}</div>
                  </div>

                  <div className={styles.implicationBox}>
                    <div className={styles.implicationIcon}>🔒</div>
                    <div className={styles.implicationText}>{selectedData.implication}</div>
                  </div>
                </>
              )}

              {/* Hi-C visualization */}
              {selectedLayer === 'Hi-C' && (
                <>
                  <div className={styles.marksSection}>
                    <div className={styles.marksTitle}>3D Chromatin Architecture</div>
                    {selectedData.metrics.map((m) => (
                      <div key={m.name} className={styles.metricRow}>
                        <div className={styles.metricRowHeader}>
                          <span className={styles.markName}>
                            {m.name}
                            <span className={styles.markType} style={{ color: m.type === 'repressive' ? '#ef4444' : m.type === 'neutral' ? '#64748b' : '#22c55e' }}>
                              {' '}({m.detail})
                            </span>
                          </span>
                          <span className={`font-mono ${styles.markValue}`} style={{ color: m.color }}>
                            {m.value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.findingBox}>
                    <div className={styles.findingLabel}>Key Finding</div>
                    <div className={styles.findingText}>{selectedData.finding}</div>
                  </div>

                  <div className={styles.implicationBox}>
                    <div className={styles.implicationIcon}>🧬</div>
                    <div className={styles.implicationText}>{selectedData.implication}</div>
                  </div>
                </>
              )}

              {/* ChIP-seq visualization */}
              {selectedLayer === 'ChIP-seq' && (
                <>
                  <div className={styles.marksSection}>
                    <div className={styles.marksTitle}>Histone Mark Enrichment</div>
                    {selectedData.marks.map((mark) => (
                      <div key={mark.name} className={styles.markRow}>
                        <div className={styles.markHeader}>
                          <span className={styles.markName}>
                            {mark.name}
                            <span className={styles.markType} style={{ color: mark.type === 'repressive' ? '#ef4444' : '#22c55e' }}>
                              {mark.type === 'repressive' ? ' (repressive)' : ' (active)'}
                            </span>
                          </span>
                          <span className={`font-mono ${styles.markValue}`} style={{ color: mark.color }}>
                            {mark.value}× {mark.value > 1 ? '↑' : '↓'}
                          </span>
                        </div>
                        <div className={styles.markBar}>
                          <div className={styles.markBaseline} style={{ left: '20%' }} />
                          <div 
                            className={styles.markFill}
                            style={{ 
                              width: `${Math.min(mark.value * 20, 100)}%`, 
                              background: `linear-gradient(90deg, ${mark.color}80, ${mark.color})` 
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.findingBox}>
                    <div className={styles.findingLabel}>Key Finding</div>
                    <div className={styles.findingText}>{selectedData.finding}</div>
                  </div>

                  <div className={styles.implicationBox}>
                    <div className={styles.implicationIcon}>🎯</div>
                    <div className={styles.implicationText}>{selectedData.implication}</div>
                  </div>
                </>
              )}
            </>
          ) : (
            // Empty state - simple prompt
            <div className={styles.emptyState}>
              <div className={styles.emptyDesc}>
                Load a data layer to begin analysis
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
