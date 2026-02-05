import { useState } from 'react';
import { reactionDetails, reactionTableData } from '../../data';
import { useSelectionStore } from '../../stores';
import { cn } from '../../lib/utils';
import { Card, CardHeader, CardContent, DataRow, Badge, Selectable, EmptyState } from '../ui';

export function MetabolismPage() {
  const { selectedReaction, selectReaction } = useSelectionStore();
  const [anaerobic, setAnaerobic] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [glucoseLevel, setGlucoseLevel] = useState(10);

  const handleAnaerobicToggle = () => {
    const willBeAnaerobic = !anaerobic;
    setIsRecalculating(true);
    setAnaerobic(willBeAnaerobic);
    setTimeout(() => setIsRecalculating(false), 1200);
  };

  const handleGlucoseChange = (e) => {
    const newValue = Number(e.target.value);
    setIsRecalculating(true);
    setTimeout(() => { setGlucoseLevel(newValue); setIsRecalculating(false); }, 400);
  };

  const getGrowthRate = () => {
    if (anaerobic) return '0.0000';
    if (glucoseLevel >= 10) return '0.0881';
    if (glucoseLevel >= 2) return '0.0352';
    return '0.0044';
  };

  const getDGColor = (dG) => {
    if (dG === 0) return 'text-slate-500';
    if (dG < -30) return 'text-blue-400';
    if (dG > 30) return 'text-amber-400';
    return 'text-green-400';
  };

  return (
    <div className="grid grid-cols-[220px_1fr_320px] gap-4 h-full">
      {/* Left Sidebar */}
      <div className="flex flex-col gap-3">
        {/* Model Info */}
        <Card>
          <CardHeader>Model</CardHeader>
          <CardContent>
            <div className="px-3 py-2 bg-green-500/10 rounded-md mb-3 text-[11px] text-green-500">yeast-GEM.xml</div>
            <DataRow label="Reactions" value="4,131" valueClassName="mono" style={{ padding: '6px 0' }} />
            <DataRow label="Metabolites" value="2,806" valueClassName="mono" style={{ padding: '6px 0' }} />
            <DataRow label="Genes" value="1,161" valueClassName="mono" style={{ padding: '6px 0' }} />
            <div className="mt-3 px-3 py-2 bg-black/30 rounded-md text-[11px] text-slate-500 text-center">
              Growth: <span className="mono text-green-500">{getGrowthRate()} h⁻¹</span>
            </div>
          </CardContent>
        </Card>

        {/* Thermodynamics */}
        <Card>
          <CardHeader>Thermodynamics</CardHeader>
          <CardContent>
            <div className={cn(
              'px-3 py-2 rounded-md mb-3 text-[11px] transition-all duration-300',
              isRecalculating ? 'bg-orange-400/15 text-orange-400' : 'bg-violet-400/10 text-violet-400'
            )}>
              {isRecalculating ? '⟳ Recalculating...' : '4,131 reactions loaded'}
            </div>
            <DataRow label="Shifted" style={{ padding: '4px 0', fontSize: 11 }}
              value={<span className="mono" style={{ color: anaerobic ? '#fb923c' : '#64748b', transition: 'color 0.3s' }}>{anaerobic ? '847' : '0'}</span>} />
            <DataRow label="Direction flipped" style={{ padding: '4px 0', fontSize: 11 }}
              value={<span className="mono" style={{ color: anaerobic ? '#ef4444' : '#64748b', transition: 'color 0.3s' }}>{anaerobic ? '234' : '0'}</span>} />
          </CardContent>
        </Card>

        {/* Conditions */}
        <Card className="flex-1">
          <CardHeader>Conditions</CardHeader>
          <CardContent>
            <div
              onClick={handleAnaerobicToggle}
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-md mb-2 cursor-pointer transition-all duration-300',
                anaerobic ? 'bg-green-500/10 border border-green-500/30' : 'bg-black/30 border border-transparent'
              )}
            >
              <input type="checkbox" checked={anaerobic} readOnly style={{ accentColor: '#22c55e', pointerEvents: 'none' }} />
              <span className="text-xs" style={{ color: anaerobic ? '#22c55e' : '#e2e8f0' }}>oxygen = 0</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-black/30 border border-white/10">
              <span className="text-xs text-slate-400">glucose =</span>
              <select value={glucoseLevel} onChange={handleGlucoseChange}
                className="bg-slate-800 border border-white/20 rounded text-slate-200 text-xs px-2 py-1 cursor-pointer outline-none">
                <option value={20}>20</option>
                <option value={10}>10</option>
                <option value={2}>2</option>
                <option value={0.1}>0.1</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Center: Reactions Table */}
      <Card className="flex flex-col overflow-hidden">
        <CardHeader>
          <span>Reactions</span>
          <span className="text-[10px] transition-colors duration-300"
            style={{ color: anaerobic ? '#fb923c' : glucoseLevel < 10 ? '#fb923c' : '#64748b' }}>
            {anaerobic ? '847 reactions affected' : glucoseLevel < 10 ? 'glucose-limited' : '4,131 total'}
          </span>
        </CardHeader>

        <div className="grid grid-cols-[70px_55px_40px_80px_1fr] px-4 py-2 border-b border-white/[0.06] text-[10px] font-semibold text-slate-500 tracking-[0.5px]">
          <div>FLUX</div><div>ΔG°</div><div>LOC</div><div>ID</div><div>NAME</div>
        </div>

        <div className="flex-1 overflow-auto overflow-x-hidden">
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

            return (
              <Selectable
                key={rxn.id}
                selected={isSelected}
                onClick={() => selectReaction(rxn.id)}
                className={cn(
                  'grid grid-cols-[70px_55px_40px_80px_1fr] px-4 py-2.5 border-b border-white/[0.03] border-l-2 border-l-transparent text-[11px] rounded',
                  'transition-[background,border-left-color] duration-400',
                  isBlocked && 'bg-red-500/10 !border-l-red-500',
                  isReduced && 'bg-orange-400/[0.08] !border-l-orange-400',
                  isLimited && 'bg-orange-400/[0.06] !border-l-orange-400',
                  isIncreased && 'bg-green-500/[0.08] !border-l-green-500',
                )}
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
                  <span className={cn('mono text-[10px]', getDGColor(dG))} style={{ transition: 'all 0.3s' }}>
                    {dG === 0 ? '—' : dG}
                  </span>
                </div>
                <div>
                  <span className="px-1.5 py-0.5 rounded-[3px] text-[9px] bg-white/10 text-slate-400">{rxn.loc}</span>
                </div>
                <div className="mono text-blue-400">{rxn.id}</div>
                <div className="overflow-hidden text-ellipsis whitespace-nowrap transition-colors duration-400"
                  style={{
                    color: isBlocked ? '#fca5a5' : isIncreased ? '#86efac' : '#94a3b8',
                    transitionDelay: waveDelay ? `${waveDelay}ms` : undefined
                  }}>
                  {rxn.name}
                  {isBlocked && <span className="ml-2 text-red-500 text-[9px]">● BLOCKED</span>}
                  {isIncreased && <span className="ml-2 text-green-500 text-[9px]">▲</span>}
                </div>
              </Selectable>
            );
          })}
        </div>
      </Card>

      {/* Right: Reaction Details */}
      <Card className="flex flex-col overflow-hidden">
        <CardHeader>Reaction Details</CardHeader>
        {reactionDetails[selectedReaction] ? (
          <div className="p-4 overflow-auto flex-1">
            <ReactionDetails
              rxn={reactionDetails[selectedReaction]}
              rxnId={selectedReaction}
              anaerobic={anaerobic}
              glucoseLevel={glucoseLevel}
            />
          </div>
        ) : (
          <EmptyState>Reaction details will appear here</EmptyState>
        )}
      </Card>
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
  const thermoBoxVariant = rxn.dG < -10 ? 'bg-green-500/10' : rxn.dG > 10 ? 'bg-amber-500/10' : 'bg-blue-400/10';

  return (
    <>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="mono text-sm text-blue-400">{rxnId}</span>
          {isBlocked && <Badge variant="blocked">BLOCKED</Badge>}
          {isReduced && !isLimited && <Badge variant="reduced">REDUCED</Badge>}
          {isLimited && <Badge variant="limited">LIMITED</Badge>}
          {isIncreased && <Badge variant="increased">INCREASED</Badge>}
        </div>
        <div className="text-[13px] text-slate-200 mb-2">{rxn.name}</div>
        <div className="text-[11px] text-slate-500">
          Compartment: <span className={isMito ? 'text-violet-400' : 'text-green-500'}>{rxn.compartment}</span>
        </div>
      </div>

      <div className="p-4 bg-black/30 rounded-lg mb-4">
        <div className="mono text-[11px] text-slate-400 leading-relaxed">
          {rxn.substrates.join(' + ')} → {rxn.products.join(' + ')}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-[11px] text-slate-500 mb-1">Thermodynamics</div>
        <div className={cn('p-4 rounded-lg border border-white/10 mb-4', thermoBoxVariant)}>
          <div className="text-2xl mb-1" style={{ color: dGColor }}>
            <span className="mono">{rxn.dG.toFixed(1)}</span>
            <span className="text-xs ml-1">kJ/mol</span>
          </div>
          <div className="text-[11px] text-slate-500 mb-2">ΔG°′ ± {rxn.uncertainty.toFixed(1)}</div>
          <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-medium" style={{ color: dGColor }}>{dGLabel}</span>
          {rxn.method !== 'standard' && (
            <div className="text-[9px] text-slate-500 mt-2">
              Method: {rxn.method === 'multicompartmental' ? 'Multicompartmental (PMF)' : 'Redox carrier'}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <div className="text-[9px] text-slate-500 mb-1.5 tracking-[0.5px]">SUBSTRATES</div>
          {rxn.substrates.map((s, i) => (
            <div key={i} className="text-[11px] text-slate-400 mb-1">{s}</div>
          ))}
        </div>
        <div>
          <div className="text-[9px] text-slate-500 mb-1.5 tracking-[0.5px]">PRODUCTS</div>
          {rxn.products.map((p, i) => (
            <div key={i} className="text-[11px] text-slate-400 mb-1">{p}</div>
          ))}
        </div>
      </div>

      <DataRow label="Subsystem" value={<span className="text-[11px] text-slate-400">{rxn.subsystem}</span>} style={{ padding: '6px 0' }} />
      <DataRow label="EC" value={<span className="mono text-[11px] text-slate-400">{rxn.ec}</span>} style={{ padding: '6px 0' }} />
    </>
  );
}
