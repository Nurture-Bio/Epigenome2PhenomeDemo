import { useEffect, useRef, useState } from 'react';

// Expected values from the original Navigation.module.css
const EXPECTED = {
  header: {
    paddingTop: '20px',
    paddingBottom: '20px',
    paddingLeft: '40px',
    paddingRight: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  logo: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
  },
  brandName: {
    fontSize: '16px',
    fontWeight: '600',
  },
  brandTagline: {
    fontSize: '11px',
  },
  nav: {
    display: 'flex',
    gap: '4px',
  },
  navTab: {
    paddingTop: '12px',
    paddingBottom: '12px',
    paddingLeft: '24px',
    paddingRight: '24px',
    fontSize: '13px',
    fontWeight: '500',
    letterSpacing: '0.5px',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    boxSizing: 'border-box',
    borderTopWidth: '0px',
    borderBottomWidth: '0px',
    borderLeftWidth: '0px',
    borderRightWidth: '0px',
  },
  version: {
    fontSize: '11px',
  },
};

function getComputed(el, props) {
  if (!el) return {};
  const cs = window.getComputedStyle(el);
  const result = {};
  for (const prop of props) {
    result[prop] = cs[prop];
  }
  return result;
}

function compare(actual, expected) {
  const results = [];
  for (const [prop, expectedVal] of Object.entries(expected)) {
    const actualVal = actual[prop] || '(not found)';
    // Normalize for comparison
    const norm = (v) => v.replace(/\s/g, '');
    const match = norm(actualVal) === norm(expectedVal);
    results.push({ prop, expected: expectedVal, actual: actualVal, match });
  }
  return results;
}

export function NavDiagnostic() {
  const [results, setResults] = useState(null);
  const measured = useRef(false);

  useEffect(() => {
    if (measured.current) return;
    measured.current = true;

    // Wait for render
    requestAnimationFrame(() => {
      setTimeout(() => {
        const header = document.querySelector('header');
        const brand = header?.querySelector(':scope > div:first-child');
        const logo = brand?.querySelector(':scope > div:first-child');
        const brandText = brand?.querySelector(':scope > div:last-child');
        const brandName = brandText?.querySelector(':scope > div:first-child');
        const brandTagline = brandText?.querySelector(':scope > div:last-child');
        const nav = header?.querySelector('nav');
        const navTabs = nav ? Array.from(nav.querySelectorAll('button')) : [];
        const version = header?.querySelector(':scope > div:last-child');

        const data = {};

        data.header = compare(
          getComputed(header, Object.keys(EXPECTED.header)),
          EXPECTED.header
        );
        data.brand = compare(
          getComputed(brand, Object.keys(EXPECTED.brand)),
          EXPECTED.brand
        );
        data.logo = compare(
          getComputed(logo, Object.keys(EXPECTED.logo)),
          EXPECTED.logo
        );
        data.brandName = compare(
          getComputed(brandName, Object.keys(EXPECTED.brandName)),
          EXPECTED.brandName
        );
        data.brandTagline = compare(
          getComputed(brandTagline, Object.keys(EXPECTED.brandTagline)),
          EXPECTED.brandTagline
        );
        data.nav = compare(
          getComputed(nav, Object.keys(EXPECTED.nav)),
          EXPECTED.nav
        );

        // Check all tabs
        data.navTabs = navTabs.map((tab, i) => ({
          text: tab.textContent,
          results: compare(
            getComputed(tab, Object.keys(EXPECTED.navTab)),
            EXPECTED.navTab
          ),
        }));

        data.version = compare(
          getComputed(version, Object.keys(EXPECTED.version)),
          EXPECTED.version
        );

        // Count failures
        let totalChecks = 0;
        let failures = 0;
        const allSections = [data.header, data.brand, data.logo, data.brandName, data.brandTagline, data.nav, data.version];
        allSections.forEach(section => {
          section.forEach(r => { totalChecks++; if (!r.match) failures++; });
        });
        data.navTabs.forEach(tab => {
          tab.results.forEach(r => { totalChecks++; if (!r.match) failures++; });
        });

        data.summary = { totalChecks, failures, pass: failures === 0 };

        // Also capture actual rendered dimensions and font info
        data.dimensions = {};
        const elements = { header, brand, logo, nav };
        for (const [name, el] of Object.entries(elements)) {
          if (el) {
            const rect = el.getBoundingClientRect();
            data.dimensions[name] = {
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            };
          }
        }
        data.tabDimensions = navTabs.map(tab => {
          const rect = tab.getBoundingClientRect();
          const cs = window.getComputedStyle(tab);
          return {
            text: tab.textContent,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            fontFamily: cs.fontFamily,
            lineHeight: cs.lineHeight,
            display: cs.display,
          };
        });

        // Check total nav spacing: sum of tab widths + gaps vs actual nav width
        const navRect = nav?.getBoundingClientRect();
        const tabWidthSum = navTabs.reduce((sum, t) => sum + t.getBoundingClientRect().width, 0);
        const navGap = nav ? parseFloat(window.getComputedStyle(nav).gap) || 0 : 0;
        const expectedNavWidth = tabWidthSum + navGap * (navTabs.length - 1);
        data.navLayout = {
          navActualWidth: Math.round(navRect?.width || 0),
          tabWidthSum: Math.round(tabWidthSum),
          gapCount: navTabs.length - 1,
          gapSize: navGap,
          expectedWidth: Math.round(expectedNavWidth),
        };

        setResults(data);
      }, 200);
    });
  }, []);

  if (!results) return null;

  const S = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, background: 'rgba(0,0,0,0.95)', overflow: 'auto', padding: 32, fontFamily: 'monospace', fontSize: 12, color: '#e2e8f0' },
    header: { fontSize: 18, fontWeight: 700, marginBottom: 16 },
    summary: { padding: '12px 16px', borderRadius: 8, marginBottom: 24, fontSize: 14, fontWeight: 600 },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 4 },
    row: { display: 'flex', gap: 12, padding: '3px 0', alignItems: 'center' },
    prop: { width: 160, color: '#64748b' },
    expected: { width: 200, color: '#94a3b8' },
    actual: { width: 200 },
    pass: { color: '#22c55e' },
    fail: { color: '#ef4444', fontWeight: 700 },
    close: { position: 'fixed', top: 16, right: 16, background: '#334155', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', zIndex: 100000, fontSize: 13 },
  };

  const renderSection = (title, data) => (
    <div style={S.section}>
      <div style={S.sectionTitle}>{title}</div>
      {data.map((r, i) => (
        <div key={i} style={S.row}>
          <span style={r.match ? S.pass : S.fail}>{r.match ? '✓' : '✗'}</span>
          <span style={S.prop}>{r.prop}</span>
          <span style={S.expected}>expected: {r.expected}</span>
          <span style={{ ...S.actual, ...(r.match ? S.pass : S.fail) }}>actual: {r.actual}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div style={S.overlay} id="nav-diagnostic">
      <button style={S.close} onClick={() => document.getElementById('nav-diagnostic').remove()}>
        Close Diagnostic
      </button>
      <div style={S.header}>Navigation CSS Diagnostic</div>
      <div style={{
        ...S.summary,
        background: results.summary.pass ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
        border: `1px solid ${results.summary.pass ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
        color: results.summary.pass ? '#22c55e' : '#ef4444',
      }}>
        {results.summary.pass
          ? `ALL ${results.summary.totalChecks} CHECKS PASSED`
          : `${results.summary.failures} / ${results.summary.totalChecks} CHECKS FAILED`}
      </div>

      {renderSection('header', results.header)}
      {renderSection('brand (flex container)', results.brand)}
      {renderSection('logo', results.logo)}
      {renderSection('brandName', results.brandName)}
      {renderSection('brandTagline', results.brandTagline)}
      {renderSection('nav (flex container)', results.nav)}
      {results.navTabs.map((tab, i) => renderSection(`navTab[${i}]: "${tab.text}"`, tab.results))}
      {renderSection('version', results.version)}

      {/* Rendered Dimensions */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Rendered Dimensions (getBoundingClientRect)</div>
        {Object.entries(results.dimensions).map(([name, dim]) => (
          <div key={name} style={S.row}>
            <span style={{ width: 160, color: '#94a3b8' }}>{name}</span>
            <span>{dim.width}px × {dim.height}px</span>
          </div>
        ))}
      </div>

      <div style={S.section}>
        <div style={S.sectionTitle}>Tab Dimensions + Font Info</div>
        {results.tabDimensions.map((tab, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ color: '#94a3b8', marginBottom: 2 }}>"{tab.text}" — {tab.width}px × {tab.height}px</div>
            <div style={{ color: '#64748b', paddingLeft: 16 }}>
              font-family: {tab.fontFamily}<br/>
              line-height: {tab.lineHeight}<br/>
              display: {tab.display}
            </div>
          </div>
        ))}
      </div>

      <div style={S.section}>
        <div style={S.sectionTitle}>Nav Layout Math</div>
        <div style={S.row}><span style={S.prop}>nav actual width</span><span>{results.navLayout.navActualWidth}px</span></div>
        <div style={S.row}><span style={S.prop}>tab width sum</span><span>{results.navLayout.tabWidthSum}px</span></div>
        <div style={S.row}><span style={S.prop}>gaps</span><span>{results.navLayout.gapCount} × {results.navLayout.gapSize}px = {results.navLayout.gapCount * results.navLayout.gapSize}px</span></div>
        <div style={S.row}><span style={S.prop}>expected total</span><span>{results.navLayout.expectedWidth}px</span></div>
      </div>
    </div>
  );
}
