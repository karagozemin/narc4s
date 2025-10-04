// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IPythEntropy
 * @dev Pyth Entropy interface for random number generation on Monad
 */
interface IPythEntropy {
    function getDefaultProvider() external view returns (address);
    function request(address provider, bytes32 userCommitment, bool useBlockhash) external payable returns (uint64);
    function reveal(address provider, uint64 sequenceNumber, bytes32 userRandomness) external view returns (bytes32);
    function getFee(address provider) external view returns (uint128);
}

/**
 * @title PythVRFConsumer
 * @dev Base contract for consuming Pyth Entropy VRF on Monad
 */
abstract contract PythVRFConsumer {
    IPythEntropy public immutable pythEntropy;
    address public immutable defaultProvider;

    // VRF request tracking
    mapping(uint64 => bytes32) public userCommitments;
    mapping(uint64 => address) public requesters;
    mapping(uint64 => bool) public fulfilled;

    event RandomnessRequested(uint64 indexed sequenceNumber, address indexed requester, bytes32 userCommitment);
    event RandomnessFulfilled(uint64 indexed sequenceNumber, bytes32 randomness);

    constructor(address _pythEntropyAddress) {
        pythEntropy = IPythEntropy(_pythEntropyAddress);
        defaultProvider = pythEntropy.getDefaultProvider();
    }

    /**
     * @dev Request randomness from Pyth Entropy
     */
    function _requestRandomness(bytes32 userCommitment) internal returns (uint64) {
        uint128 fee = pythEntropy.getFee(defaultProvider);
        require(msg.value >= fee, "Insufficient fee for VRF request");

        uint64 sequenceNumber = pythEntropy.request{value: fee}(
            defaultProvider,
            userCommitment,
            true // use blockhash for additional entropy
        );

        userCommitments[sequenceNumber] = userCommitment;
        requesters[sequenceNumber] = msg.sender;

        emit RandomnessRequested(sequenceNumber, msg.sender, userCommitment);
        return sequenceNumber;
    }

    /**
     * @dev Reveal randomness from Pyth Entropy (called after reveal delay)
     */
    function _revealRandomness(uint64 sequenceNumber, bytes32 userRandomness) internal returns (bytes32) {
        require(!fulfilled[sequenceNumber], "Request already fulfilled");
        require(userCommitments[sequenceNumber] != bytes32(0), "Invalid sequence number");
        require(requesters[sequenceNumber] == msg.sender, "Not the requester");

        bytes32 randomness = pythEntropy.reveal(defaultProvider, sequenceNumber, userRandomness);
        fulfilled[sequenceNumber] = true;

        emit RandomnessFulfilled(sequenceNumber, randomness);
        return randomness;
    }

    /**
     * @dev Get VRF fee from Pyth Entropy
     */
    function getVRFFee() public view returns (uint128) {
        return pythEntropy.getFee(defaultProvider);
    }

    /**
     * @dev Override this function to handle randomness
     */
    function _useRandomness(uint64 sequenceNumber, bytes32 randomness) internal virtual;
}
