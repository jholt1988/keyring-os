const fs = require('fs');
const file = 'apps/admin/src/app/api/v2/[...path]/route.ts';
let c = fs.readFileSync(file, 'utf8');
const target = "  if (token) headers.set('authorization', `Bearer ${token}`);";
const replacement = target + "\n  if (path === 'auth/me' && !token) {\n    return NextResponse.json({ statusMessage: 'Proxy: No auth_token cookie received from browser' }, { status: 401 });\n  }";
if (!c.includes("Proxy: No auth_token")) {
  c = c.replace(target, replacement);
  fs.writeFileSync(file, c);
}
