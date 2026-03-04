import { useMemo } from 'react';
import { geneFlavorMap, getDescriptorStats, searchByDescriptor, suggestedSearches } from '../../data/geneFlavorMap';
import { cn } from '../../lib/utils';
import { Badge, Card, CardHeader, DataRow, EmptyState, Selectable } from '../ui';
import { useSelectionStore } from '../../stores';

export function FlavorSearchPage() {
  const { searchedPhenotype, phenotypeSearchGene, setSearchedPhenotype, setPhenotypeSearchGene } = useSelectionStore();
  const query = searchedPhenotype;
  const selectedGene = phenotypeSearchGene;

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchByDescriptor(query);
  }, [query]);

  const stats = useMemo(() => getDescriptorStats(), []);

  const handleSuggestionClick = (term) => {
    setSearchedPhenotype(term);
    setPhenotypeSearchGene(null);
  };

  const selectedGeneData = selectedGene
    ? results.find(g => g.gene_id === selectedGene) || geneFlavorMap.find(g => g.gene_id === selectedGene)
    : null;

  return (
    <div className="grid grid-cols-[280px_1fr_320px] gap-4 h-full min-h-0">
      {/* Left: Search Panel */}
      <div className="flex flex-col min-h-0">
        <Card>
          <CardHeader>Desired Phenotype</CardHeader>
          <div className="p-4">
            {/* Search Input */}
            <div className="relative flex items-center">
              <svg className="absolute left-3 opacity-40" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                value={query}
                onChange={(e) => { setSearchedPhenotype(e.target.value); setPhenotypeSearchGene(null); }}
                placeholder="Phenotype search..."
                autoFocus
                className="w-full py-3 pl-10 pr-9 bg-surface-input border border-border-default rounded-lg type-sm text-text-primary outline-none transition-all placeholder:text-text-muted"
                onFocus={e => { e.target.style.borderColor = 'var(--color-accent)'; e.target.style.boxShadow = '0 0 0 2px color-mix(in srgb, var(--color-accent) 20%, transparent)'; }}
                onBlur={e  => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
              />
              {query && (
                <button
                  onClick={() => { setSearchedPhenotype(''); setPhenotypeSearchGene(null); }}
                  className="absolute right-2.5 bg-transparent border-none text-text-muted text-lg cursor-pointer px-2 py-1 hover:text-text-primary"
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
                      className="py-1 px-3 bg-surface-hover border border-border-default text-text-secondary type-caption cursor-pointer transition-all hover:bg-surface-selected hover:text-text-primary"
                      style={{ borderRadius: 'var(--radius-md)' }}
                    >
                      {s.term}
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
            <DataRow label="Source model" value="Yeast-GEM 8.6" />
            <DataRow label="Flavor data" value="GoodScents" />
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
                  className="flex justify-between items-center w-full py-2.5 px-3 bg-transparent border-none rounded-md text-text-primary type-caption cursor-pointer transition-colors text-left hover:bg-surface-hover"
                >
                  <span>{desc}</span>
                  <span className="type-caption text-text-muted">{count} genes</span>
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
              <>Genes producing '<span style={{ color: 'var(--color-success)' }}>{query}</span>' compounds</>
            ) : 'Search Results'}
          </span>
          {results.length > 0 && <span style={{ color: 'var(--color-success)' }}>{results.length} genes found</span>}
        </CardHeader>

        {!query ? (
          <EmptyState>Search results will appear here</EmptyState>
        ) : results.length === 0 ? (
          <EmptyState>No matching genes</EmptyState>
        ) : (
          <div className="p-3 overflow-y-auto flex flex-col gap-2">
            {results.map((gene, idx) => (
              <Selectable
                key={gene.gene_id}
                selected={selectedGene === gene.gene_id}
                onClick={() => setPhenotypeSearchGene(gene.gene_id)}
                className="p-3.5 px-4 border border-border-subtle"
              >
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="type-caption text-text-muted min-w-[20px]">#{idx + 1}</div>
                  <div className="flex items-baseline gap-2 flex-1">
                    <span className="type-gene" style={{ color: 'var(--color-success)' }}>{gene.gene_name || gene.gene_id}</span>
                    <span className="type-mono text-text-muted">{gene.gene_name ? gene.gene_id : ''}</span>
                  </div>
                  {gene.highlight && <Badge variant="keyGene">Key Gene</Badge>}
                </div>
                {gene.full_name && (
                  <div className="type-sm mb-2.5 ml-8">{gene.full_name}</div>
                )}
                <div className="flex flex-wrap gap-1.5 ml-8">
                  {gene.matchingCompounds.slice(0, 3).map(c => (
                    <div key={c.page_id} className="flex flex-col py-1.5 px-2.5 bg-surface-selected type-caption">
                      <span className="text-text-primary">{c.name}</span>
                      {c.note && <span className="type-caption mt-0.5" style={{ color: 'var(--color-success)' }}>{c.note}</span>}
                    </div>
                  ))}
                  {gene.matchingCompounds.length > 3 && (
                    <div className="py-1.5 px-2.5 text-text-muted type-caption">+{gene.matchingCompounds.length - 3} more</div>
                  )}
                </div>
              </Selectable>
            ))}
          </div>
        )}
      </Card>

      {/* Right: Gene Details */}
      <Card
        className="flex flex-col min-h-0 transition-colors duration-200"
        style={selectedGeneData ? { borderColor: 'color-mix(in srgb, var(--color-success) 20%, transparent)' } : undefined}
      >
        <CardHeader>Gene Details</CardHeader>
        {selectedGeneData ? (
          <div className="p-4 overflow-y-auto flex-1">
            {/* Header */}
            <div className="mb-4 pb-3 border-b border-border-subtle">
              <div className="type-gene" style={{ color: 'var(--color-success)' }}>{selectedGeneData.gene_name || selectedGeneData.gene_id}</div>
              {selectedGeneData.gene_name && <div className="type-mono mt-0.5">{selectedGeneData.gene_id}</div>}
              {selectedGeneData.full_name && <div className="type-sm text-text-secondary mt-1.5">{selectedGeneData.full_name}</div>}
            </div>

            {/* Importance */}
            {selectedGeneData.importance && (
              <div className="callout mb-4 type-sm leading-snug" style={{ '--callout-color': 'var(--color-success)', color: 'var(--color-success)' }}>
                {selectedGeneData.importance}
              </div>
            )}

            {/* Compounds */}
            <div className="mb-5">
              <div className="type-label mb-2.5">
                Compounds Produced ({selectedGeneData.compounds.length})
              </div>
              <div className="flex flex-col gap-3">
                {selectedGeneData.compounds.map(c => (
                  <div key={c.page_id} className="py-2.5 px-3 bg-surface-input rounded-md">
                    <div className="type-body mb-1">{c.name}</div>
                    {c.note && <div className="type-caption italic mb-1.5" style={{ color: 'var(--color-success)' }}>{c.note}</div>}
                    {c.odor?.length > 0 && (
                      <div className="flex gap-2 type-sm mt-1">
                        <span className="text-text-muted shrink-0">Odor:</span>
                        <span className="text-text-secondary">
                          {c.odor.slice(0, 6).map((o, i) => (
                            <span
                              key={o}
                              style={o.toLowerCase().includes(query.toLowerCase()) ? { color: 'var(--color-warning)', fontWeight: 500 } : undefined}
                            >
                              {o}{i < Math.min(c.odor.length, 6) - 1 ? ', ' : ''}
                            </span>
                          ))}
                          {c.odor.length > 6 && <span className="text-text-muted ml-1">+{c.odor.length - 6}</span>}
                        </span>
                      </div>
                    )}
                    {c.flavor?.length > 0 && (
                      <div className="flex gap-2 type-sm mt-1">
                        <span className="text-text-muted shrink-0">Flavor:</span>
                        <span className="text-text-secondary">
                          {c.flavor.slice(0, 6).map((f, i) => (
                            <span
                              key={f}
                              style={f.toLowerCase().includes(query.toLowerCase()) ? { color: 'var(--color-warning)', fontWeight: 500 } : undefined}
                            >
                              {f}{i < Math.min(c.flavor.length, 6) - 1 ? ', ' : ''}
                            </span>
                          ))}
                          {c.flavor.length > 6 && <span className="text-text-muted ml-1">+{c.flavor.length - 6}</span>}
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
                  <span className="type-caption text-text-muted">Odors</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedGeneData.all_odors.slice(0, 12).map(o => {
                      const isMatch = o.toLowerCase().includes(query.toLowerCase());
                      return (
                        <span
                          key={o}
                          className="px-2 py-0.5 rounded type-caption"
                          style={isMatch
                            ? { background: 'color-mix(in srgb, var(--color-warning) 20%, transparent)', color: 'var(--color-warning)' }
                            : { background: 'var(--surface-hover)', color: 'var(--text-secondary)' }
                          }
                        >{o}</span>
                      );
                    })}
                    {selectedGeneData.all_odors.length > 12 && <span className="px-2 py-0.5 type-caption text-text-muted">+{selectedGeneData.all_odors.length - 12}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="type-caption text-text-muted">Flavors</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedGeneData.all_flavors.slice(0, 12).map(f => {
                      const isMatch = f.toLowerCase().includes(query.toLowerCase());
                      return (
                        <span
                          key={f}
                          className="px-2 py-0.5 rounded type-caption"
                          style={isMatch
                            ? { background: 'color-mix(in srgb, var(--color-warning) 20%, transparent)', color: 'var(--color-warning)' }
                            : { background: 'var(--surface-hover)', color: 'var(--text-secondary)' }
                          }
                        >{f}</span>
                      );
                    })}
                    {selectedGeneData.all_flavors.length > 12 && <span className="px-2 py-0.5 type-caption text-text-muted">+{selectedGeneData.all_flavors.length - 12}</span>}
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
