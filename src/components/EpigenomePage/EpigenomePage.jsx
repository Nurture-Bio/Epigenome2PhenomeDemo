import { bottleneckGenes, epigenomeLayers } from '../../data';
import sharedStyles from '../../styles/shared.module.css';
import styles from './EpigenomePage.module.css';

export function EpigenomePage() {
  return (
    <div className={styles.container}>
        {/* Layer Stack */}
        <div className={styles.layerStack}>
          {epigenomeLayers.map((layer, i) => (
            <div key={layer.name}>
              <div className={styles.layerCard} style={{ borderLeft: `3px solid ${layer.color}` }}>
                <div className={styles.layerContent}>
                  <div>
                    <div className={styles.layerName}>{layer.name}</div>
                    <div className={styles.layerQuestion}>{layer.question}</div>
                  </div>
                  <div
                    className={styles.layerBadge}
                    style={{ background: `${layer.color}20`, color: layer.color }}
                  >
                    {layer.source}
                  </div>
                </div>
              </div>
              {i < epigenomeLayers.length - 1 && <div className={styles.arrow}>↓</div>}
            </div>
          ))}

          <div className={styles.arrow}>↓</div>

          <div className={styles.convergence}>
            <div className={styles.convergenceLabel}>CONVERGENCE</div>
            <div className={styles.convergenceTitle}>Regulatory Score per Gene</div>
            <div className={styles.convergenceCode}>
              <span className="mono" style={{ fontSize: 12, color: '#94a3b8' }}>
                GPR: <span style={{ color: '#60a5fa' }}>OR → max(scores)</span>,{' '}
                <span style={{ color: '#a78bfa' }}>AND → min(scores)</span>
              </span>
            </div>
            <div className={styles.convergenceSubtitle}>
              Multi-omic integration → Reaction flux weights
            </div>
          </div>
        </div>

        {/* Example Gene Panel */}
        <div className={sharedStyles.panel} style={{ height: 'fit-content' }}>
          <div className={sharedStyles.panelHeader}>Pathway Bottleneck Analysis</div>
          <div style={{ padding: 20 }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                Chromatin accessibility across isoamyl acetate pathway genes
              </div>

              {bottleneckGenes.map((gene) => (
                <div key={gene.gene} className={styles.geneBar}>
                  <div className={styles.geneBarHeader}>
                    <div>
                      <span className={`mono ${styles.geneId} ${gene.highlight ? styles.geneIdHighlight : ''}`}>
                        {gene.gene}
                      </span>
                      <span className={styles.geneName}>{gene.name}</span>
                    </div>
                    <span className={`mono ${styles.genePct} ${gene.pct > 50 ? styles.genePctHigh : styles.genePctLow}`}>
                      {gene.pct}%
                    </span>
                  </div>
                  <div className={styles.bottleneckBar}>
                    <div
                      className={`${styles.bottleneckFill} ${gene.highlight ? styles.bottleneckFillDanger : styles.bottleneckFillSuccess}`}
                      style={{ width: `${gene.pct}%` }}
                    />
                    {gene.highlight && <div className={styles.bottleneckLabel}>BOTTLENECK</div>}
                  </div>
                  <div className={styles.geneRole}>{gene.role}</div>
                </div>
              ))}
            </div>

            <div className={styles.alertBox}>
              <div className={styles.alertHeader}>
                <div className={styles.alertIcon}>🔒</div>
                <div>
                  <div className={styles.alertTitle}>ATF1 is chromatin-restricted</div>
                  <div className={styles.alertSubtitle}>6% accessible vs 69-93% for upstream genes</div>
                </div>
              </div>
              <div className={styles.alertBody}>
                The entire Ehrlich pathway is open <em>except</em> at the final esterification step.
                Opening ATF1 chromatin could increase banana flavor production by ~4x.
              </div>
            </div>

            <div className={sharedStyles.dataRow}>
              <span className={sharedStyles.dataLabel}>Predicted intervention</span>
              <span className={sharedStyles.dataValue} style={{ color: '#22c55e' }}>dCas9-VPR activation</span>
            </div>
            <div className={sharedStyles.dataRow}>
              <span className={sharedStyles.dataLabel}>Target region</span>
              <span className={`${sharedStyles.dataValue} mono`} style={{ fontSize: 11 }}>YOR377W promoter</span>
            </div>
            <div className={sharedStyles.dataRow}>
              <span className={sharedStyles.dataLabel}>Expected Δ flux</span>
              <span className={sharedStyles.dataValue} style={{ color: '#22c55e' }}>+367%</span>
            </div>
          </div>
        </div>
      </div>
  );
}
