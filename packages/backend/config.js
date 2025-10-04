// Backend Configuration
export const config = {
  // Ngrok Configuration
  ngrok: {
    url: process.env.NGROK_URL || 'https://1a3b2ef0bf9c.ngrok-free.app',
    skipBrowserWarning: true
  },
  
  // Server Configuration
  server: {
    port: process.env.PORT || 3001,
    environment: process.env.NODE_ENV || 'development'
  },
  
  // CORS Configuration
  cors: {
    allowedOrigins: [
      'http://localhost:3000',
      'http://localhost:3001', 
      'https://localhost:3000',
      'https://localhost:3001',
      process.env.NGROK_URL || 'https://1a3b2ef0bf9c.ngrok-free.app',
      'https://1a3b2ef0bf9c.ngrok-free.app',
      'https://narc4s.vercel.app',
      'https://*.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
    credentials: true
  },
  
  // Twitter API Configuration
  twitter: {
    apiKey: process.env.TWITTER_API_KEY,
    apiKeySecret: process.env.TWITTER_API_KEY_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    bearerToken: process.env.TWITTER_BEARER_TOKEN
  }
};

// Helper function to get backend URL
export function getBackendUrl() {
  return process.env.BACKEND_URL || config.ngrok.url;
}

// Helper function to setup CORS headers
export function setupCorsHeaders(res, req) {
  const origin = req.headers.origin;
  
  if (config.cors.allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', config.cors.methods.join(', '));
  res.setHeader('Access-Control-Allow-Headers', config.cors.allowedHeaders.join(', '));
  res.setHeader('Access-Control-Allow-Credentials', config.cors.credentials);
  
  if (config.ngrok.skipBrowserWarning) {
    res.setHeader('ngrok-skip-browser-warning', 'true');
  }
}
