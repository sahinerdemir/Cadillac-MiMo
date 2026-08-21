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

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (!kvUrl || !kvToken) {
    return response.status(500).json({ 
      error: 'Vercel KV database is not connected. Please connect a KV database in your Vercel project dashboard.' 
    });
  }

  try {
    // Save updated guest instructions JSON to Vercel KV using REST command API
    const dbResponse = await fetch(kvUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${kvToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(["SET", "guest_instructions", JSON.stringify(body)])
    });
    
    const result = await dbResponse.json();
    
    if (result && result.error) {
      return response.status(500).json({ error: `Database write failed: ${result.error}` });
    }

    return response.status(200).json({ message: 'Instructions updated successfully!' });
  } catch (error) {
    console.error("KV save error:", error);
    return response.status(500).json({ error: 'Failed to persist updates to the database.' });
  }
}
