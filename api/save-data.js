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
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  // Validate authentication
  const authHeader = request.headers.authorization;
  const password = authHeader ? authHeader.replace('Bearer ', '') : '';
  const adminPassword = process.env.ADMIN_PASSWORD || 'cadillac5201';

  if (password !== adminPassword) {
    return response.status(401).json({ error: 'Unauthorized: Incorrect password' });
  }

  // Validate body payload
  const body = request.body;
  if (!body || typeof body !== 'object') {
    return response.status(400).json({ error: 'Bad Request: Missing data payload' });
  }

  if (!redis) {
    return response.status(500).json({ 
      error: 'Redis database is not connected. Please verify the REDIS_URL environment variable in your Vercel project.' 
    });
  }

  try {
    // Save updated guest instructions JSON to Redis TCP
    await redis.set("guest_instructions", JSON.stringify(body));
    return response.status(200).json({ message: 'Instructions updated successfully!' });
  } catch (error) {
    console.error("Redis save error:", error);
    return response.status(500).json({ error: 'Failed to persist updates to the database.' });
  }
}
