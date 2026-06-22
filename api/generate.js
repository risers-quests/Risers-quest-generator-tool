export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set. Add it in Vercel Project Settings → Environment Variables.' });
  const { system, user, maxTokens } = req.body || {};
  if (!system || !user) return res.status(400).json({ error: 'Missing system or user.' });
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: maxTokens || 2000, system, messages: [{ role: 'user', content: user }] })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || 'Anthropic API error' });
    const text = (data.content || []).map(b => b.text || '').join('\n');
    return res.status(200).json({ text });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
