// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/TwitterRaffle.sol";
import "./DeployHelpers.s.sol";

contract DeployTwitterRaffle is ScaffoldETHDeploy {
    // Pyth Entropy VRF address on Monad Testnet
    address constant PYTH_ENTROPY_ADDRESS = 0x36825bf3Fbdf5a29E2d5148bfe7Dcf7B5639e320;

    function run() external ScaffoldEthDeployerRunner {
        TwitterRaffle twitterRaffle = new TwitterRaffle(deployer);

        console.logString(string.concat("TwitterRaffle deployed at: ", vm.toString(address(twitterRaffle))));

        console.logString(string.concat("Fee recipient: ", vm.toString(deployer)));

        console.logString(string.concat("Pyth Entropy VRF: ", vm.toString(PYTH_ENTROPY_ADDRESS)));

        // Get actual VRF fee from Pyth
        uint256 vrfFee = twitterRaffle.VRF_FEE();
        console.logString(string.concat("VRF Fee: ", vm.toString(vrfFee)));

        console.logString("Raffle fee: 0.1 MON + dynamic VRF fee");
        console.logString("Reveal delay: 2 blocks");
        console.logString("Default gas limit: 500,000");
    }
}
