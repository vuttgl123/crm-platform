import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const allowlistPath = path.join(__dirname, 'english-only-allowlist.json');
let allowlist = [];
try {
  if (fs.existsSync(allowlistPath)) {
    const raw = JSON.parse(fs.readFileSync(allowlistPath, 'utf8'));
    allowlist = (raw.allowlist || []).map((item) => item.file.replace(/\\/g, '/'));
  }
} catch (e) {
  console.warn('Could not parse allowlist:', e.message);
}

const PROHIBITED_PATTERNS = [
  { name: 'Vietnamese date-fns locale', regex: /from ['"]date-fns\/locale\/vi['"]|from ['"]date-fns\/locale['"].*\bvi\b/ },
  { name: 'Hardcoded vi-VN locale tag', regex: /['"]vi-VN['"]/ },
  { name: 'Legacy locale preference storage key', regex: /vum_crm_locale_pref/ },
  { name: 'Deprecated AuthLanguageMenu component', regex: /AuthLanguageMenu/ },
  { name: 'Deprecated Vietnamese translation bundle reference', regex: /locales\/vi\/translation\.json/ },
];

let errorCount = 0;

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      if (['node_modules', 'dist', '.git', 'coverage'].includes(entry.name)) continue;
      scanDir(fullPath);
    } else if (entry.isFile()) {
      if (!/\.(tsx?|jsx?|json|html|css)$/.test(entry.name)) continue;
      if (allowlist.includes(relPath)) continue;

      const content = fs.readFileSync(fullPath, 'utf8');
      PROHIBITED_PATTERNS.forEach(({ name, regex }) => {
        if (regex.test(content)) {
          console.error(`[VIOLATION] ${relPath}: Found prohibited pattern "${name}"`);
          errorCount++;
        }
      });
    }
  }
}

console.log('--- Checking English-Only Architecture Rules ---');
scanDir(path.join(rootDir, 'src'));

if (fs.existsSync(path.join(rootDir, 'src', 'i18n', 'locales', 'vi'))) {
  console.error('[VIOLATION] Found deprecated directory: src/i18n/locales/vi');
  errorCount++;
}

if (errorCount > 0) {
  console.error(`\nFailed with ${errorCount} violation(s).`);
  process.exit(1);
} else {
  console.log('All English-only checks passed successfully (0 violations).');
  process.exit(0);
}
