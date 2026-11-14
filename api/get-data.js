import fs from 'fs';
import path from 'path';
import Redis from 'ioredis';

export default async function handler(request, response) {
  // CORS Headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // 1. Try reading via Upstash / Vercel KV REST API
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
        body: JSON.stringify(["GET", "guest_instructions"])
      });
      const data = await restRes.json();
      if (data && data.result) {
        const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
        return response.status(200).json(parsed);
      }
    } catch (err) {
      console.error("KV REST read error:", err);
    }
  }

  // 2. Try reading via Redis TCP (REDIS_URL)
  if (process.env.REDIS_URL) {
    let client;
    try {
      client = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        connectTimeout: 5000,
        enableReadyCheck: false
      });
      const data = await client.get("guest_instructions");
      if (data) {
        const parsed = JSON.parse(data);
        return response.status(200).json(parsed);
      }
    } catch (err) {
      console.error("Redis TCP read error:", err);
    } finally {
      if (client) {
        try { client.disconnect(); } catch (_) {}
      }
    }
  }

  // 3. Fallback to local instructions/data.json or root data.json
  try {
    let filePath = path.join(process.cwd(), 'instructions', 'data.json');
    if (!fs.existsSync(filePath)) {
      filePath = path.join(process.cwd(), 'data.json');
    }
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(fileContent);
    return response.status(200).json(parsed);
  } catch (error) {
    console.error("Local file read error:", error);
    return response.status(500).json({ error: "Failed to load stay instructions." });
  }
}
