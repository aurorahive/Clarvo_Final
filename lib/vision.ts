const VISION_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY;

export async function scanReceiptImage(base64Image: string): Promise<{
  retailer?: string;
  date?: string;
  total?: string;
  items?: string[];
}> {
  const body = {
    requests: [{
      image: { content: base64Image },
      features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
    }],
  };

  const res = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );
  const data = await res.json();
  const text = data.responses?.[0]?.fullTextAnnotation?.text || '';
  
  // Parse common receipt patterns
  const dateMatch = text.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/);
  const totalMatch = text.match(/(?:total|amount|£)\s*[£]?\s*(\d+\.\d{2})/i);
  const lines = text.split('\n').filter((l: string) => l.trim().length > 2);
  
  return {
    retailer: lines[0] || undefined,
    date: dateMatch?.[0],
    total: totalMatch?.[1],
    items: lines.slice(1, 6),
  };
}

export async function detectProductLabel(base64Image: string): Promise<{
  labels: string[];
  logoDescription?: string;
}> {
  const body = {
    requests: [{
      image: { content: base64Image },
      features: [
        { type: 'LABEL_DETECTION', maxResults: 5 },
        { type: 'LOGO_DETECTION', maxResults: 2 },
      ],
    }],
  };

  const res = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );
  const data = await res.json();
  const labels = data.responses?.[0]?.labelAnnotations?.map((l: any) => l.description) || [];
  const logo = data.responses?.[0]?.logoAnnotations?.[0]?.description;
  
  return { labels, logoDescription: logo };
}
