const fs = require('fs');
const path = require('path');

function walk(dir, prefix = '') {
  const entries = fs.readdirSync(dir);
  const routes = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    if (fs.statSync(fullPath).isDirectory()) {
      routes.push(...walk(fullPath, `${prefix}/${entry}`));
    } else if (entry.endsWith('.tsx') || entry.endsWith('.ts') || entry.endsWith('.js')) {
      let route = `${prefix}/${entry.replace(/\.(tsx?|js)$/, '')}`;
      if (route.endsWith('/index')) {
        route = route.replace(/\/index$/, '');
      }
      routes.push(route);
    }
  }
  return routes;
}

const apps = ['admin', 'tenant-portal'];
for (const app of apps) {
  const base = path.join(process.cwd(), 'apps', app);
  console.log(`\n=== ${app.toUpperCase()} routes ===`);
  try {
    const routes = walk(base);
    routes.sort().forEach(r => console.log(r));
  } catch (e) {
    console.error('Failed to read', base, e.message);
  }
}
