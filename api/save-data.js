import Redis from 'ioredis';

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
        throw new Error(`REST Error: ${restData.error}`);
      }
      return response.status(200).json({ message: 'Instructions updated successfully via REST!' });
    } catch (err) {
      console.error("KV REST save error:", err);
      errors.push(`REST: ${err.message}`);
    }
  }

  // 2. Attempt Save via Redis TCP (REDIS_URL) if configured
  if (process.env.REDIS_URL) {
    let client;
    try {
      client = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        connectTimeout: 5000,
        enableReadyCheck: false
      });

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

  // 3. If neither worked or neither is configured
  if (!kvUrl && !process.env.REDIS_URL) {
    return response.status(500).json({
      error: 'No database configured. Please add REDIS_URL or KV_REST_API_URL to your Vercel Environment Variables.'
    });
  }

  return response.status(500).json({
    error: `Failed to persist updates to the database (${errors.join(' | ')})`
  });
}
