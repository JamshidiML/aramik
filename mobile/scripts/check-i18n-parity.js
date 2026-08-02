/**
 * QC tool: verifies that de.json and en.json contain exactly the same keys.
 * Run: node scripts/check-i18n-parity.js
 * This script must run in CI; if it fails, the PR must not be merged.
 */
const de = require('../src/i18n/locales/de.json');
const en = require('../src/i18n/locales/en.json');

function flatten(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [key, val]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof val === 'object' && val !== null) {
      Object.assign(acc, flatten(val, path));
    } else {
      acc[path] = true;
    }
    return acc;
  }, {});
}

const deKeys = Object.keys(flatten(de)).sort();
const enKeys = Object.keys(flatten(en)).sort();

const missingInEn = deKeys.filter((k) => !enKeys.includes(k));
const missingInDe = enKeys.filter((k) => !deKeys.includes(k));

if (missingInEn.length || missingInDe.length) {
  console.error('❌ i18n parity check failed');
  if (missingInEn.length) console.error('Missing in en.json:', missingInEn);
  if (missingInDe.length) console.error('Missing in de.json:', missingInDe);
  process.exit(1);
} else {
  console.log(`✅ i18n parity OK (${deKeys.length} keys in both languages)`);
}
