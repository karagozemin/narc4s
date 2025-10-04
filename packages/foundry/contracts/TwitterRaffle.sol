// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "openzeppelin-contracts/contracts/utils/Pausable.sol";
import "./PythVRFConsumer.sol";

/**
 * @title TwitterRaffle
 * @dev Twitter raffle verification system for fair giveaways using Pyth VRF
 * @author NARC4S Team
 */
contract TwitterRaffle is Ownable, ReentrancyGuard, Pausable, PythVRFConsumer {
    
    // Raffle types
    enum RaffleType {
        LIKES,      // 0 - From tweet likes
        RETWEETS,   // 1 - From retweets
        COMMENTS    // 2 - From comments
    }
    
    // Raffle status enum
    enum RaffleStatus {
        PROCESSING,   // VRF in progress
        COMPLETED,    // Results ready
        CANCELLED     // Raffle cancelled
    }

    // Twitter Raffle struct
    struct Raffle {
        uint256 id;
        string tweetUrl;
        RaffleType raffleType;
        uint256 winnerCount;
        uint256 backupCount;
        address creator;
        uint256 createdAt;
        RaffleStatus status;
        address[] participants;
        address[] winners;
        address[] backups;
        uint256 vrfRequestId;
    }

    // State variables
    uint256 public nextRaffleId = 1;
    uint256 public constant RAFFLE_FEE = 0.1 ether; // 0.1 MON
    uint256 public constant VRF_FEE = 0.01 ether; // 0.01 MON for VRF
    uint256 public constant REVEAL_DELAY = 2; // 2 blocks delay
    uint256 public constant DEFAULT_GAS_LIMIT = 500000; // 500k gas
    address public feeRecipient;
    
    mapping(uint256 => Raffle) public raffles;
    mapping(address => uint256[]) public userRaffles;
    mapping(string => bool) public processedTweets; // Prevent duplicate tweets
    mapping(uint64 => uint256) public vrfToRaffle; // VRF sequence to raffle ID

    // Events
    event TwitterRaffleCreated(
        uint256 indexed raffleId,
        address indexed creator,
        string tweetUrl,
        RaffleType raffleType,
        uint256 winnerCount,
        uint256 backupCount
    );
    
    event RaffleProcessing(
        uint256 indexed raffleId,
        uint256 timestamp
    );
    
    event WinnersSelected(
        uint256 indexed raffleId,
        address[] winners,
        address[] backups
    );
    
    event RaffleCancelled(
        uint256 indexed raffleId,
        string reason
    );

    // Modifiers
    modifier raffleExists(uint256 raffleId) {
        require(raffleId < nextRaffleId && raffleId > 0, "Raffle does not exist");
        _;
    }

    modifier onlyRaffleCreator(uint256 raffleId) {
        require(raffles[raffleId].creator == msg.sender, "Only raffle creator");
        _;
    }

    constructor(address _feeRecipient, address _pythEntropyAddress) 
        Ownable(msg.sender) 
        PythVRFConsumer(_pythEntropyAddress) 
    {
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Create a new Twitter raffle
     */
    function createTwitterRaffle(
        string memory _tweetUrl,
        RaffleType _raffleType,
        uint256 _winnerCount,
        uint256 _backupCount
    ) external payable whenNotPaused nonReentrant returns (uint256) {
        require(msg.value >= RAFFLE_FEE + VRF_FEE, "Insufficient fee");
        require(_winnerCount > 0 && _winnerCount <= 50, "Invalid winner count");
        require(_backupCount <= 20, "Invalid backup count");
        require(bytes(_tweetUrl).length > 0, "Tweet URL required");
        require(!processedTweets[_tweetUrl], "Tweet already processed");

        uint256 raffleId = nextRaffleId++;
        
        Raffle storage newRaffle = raffles[raffleId];
        newRaffle.id = raffleId;
        newRaffle.tweetUrl = _tweetUrl;
        newRaffle.raffleType = _raffleType;
        newRaffle.winnerCount = _winnerCount;
        newRaffle.backupCount = _backupCount;
        newRaffle.creator = msg.sender;
        newRaffle.createdAt = block.timestamp;
        newRaffle.status = RaffleStatus.PROCESSING;
        
        processedTweets[_tweetUrl] = true;
        userRaffles[msg.sender].push(raffleId);

        // Transfer fees
        if (msg.value > RAFFLE_FEE + VRF_FEE) {
            payable(msg.sender).transfer(msg.value - RAFFLE_FEE - VRF_FEE);
        }
        payable(feeRecipient).transfer(RAFFLE_FEE);
        // VRF_FEE will be used for Pyth VRF request

        emit TwitterRaffleCreated(
            raffleId,
            msg.sender,
            _tweetUrl,
            _raffleType,
            _winnerCount,
            _backupCount
        );

        emit RaffleProcessing(raffleId, block.timestamp);

        // Simulate Twitter data fetching - in production, this would be done by oracle
        _simulateTwitterDataFetch(raffleId);

        return raffleId;
    }

    /**
     * @dev Trigger VRF request for winner selection
     */
    function triggerVRF(uint256 raffleId) external {
        Raffle storage raffle = raffles[raffleId];
        require(raffle.participants.length > 0, "No participants");
        require(raffle.status == RaffleStatus.PROCESSING, "Invalid status");
        
        // Create user random number from raffle data
        bytes32 userRandomNumber = keccak256(abi.encodePacked(
            raffleId,
            raffle.tweetUrl,
            raffle.participants.length,
            block.timestamp
        ));
        
        // Request randomness from Pyth VRF
        uint64 sequenceNumber = _requestRandomness(userRandomNumber);
        
        // Map VRF sequence to raffle ID
        vrfToRaffle[sequenceNumber] = raffleId;
        raffle.vrfRequestId = sequenceNumber;
    }

    /**
     * @dev Fulfill VRF request and select winners
     */
    function fulfillVRF(uint64 sequenceNumber) external {
        uint256 raffleId = vrfToRaffle[sequenceNumber];
        require(raffleId != 0, "Invalid sequence number");
        
        _fulfillRandomness(sequenceNumber);
    }

    /**
     * @dev Override from PythVRFConsumer - handle randomness
     */
    function _useRandomness(uint64 sequenceNumber, bytes32 randomness) internal override {
        uint256 raffleId = vrfToRaffle[sequenceNumber];
        _selectWinnersWithVRF(raffleId, randomness);
    }

    /**
     * @dev Simulate Twitter data fetching and VRF trigger
     * In production, this would be called by an oracle/backend service
     */
    function _simulateTwitterDataFetch(uint256 raffleId) internal {
        // This would normally be done by a backend service that:
        // 1. Fetches Twitter data using Twitter API
        // 2. Extracts participant addresses (from bio, replies, etc.)
        // 3. Calls setParticipants() with the fetched data
        // 4. Triggers VRF for winner selection
        
        // For demo purposes, we'll create some mock participants
        address[] memory mockParticipants = new address[](10);
        mockParticipants[0] = 0x1234567890123456789012345678901234567890;
        mockParticipants[1] = 0x2345678901234567890123456789012345678901;
        mockParticipants[2] = 0x3456789012345678901234567890123456789012;
        mockParticipants[3] = 0x4567890123456789012345678901234567890123;
        mockParticipants[4] = 0x5678901234567890123456789012345678901234;
        mockParticipants[5] = 0x6789012345678901234567890123456789012345;
        mockParticipants[6] = 0x7890123456789012345678901234567890123456;
        mockParticipants[7] = 0x8901234567890123456789012345678901234567;
        mockParticipants[8] = 0x9012345678901234567890123456789012345678;
        mockParticipants[9] = 0xA123456789012345678901234567890123456789;
        
        raffles[raffleId].participants = mockParticipants;
        
        // Auto-trigger VRF after setting participants
        _triggerVRFInternal(raffleId);
    }

    /**
     * @dev Internal function to trigger VRF
     */
    function _triggerVRFInternal(uint256 raffleId) internal {
        Raffle storage raffle = raffles[raffleId];
        
        // Create user random number from raffle data
        bytes32 userRandomNumber = keccak256(abi.encodePacked(
            raffleId,
            raffle.tweetUrl,
            raffle.participants.length,
            block.timestamp
        ));
        
        // For demo, we'll use pseudo-random until Pyth VRF is fully integrated
        _selectWinnersWithVRF(raffleId, userRandomNumber);
    }

    /**
     * @dev Select winners using VRF randomness
     */
    function _selectWinnersWithVRF(uint256 raffleId, bytes32 randomness) internal {
        Raffle storage raffle = raffles[raffleId];
        
        require(raffle.participants.length > 0, "No participants");
        require(raffle.participants.length >= raffle.winnerCount, "Not enough participants");

        // Use VRF randomness as seed
        uint256 seed = uint256(randomness);

        // Select winners
        bool[] memory selected = new bool[](raffle.participants.length);
        
        // Select main winners
        for (uint256 i = 0; i < raffle.winnerCount; i++) {
            uint256 randomIndex;
            do {
                seed = uint256(keccak256(abi.encodePacked(seed, i)));
                randomIndex = seed % raffle.participants.length;
            } while (selected[randomIndex]);
            
            selected[randomIndex] = true;
            raffle.winners.push(raffle.participants[randomIndex]);
        }

        // Select backup winners
        for (uint256 i = 0; i < raffle.backupCount; i++) {
            uint256 randomIndex;
            uint256 attempts = 0;
            do {
                seed = uint256(keccak256(abi.encodePacked(seed, i + 1000)));
                randomIndex = seed % raffle.participants.length;
                attempts++;
            } while (selected[randomIndex] && attempts < 100);
            
            if (!selected[randomIndex]) {
                selected[randomIndex] = true;
                raffle.backups.push(raffle.participants[randomIndex]);
            }
        }

        raffle.status = RaffleStatus.COMPLETED;
        emit WinnersSelected(raffleId, raffle.winners, raffle.backups);
    }

    /**
     * @dev Set participants for a raffle (called by oracle/backend)
     * In production, this would be restricted to oracle address
     */
    function setParticipants(
        uint256 raffleId,
        address[] memory _participants
    ) external raffleExists(raffleId) {
        // In production, add oracle access control here
        require(_participants.length > 0, "No participants");
        
        Raffle storage raffle = raffles[raffleId];
        require(raffle.status == RaffleStatus.PROCESSING, "Invalid status");
        
        raffle.participants = _participants;
        
        // Trigger VRF for winner selection
        _triggerVRFInternal(raffleId);
    }

    /**
     * @dev Get raffle details
     */
    function getRaffle(uint256 raffleId) 
        external 
        view 
        raffleExists(raffleId) 
        returns (Raffle memory) 
    {
        return raffles[raffleId];
    }

    /**
     * @dev Get raffle participants
     */
    function getRaffleParticipants(uint256 raffleId) 
        external 
        view 
        raffleExists(raffleId) 
        returns (address[] memory) 
    {
        return raffles[raffleId].participants;
    }

    /**
     * @dev Get raffle winners
     */
    function getRaffleWinners(uint256 raffleId) 
        external 
        view 
        raffleExists(raffleId) 
        returns (address[] memory winners, address[] memory backups) 
    {
        Raffle storage raffle = raffles[raffleId];
        return (raffle.winners, raffle.backups);
    }

    /**
     * @dev Get user's raffles
     */
    function getUserRaffles(address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userRaffles[user];
    }

    /**
     * @dev Get recent raffles
     */
    function getRecentRaffles(uint256 limit) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256 totalRaffles = nextRaffleId - 1;
        uint256 resultCount = limit > totalRaffles ? totalRaffles : limit;
        
        uint256[] memory result = new uint256[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = totalRaffles - i;
        }
        
        return result;
    }

    /**
     * @dev Get raffle type as string
     */
    function getRaffleTypeString(RaffleType _type) 
        external 
        pure 
        returns (string memory) 
    {
        if (_type == RaffleType.LIKES) return "Likes";
        if (_type == RaffleType.RETWEETS) return "Retweets";
        if (_type == RaffleType.COMMENTS) return "Comments";
        return "Unknown";
    }

    /**
     * @dev Check if tweet has been processed
     */
    function isTweetProcessed(string memory tweetUrl) 
        external 
        view 
        returns (bool) 
    {
        return processedTweets[tweetUrl];
    }

    /**
     * @dev Get total number of raffles
     */
    function getTotalRaffles() external view returns (uint256) {
        return nextRaffleId - 1;
    }

    // Admin functions
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid address");
        feeRecipient = _feeRecipient;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Emergency withdrawal
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
