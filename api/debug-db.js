import Redis from 'ioredis';

export default async function handler(request, response) {
  let redisHost = null;
  let redisPort = null;
  let redisProto = null;

  if (process.env.REDIS_URL) {
    try {
      const u = new URL(process.env.REDIS_URL);
      redisHost = u.hostname;
      redisPort = u.port;
      redisProto = u.protocol;
    } catch (_) {}
  }

  const results = {
    envCheck: {
      has_KV_REST_API_URL: !!process.env.KV_REST_API_URL,
      has_KV_URL: !!process.env.KV_URL,
      has_REDIS_URL: !!process.env.REDIS_URL,
      redisHost,
      redisPort,
      redisProto
    }
  };

  // Detailed connection attempt with error code
  if (process.env.REDIS_URL) {
    let c;
    try {
      const isTls = redisProto === 'rediss:';
      c = new Redis(process.env.REDIS_URL, {
        connectTimeout: 5000,
        maxRetriesPerRequest: 1,
        tls: isTls ? { rejectUnauthorized: false } : undefined,
        retryStrategy: () => null
      });

      const pong = await c.ping();
      results.test = { success: true, pong };
    } catch (e) {
      results.test = {
        success: false,
        name: e.name,
        message: e.message,
        code: e.code,
        errno: e.errno,
        syscall: e.syscall
      };
    } finally {
      if (c) try { c.disconnect(); } catch (_) {}
    }
  }

  return response.status(200).json(results);
}
