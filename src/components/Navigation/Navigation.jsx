import { useEffect, useRef, useState } from 'react';
import styles from './Navigation.module.css';

const pages = ['Biochemistry', 'Epigenome', 'Flux Dynamics', 'Guide Design'];

export function Navigation({ activePage, setActivePage }) {
  const navRef = useRef(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const activeTab = nav.children[activePage];
    if (activeTab) {
      const navRect = nav.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      setIndicator({
        left: tabRect.left - navRect.left,
        width: tabRect.width,
      });
    }
  }, [activePage]);

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.logo}>AF</div>
        <div>
          <div className={styles.brandName}>atacflux</div>
          <div className={styles.brandTagline}>Metabolic Engineering Platform</div>
        </div>
      </div>

      <nav className={styles.nav} ref={navRef}>
        {pages.map((page, i) => (
          <button
            key={page}
            className={`${styles.navTab} ${activePage === i ? styles.active : ''}`}
            onClick={() => setActivePage(i)}
          >
            {page}
          </button>
        ))}
        <div
          className={styles.indicator}
          style={{
            left: indicator.left,
            width: indicator.width,
          }}
        />
      </nav>

      <div className={styles.version}>
        <span className="mono">v0.9.2-beta</span> • S. cerevisiae S288C
      </div>
    </header>
  );
}
