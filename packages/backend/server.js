import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Twitter API client
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_KEY_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// Bearer token client for read-only operations
const bearerClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

// Extract tweet ID from URL
function extractTweetId(tweetUrl) {
  const match = tweetUrl.match(/status\/(\d+)/);
  return match ? match[1] : null;
}

// Get users who liked a tweet
async function getLikingUsers(tweetId) {
  try {
    const response = await bearerClient.v2.tweetLikedBy(tweetId, {
      max_results: 100,
      'user.fields': ['username', 'public_metrics']
    });
    
    return response.data?.map(user => ({
      id: user.id,
      username: user.username,
      address: null // Will be extracted from bio or replies
    })) || [];
  } catch (error) {
    console.error('Error fetching liking users:', error);
    return [];
  }
}

// Get users who retweeted a tweet
async function getRetweetingUsers(tweetId) {
  try {
    const response = await bearerClient.v2.tweetRetweetedBy(tweetId, {
      max_results: 100,
      'user.fields': ['username', 'public_metrics']
    });
    
    return response.data?.map(user => ({
      id: user.id,
      username: user.username,
      address: null
    })) || [];
  } catch (error) {
    console.error('Error fetching retweeting users:', error);
    return [];
  }
}

// Get users who replied to a tweet
async function getReplyingUsers(tweetId) {
  try {
    const response = await bearerClient.v2.search(`conversation_id:${tweetId}`, {
      max_results: 100,
      'tweet.fields': ['author_id', 'conversation_id'],
      'user.fields': ['username']
    });
    
    const users = new Map();
    
    if (response.data) {
      for (const tweet of response.data) {
        if (tweet.author_id && !users.has(tweet.author_id)) {
          const user = response.includes?.users?.find(u => u.id === tweet.author_id);
          if (user) {
            users.set(tweet.author_id, {
              id: tweet.author_id,
              username: user.username,
              address: null
            });
          }
        }
      }
    }
    
    return Array.from(users.values());
  } catch (error) {
    console.error('Error fetching replying users:', error);
    return [];
  }
}

// Main endpoint to process Twitter raffle
app.post('/api/process-raffle', async (req, res) => {
  try {
    const { raffleId, tweetUrl, raffleType, winnerCount, backupCount } = req.body;
    
    if (!raffleId || !tweetUrl || raffleType === undefined || !winnerCount) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const tweetId = extractTweetId(tweetUrl);
    if (!tweetId) {
      return res.status(400).json({ error: 'Invalid tweet URL' });
    }
    
    console.log(`Processing raffle ${raffleId} for tweet ${tweetId}, type: ${raffleType}`);
    console.log(`Winners: ${winnerCount}, Backups: ${backupCount || 0}`);
    
    let users = [];
    
    // Get users based on raffle type
    switch (parseInt(raffleType)) {
      case 0: // LIKES
        users = await getLikingUsers(tweetId);
        break;
      case 1: // RETWEETS
        users = await getRetweetingUsers(tweetId);
        break;
      case 2: // COMMENTS
        users = await getReplyingUsers(tweetId);
        break;
      default:
        return res.status(400).json({ error: 'Invalid raffle type' });
    }
    
    console.log(`Found ${users.length} users`);
    
    if (users.length === 0) {
      return res.status(400).json({ 
        error: 'No participants found for this tweet' 
      });
    }
    
    if (users.length < winnerCount) {
      return res.status(400).json({ 
        error: `Not enough participants. Found ${users.length}, need ${winnerCount}` 
      });
    }
    
    // Randomly select winners and backups
    const shuffled = [...users].sort(() => Math.random() - 0.5);
    const winners = shuffled.slice(0, winnerCount);
    const backups = backupCount > 0 ? shuffled.slice(winnerCount, winnerCount + backupCount) : [];
    
    console.log(`Selected ${winners.length} winners and ${backups.length} backups`);
    
    res.json({
      success: true,
      raffleId,
      tweetUrl,
      raffleType: getRaffleTypeString(raffleType),
      totalParticipants: users.length,
      winners: winners.map(user => ({
        username: user.username,
        twitterUrl: `https://twitter.com/${user.username}`
      })),
      backups: backups.map(user => ({
        username: user.username,
        twitterUrl: `https://twitter.com/${user.username}`
      })),
      allParticipants: users.map(user => user.username) // For transparency
    });
    
  } catch (error) {
    console.error('Error processing raffle:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Helper function to get raffle type string
function getRaffleTypeString(type) {
  switch (parseInt(type)) {
    case 0: return "Likes";
    case 1: return "Retweets";
    case 2: return "Comments";
    default: return "Unknown";
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NARC4S Backend Service running on port ${PORT}`);
  console.log(`🐦 Twitter API integration ready`);
  console.log(`⛓️  Connected to Monad testnet`);
});
