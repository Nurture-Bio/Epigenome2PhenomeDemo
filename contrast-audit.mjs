/**
 * contrast-audit.mjs
 * Visits all 5 SPA pages via nav clicks, runs axe color-contrast rule on each.
 * Usage: node contrast-audit.mjs
 */

import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';

const BASE_URL = 'http://localhost:5180/Epigenome2PhenomeDemo/';
const CHROME_PATH = '/home/ryan.ward/.cache/puppeteer/chrome/linux-145.0.7632.77/chrome-linux64/chrome';
const AXE_PATH = '/tmp/axe.min.js';

const axeSource = readFileSync(AXE_PATH, 'utf8');

const NAV_LABELS = [
  'Phenotype Search',
  'Metabolism',
  'Gene Topology',
  'Simulation',
  'Guide Design',
];

async function auditPage(page, label) {
  // Inject axe-core
  await page.evaluate(axeSource);

  // Run color-contrast rule only
  const results = await page.evaluate(() =>
    axe.run(document, { runOnly: ['color-contrast'] })
  );

  const violations = results.violations;
  if (violations.length === 0) {
    console.log(`  ✓ ${label}: 0 contrast violations`);
    return [];
  }

  console.log(`  ✗ ${label}: ${violations.length} violation(s)`);
  const issues = [];
  for (const v of violations) {
    for (const node of v.nodes) {
      const info = {
        page: label,
        rule: v.id,
        impact: v.impact,
        description: v.description,
        html: node.html.slice(0, 120),
        failureSummary: node.failureSummary,
      };
      issues.push(info);
      console.log(`    - ${info.impact}: ${info.failureSummary}`);
      console.log(`      HTML: ${info.html}`);
    }
  }
  return issues;
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log(`\nLoading ${BASE_URL}...`);
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const allIssues = [];

  // Find nav buttons
  const navButtons = await page.$$('header button, header [role="tab"], nav button');
  console.log(`Found ${navButtons.length} nav buttons`);

  // Audit each page by clicking nav tabs in order
  for (let i = 0; i < NAV_LABELS.length; i++) {
    const label = NAV_LABELS[i];

    // Click the i-th nav button
    try {
      // Get fresh list of buttons each time
      const buttons = await page.$$('header button:not([data-theme-toggle])');
      if (buttons[i]) {
        await buttons[i].click();
        await new Promise(r => setTimeout(r, 800));
      }
    } catch (e) {
      console.log(`  Could not click nav for ${label}: ${e.message}`);
    }

    const issues = await auditPage(page, label);
    allIssues.push(...issues);
  }

  await browser.close();

  console.log('\n========================================');
  if (allIssues.length === 0) {
    console.log('ALL CLEAR — 0 contrast violations across all 5 pages');
  } else {
    console.log(`TOTAL: ${allIssues.length} contrast violation(s) to fix`);
  }
  console.log('========================================\n');
}

main().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
