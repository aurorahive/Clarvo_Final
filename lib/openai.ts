const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export async function generateGuidance(productName: string, brand: string, category: string): Promise<string[]> {
  const prompt = `You are a product care expert. For a ${brand} ${productName} (category: ${category}), provide 5 practical ownership tips covering: cleaning, maintenance, common issues, safety, and longevity. Return as a JSON array of objects with fields: type (one of: cleaning, maintenance, troubleshooting, safety, usage_tip), title (short), content (2 sentences max). Be specific and practical.`;
  
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });
  const data = await res.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  return parsed.tips || parsed.guidance || [];
}

export async function getRepairAdvice(productName: string, issue: string): Promise<string> {
  const prompt = `A user owns a ${productName} and reports: "${issue}". In 3 sentences, advise whether to repair or replace it, mention typical repair cost range in GBP, and one practical next step. Be direct and helpful.`;
  
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });
  const data = await res.json();
  return data.choices[0].message.content;
}
