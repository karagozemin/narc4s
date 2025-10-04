import { TwitterApi } from 'twitter-api-v2';
import crypto from 'crypto';

// Twitter API client
const createTwitterClient = () => {
  return new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_KEY_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    bearerToken: process.env.TWITTER_BEARER_TOKEN,
  });
};

// Helper functions
function extractTweetId(url) {
  const patterns = [
    /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/,
    /(\d{15,20})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function getRaffleTypeString(raffleType) {
  switch (parseInt(raffleType)) {
    case 0: return 'Likes';
    case 1: return 'Retweets';
    case 2: return 'Comments (soon)';
    default: return 'Unknown';
  }
}

async function getLikingUsers(tweetId) {
  const twitterClient = createTwitterClient();
  
  try {
    console.log(`Fetching likes for tweet ${tweetId}...`);
    
    const response = await twitterClient.v2.tweetLikedBy(tweetId, {
      max_results: 100,
      'user.fields': ['id', 'username', 'name', 'public_metrics']
    });

    console.log('Likes response:', response);

    if (!response.data || response.data.length === 0) {
      console.log('No likes found for this tweet');
      return [];
    }

    return response.data.map(user => ({
      id: user.id,
      username: user.username,
      name: user.name
    }));

  } catch (error) {
    console.error('Error fetching likes:', error);
    
    if (error.code === 429) {
      const resetTime = error.rateLimit?.reset ? new Date(error.rateLimit.reset * 1000).toLocaleTimeString() : 'unknown';
      throw new Error(`Twitter API rate limit exceeded. Try again after ${resetTime}`);
    }
    
    throw error;
  }
}

async function getRetweetingUsers(tweetId) {
  const twitterClient = createTwitterClient();
  
  try {
    console.log(`Fetching retweets for tweet ${tweetId}...`);
    
    const response = await twitterClient.v2.tweetRetweetedBy(tweetId, {
      max_results: 100,
      'user.fields': ['id', 'username', 'name', 'public_metrics']
    });

    console.log('Retweets response:', response);

    if (!response.data || response.data.length === 0) {
      console.log('No retweets found for this tweet');
      return [];
    }

    return response.data.map(user => ({
      id: user.id,
      username: user.username,
      name: user.name
    }));

  } catch (error) {
    console.error('Error fetching retweets:', error);
    
    if (error.code === 429) {
      const resetTime = error.rateLimit?.reset ? new Date(error.rateLimit.reset * 1000).toLocaleTimeString() : 'unknown';
      throw new Error(`Twitter API rate limit exceeded. Try again after ${resetTime}`);
    }
    
    throw error;
  }
}

// Main serverless function
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
    'https://narc4s.vercel.app',
    'https://narc4s-narc4s.vercel.app',
    'https://narc4s-git-main-narc4s.vercel.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, ngrok-skip-browser-warning');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('ngrok-skip-browser-warning', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { raffleId, tweetUrl, raffleType, winnerCount, backupCount, transactionHash } = req.body;
    
    if (!raffleId || !tweetUrl || raffleType === undefined || !winnerCount) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }
    
    const tweetId = extractTweetId(tweetUrl);
    if (!tweetId) {
      return res.status(400).json({ success: false, error: 'Invalid tweet URL' });
    }

    console.log(`Processing raffle ${raffleId} for tweet ${tweetId}, type: ${raffleType}`);
    console.log(`Winners: ${winnerCount}, Backups: ${backupCount || 0}`);

    let users = [];
    try {
      switch (parseInt(raffleType)) {
        case 0: // LIKES
          users = await getLikingUsers(tweetId);
          break;
        case 1: // RETWEETS
          users = await getRetweetingUsers(tweetId);
          break;
        case 2: // COMMENTS - Coming soon
          return res.status(400).json({
            success: false,
            error: 'Comments raffle feature is coming soon! Please use Likes or Retweets for now.'
          });
        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid raffle type'
          });
      }
    } catch (twitterError) {
      // Handle Twitter API specific errors
      if (twitterError.message && twitterError.message.includes('rate limit exceeded')) {
        return res.status(429).json({
          success: false,
          error: twitterError.message
        });
      }

      // Re-throw other errors to be handled by main catch block
      throw twitterError;
    }

    console.log(`Found ${users.length} users`);

    if (users.length === 0) {
      let errorMessage = 'No participants found for this tweet';
      if (parseInt(raffleType) === 0) errorMessage = 'No users found who liked this tweet. The tweet might be private or have no likes.';
      if (parseInt(raffleType) === 1) errorMessage = 'No users found who retweeted this tweet. The tweet might be private or have no retweets.';
      return res.status(404).json({ success: false, error: errorMessage });
    }

    if (users.length < winnerCount) {
      return res.status(400).json({
        success: false,
        error: `Not enough participants. Found ${users.length}, need ${winnerCount}`
      });
    }

    // Randomly select winners and backups using VRF-based randomness
    // Get randomness from the transaction hash (contains VRF randomness)
    const vrfSeed = transactionHash || Date.now().toString();
    const randomSeed = parseInt(vrfSeed.slice(-8), 16); // Use last 8 chars as hex

    console.log(`Using VRF seed: ${vrfSeed.slice(-8)} (${randomSeed})`);

    // Create deterministic but unpredictable shuffle using VRF seed
    const shuffled = [...users].sort((a, b) => {
      const hashA = parseInt(crypto.createHash('sha256').update(a.id + randomSeed).digest('hex').slice(0, 8), 16);
      const hashB = parseInt(crypto.createHash('sha256').update(b.id + randomSeed).digest('hex').slice(0, 8), 16);
      return hashA - hashB;
    });

    const winners = shuffled.slice(0, winnerCount);
    const backups = backupCount > 0 ? shuffled.slice(winnerCount, winnerCount + backupCount) : [];

    console.log(`Selected ${winners.length} winners and ${backups.length} backups`);

    res.json({
      success: true,
      raffleId,
      tweetUrl,
      totalParticipants: users.length,
      raffleType: getRaffleTypeString(raffleType),
      winners: winners.map(user => ({
        id: user.id,
        username: user.username,
        twitterUrl: `https://twitter.com/${user.username}`
      })),
      backups: backups.map(user => ({
        id: user.id,
        username: user.username,
        twitterUrl: `https://twitter.com/${user.username}`
      })),
      allParticipants: users.map(user => user.username) // For transparency
    });

  } catch (error) {
    console.error('Error processing raffle:', error);

    // Check if it's a rate limit error
    if (error.message && error.message.includes('rate limit exceeded')) {
      return res.status(429).json({
        success: false,
        error: error.message
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Failed to process raffle. Please try again later.',
      details: error.message
    });
  }
}
