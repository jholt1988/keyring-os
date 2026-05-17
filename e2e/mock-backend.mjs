import http from 'node:http';

const json = (res, code, body, headers = {}) => {
  res.writeHead(code, { 'content-type': 'application/json', ...headers });
  res.end(JSON.stringify(body));
};

const parseBody = (req) =>
  new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1:3001');

  if (url.pathname === '/health') {
    return json(res, 200, { ok: true });
  }

  if (url.pathname === '/api/auth/login' && req.method === 'POST') {
    const body = await parseBody(req);
    if (body.username === 'admin' && body.password === 'password123') {
      return json(res, 200, {
        access_token: 'access-token-e2e',
        refresh_token: 'refresh-token-e2e',
        user: { id: 'u1', username: 'admin', roles: ['ADMIN'] },
      });
    }
    return json(res, 401, { statusMessage: 'Invalid credentials' });
  }

  if (url.pathname === '/api/auth/me' && req.method === 'GET') {
    const auth = req.headers.authorization ?? '';
    if (auth === 'Bearer access-token-e2e') {
      return json(res, 200, { user: { id: 'u1', username: 'admin', roles: ['ADMIN'] } });
    }
    return json(res, 401, { statusMessage: 'Unauthorized' });
  }

  if (url.pathname === '/api/auth/logout' && req.method === 'POST') {
    return json(res, 200, { ok: true });
  }

  return json(res, 404, { statusMessage: 'Not found' });
});

server.listen(3001, '127.0.0.1');
