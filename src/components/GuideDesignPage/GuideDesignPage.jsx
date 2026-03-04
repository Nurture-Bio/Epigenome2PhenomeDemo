import { useState } from 'react';
import { guides } from '../../data';
import { cn } from '../../lib/utils';
import { Button, Card, CardHeader, ComboBox, DataRow, EmptyState, MetricBar, PlotSurface } from '../ui';
import './GuideDesignPage.css';

function seededNoise(x) {
  const n = Math.sin(x * 12.9898) * 43758.5453;
  return n - Math.floor(n);
}

function generateAtacPath(guides, regionStart, regionEnd, isPredicted = false, selectedGuide = null, isRepression = false) {
  const width = 100;
  const height = 32;
  const baseline = height - 1;
  const points = [];
  for (let x = 0; x <= width; x += 1) {
    let y = baseline - (seededNoise(x * 0.1) * 1 + 0.5);
    guides.forEach(guide => {
      const guideX = ((guide.position - regionStart) / (regionEnd - regionStart)) * width;
      const distance = Math.abs(x - guideX);
      let score = guide.atacScore;
      if (isPredicted && selectedGuide === guide.id) {
        score = isRepression ? Math.max(0.02, guide.atacScore * 0.15) : guide.predictedAtac;
      }
      const peakWidth = 3 + score * 10;
      if (distance < peakWidth) {
        const peakHeight = score * (height - 3);
        const falloff = Math.pow(Math.max(0, 1 - distance / peakWidth), 1.5);
        y = Math.min(y, baseline - peakHeight * falloff);
      }
    });
    points.push({ x, y });
  }
  let path = `M0,${baseline} `;
  points.forEach((p, i) => {
    if (i === 0) { path += `L${p.x},${p.y} `; }
    else {
      const prev = points[i - 1];
      const cpX = (prev.x + p.x) / 2;
      path += `Q${prev.x},${prev.y} ${cpX},${(prev.y + p.y) / 2} `;
    }
  });
  path += `L${width},${baseline} L${width},${height} L0,${height} Z`;
  return path;
}

function DnaVisualization({ guides, selectedGuide, onSelectGuide, isRepression }) {
  const regionStart = -500;
  const regionEnd = 0;
  const regionWidth = regionEnd - regionStart;
  const posToPercent = (pos) => ((pos - regionStart) / regionWidth) * 100;
  const ticks = [-500, -400, -300, -200, -100, 0];
  const currentAtacPath = generateAtacPath(guides, regionStart, regionEnd, false, null, false);
  const predictedAtacPath = selectedGuide
    ? generateAtacPath(guides, regionStart, regionEnd, true, selectedGuide, isRepression) : null;
  const selectedGuideData = guides.find(g => g.id === selectedGuide);
  const getPredictedAtac = (guide) => isRepression ? Math.max(0.02, guide.atacScore * 0.15) : guide.predictedAtac;

  return (
    <PlotSurface className="px-5 py-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 items-center">
          <ComboBox defaultValue="ATF1" options={['ATF1','ATF2','EHT1','BAT1','BAT2'].map(v => ({ value: v, label: v }))} />
          <ComboBox defaultValue="promoter" options={[
            { value: 'promoter', label: 'Promoter' },
            { value: '5utr',     label: "5' UTR" },
            { value: 'cds',      label: 'CDS' },
            { value: '3utr',     label: "3' UTR" },
          ]} />
        </div>
        <span className="type-mono bg-surface-input px-2 py-1 rounded">chr XV: 798,234 - 798,734</span>
      </div>

      <div className="dnaTrackContainer">
        <div className="dnaAxis">
          {ticks.map(tick => (
            <div key={tick} className="dnaTick" style={{ left: `${posToPercent(tick)}%` }}>
              <div className="dnaTickLine" />
              <span className="dnaTickLabel">{tick}</span>
            </div>
          ))}
        </div>
        <div className="dnaBackbone">
          <div className="dnaStrand" />
          <div className="dnaHelixPattern" />
          <div className="dnaStrand dnaStrandBottom" />
        </div>
        <div className="tssMarker" style={{ left: `${posToPercent(0)}%` }}>
          <div className="tssArrow">→</div>
          <span className="tssLabel">TSS</span>
        </div>

        {guides.map(guide => {
          const isSelected = selectedGuide === guide.id;
          const isPlus = guide.strand === '+';
          return (
            <div key={guide.id}
              className={cn('guideMarker', isSelected && 'guideMarkerSelected', isPlus ? 'guideMarkerPlus' : 'guideMarkerMinus')}
              style={{ left: `${posToPercent(guide.position)}%` }}
              onClick={() => onSelectGuide(guide.id)}
              title={`Guide ${guide.id}: ${guide.position}bp (${guide.strand})`}>
              {isPlus ? (
                <><div className="guideMarkerHead">▶</div><div className="guideMarkerLine" /></>
              ) : (
                <><div className="guideMarkerLine" /><div className="guideMarkerHead">◀</div></>
              )}
            </div>
          );
        })}

        <div className="atacTrack">
          <div className="atacLabel">ATAC</div>
          <div className="atacSignal">
            <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="atacSvg">
              <defs>
                <linearGradient id="atacGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-danger)" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="var(--color-danger)" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="atacPredictedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="atacRepressionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-purple)" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="var(--color-purple)" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <path d={currentAtacPath} fill="url(#atacGradient)" />
            </svg>
          </div>
        </div>
        <div className="atacTrack atacTrackPredicted">
          <div className="atacLabel" style={{ color: isRepression ? 'var(--color-purple)' : 'var(--color-success)', opacity: selectedGuide ? 1 : 0.3 }}>
            {isRepression ? 'Repr' : 'Act'}
          </div>
          <div className="atacSignal" style={{ opacity: selectedGuide ? 1 : 0.15 }}>
            <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="atacSvg">
              <path d={predictedAtacPath || currentAtacPath} fill={isRepression ? 'url(#atacRepressionGradient)' : 'url(#atacPredictedGradient)'} />
            </svg>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 pt-3 border-t border-border-subtle flex-wrap items-center">
        <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
          <span className="w-2 h-2 rounded-sm bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
          <span>+ strand</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
          <span className="w-2 h-2 rounded-sm bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.5)]" />
          <span>- strand</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
          <span className="w-5 h-2 rounded-sm bg-gradient-to-r from-red-500 to-red-500/20" />
          <span>Current ATAC</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-text-muted" style={{ visibility: selectedGuide ? 'visible' : 'hidden' }}>
          <span className={cn('w-5 h-2 rounded-sm bg-gradient-to-r', isRepression ? 'from-violet-500 to-violet-500/20' : 'from-green-500 to-green-500/20')} />
          <span>Predicted</span>
        </div>
        <div className="ml-auto flex items-center gap-2 px-2.5 py-1 bg-green-500/10 border border-green-500/30 rounded-md"
          style={{ visibility: selectedGuideData ? 'visible' : 'hidden' }}>
          <span className="text-[10px] text-text-muted">Δ Accessibility:</span>
          <span className="text-[11px] font-semibold font-mono" style={{ color: isRepression ? 'var(--color-purple)' : 'var(--color-success)' }}>
            {selectedGuideData ? `${Math.round(selectedGuideData.atacScore * 100)}% → ${Math.round(getPredictedAtac(selectedGuideData) * 100)}%` : '—% → —%'}
          </span>
        </div>
      </div>
    </PlotSurface>
  );
}

export function GuideDesignPage() {
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [isRepression, setIsRepression] = useState(false);
  const selectedGuideData = guides.find(g => g.id === selectedGuide);
  const getPredictedAtac = (guide) => isRepression ? Math.max(0.02, guide.atacScore * 0.15) : guide.predictedAtac;
  const getPredictedFlux = (guide) => {
    if (isRepression) return `-${Math.round(guide.atacScore * 100 * 0.85)}%`;
    return guide.predictedFlux;
  };

  const intensityPercent = selectedGuideData
    ? (isRepression ? Math.max(2, 10 - selectedGuideData.atacScore * 20) : Math.min(100, parseInt(selectedGuideData.predictedFlux) / 5 + 10))
    : 10;

  return (
    <div className="max-w-[956px] mx-auto flex flex-col h-full">
      {/* Mode header */}
      <div className="py-1.5 px-4 rounded-md flex justify-between items-center mb-4"
        style={{ background: isRepression ? 'var(--color-purple)' : 'var(--color-success)' }}>
        <span className="text-xs font-semibold text-text-on-color">{isRepression ? 'Repression Mode' : 'Activation Mode'}</span>
        <Button variant="secondary" onClick={() => setIsRepression(!isRepression)}>
          Switch to {isRepression ? 'Activation' : 'Repression'}
        </Button>
      </div>

      <DnaVisualization guides={guides} selectedGuide={selectedGuide} onSelectGuide={setSelectedGuide} isRepression={isRepression} />

      {/* Two column layout */}
      <div className="grid grid-cols-[1fr_340px] gap-4 items-start flex-1 min-h-0">
        {/* Guide table */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="!py-2 !px-4 !text-[11px]">
            <span style={{ color: isRepression ? 'var(--color-purple)' : 'var(--color-success)' }}>{guides.length} guides</span> found • Click to select
          </CardHeader>
          <div className="flex-1 overflow-auto">
            <table className="dt">
              <colgroup>
                <col /><col style={{ width: 55 }} /><col style={{ width: 35 }} />
                <col style={{ width: 45 }} /><col style={{ width: 70 }} />
                <col style={{ width: 50 }} /><col style={{ width: 60 }} />
              </colgroup>
              <thead>
                <tr><th>Spacer</th><th>Pos</th><th>±</th><th>PAM</th><th>Off-targets</th><th>ATAC</th><th>Δ Flux</th></tr>
              </thead>
              <tbody>
                {guides.map(guide => (
                  <tr key={guide.id}
                    className={cn('dr', selectedGuide === guide.id && 'dr--selected')}
                    onClick={() => setSelectedGuide(guide.id)}
                  >
                    <td className="mono text-[10px]">{guide.spacer}</td>
                    <td className="mono">{guide.position}</td>
                    <td>{guide.strand}</td>
                    <td className="mono">{guide.pam}</td>
                    <td style={{ color: guide.offTargets === 0 ? 'var(--color-success)' : 'var(--color-warning)' }}>{guide.offTargets}</td>
                    <td style={{ color: 'var(--color-danger)' }}>{Math.round(guide.atacScore * 100)}%</td>
                    <td className="font-semibold" style={{ color: isRepression ? 'var(--color-purple)' : 'var(--color-success)' }}>{getPredictedFlux(guide)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Details panel */}
        <Card
          className={cn('transition-all duration-300', selectedGuideData && 'bg-gradient-to-br from-green-500/5 to-blue-500/5')}
          style={{ borderColor: selectedGuide ? (isRepression ? 'rgba(139, 92, 246, 0.2)' : 'rgba(34, 197, 94, 0.2)') : undefined }}
        >
          <CardHeader className="!py-2 !px-4 !text-[11px]">
            Guide Details
          </CardHeader>
          {selectedGuideData ? (
            <div className="p-4">
              <div className="mono text-xs px-3 py-2.5 bg-surface-input rounded-md break-all leading-snug mb-4">
                {selectedGuideData.spacer}-<span style={{ color: 'var(--color-success)' }}>{selectedGuideData.pam}</span>
              </div>

              <DataRow label="Position" value={<span className="mono text-[11px]">{selectedGuideData.position} from TSS</span>} />
              <DataRow label="Chromatin" value={<span className="text-[11px]" style={{ color: 'var(--color-danger)' }}>{Math.round(selectedGuideData.atacScore * 100)}% accessible</span>} />
              <DataRow label={isRepression ? 'Repression' : 'Activation'}
                value={<span className="text-[11px]" style={{ color: isRepression ? 'var(--color-purple)' : 'var(--color-success)' }}>
                  → {Math.round(getPredictedAtac(selectedGuideData) * 100)}% ({isRepression ? '' : '+'}{Math.round((getPredictedAtac(selectedGuideData) - selectedGuideData.atacScore) * 100)}%)
                </span>}
              />

              <div className="mt-4 p-3.5 rounded-lg" style={{ background: isRepression ? 'rgba(139, 92, 246, 0.1)' : 'var(--surface-input)' }}>
                <div className="type-sm text-text-muted mb-1.5">Predicted isoamyl acetate flux</div>
                <div className="text-lg font-light mb-3">
                  <span className="text-text-muted">0.12</span>
                  <span className="text-text-muted mx-1.5">→</span>
                  <span style={{ color: isRepression ? 'var(--color-purple)' : 'var(--color-success)' }}>
                    {isRepression
                      ? (0.12 * (1 - selectedGuideData.atacScore * 0.85)).toFixed(2)
                      : (0.12 * (1 + parseInt(selectedGuideData.predictedFlux) / 100)).toFixed(2)}
                  </span>
                  <span className="text-[9px] text-text-muted ml-1">mmol/gDW/h</span>
                </div>
                <div className="flex justify-between mb-1.5 type-caption uppercase tracking-[0.5px]">
                  <span>Banana flavor intensity</span>
                  <span style={{ color: isRepression ? 'var(--color-purple)' : 'var(--color-success)' }}>{getPredictedFlux(selectedGuideData)}</span>
                </div>
                <MetricBar
                  value={intensityPercent}
                  variant={isRepression ? 'purple' : 'success'}
                />
              </div>
            </div>
          ) : (
          <EmptyState>Guide impact will appear here</EmptyState>
          )}
        </Card>
      </div>
    </div>
  );
}
