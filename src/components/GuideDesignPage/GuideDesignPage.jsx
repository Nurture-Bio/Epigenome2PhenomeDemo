import { useState } from 'react';
import { guides, targetGene } from '../../data';
import sharedStyles from '../../styles/shared.module.css';
import styles from './GuideDesignPage.module.css';

export function GuideDesignPage() {
  const [selectedGuide, setSelectedGuide] = useState(null);

  const selectedGuideData = guides.find(g => g.id === selectedGuide);

  return (
    <>
      {/* Mode header */}
      <div className={styles.modeHeader}>
        <span className={styles.modeTitle}>dCas9-VPR Activation Mode (Active)</span>
        <div className={styles.modeActions}>
          <button className={sharedStyles.buttonSecondary}>
            Switch to: KRAB Repression
          </button>
        </div>
      </div>

      {/* Config panel */}
      <div className={`${sharedStyles.panel} ${styles.configPanel}`}>
        <div className={styles.configGrid}>
          <div>
            <label className={styles.configLabel}>Target Gene</label>
            <div className={styles.configValue}>
              <span className="mono">{targetGene.yorf}</span>
              <span className={styles.configSecondary}>({targetGene.name})</span>
            </div>
          </div>
          <div>
            <label className={styles.configLabel}>Target Region</label>
            <div className={styles.configValue}>{targetGene.region}</div>
          </div>
          <div>
            <label className={styles.configLabel}>PAM</label>
            <div className={styles.configValue}>
              <span className="mono">{targetGene.pam}</span>
              <span className={styles.configSecondary}>({targetGene.cas})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div className={styles.columnsContainer}>
        {/* Guide table */}
        <div className={`${sharedStyles.panel} ${styles.guideTablePanel}`}>
          <div className={sharedStyles.panelHeader} style={{ padding: '8px 16px', fontSize: 11 }}>
            <span style={{ color: '#22c55e' }}>{guides.length} guides</span> found • Click to select
          </div>
          <div>
            <div className={`${styles.guideRow} ${styles.guideHeader}`}>
              <div>Spacer</div>
              <div>Pos</div>
              <div>±</div>
              <div>PAM</div>
              <div>Off</div>
              <div>ATAC</div>
              <div>Δ Flux</div>
            </div>
            {guides.map(guide => (
              <div
                key={guide.id}
                className={`${styles.guideRow} ${selectedGuide === guide.id ? styles.guideRowSelected : ''}`}
                onClick={() => setSelectedGuide(guide.id)}
              >
                <div className="mono" style={{ fontSize: 10 }}>{guide.spacer}</div>
                <div className="mono">{guide.position}</div>
                <div>{guide.strand}</div>
                <div className="mono">{guide.pam}</div>
                <div style={{ color: guide.offTargets === 0 ? '#22c55e' : '#f59e0b' }}>{guide.offTargets}</div>
                <div style={{ color: '#ef4444' }}>{Math.round(guide.atacScore * 100)}%</div>
                <div style={{ color: '#22c55e', fontWeight: 500 }}>{guide.predictedFlux}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected guide detail */}
        <div className={`${sharedStyles.panel} ${styles.detailsPanel} ${selectedGuide ? styles.detailsPanelActive : ''}`}>
          <div className={sharedStyles.panelHeader} style={{ borderColor: selectedGuide ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.06)' }}>
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
                <span className={sharedStyles.dataLabel}>VPR effect</span>
                <span className={sharedStyles.dataValue} style={{ color: '#22c55e', fontSize: 11 }}>
                  +64% opening
                </span>
              </div>

              <div className={styles.fluxPrediction}>
                <div className={styles.fluxTitle}>Predicted flux</div>
                <div className={styles.fluxValues}>
                  <span className={styles.fluxOld}>0.12</span>
                  <span className={styles.fluxArrow}>→</span>
                  <span className={styles.fluxNew}>
                    {(0.12 * (1 + parseInt(selectedGuideData.predictedFlux) / 100)).toFixed(2)}
                  </span>
                  <span className={styles.fluxUnit}>mmol/gDW/h</span>
                </div>

                <div className={styles.intensityLabel}>Banana flavor intensity</div>
                <div className={styles.intensityBar}>
                  <div
                    className={styles.intensityFill}
                    style={{ width: `${parseInt(selectedGuideData.predictedFlux) + 20}%` }}
                  />
                  <div className={styles.intensityValue}>{selectedGuideData.predictedFlux}</div>
                </div>
              </div>

              <button className={sharedStyles.button} style={{ width: '100%', marginTop: 16 }}>
                Order this guide
              </button>
            </div>
          ) : (
            <div className={styles.emptyState}>
              ← Select a guide to see predicted flux impact
            </div>
          )}
        </div>
      </div>
    </>
  );
}
