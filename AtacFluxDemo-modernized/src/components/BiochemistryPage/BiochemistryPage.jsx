import { useState } from 'react';
import { reactionDetails, reactionTableData } from '../../data';
import { useSelectionStore } from '../../stores';
import { cn } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent, DataRow, StatusBadge, ThermoBadge } from '../ui';

export function BiochemistryPage() {
  const { selectedReaction, selectReaction } = useSelectionStore();
  const [anaerobic, setAnaerobic] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [glucoseLevel, setGlucoseLevel] = useState(10);

  const handleAnaerobicToggle = () => {
    setIsRecalculating(true);
    setAnaerobic(!anaerobic);
    setTimeout(() => setIsRecalculating(false), 1200);
  };

  const handleGlucoseChange = (e) => {
    setIsRecalculating(true);
    setTimeout(() => {
      setGlucoseLevel(Number(e.target.value));
      setIsRecalculating(false);
    }, 400);
  };

  const getGrowthRate = () => {
    if (anaerobic) return '0.0000';
    if (glucoseLevel >= 10) return '0.0881';
    if (glucoseLevel >= 2) return '0.0352';
    return '0.0044';
  };

  return (
    <div className="grid grid-cols-[200px_1fr_280px] gap-4 h-full min-h-0">
      {/* Left Sidebar */}
      <div className="flex flex-col gap-4 overflow-auto">
        {/* Model Info */}
        <Card>
          <CardHeader><CardTitle>Model</CardTitle></CardHeader>
          <CardContent>
            <div className="inline-block px-2.5 py-1 mb-3 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 text-[10px] font-semibold">
              yeast-GEM.xml
            </div>
            <DataRow label="Reactions" value="4,131" mono />
            <DataRow label="Metabolites" value="2,806" mono />
            <DataRow label="Genes" value="1,161" mono />
            <div className="mt-3 pt-3 border-t border-white/[0.06] text-[11px] text-slate-400">
              Growth: <span className="font-mono text-green-500">{getGrowthRate()} h⁻¹</span>
            </div>
          </CardContent>
        </Card>

        {/* Thermodynamics Status */}
        <Card>
          <CardHeader><CardTitle>Thermodynamics</CardTitle></CardHeader>
          <CardContent>
            <div className={cn(
              'px-2.5 py-1.5 rounded text-[10px] font-medium mb-3 transition-colors',
              isRecalculating 
                ? 'bg-amber-500/20 text-amber-400' 
                : 'bg-green-500/20 text-green-400'
            )}>
              {isRecalculating ? '⟳ Recalculating...' : '4,131 reactions loaded'}
            </div>
            <DataRow 
              label="Shifted" 
              value={anaerobic ? '847' : '0'} 
              mono 
              valueColor={anaerobic ? 'text-orange-400' : 'text-slate-500'}
            />
            <DataRow 
              label="Direction flipped" 
              value={anaerobic ? '234' : '0'} 
              mono 
              valueColor={anaerobic ? 'text-red-500' : 'text-slate-500'}
            />
          </CardContent>
        </Card>

        {/* Conditions */}
        <Card className="flex-1">
          <CardHeader><CardTitle>Conditions</CardTitle></CardHeader>
          <CardContent>
            <div
              onClick={handleAnaerobicToggle}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded cursor-pointer mb-2 transition-colors',
                anaerobic 
                  ? 'bg-green-500/20 border border-green-500/30' 
                  : 'bg-black/30 border border-white/10 hover:bg-white/[0.03]'
              )}
            >
              <input 
                type="checkbox" 
                checked={anaerobic} 
                readOnly 
                className="accent-green-500 pointer-events-none" 
              />
              <span className={cn('text-xs', anaerobic ? 'text-green-500' : 'text-slate-200')}>
                oxygen = 0
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-black/30 border border-white/10 rounded">
              <span className="text-xs text-slate-400">glucose =</span>
              <select 
                value={glucoseLevel} 
                onChange={handleGlucoseChange}
                className="bg-transparent border-none text-slate-200 text-xs cursor-pointer focus:outline-none"
              >
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
          <CardTitle>Reactions</CardTitle>
          <span className={cn(
            'text-[10px] transition-colors',
            anaerobic || glucoseLevel < 10 ? 'text-orange-400' : 'text-slate-500'
          )}>
            {anaerobic ? '847 reactions affected' : glucoseLevel < 10 ? 'glucose-limited' : '4,131 total'}
          </span>
        </CardHeader>

        {/* Table Header */}
        <div className="grid grid-cols-[60px_50px_40px_70px_1fr] px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wide border-b border-white/[0.06]">
          <div>Flux</div>
          <div>ΔG°</div>
          <div>Loc</div>
          <div>ID</div>
          <div>Name</div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto">
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
              <div
                key={rxn.id}
                onClick={() => selectReaction(rxn.id)}
                className={cn(
                  'grid grid-cols-[60px_50px_40px_70px_1fr] px-3 py-2 text-[11px]',
                  'border-b border-white/[0.04] cursor-pointer transition-colors',
                  'hover:bg-white/[0.03]',
                  isSelected && 'bg-white/[0.06]',
                  isBlocked && 'bg-red-500/[0.05]',
                  isReduced && 'bg-orange-500/[0.05]',
                  isIncreased && 'bg-green-500/[0.05]',
                  isLimited && 'bg-amber-500/[0.03]',
                )}
                style={waveDelay ? { transitionDelay: `${waveDelay}ms` } : undefined}
              >
                <div className={cn(
                  'font-mono transition-colors',
                  flux === 0 ? 'text-red-500' : isIncreased ? 'text-green-500' : (isReduced || isLimited) ? 'text-orange-400' : 'text-green-400'
                )}>
                  {flux.toFixed(2)}
                </div>
                <div><ThermoBadge dG={dG} /></div>
                <div>
                  <span className="px-1.5 py-0.5 bg-slate-700/50 rounded text-[9px] text-slate-400">
                    {rxn.loc}
                  </span>
                </div>
                <div className="font-mono text-blue-400">{rxn.id}</div>
                <div className={cn(
                  'truncate transition-colors',
                  isBlocked ? 'text-red-300' : isIncreased ? 'text-green-300' : 'text-slate-400'
                )}>
                  {rxn.name}
                  {isBlocked && <span className="ml-2 text-[9px] text-red-400">● BLOCKED</span>}
                  {isIncreased && <span className="ml-2 text-green-500">▲</span>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Right: Reaction Details */}
      <Card className="flex flex-col overflow-hidden">
        <CardHeader><CardTitle>Reaction Details</CardTitle></CardHeader>
        <div className="flex-1 overflow-auto">
          {reactionDetails[selectedReaction] ? (
            <CardContent>
              <ReactionDetails
                rxn={reactionDetails[selectedReaction]}
                rxnId={selectedReaction}
                anaerobic={anaerobic}
                glucoseLevel={glucoseLevel}
              />
            </CardContent>
          ) : (
            <div className="p-4 text-slate-500 text-xs">
              Select a reaction to view details
            </div>
          )}
        </div>
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

  const dGColor = rxn.dG < -10 ? 'text-green-500' : rxn.dG > 10 ? 'text-amber-500' : 'text-blue-400';
  const dGLabel = rxn.dG < -10 ? 'Thermodynamically favorable' : rxn.dG > 10 ? 'Thermodynamically unfavorable' : 'Near equilibrium';

  return (
    <>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-mono text-blue-400 font-semibold">{rxnId}</span>
          {isBlocked && <StatusBadge status="blocked" />}
          {isReduced && !isLimited && <StatusBadge status="reduced" />}
          {isLimited && <StatusBadge status="limited" />}
          {isIncreased && <StatusBadge status="increased" />}
        </div>
        <div className="text-[13px] text-slate-200 mb-1">{rxn.name}</div>
        <div className="text-[10px] text-slate-500">
          Compartment: <span className={isMito ? 'text-amber-400' : 'text-green-400'}>{rxn.compartment}</span>
        </div>
      </div>

      {/* Equation */}
      <div className="p-3 bg-black/30 rounded-lg mb-4">
        <div className="font-mono text-[11px] text-slate-300">
          {rxn.substrates.join(' + ')} → {rxn.products.join(' + ')}
        </div>
      </div>

      {/* Thermodynamics */}
      <div className="mb-4">
        <div className="text-[11px] text-slate-500 mb-2">Thermodynamics</div>
        <div className={cn(
          'p-3 rounded-lg border',
          rxn.dG < -10 ? 'bg-green-500/[0.08] border-green-500/20' :
          rxn.dG > 10 ? 'bg-amber-500/[0.08] border-amber-500/20' :
          'bg-blue-500/[0.08] border-blue-500/20'
        )}>
          <div className={cn('text-2xl font-light mb-1', dGColor)}>
            <span className="font-mono">{rxn.dG.toFixed(1)}</span>
            <span className="text-[10px] text-slate-500 ml-1">kJ/mol</span>
          </div>
          <div className="text-[10px] text-slate-500 mb-1">ΔG°′ ± {rxn.uncertainty.toFixed(1)}</div>
          <div className={cn('text-[11px]', dGColor)}>{dGLabel}</div>
          {rxn.method !== 'standard' && (
            <div className="text-[9px] text-slate-500 mt-2">
              Method: {rxn.method === 'multicompartmental' ? 'Multicompartmental (PMF)' : 'Redox carrier'}
            </div>
          )}
        </div>
      </div>

      {/* Metabolites */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Substrates</div>
          {rxn.substrates.map((s, i) => (
            <div key={i} className="text-[11px] text-slate-300 py-0.5">{s}</div>
          ))}
        </div>
        <div>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Products</div>
          {rxn.products.map((p, i) => (
            <div key={i} className="text-[11px] text-slate-300 py-0.5">{p}</div>
          ))}
        </div>
      </div>

      {/* Footer data */}
      <DataRow label="Subsystem" value={rxn.subsystem} />
      <DataRow label="EC" value={rxn.ec} mono />
    </>
  );
}
