export default async function handler(req, res) {
  // Ngrok URL configuration
  const NGROK_URL = process.env.NGROK_URL || 'https://1a3b2ef0bf9c.ngrok-free.app';
  
  // Enable CORS with ngrok support
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001', 
    'https://localhost:3000',
    'https://localhost:3001',
    NGROK_URL,
    'https://1a3b2ef0bf9c.ngrok-free.app',
    'https://narc4s.vercel.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, ngrok-skip-browser-warning');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('ngrok-skip-browser-warning', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'NARC4S Backend',
    version: '2.0',
    ngrokUrl: NGROK_URL,
    environment: process.env.NODE_ENV || 'production',
    deployment: 'vercel'
  });
}
