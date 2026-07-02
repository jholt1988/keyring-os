const fs = require('fs');
const file = 'apps/admin/src/app/api/v2/[...path]/route.ts';
let c = fs.readFileSync(file, 'utf8');
c = c.replace(/secure: process\.env\.NODE_ENV === 'production',/g, "secure: request.nextUrl.protocol === 'https:',");
c = c.replace(/sameSite: 'strict',/g, "sameSite: 'lax',");
fs.writeFileSync(file, c);
