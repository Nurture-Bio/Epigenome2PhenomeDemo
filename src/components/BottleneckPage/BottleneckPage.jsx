import { bottleneckGenes } from '../../data';
import sharedStyles from '../../styles/shared.module.css';
import styles from './BottleneckPage.module.css';

export function BottleneckPage() {
  return (
    <div className={styles.container}>
      {/* Main bottleneck analysis panel */}
      <div className={sharedStyles.panel}>
        <div className={sharedStyles.panelHeader}>Pathway Bottleneck Analysis</div>
        <div className={styles.content}>
          <div className={styles.description}>
            Chromatin accessibility across isoamyl acetate pathway genes
          </div>

          <div className={styles.geneList}>
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

          <div className={styles.dataSection}>
            <div className={sharedStyles.dataRow}>
              <span className={sharedStyles.dataLabel}>Predicted intervention</span>
              <span className={sharedStyles.dataValue} style={{ color: '#22c55e' }}>Chromatin activation</span>
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

      {/* Additional context panel */}
      <div className={sharedStyles.panel}>
        <div className={sharedStyles.panelHeader}>Bottleneck Impact</div>
        <div className={styles.content}>
          <div className={styles.impactGrid}>
            <div className={styles.impactCard}>
              <div className={styles.impactValue} style={{ color: '#ef4444' }}>6%</div>
              <div className={styles.impactLabel}>ATF1 Accessibility</div>
              <div className={styles.impactDescription}>Severely restricted chromatin state</div>
            </div>
            <div className={styles.impactCard}>
              <div className={styles.impactValue} style={{ color: '#22c55e' }}>~75%</div>
              <div className={styles.impactLabel}>Upstream Average</div>
              <div className={styles.impactDescription}>Open chromatin for precursor genes</div>
            </div>
            <div className={styles.impactCard}>
              <div className={styles.impactValue} style={{ color: '#f97316' }}>4×</div>
              <div className={styles.impactLabel}>Potential Gain</div>
              <div className={styles.impactDescription}>Predicted flux increase after intervention</div>
            </div>
          </div>

          <div className={styles.insightSection}>
            <div className={styles.insightTitle}>Key Insight</div>
            <div className={styles.insightText}>
              The bottleneck at ATF1 represents disproportionate impact — a small chromatin change 
              at this gene produces a large flux effect because it controls the final step to product.
              Targeting upstream genes with already-open chromatin yields diminishing returns.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
