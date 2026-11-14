import Redis from 'ioredis';

function createRedisClient(url) {
  const isTls = typeof url === 'string' && url.startsWith('rediss://');
  const opts = {
    maxRetriesPerRequest: 1,
    connectTimeout: 5000,
    enableReadyCheck: false,
    retryStrategy: () => null // do not retry endlessly
  };
  if (isTls) {
    opts.tls = { rejectUnauthorized: false };
  }
  return new Redis(url, opts);
}

export default async function handler(request, response) {
  // CORS Headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  // Validate authentication
  const authHeader = request.headers.authorization || '';
  const password = authHeader.replace(/^Bearer\s+/i, '').trim();
  const adminPassword = (process.env.ADMIN_PASSWORD || 'cadillac5201').trim();

  const isMatch = password && (password === adminPassword || password.toLowerCase() === adminPassword.toLowerCase());

  if (!isMatch) {
    return response.status(401).json({ error: 'Unauthorized: Incorrect password' });
  }

  // Validate body payload
  const body = request.body;
  if (!body || typeof body !== 'object') {
    return response.status(400).json({ error: 'Bad Request: Missing data payload' });
  }

  const payloadString = JSON.stringify(body);
  const errors = [];

  // 1. Attempt Save via Upstash / Vercel KV REST API if configured
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (kvUrl && kvToken) {
    try {
      const restRes = await fetch(kvUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${kvToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(["SET", "guest_instructions", payloadString])
      });
      const restData = await restRes.json();
      if (restData && restData.error) {
        throw new Error(`REST: ${restData.error}`);
      }
      return response.status(200).json({ message: 'Instructions updated successfully via REST!' });
    } catch (err) {
      console.error("KV REST save error:", err);
      errors.push(`REST: ${err.message}`);
    }
  }

  // 2. Attempt Save via KV_URL (Vercel KV standard TCP connection)
  const tcpUrls = [process.env.KV_URL, process.env.REDIS_URL].filter(Boolean);

  for (const url of tcpUrls) {
    let client;
    try {
      client = createRedisClient(url);
      await client.set("guest_instructions", payloadString);
      return response.status(200).json({ message: 'Instructions updated successfully via Redis TCP!' });
    } catch (err) {
      console.error("Redis TCP save error:", err);
      errors.push(`TCP: ${err.message}`);
    } finally {
      if (client) {
        try { client.disconnect(); } catch (_) {}
      }
    }
  }

  // 3. If no DB is configured or all attempts failed
  if (!kvUrl && tcpUrls.length === 0) {
    return response.status(500).json({
      error: 'No database configured. Please connect Vercel KV or add REDIS_URL to your Vercel project settings.'
    });
  }

  return response.status(500).json({
    error: `Failed to persist updates to the database (${errors.join(' | ')})`
  });
}
