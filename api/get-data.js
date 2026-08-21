import fs from 'fs';
import path from 'path';

export default async function handler(request, response) {
  // CORS Headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  
  if (kvUrl && kvToken) {
    try {
      // Query Vercel KV REST API using command endpoint
      const res = await fetch(kvUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${kvToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(["GET", "guest_instructions"])
      });
      
      const data = await res.json();
      
      if (data && data.result) {
        const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
        return response.status(200).json(parsed);
      }
    } catch (error) {
      console.error("KV read error, falling back to local file:", error);
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
