import Redis from 'ioredis';

export default async function handler(request, response) {
  // Simple diagnostic endpoint to inspect DB env vars and test connections
  const envCheck = {
    has_KV_REST_API_URL: !!process.env.KV_REST_API_URL,
    has_KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
    has_KV_URL: !!process.env.KV_URL,
    has_REDIS_URL: !!process.env.REDIS_URL,
    has_UPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
    has_UPSTASH_REDIS_REST_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN,
  };

  const results = { envCheck, tests: {} };

  // Test KV REST if present
  const restUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const restToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (restUrl && restToken) {
    try {
      const r = await fetch(restUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${restToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(["PING"])
      });
      const data = await r.json();
      results.tests.rest = { success: true, response: data };
    } catch (e) {
      results.tests.rest = { success: false, error: e.message };
    }
  }

  // Test KV_URL if present
  if (process.env.KV_URL) {
    let c;
    try {
      c = new Redis(process.env.KV_URL, { connectTimeout: 3000, maxRetriesPerRequest: 1 });
      const pong = await c.ping();
      results.tests.KV_URL = { success: true, pong };
    } catch (e) {
      results.tests.KV_URL = { success: false, error: e.message };
    } finally {
      if (c) try { c.disconnect(); } catch (_) {}
    }
  }

  // Test REDIS_URL if present
  if (process.env.REDIS_URL) {
    let c;
    try {
      c = new Redis(process.env.REDIS_URL, { connectTimeout: 3000, maxRetriesPerRequest: 1 });
      const pong = await c.ping();
      results.tests.REDIS_URL = { success: true, pong };
    } catch (e) {
      results.tests.REDIS_URL = { success: false, error: e.message };
    } finally {
      if (c) try { c.disconnect(); } catch (_) {}
    }
  }

  return response.status(200).json(results);
}
