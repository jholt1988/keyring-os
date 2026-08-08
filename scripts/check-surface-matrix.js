const matrix = [
  // Feature → expected pattern (wild‑card)
  ['Authentication',      ['app/(admin)/login', 'app/(tenant)/login', 'pages/api/auth']],
  ['Property',           ['app/(admin)/properties', 'app/(tenant)/properties']],
  ['Leases',             ['app/(admin)/leases', 'app/(tenant)/leases']],
  ['Payments',           ['app/(admin)/payments', 'app/(tenant)/payments']],
  ['Maintenance',        ['app/(admin)/maintenance', 'app/(tenant)/maintenance']],
  ['Decisions',          ['app/(admin)/decisions']],
  ['Chat',               ['ChatWindow', 'NotificationFeed']],
  ['Dashboard',          ['app/(admin)/dashboard']],
  ['UserRoles',          ['app/(admin)/users', 'app/(admin)/roles']],
  ['Settings',           ['app/(admin)/settings']],
  ['OpenAPI',            ['src/lib/operator/api/generated/schema.ts']],
  ['Profile',            ['app/(tenant)/profile']],
  ['Notifications',      ['app/(tenant)/notifications']],
  ['i18n',               ['i18n', 'next-i18next.config.js']],
  ['HealthCheck',        ['pages/api/health']],
];

function matches(route, patterns) {
  return patterns.some(p => {
    // Convert simple wildcard “*” to RegExp
    const re = new RegExp('^' + p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\\\//g, '.*') + '$');
    return re.test(route);
  });
}

function report(section, routes) {
  console.log(`\n=== ${section} ===`);
  for (const [feat, pats] of matrix) {
    const found = routes.some(r => matches(r, pats));
    console.log(`${found ? '✔' : '✖'} ${feat}`);
  }
}

// Run the reporting for each bucket
report('ADMIN UI', uiPages.ADMIN);
report('TENANT UI', uiPages.TENANT);
report('API', apiRoutes);
report('SHARED‑UI', sharedComponents.map(c => `components/${c}`));