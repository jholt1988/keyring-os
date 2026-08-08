
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

function walk(dir: string, prefix = '') {
  const entries = readdirSync(dir);
  const routes: string[] = [];
  for (const e of entries) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) {
      routes.push(...walk(p, ${prefix}/${e}));
    } else if (e.endsWith('.tsx') || e.endsWith('.ts') || e.endsWith('.js')) {
      // strip file extensions & index file handling
      let r = ${prefix}/${e.replace(/\.(tsx?|js)$/, '')};
      if (r.endsWith('/index')) r = r.replace(/\/index$/, '');
      routes.push(r);
    }
  }
  return routes;
}

const apps = ['admin', 'tenant-portal'];
for (const app of apps) {
  const base = join(process.cwd(), 'apps', app, 'src/pages');
  console.log(\n=== ${app.toUpperCase()} routes ===);
  const routes = walk(base);
  routes.sort().forEach(r => console.log(r));
}
