export default async function handler(request, response) {
  const allKeys = Object.keys(process.env);
  const relevantKeys = allKeys.filter(k => 
    /REDIS|KV|UPSTASH|STORAGE|DATABASE|MIRROR/i.test(k)
  );

  // Return only key names (not secret values) for security
  return response.status(200).json({
    matchingKeys: relevantKeys
  });
}
