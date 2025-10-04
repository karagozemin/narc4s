// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/TwitterRaffle.sol";
import "./DeployHelpers.s.sol";

contract DeployTwitterRaffle is ScaffoldETHDeploy {
    // Pyth Entropy VRF address on Monad Testnet
    address constant PYTH_ENTROPY_ADDRESS = 0x36825bf3Fbdf5a29E2d5148bfe7Dcf7B5639e320;
    
    function run() external ScaffoldEthDeployerRunner {
        TwitterRaffle twitterRaffle = new TwitterRaffle(deployer, PYTH_ENTROPY_ADDRESS);
        
        console.logString(
            string.concat(
                "TwitterRaffle deployed at: ", 
                vm.toString(address(twitterRaffle))
            )
        );
        
        console.logString(
            string.concat(
                "Fee recipient: ", 
                vm.toString(deployer)
            )
        );
        
        console.logString(
            string.concat(
                "Pyth Entropy VRF: ", 
                vm.toString(PYTH_ENTROPY_ADDRESS)
            )
        );
        
        console.logString("Raffle fee: 0.1 MON + 0.01 MON VRF");
        console.logString("Reveal delay: 2 blocks");
        console.logString("Default gas limit: 500,000");
    }
}
