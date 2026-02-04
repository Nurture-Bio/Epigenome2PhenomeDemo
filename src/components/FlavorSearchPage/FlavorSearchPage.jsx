import { useMemo, useState } from 'react';
import { geneFlavorMap, getDescriptorStats, searchByDescriptor, suggestedSearches } from '../../data/geneFlavorMap';
import sharedStyles from '../../styles/shared.module.css';
import styles from './FlavorSearchPage.module.css';

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
    <div className={styles.container}>
      {/* Left: Search Panel */}
      <div className={styles.searchPanel}>
        <div className={sharedStyles.panel}>
          <div className={sharedStyles.panelHeader}>Flavor Search</div>
          <div className={styles.searchContainer}>
            <div className={styles.searchInputWrapper}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedGene(null);
                }}
                placeholder="Search for a flavor (e.g., banana, peach, rancid)..."
                className={styles.searchInput}
                autoFocus
              />
              {query && (
                <button 
                  className={styles.clearButton}
                  onClick={() => {
                    setQuery('');
                    setSelectedGene(null);
                  }}
                >
                  ×
                </button>
              )}
            </div>
            
            {!query && (
              <div className={styles.suggestions}>
                <div className={styles.suggestionsLabel}>Try searching for:</div>
                <div className={styles.suggestionTags}>
                  {suggestedSearches.map(s => (
                    <button
                      key={s.term}
                      className={styles.suggestionTag}
                      onClick={() => handleSuggestionClick(s.term)}
                    >
                      <span>{s.emoji}</span>
                      <span>{s.term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Stats panel */}
        <div className={sharedStyles.panel} style={{ marginTop: 16 }}>
          <div className={sharedStyles.panelHeader}>Database</div>
          <div style={{ padding: 16 }}>
            <div className={sharedStyles.dataRow} style={{ padding: '6px 0' }}>
              <span className={sharedStyles.dataLabel}>Total genes</span>
              <span className={`${sharedStyles.dataValue} mono`}>{stats.totalGenes}</span>
            </div>
            <div className={sharedStyles.dataRow} style={{ padding: '6px 0' }}>
              <span className={sharedStyles.dataLabel}>Source model</span>
              <span className={sharedStyles.dataValue}>Yeast-GEM 8.6</span>
            </div>
            <div className={sharedStyles.dataRow} style={{ padding: '6px 0' }}>
              <span className={sharedStyles.dataLabel}>Flavor data</span>
              <span className={sharedStyles.dataValue}>GoodScents</span>
            </div>
          </div>
        </div>
        
        {/* Top descriptors */}
        {!query && (
          <div className={sharedStyles.panel} style={{ marginTop: 16, flex: 1 }}>
            <div className={sharedStyles.panelHeader}>Top Odor Descriptors</div>
            <div className={styles.descriptorList}>
              {stats.topOdors.slice(0, 8).map(([desc, count]) => (
                <button
                  key={desc}
                  className={styles.descriptorItem}
                  onClick={() => handleSuggestionClick(desc)}
                >
                  <span className={styles.descriptorName}>{desc}</span>
                  <span className={styles.descriptorCount}>{count} genes</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Center: Results */}
      <div className={`${sharedStyles.panel} ${styles.resultsPanel}`}>
        <div className={sharedStyles.panelHeader} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>
            {query ? (
              <>
                Genes producing '<span style={{ color: '#22c55e' }}>{query}</span>' compounds
              </>
            ) : (
              'Search Results'
            )}
          </span>
          {results.length > 0 && (
            <span style={{ color: '#22c55e' }}>{results.length} genes found</span>
          )}
        </div>
        
        {!query ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyTitle}>Search for a flavor profile</div>
            <div className={styles.emptyText}>
              Enter a descriptor like "banana" to find genes that produce compounds with that flavor or aroma.
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <div className={styles.emptyTitle}>No genes found</div>
            <div className={styles.emptyText}>
              Try a different search term like: fruity, floral, sweet, or rancid
            </div>
          </div>
        ) : (
          <div className={styles.resultsList}>
            {results.map((gene, idx) => (
              <div
                key={gene.gene_id}
                className={`${styles.resultCard} ${sharedStyles.selectable} ${selectedGene === gene.gene_id ? sharedStyles.selected : ''} ${gene.highlight ? styles.resultCardHighlight : ''}`}
                onClick={() => setSelectedGene(gene.gene_id)}
              >
                <div className={styles.resultHeader}>
                  <div className={styles.resultRank}>#{idx + 1}</div>
                  <div className={styles.geneInfo}>
                    <span className={`mono ${styles.geneName}`}>{gene.gene_name || gene.gene_id}</span>
                    <span className={`mono ${styles.geneId}`}>{gene.gene_name ? gene.gene_id : ''}</span>
                  </div>
                  {gene.highlight && (
                    <span className={styles.keyGeneBadge}>⭐ Key Gene</span>
                  )}
                </div>
                {gene.full_name && (
                  <div className={styles.fullName}>{gene.full_name}</div>
                )}
                <div className={styles.compoundsList}>
                  {gene.matchingCompounds.slice(0, 3).map(c => (
                    <div key={c.page_id} className={styles.compoundTag}>
                      <span className={styles.compoundName}>{c.name}</span>
                      {c.note && <span className={styles.compoundNote}>{c.note}</span>}
                    </div>
                  ))}
                  {gene.matchingCompounds.length > 3 && (
                    <div className={styles.moreCompounds}>
                      +{gene.matchingCompounds.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Right: Gene Details */}
      <div className={`${sharedStyles.panel} ${styles.detailsPanel} ${selectedGeneData ? styles.detailsPanelActive : ''}`}>
        <div className={sharedStyles.panelHeader}>Gene Details</div>
        {selectedGeneData ? (
          <div className={styles.detailsContent}>
            <div className={styles.detailsHeader}>
              <div className={`mono ${styles.detailsGeneName}`}>
                {selectedGeneData.gene_name || selectedGeneData.gene_id}
              </div>
              {selectedGeneData.gene_name && (
                <div className={`mono ${styles.detailsGeneId}`}>{selectedGeneData.gene_id}</div>
              )}
              {selectedGeneData.full_name && (
                <div className={styles.detailsFullName}>{selectedGeneData.full_name}</div>
              )}
            </div>
            
            {selectedGeneData.importance && (
              <div className={styles.importanceBox}>
                <span className={styles.importanceIcon}>💡</span>
                <span>{selectedGeneData.importance}</span>
              </div>
            )}
            
            <div className={styles.detailsSection}>
              <div className={styles.sectionTitle}>Compounds Produced ({selectedGeneData.compounds.length})</div>
              <div className={styles.compoundsDetail}>
                {selectedGeneData.compounds.map(c => (
                  <div key={c.page_id} className={styles.compoundDetail}>
                    <div className={styles.compoundDetailName}>{c.name}</div>
                    {c.note && <div className={styles.compoundDetailNote}>{c.note}</div>}
                    {c.odor?.length > 0 && (
                      <div className={styles.descriptorRow}>
                        <span className={styles.descriptorLabel}>Odor:</span>
                        <span className={styles.descriptorValues}>
                          {c.odor.slice(0, 6).map((o, i) => (
                            <span 
                              key={o} 
                              className={`${styles.descriptorValue} ${o.toLowerCase().includes(query.toLowerCase()) ? styles.descriptorMatch : ''}`}
                            >
                              {o}{i < Math.min(c.odor.length, 6) - 1 ? ', ' : ''}
                            </span>
                          ))}
                          {c.odor.length > 6 && <span className={styles.descriptorMore}>+{c.odor.length - 6}</span>}
                        </span>
                      </div>
                    )}
                    {c.flavor?.length > 0 && (
                      <div className={styles.descriptorRow}>
                        <span className={styles.descriptorLabel}>Flavor:</span>
                        <span className={styles.descriptorValues}>
                          {c.flavor.slice(0, 6).map((f, i) => (
                            <span 
                              key={f} 
                              className={`${styles.descriptorValue} ${f.toLowerCase().includes(query.toLowerCase()) ? styles.descriptorMatch : ''}`}
                            >
                              {f}{i < Math.min(c.flavor.length, 6) - 1 ? ', ' : ''}
                            </span>
                          ))}
                          {c.flavor.length > 6 && <span className={styles.descriptorMore}>+{c.flavor.length - 6}</span>}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className={styles.detailsSection}>
              <div className={styles.sectionTitle}>All Descriptors</div>
              <div className={styles.allDescriptors}>
                <div className={styles.descriptorCategory}>
                  <span className={styles.categoryLabel}>Odors</span>
                  <div className={styles.categoryTags}>
                    {selectedGeneData.all_odors.slice(0, 12).map(o => (
                      <span 
                        key={o} 
                        className={`${styles.categoryTag} ${o.toLowerCase().includes(query.toLowerCase()) ? styles.categoryTagMatch : ''}`}
                      >
                        {o}
                      </span>
                    ))}
                    {selectedGeneData.all_odors.length > 12 && (
                      <span className={styles.categoryMore}>+{selectedGeneData.all_odors.length - 12}</span>
                    )}
                  </div>
                </div>
                <div className={styles.descriptorCategory}>
                  <span className={styles.categoryLabel}>Flavors</span>
                  <div className={styles.categoryTags}>
                    {selectedGeneData.all_flavors.slice(0, 12).map(f => (
                      <span 
                        key={f} 
                        className={`${styles.categoryTag} ${f.toLowerCase().includes(query.toLowerCase()) ? styles.categoryTagMatch : ''}`}
                      >
                        {f}
                      </span>
                    ))}
                    {selectedGeneData.all_flavors.length > 12 && (
                      <span className={styles.categoryMore}>+{selectedGeneData.all_flavors.length - 12}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.detailsEmpty}>
            ← Select a gene to see compound details
          </div>
        )}
      </div>
    </div>
  );
}
