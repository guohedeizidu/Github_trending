import express from 'express';
import { HttpsProxyAgent } from 'https-proxy-agent';
import https from 'https';
import http from 'http';

const app = express();
const PORT = 3001;
const PROXY_URL = process.env.HTTP_PROXY || 'http://127.0.0.1:7890';

app.use(express.json({ limit: '100kb' }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Proxy AI API requests — must be before function definitions due to Express 5 routing
app.use('/api/ai', async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { apiUrl, apiKey, model, messages, temperature } = req.body;
  console.log(`[AI Chat] apiUrl: ${apiUrl} | model: ${model}`);
  if (!apiUrl || !apiKey || !model) {
    return res.status(400).json({ error: 'Missing apiUrl, apiKey, or model' });
  }

  let url;
  if (apiUrl.includes('/chat/completions')) {
    url = apiUrl;
  } else if (apiUrl.endsWith('/v1') || apiUrl.endsWith('/v1/')) {
    url = apiUrl.replace(/\/$/, '') + '/chat/completions';
  } else {
    url = apiUrl.replace(/\/$/, '') + '/v1/chat/completions';
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };
  const body = JSON.stringify({ model, messages, temperature: temperature ?? 0.3 });

  try {
    const data = await postViaProxy(url, headers, body);
    res.type('json').send(data);
  } catch (e) {
    try {
      const data = await postDirect(url, headers, body);
      res.type('json').send(data);
    } catch (e2) {
      res.status(500).json({ error: e2.message });
    }
  }
});

function fetchViaProxy(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const agent = new HttpsProxyAgent(PROXY_URL);
    const parsedUrl = new URL(url);
    const options = {
      agent,
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Host': parsedUrl.hostname,
        ...headers,
      },
    };

    const req = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.end();
  });
}

function fetchDirect(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Host': parsedUrl.hostname,
        ...headers,
      },
    };

    const req = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.end();
  });
}

function postViaProxy(url, headers = {}, body = '') {
  return new Promise((resolve, reject) => {
    const agent = new HttpsProxyAgent(PROXY_URL);
    const parsedUrl = new URL(url);
    const options = {
      agent,
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Host': parsedUrl.hostname,
        ...headers,
      },
    };
    const req = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function postDirect(url, headers = {}, body = '') {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Host': parsedUrl.hostname,
        ...headers,
      },
    };
    const req = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

app.get('/', (req, res) => {
  res.json({ status: 'ok', endpoints: ['/api/trending', '/api/github/*'] });
});

app.get('/api/trending', async (req, res) => {
  const { since = 'daily', language = '' } = req.query;
  let url = 'https://github.com/trending';
  if (language) url += `/${language}`;
  url += `?since=${since}`;

  try {
    const html = await fetchViaProxy(url, { Accept: 'text/html' });
    res.send(html);
  } catch (e) {
    try {
      const html = await fetchDirect(url, { Accept: 'text/html' });
      res.send(html);
    } catch (e2) {
      res.status(500).json({ error: e2.message });
    }
  }
});

// Proxy GitHub API requests
app.use('/api/github', async (req, res) => {
  const path = req.url.startsWith('/') ? req.url.slice(1) : req.url;
  const url = `https://api.github.com/${path}`;
  const token = req.headers['x-github-token'];
  const headers = {
    Accept: req.headers['accept'] || 'application/vnd.github.v3+json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  console.log(`[GitHub API] ${url} | token: ${token ? 'yes' : 'no'}`);

  try {
    const data = await fetchViaProxy(url, headers);
    res.type(req.headers['accept']?.includes('raw') ? 'text' : 'json').send(data);
  } catch (e) {
    try {
      const data = await fetchDirect(url, headers);
      res.type(req.headers['accept']?.includes('raw') ? 'text' : 'json').send(data);
    } catch (e2) {
      res.status(500).json({ error: e2.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
  console.log(`Using proxy: ${PROXY_URL}`);
});
