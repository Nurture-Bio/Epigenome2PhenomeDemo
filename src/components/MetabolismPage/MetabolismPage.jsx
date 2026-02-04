import { useState } from 'react';
import { reactionDetails, reactionTableData } from '../../data';
import { useSelectionStore } from '../../stores';
import sharedStyles from '../../styles/shared.module.css';
import styles from './MetabolismPage.module.css';

export function MetabolismPage() {
  const { selectedReaction, selectReaction } = useSelectionStore();
  const [anaerobic, setAnaerobic] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [glucoseLevel, setGlucoseLevel] = useState(10);

  const handleAnaerobicToggle = () => {
    const willBeAnaerobic = !anaerobic;
    setIsRecalculating(true);
    setAnaerobic(willBeAnaerobic);
    setTimeout(() => {
      setIsRecalculating(false);
    }, 1200);
  };

  const handleGlucoseChange = (e) => {
    const newValue = Number(e.target.value);
    setIsRecalculating(true);
    setTimeout(() => {
      setGlucoseLevel(newValue);
      setIsRecalculating(false);
    }, 400);
  };

  const getGrowthRate = () => {
    if (anaerobic) return '0.0000';
    if (glucoseLevel >= 10) return '0.0881';
    if (glucoseLevel >= 2) return '0.0352';
    return '0.0044';
  };

  const getDGBadgeClass = (dG) => {
    if (dG === 0) return styles.dGBadgeNeutral;
    if (dG < -30) return styles.dGBadgeHighFavorable;
    if (dG > 30) return styles.dGBadgeUnfavorable;
    return styles.dGBadgeFavorable;
  };

  const getDGColor = (dG) => {
    if (dG < -10) return '#22c55e';
    if (dG > 10) return '#f59e0b';
    return '#60a5fa';
  };

  const getDGLabel = (dG) => {
    if (dG < -10) return 'Thermodynamically favorable';
    if (dG > 10) return 'Thermodynamically unfavorable';
    return 'Near equilibrium';
  };

  return (
    <div className={styles.container}>
        {/* Left Sidebar */}
        <div className={styles.sidebar}>
          {/* Model Info */}
          <div className={sharedStyles.panel}>
            <div className={sharedStyles.panelHeader}>Model</div>
            <div style={{ padding: 16 }}>
              <div className={styles.modelBadge}>yeast-GEM.xml</div>
              <div className={sharedStyles.dataRow} style={{ padding: '6px 0' }}>
                <span className={sharedStyles.dataLabel}>Reactions</span>
                <span className={`${sharedStyles.dataValue} mono`}>4,131</span>
              </div>
              <div className={sharedStyles.dataRow} style={{ padding: '6px 0' }}>
                <span className={sharedStyles.dataLabel}>Metabolites</span>
                <span className={`${sharedStyles.dataValue} mono`}>2,806</span>
              </div>
              <div className={sharedStyles.dataRow} style={{ padding: '6px 0' }}>
                <span className={sharedStyles.dataLabel}>Genes</span>
                <span className={`${sharedStyles.dataValue} mono`}>1,161</span>
              </div>
              <div className={styles.growthRate}>
                Growth: <span className="mono" style={{ color: '#22c55e' }}>{getGrowthRate()} h⁻¹</span>
              </div>
            </div>
          </div>

          {/* Thermodynamics Status */}
          <div className={sharedStyles.panel}>
            <div className={sharedStyles.panelHeader}>Thermodynamics</div>
            <div style={{ padding: 16 }}>
              <div className={`${styles.thermoBadge} ${isRecalculating ? styles.thermoBadgeRecalculating : styles.thermoBadgeActive}`}>
                {isRecalculating ? '⟳ Recalculating...' : '4,131 reactions loaded'}
              </div>
              <div className={sharedStyles.dataRow} style={{ padding: '4px 0', fontSize: 11 }}>
                <span className={sharedStyles.dataLabel}>Shifted</span>
                <span className="mono" style={{ color: anaerobic ? '#fb923c' : '#64748b', transition: 'color 0.3s' }}>
                  {anaerobic ? '847' : '0'}
                </span>
              </div>
              <div className={sharedStyles.dataRow} style={{ padding: '4px 0', fontSize: 11 }}>
                <span className={sharedStyles.dataLabel}>Direction flipped</span>
                <span className="mono" style={{ color: anaerobic ? '#ef4444' : '#64748b', transition: 'color 0.3s' }}>
                  {anaerobic ? '234' : '0'}
                </span>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div className={sharedStyles.panel} style={{ flex: 1 }}>
            <div className={sharedStyles.panelHeader}>Conditions</div>
            <div style={{ padding: 16 }}>
              <div
                onClick={handleAnaerobicToggle}
                className={`${styles.conditionOption} ${anaerobic ? styles.conditionOptionActive : styles.conditionOptionInactive}`}
              >
                <input type="checkbox" checked={anaerobic} readOnly style={{ accentColor: '#22c55e', pointerEvents: 'none' }} />
                <span style={{ fontSize: 12, color: anaerobic ? '#22c55e' : '#e2e8f0' }}>oxygen = 0</span>
              </div>
              <div className={styles.conditionOption} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>glucose =</span>
                <select value={glucoseLevel} onChange={handleGlucoseChange} className={styles.glucoseSelect}>
                  <option value={20}>20</option>
                  <option value={10}>10</option>
                  <option value={2}>2</option>
                  <option value={0.1}>0.1</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Reactions Table */}
        <div className={`${sharedStyles.panel} ${styles.reactionsPanel}`}>
          <div className={sharedStyles.panelHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Reactions</span>
            <span style={{ fontSize: 10, color: anaerobic ? '#fb923c' : glucoseLevel < 10 ? '#fb923c' : '#64748b', transition: 'color 0.3s' }}>
              {anaerobic ? '847 reactions affected' : glucoseLevel < 10 ? 'glucose-limited' : '4,131 total'}
            </span>
          </div>

          <div className={styles.tableHeader}>
            <div>FLUX</div>
            <div>ΔG°</div>
            <div>LOC</div>
            <div>ID</div>
            <div>NAME</div>
          </div>

          <div className={styles.tableBody}>
            {reactionTableData.map((rxn) => {
              const glucoseScale = glucoseLevel >= 20 ? 1.5 : glucoseLevel >= 10 ? 1.0 : glucoseLevel >= 2 ? 0.4 : 0.05;
              const isLowGlucose = glucoseLevel < 10;
              const baseFlux = anaerobic ? rxn.flux[1] : rxn.flux[0];
              const flux = baseFlux * glucoseScale;
              const dG = anaerobic ? rxn.dG[1] : rxn.dG[0];
              const isSelected = selectedReaction === rxn.id;
              const isBlocked = anaerobic && rxn.status === 'blocked';
              const isReduced = anaerobic && rxn.status === 'reduced';
              const isIncreased = anaerobic && rxn.status === 'increased';
              const isLimited = isLowGlucose && !isBlocked && !anaerobic;
              const waveDelay = isRecalculating && anaerobic ? rxn.wave * 200 : 0;

              let rowClass = `${styles.reactionRow} ${sharedStyles.selectable}`;
              if (isBlocked) rowClass += ` ${styles.reactionRowBlocked}`;
              else if (isLimited) rowClass += ` ${styles.reactionRowLimited}`;
              else if (isReduced) rowClass += ` ${styles.reactionRowReduced}`;
              else if (isIncreased) rowClass += ` ${styles.reactionRowIncreased}`;
              if (isSelected) rowClass += ` ${sharedStyles.selected}`;

              return (
                <div
                  key={rxn.id}
                  onClick={() => selectReaction(rxn.id)}
                  className={rowClass}
                  style={waveDelay ? { transitionDelay: `${waveDelay}ms` } : undefined}
                >
                  <div className="mono" style={{
                    color: flux === 0 ? '#ef4444' : isIncreased ? '#22c55e' : (isReduced || isLimited) ? '#fb923c' : '#4ade80',
                    transition: 'color 0.4s',
                    transitionDelay: waveDelay ? `${waveDelay}ms` : undefined
                  }}>
                    {flux.toFixed(2)}
                  </div>
                  <div>
                    <span className={getDGBadgeClass(dG)} style={{ transition: 'all 0.3s' }}>
                      {dG === 0 ? '—' : dG}
                    </span>
                  </div>
                  <div>
                    <span className={styles.locBadge}>{rxn.loc}</span>
                  </div>
                  <div className="mono" style={{ color: '#60a5fa' }}>{rxn.id}</div>
                  <div style={{
                    color: isBlocked ? '#fca5a5' : isIncreased ? '#86efac' : '#94a3b8',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.4s',
                    transitionDelay: waveDelay ? `${waveDelay}ms` : undefined
                  }}>
                    {rxn.name}
                    {isBlocked && <span className={styles.blockedLabel}>● BLOCKED</span>}
                    {isIncreased && <span style={{ marginLeft: 8, color: '#22c55e', fontSize: 9 }}>▲</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Reaction Details */}
        <div className={`${sharedStyles.panel} ${styles.detailsPanel}`}>
          <div className={sharedStyles.panelHeader}>Reaction Details</div>
          {reactionDetails[selectedReaction] ? (
            <div style={{ padding: 16, overflow: 'auto', flex: 1 }}>
              <ReactionDetails
                rxn={reactionDetails[selectedReaction]}
                rxnId={selectedReaction}
                anaerobic={anaerobic}
                glucoseLevel={glucoseLevel}
              />
            </div>
          ) : (
            <div style={{ padding: 16, color: '#64748b', fontSize: 12 }}>
              Select a reaction to view details
            </div>
          )}
        </div>
      </div>
  );
}

function ReactionDetails({ rxn, rxnId, anaerobic, glucoseLevel }) {
  const isMito = rxn.compartment === 'mitochondria';
  const isBlocked = anaerobic && isMito;
  const isLowGlucose = glucoseLevel < 10;

  const tableRxn = reactionTableData.find(r => r.id === rxnId);
  const status = anaerobic && tableRxn ? tableRxn.status : null;
  const isReduced = status === 'reduced';
  const isIncreased = status === 'increased' && !isLowGlucose;
  const isLimited = isLowGlucose && !isBlocked;

  const dGColor = rxn.dG < -10 ? '#22c55e' : rxn.dG > 10 ? '#f59e0b' : '#60a5fa';
  const dGLabel = rxn.dG < -10 ? 'Thermodynamically favorable' : rxn.dG > 10 ? 'Thermodynamically unfavorable' : 'Near equilibrium';

  const getThermoBoxClass = () => {
    if (rxn.dG < -10) return styles.thermoBoxFavorable;
    if (rxn.dG > 10) return styles.thermoBoxUnfavorable;
    return styles.thermoBoxNeutral;
  };

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span className={`mono ${styles.reactionId}`}>{rxnId}</span>
          {isBlocked && <span className={sharedStyles.badgeBlocked}>BLOCKED</span>}
          {isReduced && !isLimited && <span className={sharedStyles.badgeReduced}>REDUCED</span>}
          {isLimited && <span className={sharedStyles.badgeLimited}>LIMITED</span>}
          {isIncreased && <span className={sharedStyles.badgeIncreased}>INCREASED</span>}
        </div>
        <div className={styles.reactionName}>{rxn.name}</div>
        <div className={styles.compartmentLabel}>
          Compartment: <span className={isMito ? styles.compartmentMito : styles.compartmentCyto}>{rxn.compartment}</span>
        </div>
      </div>

      <div className={styles.equationBox}>
        <div className={`mono ${styles.equation}`}>
          {rxn.substrates.join(' + ')} → {rxn.products.join(' + ')}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Thermodynamics</div>
        <div className={`${styles.thermoBox} ${getThermoBoxClass()}`}>
          <div className={styles.dGValue} style={{ color: dGColor }}>
            <span className="mono">{rxn.dG.toFixed(1)}</span>
            <span className={styles.dGUnit}>kJ/mol</span>
          </div>
          <div className={styles.uncertainty}>ΔG°′ ± {rxn.uncertainty.toFixed(1)}</div>
          <span className={styles.thermoLabel} style={{ color: dGColor }}>{dGLabel}</span>
          {rxn.method !== 'standard' && (
            <div style={{ fontSize: 9, color: '#64748b', marginTop: 8 }}>
              Method: {rxn.method === 'multicompartmental' ? 'Multicompartmental (PMF)' : 'Redox carrier'}
            </div>
          )}
        </div>
      </div>

      <div className={styles.metabolitesGrid}>
        <div>
          <div className={styles.metaboliteHeader}>SUBSTRATES</div>
          {rxn.substrates.map((s, i) => (
            <div key={i} className={styles.metaboliteItem}>{s}</div>
          ))}
        </div>
        <div>
          <div className={styles.metaboliteHeader}>PRODUCTS</div>
          {rxn.products.map((p, i) => (
            <div key={i} className={styles.metaboliteItem}>{p}</div>
          ))}
        </div>
      </div>

      <div className={sharedStyles.dataRow} style={{ padding: '6px 0' }}>
        <span className={sharedStyles.dataLabel}>Subsystem</span>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>{rxn.subsystem}</span>
      </div>
      <div className={sharedStyles.dataRow} style={{ padding: '6px 0' }}>
        <span className={sharedStyles.dataLabel}>EC</span>
        <span className="mono" style={{ fontSize: 11, color: '#94a3b8' }}>{rxn.ec}</span>
      </div>
    </>
  );
}
