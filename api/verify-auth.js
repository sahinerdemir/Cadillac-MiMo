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

  // Extract password from Authorization header or body
  const authHeader = request.headers.authorization || '';
  let inputPassword = authHeader.replace(/^Bearer\s+/i, '').trim();
  
  if (!inputPassword && request.body && typeof request.body === 'object') {
    inputPassword = (request.body.password || '').trim();
  }

  const expectedPassword = (process.env.ADMIN_PASSWORD || 'cadillac5201').trim();

  if (!inputPassword) {
    return response.status(400).json({ error: 'Password is required' });
  }

  const isMatch = inputPassword === expectedPassword || 
                  inputPassword.toLowerCase() === expectedPassword.toLowerCase();

  if (!isMatch) {
    return response.status(401).json({ error: 'Incorrect password. Access denied.' });
  }

  return response.status(200).json({ success: true, message: 'Authentication successful.' });
}
