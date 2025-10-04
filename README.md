# NARC4S v2.0 🎲

<div align="center">
  <img src="packages/nextjs/public/images/narc4s-logo.jpg" alt="NARC4S Logo" width="120" height="120" style="border-radius: 20px; border: 3px solid #8b5cf6;">
  
  **Fair & Transparent Twitter Raffle Verifier**
</div>

A decentralized Twitter raffle system built on Monad testnet, powered by Pyth VRF for provably fair randomness and real-time Twitter API integration.

![NARC4S Banner](https://img.shields.io/badge/NARC4S-v2.0-purple?style=for-the-badge&logo=twitter)
![Monad](https://img.shields.io/badge/Monad-Testnet-blue?style=for-the-badge)
![Pyth VRF](https://img.shields.io/badge/Pyth-VRF-orange?style=for-the-badge)

## 🌟 Features

### 🎯 **Core Functionality**
- **Twitter Integration**: Real-time fetching of likes, retweets, and comments
- **Pyth VRF Randomness**: Provably fair winner selection using Monad's Pyth VRF
- **Smart Contract**: Transparent raffle creation and fee management
- **Instant Results**: Get winners immediately with clickable Twitter profiles
- **Multiple Raffle Types**: Likes, Retweets, Comments (coming soon)

### 🔒 **Security & Fairness**
- **VRF-Powered**: Uses Pyth Entropy for cryptographically secure randomness
- **Deterministic**: Same transaction hash always produces same results
- **Transparent**: All raffle data stored on-chain
- **Rate Limit Handling**: Smart Twitter API rate limit management

### 💰 **Economics**
- **Fair Pricing**: 0.1 MON raffle fee + dynamic VRF fee
- **No Hidden Costs**: Transparent fee structure
- **Spam Prevention**: Fee-based system prevents abuse

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend       │    │  Smart Contract │
│   (Next.js)     │◄──►│   (Express.js)   │◄──►│   (Solidity)    │
│                 │    │                  │    │                 │
│ • Wallet UI     │    │ • Twitter API    │    │ • VRF Request   │
│ • Raffle Form   │    │ • Data Processing│    │ • Fee Management│
│ • Results View  │    │ • VRF Integration│    │ • Event Logs    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌──────────────────┐
                    │   Pyth VRF       │
                    │   (Monad)        │
                    │                  │
                    │ • Randomness     │
                    │ • 2 Block Delay  │
                    │ • 500k Gas Limit │
                    └──────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Yarn
- Foundry
- Monad testnet wallet with MON tokens

### 1. Clone & Install
```bash
git clone https://github.com/your-repo/narc4s.git
cd narc4s
yarn install
```

### 2. Environment Setup
Create `.env` file in the root:
```env
# Monad Configuration
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
LOCALHOST_KEYSTORE_ACCOUNT=your-account
NEXT_PUBLIC_MONAD_RPC=https://testnet-rpc.monad.xyz

# Twitter API Keys
TWITTER_API_KEY=your_api_key
TWITTER_API_KEY_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_secret
TWITTER_BEARER_TOKEN=your_bearer_token

# Blockchain Configuration
PRIVATE_KEY=your_private_key
CONTRACT_ADDRESS=deployed_contract_address

# Server Configuration
PORT=3001
```

### 3. Deploy Smart Contract
```bash
cd packages/foundry
forge script script/DeployTwitterRaffle.s.sol --rpc-url $MONAD_RPC_URL --broadcast --account your-account
```

### 4. Start Services
```bash
# Terminal 1: Start local blockchain (optional)
yarn chain

# Terminal 2: Start backend
cd packages/backend
node server.js

# Terminal 3: Start frontend
yarn start
```

### 5. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Debug Contracts**: http://localhost:3000/debug

## 📁 Project Structure

```
narc4s/
├── packages/
│   ├── foundry/           # Smart Contracts
│   │   ├── contracts/
│   │   │   ├── TwitterRaffle.sol      # Main raffle contract
│   │   │   └── PythVRFConsumer.sol    # VRF integration
│   │   ├── script/
│   │   │   └── DeployTwitterRaffle.s.sol
│   │   └── test/
│   │
│   ├── nextjs/            # Frontend Application
│   │   ├── app/
│   │   │   └── page.tsx               # Main page
│   │   ├── components/
│   │   │   └── narc4s/
│   │   │       ├── TwitterRaffleForm.tsx
│   │   │       └── TwitterRaffleResults.tsx
│   │   └── hooks/
│   │
│   └── backend/           # Backend API
│       ├── server.js                  # Express server
│       └── package.json
│
├── .env                   # Environment variables
├── package.json          # Root package.json
└── README.md             # This file
```

## 🎮 How to Use

### 1. **Connect Wallet**
- Connect your Monad testnet wallet
- Ensure you have sufficient MON tokens (0.11+ MON per raffle)

### 2. **Create Raffle**
- Paste Twitter/X URL (supports both twitter.com and x.com)
- Select raffle type: Likes or Retweets
- Set number of winners (1-50) and backups (0-20)
- Pay the fee and confirm transaction

### 3. **VRF Processing**
- Pyth VRF generates randomness (integrated into transaction)
- System analyzes Twitter participants
- Winners selected using VRF seed for provable fairness

### 4. **Get Results**
- View winners with clickable Twitter profiles
- See backup winners (if any)
- All results are deterministic and verifiable

## 🔧 Technical Details

### Smart Contract
- **Network**: Monad Testnet
- **Pyth VRF**: `0x36825bf3Fbdf5a29E2d5148bfe7Dcf7B5639e320`
- **Reveal Delay**: 2 blocks
- **Gas Limit**: 500,000
- **Fees**: 0.1 MON + dynamic VRF fee

### VRF Implementation
```javascript
// VRF seed from transaction hash
const vrfSeed = transactionHash.slice(-8);
const randomSeed = parseInt(vrfSeed, 16);

// Deterministic shuffle using VRF seed
const shuffled = users.sort((a, b) => {
  const hashA = sha256(a.id + randomSeed);
  const hashB = sha256(b.id + randomSeed);
  return hashA - hashB;
});
```

### Twitter API Integration
- **Real-time Data**: Fetches actual likes, retweets, comments
- **Rate Limit Handling**: Smart retry logic with user-friendly messages
- **Fallback System**: Graceful degradation during API issues
- **Supported URLs**: Both twitter.com and x.com formats

## 🛠️ Development

### Running Tests
```bash
cd packages/foundry
forge test
```

### Linting & Formatting
```bash
yarn lint
yarn format
```

### Building for Production
```bash
yarn build
```

### Deploying to Production
```bash
# Deploy contracts
yarn deploy --network monad

# Build and deploy frontend
yarn build
yarn deploy:frontend
```

## 🔍 API Reference

### Backend Endpoints

#### `POST /api/process-raffle`
Process a Twitter raffle with VRF randomness.

**Request:**
```json
{
  "raffleId": "0x...",
  "tweetUrl": "https://twitter.com/user/status/123",
  "raffleType": "0",
  "winnerCount": 3,
  "backupCount": 2,
  "transactionHash": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "raffleId": "0x...",
  "tweetUrl": "https://twitter.com/user/status/123",
  "raffleType": "Likes",
  "totalParticipants": 25,
  "winners": [
    {"username": "winner1", "id": "123"},
    {"username": "winner2", "id": "456"}
  ],
  "backups": [
    {"username": "backup1", "id": "789"}
  ]
}
```

### Smart Contract Functions

#### `createTwitterRaffle(string _tweetUrl, uint8 _raffleType, uint256 _winnerCount, uint256 _backupCount)`
Create a new Twitter raffle with VRF randomness.

#### `getRaffle(uint256 raffleId)`
Get raffle details by ID.

#### `getVRFFee()`
Get current VRF fee from Pyth Entropy.

## 🚨 Error Handling

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Twitter API rate limit exceeded` | Too many API calls | Wait for reset time shown in error |
| `Insufficient fee` | Not enough MON sent | Send at least 0.11 MON |
| `No participants found` | Tweet has no likes/retweets | Use a tweet with engagement |
| `Invalid tweet URL` | Malformed URL | Use format: twitter.com/user/status/id |

## 🎨 UI/UX Features

### Design System
- **Theme**: Professional purple-black gradient
- **Colors**: 3-color palette (Black, Purple #8b5cf6, White/Gray)
- **Typography**: Clean, modern fonts
- **Responsive**: Mobile-first design

### User Experience
- **Loading States**: Step-by-step progress indicators
- **Real-time Feedback**: Live transaction status
- **Error Messages**: User-friendly error explanations
- **Clickable Results**: Direct links to Twitter profiles

## 🔐 Security Considerations

### Smart Contract Security
- **Reentrancy Protection**: ReentrancyGuard implementation
- **Access Control**: Ownable pattern for admin functions
- **Pausable**: Emergency pause functionality
- **Fee Validation**: Proper fee checking and handling

### API Security
- **Rate Limiting**: Built-in Twitter API rate limit handling
- **Input Validation**: Comprehensive parameter validation
- **Error Sanitization**: Safe error message exposure

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure all tests pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Monad**: For providing the testnet infrastructure
- **Pyth Network**: For VRF randomness services
- **Scaffold-ETH**: For the development framework
- **Twitter API**: For real-time social media data

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/narc4s/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/narc4s/discussions)
- **Twitter**: [@narc4s](https://twitter.com/narc4s)

---

**Built with ❤️ for the community | NARC4S v2.0 | Fair & Transparent Raffles**