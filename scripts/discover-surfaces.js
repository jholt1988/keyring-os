const fs = require('fs');
const path = require('path');

function walk(dir, filter, prefix = '') {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir);
  const results = [];
  for (const e of entries) {
    const full = path.join(dir, e);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results.push(...walk(full, filter, `${prefix}/${e}`));
    } else if (filter(e)) {
      // Drop file extension for routes
      let r = `${prefix}/${e.replace(/\.(tsx?|js)$/, '')}`;
      // Strip trailing /index
      if (r.endsWith('/index')) r = r.replace(/\/index$/, '');
      results.push(r);
    }
  }
  return results;
}

// ── UI pages (Next 13 App Router) ─────────────────────────────
const adminApp = path.join(process.cwd(), 'apps', 'admin', 'src', 'app');
const tenantApp = path.join(process.cwd(), 'apps', 'tenant-portal', 'src', 'app');

const uiPages = {
  ADMIN: walk(adminApp, e => e.endsWith('.tsx') || e.endsWith('.ts')),
  TENANT: walk(tenantApp, e => e.endsWith('.tsx') || e.endsWith('.ts')),
};

// ── API routes (pages/api) ───────────────────────────────────────
const apiRoot = path.join(process.cwd(), 'pages', 'api');
const apiRoutes = walk(apiRoot, e => e.endsWith('.ts') || e.endsWith('.js'));

// ── Shared‑UI exported components (used as surfaces) ───────────────
const sharedUI = path.join(process.cwd(), 'packages', 'shared-ui', 'components');
const sharedComponents = fs.existsSync(sharedUI)
  ? fs.readdirSync(sharedUI).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'))
  : [];

console.log('=== UI PAGES ===');
Object.entries(uiPages).forEach(([app, routes]) => {
  console.log(`\n${app}:`);
  routes.sort().forEach(r => console.log(  `${r}`));
});

console.log('\n=== API ROUTES ===');
apiRoutes.sort().forEach(r => console.log(  `${r}`));

console.log('\n=== SHARED‑UI COMPONENTS ===');
sharedComponents.sort().forEach(c => console.log(  `${c}`));
