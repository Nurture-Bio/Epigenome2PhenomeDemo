import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { guides } from '../../data';
import sharedStyles from '../../styles/shared.module.css';
import styles from './GuideDesignPage.module.css';

// Deterministic pseudo-random noise based on position
function seededNoise(x) {
  const n = Math.sin(x * 12.9898) * 43758.5453;
  return n - Math.floor(n);
}

// Generate SVG path for ATAC signal based on guide positions and scores
function generateAtacPath(guides, regionStart, regionEnd, isPredicted = false, selectedGuide = null, isRepression = false) {
  const width = 100;
  const height = 32;
  const baseline = height - 1;
  
  // Create points array with baseline noise (deterministic)
  const points = [];
  for (let x = 0; x <= width; x += 1) {
    let y = baseline - (seededNoise(x * 0.1) * 1 + 0.5); // Very low baseline
    
    // Add peaks at guide positions - much more dramatic scaling
    guides.forEach(guide => {
      const guideX = ((guide.position - regionStart) / (regionEnd - regionStart)) * width;
      const distance = Math.abs(x - guideX);
      
      let score = guide.atacScore;
      if (isPredicted && selectedGuide === guide.id) {
        if (isRepression) {
          // Repression - reduce accessibility dramatically
          score = Math.max(0.02, guide.atacScore * 0.15);
        } else {
          // Activation - increase accessibility
          score = guide.predictedAtac;
        }
      }
      
      // Peak width scales with score (higher accessibility = wider peak)
      const peakWidth = 3 + score * 10;
      
      if (distance < peakWidth) {
        // More dramatic peak heights - 42% should be very visible
        const peakHeight = score * (height - 3);
        const falloff = Math.pow(Math.max(0, 1 - distance / peakWidth), 1.5);
        y = Math.min(y, baseline - peakHeight * falloff);
      }
    });
    
    points.push({ x, y });
  }
  
  // Build smooth path
  let path = `M0,${baseline} `;
  points.forEach((p, i) => {
    if (i === 0) {
      path += `L${p.x},${p.y} `;
    } else {
      const prev = points[i - 1];
      const cpX = (prev.x + p.x) / 2;
      path += `Q${prev.x},${prev.y} ${cpX},${(prev.y + p.y) / 2} `;
    }
  });
  path += `L${width},${baseline} L${width},${height} L0,${height} Z`;
  
  return path;
}

// DNA Visualization Component
function DnaVisualization({ guides, selectedGuide, onSelectGuide, isRepression }) {
  const regionStart = -500;
  const regionEnd = 0;
  const regionWidth = regionEnd - regionStart;
  
  // Convert position to percentage
  const posToPercent = (pos) => ((pos - regionStart) / regionWidth) * 100;
  
  // Generate tick marks
  const ticks = [-500, -400, -300, -200, -100, 0];
  
  // Generate ATAC paths
  const currentAtacPath = generateAtacPath(guides, regionStart, regionEnd, false, null, false);
  const predictedAtacPath = selectedGuide 
    ? generateAtacPath(guides, regionStart, regionEnd, true, selectedGuide, isRepression)
    : null;
  
  const selectedGuideData = guides.find(g => g.id === selectedGuide);
  
  // Calculate predicted ATAC for display
  const getPredictedAtac = (guide) => {
    if (isRepression) {
      return Math.max(0.02, guide.atacScore * 0.15);
    }
    return guide.predictedAtac;
  };
  
  return (
    <div className={styles.dnaContainer}>
      <div className={styles.dnaHeader}>
        <div className={styles.targetSelectors}>
          <select className={styles.geneSelect} defaultValue="ATF1">
            <option value="ATF1">ATF1</option>
            <option value="ATF2">ATF2</option>
            <option value="EHT1">EHT1</option>
            <option value="BAT1">BAT1</option>
            <option value="BAT2">BAT2</option>
          </select>
          <select className={styles.regionSelect} defaultValue="promoter">
            <option value="promoter">Promoter</option>
            <option value="5utr">5' UTR</option>
            <option value="cds">CDS</option>
            <option value="3utr">3' UTR</option>
          </select>
        </div>
        <span className={styles.dnaCoords}>chr XV: 798,234 - 798,734</span>
      </div>
      
      {/* Main DNA track */}
      <div className={styles.dnaTrackContainer}>
        {/* Coordinate axis */}
        <div className={styles.dnaAxis}>
          {ticks.map(tick => (
            <div 
              key={tick} 
              className={styles.dnaTick}
              style={{ left: `${posToPercent(tick)}%` }}
            >
              <div className={styles.dnaTickLine} />
              <span className={styles.dnaTickLabel}>{tick}</span>
            </div>
          ))}
        </div>
        
        {/* DNA backbone */}
        <div className={styles.dnaBackbone}>
          <div className={styles.dnaStrand} />
          <div className={styles.dnaHelixPattern} />
          <div className={`${styles.dnaStrand} ${styles.dnaStrandBottom}`} />
        </div>
        
        {/* TSS marker */}
        <div className={styles.tssMarker} style={{ left: `${posToPercent(0)}%` }}>
          <div className={styles.tssArrow}>→</div>
          <span className={styles.tssLabel}>TSS</span>
        </div>
        
        {/* Guide markers - + strand above DNA, - strand below DNA */}
        {guides.map(guide => {
          const isSelected = selectedGuide === guide.id;
          const left = posToPercent(guide.position);
          const isPlus = guide.strand === '+';
          return (
            <div
              key={guide.id}
              className={`${styles.guideMarker} ${isSelected ? styles.guideMarkerSelected : ''} ${isPlus ? styles.guideMarkerPlus : styles.guideMarkerMinus}`}
              style={{ left: `${left}%` }}
              onClick={() => onSelectGuide(guide.id)}
              title={`Guide ${guide.id}: ${guide.position}bp (${guide.strand})`}
            >
              {isPlus ? (
                <>
                  <div className={styles.guideMarkerHead}>▶</div>
                  <div className={styles.guideMarkerLine} />
                </>
              ) : (
                <>
                  <div className={styles.guideMarkerLine} />
                  <div className={styles.guideMarkerHead}>◀</div>
                </>
              )}
            </div>
          );
        })}
        
        {/* ATAC-seq accessibility track - Current */}
        <div className={styles.atacTrack}>
          <div className={styles.atacLabel}>ATAC</div>
          <div className={styles.atacSignal}>
            <svg viewBox="0 0 100 32" preserveAspectRatio="none" className={styles.atacSvg}>
              <defs>
                <linearGradient id="atacGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="atacPredictedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="atacRepressionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <path d={currentAtacPath} fill="url(#atacGradient)" />
            </svg>
          </div>
        </div>
        
        {/* Predicted ATAC track - always visible for layout stability */}
        <div className={`${styles.atacTrack} ${styles.atacTrackPredicted}`}>
          <div className={styles.atacLabel} style={{ 
            color: isRepression ? '#8b5cf6' : '#22c55e',
            opacity: selectedGuide ? 1 : 0.3
          }}>
            {isRepression ? 'Repr' : 'Act'}
          </div>
          <div className={styles.atacSignal} style={{ opacity: selectedGuide ? 1 : 0.15 }}>
            <svg viewBox="0 0 100 32" preserveAspectRatio="none" className={styles.atacSvg}>
              <path d={predictedAtacPath || currentAtacPath} fill={isRepression ? 'url(#atacRepressionGradient)' : 'url(#atacPredictedGradient)'} />
            </svg>
          </div>
        </div>
      </div>
      
      <div className={styles.dnaLegend}>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendPlus}`} />
          <span>+ strand</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendMinus}`} />
          <span>- strand</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendAtac} />
          <span>Current ATAC</span>
        </div>
        <div className={styles.legendItem} style={{ visibility: selectedGuide ? 'visible' : 'hidden' }}>
          <span className={isRepression ? styles.legendAtacRepression : styles.legendAtacPredicted} />
          <span>Predicted</span>
        </div>
        <div className={styles.legendDelta} style={{ visibility: selectedGuideData ? 'visible' : 'hidden' }}>
          <span className={styles.legendDeltaLabel}>Δ Accessibility:</span>
          <span className={styles.legendDeltaValue} style={{ color: isRepression ? '#8b5cf6' : '#22c55e' }}>
            {selectedGuideData 
              ? `${Math.round(selectedGuideData.atacScore * 100)}% → ${Math.round(getPredictedAtac(selectedGuideData) * 100)}%`
              : '—% → —%'
            }
          </span>
        </div>
      </div>
    </div>
  );
}

export function GuideDesignPage() {
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [isRepression, setIsRepression] = useState(false);

  const selectedGuideData = guides.find(g => g.id === selectedGuide);
  
  // Calculate predicted values based on mode
  const getPredictedAtac = (guide) => {
    if (isRepression) {
      return Math.max(0.02, guide.atacScore * 0.15);
    }
    return guide.predictedAtac;
  };
  
  const getPredictedFlux = (guide) => {
    if (isRepression) {
      // Repression reduces flux - stronger effect for higher ATAC scores
      const reduction = Math.round(guide.atacScore * 100 * 0.85);
      return `-${reduction}%`;
    }
    return guide.predictedFlux;
  };

  // Calculate intensity percentage for the bar
  const intensityPercent = selectedGuideData 
    ? (isRepression 
        ? Math.max(2, 10 - selectedGuideData.atacScore * 20)
        : Math.min(100, parseInt(selectedGuideData.predictedFlux) / 5 + 10))
    : 10;

  // Spring animate the intensity bar
  const springIntensity = useSpring(intensityPercent, { stiffness: 120, damping: 20 });
  useEffect(() => {
    springIntensity.set(intensityPercent);
  }, [intensityPercent, springIntensity]);
  
  const intensityWidth = useTransform(springIntensity, v => `${v}%`);

  return (
    <div className={styles.pageContainer}>
      {/* Mode header */}
      <div className={styles.modeHeader} style={{ background: isRepression 
        ? 'linear-gradient(90deg, #5b21b6 0%, #7c3aed 100%)' 
        : 'linear-gradient(90deg, #166534 0%, #15803d 100%)' 
      }}>
        <span className={styles.modeTitle}>
          {isRepression ? 'Repression Mode' : 'Activation Mode'}
        </span>
        <div className={styles.modeActions}>
          <button 
            className={sharedStyles.buttonSecondary}
            onClick={() => setIsRepression(!isRepression)}
            style={{ fontSize: 11, padding: '4px 10px' }}
          >
            Switch to {isRepression ? 'Activation' : 'Repression'}
          </button>
        </div>
      </div>
      
      {/* DNA Visualization */}
      <DnaVisualization 
        guides={guides} 
        selectedGuide={selectedGuide} 
        onSelectGuide={setSelectedGuide}
        isRepression={isRepression}
      />

      {/* Two column layout */}
      <div className={styles.columnsContainer}>
        {/* Guide table */}
        <div className={`${sharedStyles.panel} ${styles.guideTablePanel}`}>
          <div className={sharedStyles.panelHeader} style={{ padding: '8px 16px', fontSize: 11 }}>
            <span style={{ color: isRepression ? '#8b5cf6' : '#22c55e' }}>{guides.length} guides</span> found • Click to select
          </div>
          <div>
            <div className={`${styles.guideRow} ${styles.guideHeader}`}>
              <div>Spacer</div>
              <div>Pos</div>
              <div>±</div>
              <div>PAM</div>
              <div>Offtargets</div>
              <div>ATAC</div>
              <div>Δ Flux</div>
            </div>
            {guides.map(guide => (
              <div
                key={guide.id}
                className={`${styles.guideRow} ${sharedStyles.selectable} ${selectedGuide === guide.id ? sharedStyles.selected : ''}`}
                onClick={() => setSelectedGuide(guide.id)}
              >
                <div className="mono" style={{ fontSize: 10 }}>{guide.spacer}</div>
                <div className="mono">{guide.position}</div>
                <div>{guide.strand}</div>
                <div className="mono">{guide.pam}</div>
                <div style={{ color: guide.offTargets === 0 ? '#22c55e' : '#f59e0b' }}>{guide.offTargets}</div>
                <div style={{ color: '#ef4444' }}>{Math.round(guide.atacScore * 100)}%</div>
                <div style={{ color: isRepression ? '#8b5cf6' : '#22c55e', fontWeight: 500 }}>{getPredictedFlux(guide)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected guide detail */}
        <div className={`${sharedStyles.panel} ${styles.detailsPanel} ${selectedGuide ? styles.detailsPanelActive : ''}`} style={{ 
          borderColor: selectedGuide ? (isRepression ? 'rgba(139, 92, 246, 0.2)' : 'rgba(34, 197, 94, 0.2)') : undefined 
        }}>
          <div className={sharedStyles.panelHeader} style={{ padding: '8px 16px', fontSize: 11, borderColor: selectedGuide ? (isRepression ? 'rgba(139, 92, 246, 0.2)' : 'rgba(34, 197, 94, 0.2)') : 'rgba(255,255,255,0.06)' }}>
            Guide Details
          </div>
          {selectedGuideData ? (
            <div style={{ padding: 16 }}>
              <div className={`mono ${styles.spacerBox}`} style={{ fontSize: 12 }}>
                {selectedGuideData.spacer}-<span className={styles.pamHighlight}>{selectedGuideData.pam}</span>
              </div>

              <div className={sharedStyles.dataRow} style={{ padding: '6px 0' }}>
                <span className={sharedStyles.dataLabel}>Position</span>
                <span className={`${sharedStyles.dataValue} mono`} style={{ fontSize: 11 }}>
                  {selectedGuideData.position} from TSS
                </span>
              </div>
              <div className={sharedStyles.dataRow} style={{ padding: '6px 0' }}>
                <span className={sharedStyles.dataLabel}>Chromatin</span>
                <span className={sharedStyles.dataValue} style={{ color: '#ef4444', fontSize: 11 }}>
                  {Math.round(selectedGuideData.atacScore * 100)}% accessible
                </span>
              </div>
              <div className={sharedStyles.dataRow} style={{ padding: '6px 0' }}>
                <span className={sharedStyles.dataLabel}>{isRepression ? 'Repression' : 'Activation'}</span>
                <span className={sharedStyles.dataValue} style={{ color: isRepression ? '#8b5cf6' : '#22c55e', fontSize: 11 }}>
                  → {Math.round(getPredictedAtac(selectedGuideData) * 100)}% ({isRepression ? '' : '+'}{Math.round((getPredictedAtac(selectedGuideData) - selectedGuideData.atacScore) * 100)}%)
                </span>
              </div>

              <div className={styles.fluxPrediction} style={{ 
                background: isRepression ? 'rgba(139, 92, 246, 0.1)' : 'rgba(0, 0, 0, 0.3)' 
              }}>
                <div className={styles.fluxTitle}>Predicted isoamyl acetate flux</div>
                <div className={styles.fluxValues}>
                  <span className={styles.fluxOld}>0.12</span>
                  <span className={styles.fluxArrow}>→</span>
                  <span className={styles.fluxNew} style={{ color: isRepression ? '#8b5cf6' : '#22c55e' }}>
                    {isRepression 
                      ? (0.12 * (1 - selectedGuideData.atacScore * 0.85)).toFixed(2)
                      : (0.12 * (1 + parseInt(selectedGuideData.predictedFlux) / 100)).toFixed(2)
                    }
                  </span>
                  <span className={styles.fluxUnit}>mmol/gDW/h</span>
                </div>

                <div className={styles.intensityHeader}>
                  <span>Banana flavor intensity</span>
                  <span style={{ color: isRepression ? '#8b5cf6' : '#22c55e' }}>{getPredictedFlux(selectedGuideData)}</span>
                </div>
                <div className={styles.intensityBar}>
                  <motion.div
                    className={styles.intensityFill}
                    style={{ 
                      width: intensityWidth,
                      background: isRepression 
                        ? 'linear-gradient(90deg, #8b5cf6 0%, #6d28d9 100%)'
                        : 'linear-gradient(90deg, #22c55e 0%, #facc15 100%)'
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              ← Select a guide to see predicted flux impact
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
