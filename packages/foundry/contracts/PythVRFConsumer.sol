// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IPythEntropy
 * @dev Pyth Entropy interface for random number generation
 */
interface IPythEntropy {
    function getEntropy() external view returns (bytes32);
    
    function requestRandomness(
        bytes32 userRandomNumber
    ) external payable returns (uint64 sequenceNumber);
    
    function revealRandomness(
        uint64 sequenceNumber
    ) external view returns (bytes32 randomNumber);
}

/**
 * @title PythVRFConsumer
 * @dev Base contract for consuming Pyth Entropy VRF
 */
abstract contract PythVRFConsumer {
    IPythEntropy public immutable pythEntropy;
    
    // Mapping from sequence number to request details
    mapping(uint64 => address) public requesters;
    mapping(uint64 => bool) public fulfilled;
    
    event RandomnessRequested(uint64 indexed sequenceNumber, address indexed requester);
    event RandomnessFulfilled(uint64 indexed sequenceNumber, bytes32 randomness);
    
    constructor(address _pythEntropyAddress) {
        pythEntropy = IPythEntropy(_pythEntropyAddress);
    }
    
    /**
     * @dev Request randomness from Pyth Entropy
     */
    function _requestRandomness(bytes32 userRandomNumber) internal returns (uint64) {
        // For demo purposes, we'll simulate the VRF request
        // In production, this would call Pyth Entropy with proper value handling
        uint64 sequenceNumber = uint64(uint256(keccak256(abi.encodePacked(
            block.timestamp,
            userRandomNumber,
            msg.sender
        ))));
        
        requesters[sequenceNumber] = msg.sender;
        
        emit RandomnessRequested(sequenceNumber, msg.sender);
        return sequenceNumber;
    }
    
    /**
     * @dev Reveal and use randomness
     */
    function _fulfillRandomness(uint64 sequenceNumber) internal {
        require(!fulfilled[sequenceNumber], "Already fulfilled");
        
        bytes32 randomness = pythEntropy.revealRandomness(sequenceNumber);
        fulfilled[sequenceNumber] = true;
        
        emit RandomnessFulfilled(sequenceNumber, randomness);
        
        // Call the implementation-specific function
        _useRandomness(sequenceNumber, randomness);
    }
    
    /**
     * @dev Override this function to handle randomness
     */
    function _useRandomness(uint64 sequenceNumber, bytes32 randomness) internal virtual;
}

