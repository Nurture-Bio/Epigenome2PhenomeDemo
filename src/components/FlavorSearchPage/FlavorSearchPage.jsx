import { useMemo, useState } from 'react';
import { geneFlavorMap, getDescriptorStats, searchByDescriptor, suggestedSearches } from '../../data/geneFlavorMap';
import { cn } from '../../lib/utils';
import { Card, CardHeader, DataRow, EmptyState } from '../ui';

export function FlavorSearchPage() {
  const [query, setQuery] = useState('');
  const [selectedGene, setSelectedGene] = useState(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchByDescriptor(query);
  }, [query]);

  const stats = useMemo(() => getDescriptorStats(), []);

  const handleSuggestionClick = (term) => {
    setQuery(term);
    setSelectedGene(null);
  };

  const selectedGeneData = selectedGene
    ? results.find(g => g.gene_id === selectedGene) || geneFlavorMap.find(g => g.gene_id === selectedGene)
    : null;

  return (
    <div className="grid grid-cols-[280px_1fr_320px] gap-4 h-full min-h-0">
      {/* Left: Search Panel */}
      <div className="flex flex-col min-h-0">
        <Card>
          <CardHeader>Flavor Search</CardHeader>
          <div className="p-4">
            {/* Search Input */}
            <div className="relative flex items-center">
              <span className="absolute left-3 text-sm opacity-50">🔍</span>
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedGene(null); }}
                placeholder="Search for a flavor (e.g., banana, peach, rancid)..."
                autoFocus
                className="w-full py-3 pl-10 pr-9 bg-black/30 border border-white/15 rounded-lg text-white text-sm outline-none transition-all focus:border-green-500 focus:shadow-[0_0_0_2px_rgba(34,197,94,0.2)] placeholder:text-slate-500"
              />
              {query && (
                <button
                  onClick={() => { setQuery(''); setSelectedGene(null); }}
                  className="absolute right-2.5 bg-transparent border-none text-slate-500 text-lg cursor-pointer px-2 py-1 hover:text-white"
                >
                  ×
                </button>
              )}
            </div>

            {/* Suggestions */}
            {!query && (
              <div className="mt-4">
                <div className="type-label mb-2.5">Try searching for:</div>
                <div className="flex flex-wrap gap-2">
                  {suggestedSearches.map(s => (
                    <button
                      key={s.term}
                      onClick={() => handleSuggestionClick(s.term)}
                      className="flex items-center gap-1.5 py-1.5 px-3 bg-white/5 border border-white/10 rounded-2xl text-slate-200 text-xs cursor-pointer transition-all hover:bg-green-500/15 hover:border-green-500/30 hover:text-green-500"
                    >
                      <span>{s.emoji}</span>
                      <span>{s.term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Stats */}
        <Card className="mt-4">
          <CardHeader>Database</CardHeader>
          <div className="p-4">
            <DataRow label="Total genes" value={<span className="mono">{stats.totalGenes}</span>} style={{ padding: '6px 0' }} />
            <DataRow label="Source model" value="Yeast-GEM 8.6" style={{ padding: '6px 0' }} />
            <DataRow label="Flavor data" value="GoodScents" style={{ padding: '6px 0' }} />
          </div>
        </Card>

        {/* Top descriptors */}
        {!query && (
          <Card className="mt-4 flex-1">
            <CardHeader>Top Odor Descriptors</CardHeader>
            <div className="p-2 overflow-y-auto">
              {stats.topOdors.slice(0, 8).map(([desc, count]) => (
                <button
                  key={desc}
                  onClick={() => handleSuggestionClick(desc)}
                  className="flex justify-between items-center w-full py-2.5 px-3 bg-transparent border-none rounded-md text-slate-200 text-xs cursor-pointer transition-colors text-left hover:bg-white/5"
                >
                  <span>{desc}</span>
                  <span className="text-slate-500 text-[10px]">{count} genes</span>
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Center: Results */}
      <Card className="flex flex-col min-h-0">
        <CardHeader>
          <span>
            {query ? (
              <>Genes producing '<span className="text-green-500">{query}</span>' compounds</>
            ) : 'Search Results'}
          </span>
          {results.length > 0 && <span className="text-green-500">{results.length} genes found</span>}
        </CardHeader>

        {!query ? (
          <EmptyState>Search results will appear here</EmptyState>
        ) : results.length === 0 ? (
          <EmptyState>No matching genes</EmptyState>
        ) : (
          <div className="p-3 overflow-y-auto flex flex-col gap-2">
            {results.map((gene, idx) => (
              <div
                key={gene.gene_id}
                onClick={() => setSelectedGene(gene.gene_id)}
                className={cn(
                  'p-3.5 px-4 bg-black/20 border rounded-lg cursor-pointer relative z-[1] transition-all duration-150',
                  selectedGene === gene.gene_id
                    ? 'shadow-[0_0_0_1px_rgba(255,255,255,0.1),_0_4px_12px_rgba(0,0,0,0.4)] bg-white/[0.04] border-white/[0.06]'
                    : 'border-white/[0.06] hover:border-white/[0.12] hover:shadow-[inset_0_0_0_100px_rgba(255,255,255,0.04)]',
                  gene.highlight && !selectedGene === gene.gene_id && 'border-green-500/30 bg-green-500/5 hover:border-green-500/50',
                )}
              >
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="text-[10px] text-slate-500 min-w-[20px]">#{idx + 1}</div>
                  <div className="flex items-baseline gap-2 flex-1">
                    <span className="type-gene text-green-500">{gene.gene_name || gene.gene_id}</span>
                    <span className="type-mono text-slate-500">{gene.gene_name ? gene.gene_id : ''}</span>
                  </div>
                  {gene.highlight && (
                    <span className="text-[10px] px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 rounded text-yellow-500">⭐ Key Gene</span>
                  )}
                </div>
                {gene.full_name && (
                  <div className="type-sm mb-2.5 ml-8">{gene.full_name}</div>
                )}
                <div className="flex flex-wrap gap-1.5 ml-8">
                  {gene.matchingCompounds.slice(0, 3).map(c => (
                    <div key={c.page_id} className="flex flex-col py-1.5 px-2.5 bg-white/5 rounded text-[11px]">
                      <span className="text-slate-200">{c.name}</span>
                      {c.note && <span className="text-[9px] text-green-500 mt-0.5">{c.note}</span>}
                    </div>
                  ))}
                  {gene.matchingCompounds.length > 3 && (
                    <div className="py-1.5 px-2.5 text-slate-500 text-[11px]">+{gene.matchingCompounds.length - 3} more</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Right: Gene Details */}
      <Card className={cn(
        'flex flex-col min-h-0 transition-colors duration-200',
        selectedGeneData && 'border-green-500/20'
      )}>
        <CardHeader>Gene Details</CardHeader>
        {selectedGeneData ? (
          <div className="p-4 overflow-y-auto flex-1">
            {/* Header */}
            <div className="mb-4 pb-3 border-b border-white/[0.06]">
              <div className="type-gene text-xl text-green-500">{selectedGeneData.gene_name || selectedGeneData.gene_id}</div>
              {selectedGeneData.gene_name && <div className="mono text-xs text-slate-500 mt-0.5">{selectedGeneData.gene_id}</div>}
              {selectedGeneData.full_name && <div className="text-xs text-slate-400 mt-1.5">{selectedGeneData.full_name}</div>}
            </div>

            {/* Importance */}
            {selectedGeneData.importance && (
              <div className="flex gap-2.5 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-green-300 mb-4 leading-snug">
                <span className="text-sm">💡</span>
                <span>{selectedGeneData.importance}</span>
              </div>
            )}

            {/* Compounds */}
            <div className="mb-5">
              <div className="type-label mb-2.5">
                Compounds Produced ({selectedGeneData.compounds.length})
              </div>
              <div className="flex flex-col gap-3">
                {selectedGeneData.compounds.map(c => (
                  <div key={c.page_id} className="py-2.5 px-3 bg-black/20 rounded-md">
                    <div className="type-title mb-1">{c.name}</div>
                    {c.note && <div className="text-[10px] text-green-500 italic mb-1.5">{c.note}</div>}
                    {c.odor?.length > 0 && (
                      <div className="flex gap-2 text-[11px] mt-1">
                        <span className="text-slate-500 shrink-0">Odor:</span>
                        <span className="text-slate-400">
                          {c.odor.slice(0, 6).map((o, i) => (
                            <span key={o} className={cn(o.toLowerCase().includes(query.toLowerCase()) && 'text-amber-400 font-medium')}>
                              {o}{i < Math.min(c.odor.length, 6) - 1 ? ', ' : ''}
                            </span>
                          ))}
                          {c.odor.length > 6 && <span className="text-slate-500 ml-1">+{c.odor.length - 6}</span>}
                        </span>
                      </div>
                    )}
                    {c.flavor?.length > 0 && (
                      <div className="flex gap-2 text-[11px] mt-1">
                        <span className="text-slate-500 shrink-0">Flavor:</span>
                        <span className="text-slate-400">
                          {c.flavor.slice(0, 6).map((f, i) => (
                            <span key={f} className={cn(f.toLowerCase().includes(query.toLowerCase()) && 'text-amber-400 font-medium')}>
                              {f}{i < Math.min(c.flavor.length, 6) - 1 ? ', ' : ''}
                            </span>
                          ))}
                          {c.flavor.length > 6 && <span className="text-slate-500 ml-1">+{c.flavor.length - 6}</span>}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* All Descriptors */}
            <div className="mb-5">
              <div className="type-label mb-2.5">All Descriptors</div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-500">Odors</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedGeneData.all_odors.slice(0, 12).map(o => (
                      <span key={o} className={cn(
                        'px-2 py-0.5 bg-white/5 rounded text-[10px] text-slate-400',
                        o.toLowerCase().includes(query.toLowerCase()) && 'bg-amber-400/20 text-amber-400'
                      )}>{o}</span>
                    ))}
                    {selectedGeneData.all_odors.length > 12 && <span className="px-2 py-0.5 text-[10px] text-slate-500">+{selectedGeneData.all_odors.length - 12}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-500">Flavors</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedGeneData.all_flavors.slice(0, 12).map(f => (
                      <span key={f} className={cn(
                        'px-2 py-0.5 bg-white/5 rounded text-[10px] text-slate-400',
                        f.toLowerCase().includes(query.toLowerCase()) && 'bg-amber-400/20 text-amber-400'
                      )}>{f}</span>
                    ))}
                    {selectedGeneData.all_flavors.length > 12 && <span className="px-2 py-0.5 text-[10px] text-slate-500">+{selectedGeneData.all_flavors.length - 12}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState>Compound details will appear here</EmptyState>
        )}
      </Card>
    </div>
  );
}
