import { useState } from 'react';
import { motion } from 'framer-motion';
import { guides, targetGene } from '../../data';
import { cn } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent, DataRow, Button } from '../ui';

export function GuideDesignPage() {
  const [selectedGuide, setSelectedGuide] = useState(null);
  const selectedGuideData = guides.find((g) => g.id === selectedGuide);

  return (
    <div className="max-w-[956px] mx-auto flex flex-col h-full gap-4">
      {/* Mode Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-700 px-5 py-3 rounded-t-lg flex justify-between items-center">
        <span className="font-semibold">dCas9-VPR Activation Mode (Active)</span>
        <Button variant="secondary" className="text-xs px-3 py-1.5">
          Switch to: KRAB Repression
        </Button>
      </div>

      {/* Config Panel */}
      <Card className="rounded-t-none -mt-4">
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] text-slate-500 block mb-1.5">Target Gene</label>
              <div className="px-3 py-2 bg-slate-900 border border-white/10 rounded-md text-[13px]">
                <span className="font-mono">{targetGene.yorf}</span>
                <span className="text-slate-500 ml-2">({targetGene.name})</span>
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1.5">Target Region</label>
              <div className="px-3 py-2 bg-slate-900 border border-white/10 rounded-md text-[13px]">
                {targetGene.region}
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1.5">PAM</label>
              <div className="px-3 py-2 bg-slate-900 border border-white/10 rounded-md text-[13px]">
                <span className="font-mono">{targetGene.pam}</span>
                <span className="text-slate-500 ml-2">({targetGene.cas})</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-[1fr_340px] gap-4 flex-1 min-h-0">
        {/* Guide Table */}
        <Card className="flex flex-col overflow-hidden">
          <div className="px-4 py-2 border-b border-white/[0.06] text-[11px]">
            <span className="text-green-500">{guides.length} guides</span> found • Click to select
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_55px_35px_45px_45px_50px_60px] px-3 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide border-b border-white/[0.06]">
              <div>Spacer</div>
              <div>Pos</div>
              <div>±</div>
              <div>PAM</div>
              <div>Off</div>
              <div>ATAC</div>
              <div>Δ Flux</div>
            </div>

            {/* Table Rows */}
            {guides.map((guide) => (
              <div
                key={guide.id}
                onClick={() => setSelectedGuide(guide.id)}
                className={cn(
                  'grid grid-cols-[1fr_55px_35px_45px_45px_50px_60px] px-3 py-2.5 text-[11px]',
                  'border-b border-white/[0.04] cursor-pointer transition-colors',
                  'hover:bg-white/[0.03]',
                  selectedGuide === guide.id && 'bg-white/[0.06]'
                )}
              >
                <div className="font-mono text-[10px] truncate">{guide.spacer}</div>
                <div className="font-mono">{guide.position}</div>
                <div>{guide.strand}</div>
                <div className="font-mono">{guide.pam}</div>
                <div className={guide.offTargets === 0 ? 'text-green-500' : 'text-amber-500'}>
                  {guide.offTargets}
                </div>
                <div className="text-red-500">{Math.round(guide.atacScore * 100)}%</div>
                <div className="text-green-500 font-medium">{guide.predictedFlux}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Details Panel */}
        <Card className={cn(
          'transition-all duration-300',
          selectedGuide && 'bg-gradient-to-br from-green-500/5 to-blue-500/5 border-green-500/20'
        )}>
          <CardHeader className={cn('transition-colors', selectedGuide && 'border-green-500/20')}>
            <CardTitle>Guide Details</CardTitle>
          </CardHeader>

          {selectedGuideData ? (
            <CardContent>
              {/* Spacer Box */}
              <div className="font-mono text-xs p-3 bg-black/30 rounded-md break-all leading-relaxed mb-4">
                {selectedGuideData.spacer}-<span className="text-green-500">{selectedGuideData.pam}</span>
              </div>

              <DataRow label="Position" value={`${selectedGuideData.position} from TSS`} mono />
              <DataRow label="Chromatin" value={`${Math.round(selectedGuideData.atacScore * 100)}% accessible`} valueColor="text-red-500" />
              <DataRow label="VPR effect" value="+64% opening" valueColor="text-green-500" />

              {/* Flux Prediction */}
              <div className="mt-4 p-3.5 bg-black/30 rounded-lg">
                <div className="text-[11px] text-slate-500 mb-1.5">Predicted flux</div>
                <div className="text-lg font-light mb-3 flex items-baseline gap-1.5">
                  <span className="text-slate-500">0.12</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-green-500">
                    {(0.12 * (1 + parseInt(selectedGuideData.predictedFlux) / 100)).toFixed(2)}
                  </span>
                  <span className="text-[9px] text-slate-500 ml-1">mmol/gDW/h</span>
                </div>

                <div className="text-[10px] text-slate-500 mb-1.5">Banana flavor intensity</div>
                <div className="h-[18px] bg-slate-800 rounded-full overflow-hidden relative">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-yellow-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${parseInt(selectedGuideData.predictedFlux) + 20}%` }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-semibold">
                    {selectedGuideData.predictedFlux}
                  </span>
                </div>
              </div>

              <Button className="w-full mt-4">Order this guide</Button>
            </CardContent>
          ) : (
            <div className="p-6 text-center text-slate-500 text-xs">
              ← Select a guide to see predicted flux impact
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
