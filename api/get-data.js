import fs from 'fs';
import path from 'path';
import Redis from 'ioredis';

// Instantiate Redis TCP client globally for Vercel Serverless container reuse
let redis;
if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000
    });
  } catch (err) {
    console.error("Redis TCP initialization error:", err);
  }
}

export default async function handler(request, response) {
  // CORS Headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Retrieve stay instructions from Redis TCP
  if (redis) {
    try {
      const data = await redis.get("guest_instructions");
      if (data) {
        const parsed = JSON.parse(data);
        return response.status(200).json(parsed);
      }
    } catch (error) {
      console.error("Redis TCP read error, falling back to local file:", error);
    }
  }

  // Fallback to local instructions/data.json file
  try {
    const filePath = path.join(process.cwd(), 'instructions', 'data.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(fileContent);
    return response.status(200).json(parsed);
  } catch (error) {
    console.error("Local file read error:", error);
    return response.status(500).json({ error: "Failed to load stay instructions." });
  }
}
