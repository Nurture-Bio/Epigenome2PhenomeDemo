import { useEffect, useMemo, useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { useAsyncState } from '../../hooks';
import { reactionDetails, reactionTableData } from '../../data';
import { divergingColor } from '../../lib/colorScale';
import { useSelectionStore } from '../../stores';
import { Badge, Card, CardContent, CardHeader, ComboBox, DataRow, DataTable, EmptyState } from '../ui';

/**
 * computeFlux — pure function, extracted from render so delta comparison
 * can call it twice (prev conditions and current conditions) without
 * duplicating logic. Keeping this outside the component also means it
 * never gets a stale closure over component state.
 */
function computeFlux(conds, rxn) {
  const scale = conds.glucoseLevel >= 20 ? 1.5 : conds.glucoseLevel >= 10 ? 1.0 : conds.glucoseLevel >= 2 ? 0.4 : 0.05;
  return (conds.anaerobic ? rxn.flux[1] : rxn.flux[0]) * scale;
}

// Column definitions live outside the component — stable reference, never recreated.
const columnHelper = createColumnHelper();
const COLUMNS = [
  columnHelper.accessor('flux', {
    header: 'Flux',
    size: 70,
    meta: { align: 'right', mono: true },
    cell: info => info.getValue().toFixed(2),
  }),
  columnHelper.accessor('dG', {
    header: 'ΔG°',
    size: 55,
    meta: { align: 'right', mono: true },
    cell: info => info.getValue() === 0 ? '—' : info.getValue(),
  }),
  columnHelper.accessor('loc', {
    header: 'Loc',
    size: 40,
  }),
  columnHelper.accessor('id', {
    header: 'ID',
    size: 80,
    meta: { mono: true },
  }),
  columnHelper.accessor('name', {
    header: 'Name',
  }),
];

export function MetabolismPage() {
  const { selectedReaction, selectReaction } = useSelectionStore();
  const [{ status, value: conditions }, run] = useAsyncState({ anaerobic: false, glucoseLevel: 10 });
  const { anaerobic, glucoseLevel } = conditions;

  // ── DELTA TRACKING ────────────────────────────────────────────────────────
  // `prev` holds the conditions from BEFORE the last change.
  // Captured at status → 'pending' because useAsyncState holds `value` stable
  // during pending — conditions still equals the OLD value at that moment.
  // By resolved, conditions has advanced and `prev` lets us compute per-row delta.
  //
  // Delta uses divergingColor(flux, prevFlux): a continuous red→white→blue
  // scale (bioinformatics heatmap). Blue = increased flux, red = decreased flux.
  // Intensity is a power-curve (≈ cubic bezier) of the relative change ratio.
  // CSS transition on .dr's background smoothly animates the color change.
  // No remount-based animation restart needed — CSS transition handles it.
  // ──────────────────────────────────────────────────────────────────────────
  const [prev, setPrev] = useState(null);

  useEffect(() => {
    if (status === 'pending') setPrev(conditions); // snapshot old conditions before they change
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnaerobicToggle = () => {
    run(new Promise(r => setTimeout(() => r({ ...conditions, anaerobic: !anaerobic }), 1200)));
  };

  const handleGlucoseChange = (val) => {
    run(new Promise(r => setTimeout(() => r({ ...conditions, glucoseLevel: Number(val) }), 400)));
  };

  const getGrowthRate = () => {
    if (anaerobic) return '0.0000';
    if (glucoseLevel >= 10) return '0.0881';
    if (glucoseLevel >= 2) return '0.0352';
    return '0.0044';
  };

  // Flat row objects — TanStack Table owns the rest.
  // prevFlux is carried here so getRowBackground can compute the diverging color
  // without reaching back into component state.
  const rows = useMemo(() =>
    reactionTableData.map(rxn => ({
      id:       rxn.id,
      flux:     computeFlux(conditions, rxn),
      dG:       anaerobic ? rxn.dG[1] : rxn.dG[0],
      loc:      rxn.loc,
      name:     rxn.name,
      prevFlux: prev ? computeFlux(prev, rxn) : null,
    })),
    [conditions, prev] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div className="grid grid-cols-[220px_1fr_320px] gap-4 h-full">
      {/* Left Sidebar */}
      <div className="flex flex-col gap-3">
        <Card>
          <CardHeader>Model</CardHeader>
          <CardContent>
            <div className="px-3 py-2 bg-surface-input mb-3 type-mono" style={{ color: 'var(--color-success)' }}>yeast-GEM.xml</div>
            <DataRow label="Reactions"   value="4,131" />
            <DataRow label="Metabolites" value="2,806" />
            <DataRow label="Genes"       value="1,161" />
            <div className="mt-3 px-3 py-2 bg-surface-input text-center">
              <span className="type-caption">Growth: </span>
              <span className="type-mono" style={{ color: 'var(--color-success)' }}>{getGrowthRate()} h⁻¹</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>Thermodynamics</CardHeader>
          {status === 'pending' && <div className="pending-bar" />}
          <CardContent>
            <div className="px-3 py-2 bg-surface-input type-caption mb-3" style={{ color: 'var(--color-purple)' }}>
              4,131 reactions loaded
            </div>
            <DataRow label="Shifted"
              value={<span style={{ color: anaerobic ? 'var(--color-warning)' : 'var(--text-muted)' }}>{anaerobic ? '847' : '0'}</span>} />
            <DataRow label="Direction flipped"
              value={<span style={{ color: anaerobic ? 'var(--color-danger)' : 'var(--text-muted)' }}>{anaerobic ? '234' : '0'}</span>} />
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>Conditions</CardHeader>
          <CardContent>
            <div
              onClick={handleAnaerobicToggle}
              className="flex items-center gap-2 px-3 py-2.5 mb-2 cursor-pointer transition-colors border"
              style={{
                background: anaerobic ? `color-mix(in srgb, var(--color-success) 10%, transparent)` : 'var(--surface-input)',
                borderColor: anaerobic ? `color-mix(in srgb, var(--color-success) 30%, transparent)` : 'transparent',
              }}
            >
              <input type="checkbox" checked={anaerobic} readOnly style={{ accentColor: 'var(--color-success)', pointerEvents: 'none' }} />
              <span className="type-sm" style={{ color: anaerobic ? 'var(--color-success)' : 'var(--text-primary)' }}>oxygen = 0</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-surface-input border border-border-default">
              <span className="type-caption">glucose =</span>
              <ComboBox
                value={String(glucoseLevel)}
                onValueChange={handleGlucoseChange}
                options={[
                  { value: '20',  label: '20' },
                  { value: '10',  label: '10' },
                  { value: '2',   label: '2' },
                  { value: '0.1', label: '0.1' },
                ]}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Center: Reactions Table */}
      <Card className="flex flex-col overflow-hidden">
        <CardHeader>
          <span>Reactions</span>
          <span className="type-caption" style={{ color: anaerobic || glucoseLevel < 10 ? 'var(--color-warning)' : 'var(--text-muted)' }}>
            {anaerobic ? '847 reactions affected' : glucoseLevel < 10 ? 'glucose-limited' : '4,131 total'}
          </span>
        </CardHeader>
        {status === 'pending' && <div className="pending-bar" />}

        <div className="flex-1 overflow-auto">
          <DataTable
            data={rows}
            columns={COLUMNS}
            rowId="id"
            selectedId={selectedReaction}
            onSelect={selectReaction}
            getDataColor={row => divergingColor(row.flux, row.prevFlux)}
          />
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
  const isReduced   = status === 'reduced';
  const isIncreased = status === 'increased' && !isLowGlucose;
  const isLimited   = isLowGlucose && !isBlocked;

  const dGColor = rxn.dG < -10 ? 'var(--color-success)' : rxn.dG > 10 ? 'var(--color-warning)' : 'var(--color-accent)';
  const dGLabel = rxn.dG < -10 ? 'Thermodynamically favorable' : rxn.dG > 10 ? 'Thermodynamically unfavorable' : 'Near equilibrium';
  const thermoBoxColor = rxn.dG < -10 ? 'var(--color-success)' : rxn.dG > 10 ? 'var(--color-warning)' : 'var(--color-accent)';

  return (
    <>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="type-mono" style={{ color: 'var(--color-accent)' }}>{rxnId}</span>
          {isBlocked && <Badge variant="blocked">BLOCKED</Badge>}
          {isReduced && !isLimited && <Badge variant="reduced">REDUCED</Badge>}
          {isLimited && <Badge variant="limited">LIMITED</Badge>}
          {isIncreased && <Badge variant="increased">INCREASED</Badge>}
        </div>
        <div className="type-body mb-2">{rxn.name}</div>
        <div className="type-sm text-text-muted">
          Compartment: <span style={{ color: isMito ? 'var(--color-purple)' : 'var(--color-success)' }}>{rxn.compartment}</span>
        </div>
      </div>

      <div className="p-4 bg-surface-input mb-4">
        <div className="type-mono text-text-secondary leading-relaxed">
          {rxn.substrates.join(' + ')} → {rxn.products.join(' + ')}
        </div>
      </div>

      <div className="mb-4">
        <div className="type-sm text-text-muted mb-1">Thermodynamics</div>
        <div className="p-4 border border-border-default mb-4" style={{ background: `color-mix(in srgb, ${thermoBoxColor} 10%, transparent)` }}>
          <div className="type-metric mb-1" style={{ color: dGColor }}>
            <span>{rxn.dG.toFixed(1)}</span>
            <span className="type-caption ml-1">kJ/mol</span>
          </div>
          <div className="type-sm text-text-muted mb-2">ΔG°′ ± {rxn.uncertainty.toFixed(1)}</div>
          <span className="px-2 py-1 bg-surface-hover type-caption font-semibold" style={{ color: dGColor }}>{dGLabel}</span>
          {rxn.method !== 'standard' && (
            <div className="type-badge text-text-muted mt-2">
              Method: {rxn.method === 'multicompartmental' ? 'Multicompartmental (PMF)' : 'Redox carrier'}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <div className="type-badge text-text-muted mb-1.5 tracking-[0.5px]">SUBSTRATES</div>
          {rxn.substrates.map((s, i) => (
            <div key={i} className="type-sm mb-1">{s}</div>
          ))}
        </div>
        <div>
          <div className="type-badge text-text-muted mb-1.5 tracking-[0.5px]">PRODUCTS</div>
          {rxn.products.map((p, i) => (
            <div key={i} className="type-sm mb-1">{p}</div>
          ))}
        </div>
      </div>

      <DataRow label="Subsystem" value={<span className="type-sm">{rxn.subsystem}</span>} />
      <DataRow label="EC" value={<span className="type-mono text-text-muted">{rxn.ec}</span>} />
    </>
  );
}
