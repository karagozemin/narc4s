import React from "react";
import Link from "next/link";
import { hardhat } from "viem/chains";
import { CurrencyDollarIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/outline";
import { Faucet } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useGlobalState } from "~~/services/store/store";

/**
 * Site footer
 */
export const Footer = () => {
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  return (
    <div className="min-h-0 py-5 px-1 mb-11 lg:mb-0 bg-gray-900 border-t border-gray-800">
      <div>
        <div className="fixed flex justify-between items-center w-full z-10 p-4 bottom-0 left-0 pointer-events-none">
          <div className="flex flex-col md:flex-row gap-2 pointer-events-auto">
            {nativeCurrencyPrice > 0 && (
              <div>
                <div className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 cursor-auto">
                  <CurrencyDollarIcon className="h-4 w-4" />
                  <span>{nativeCurrencyPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
            {isLocalNetwork && (
              <>
                <Faucet />
                <Link
                  href="/blockexplorer"
                  passHref
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                >
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  <span>Block Explorer</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="w-full">
        <ul className="menu menu-horizontal w-full">
          <div className="flex justify-between items-center w-full px-4">
            {/* Left side - Main footer content */}
            <div className="flex justify-center items-center gap-2 text-sm flex-1">
              <div className="text-center">
                <span className="text-gray-400">
                  Built with <HeartIcon className="inline-block h-4 w-4 text-purple-500" /> for the community
                </span>
              </div>
              <span className="text-gray-600">·</span>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-6 h-6 rounded-lg overflow-hidden border border-purple-600/30">
                  <img src="/images/narc4s-logo.jpg" alt="NARC4S Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-purple-500 font-semibold">NARC4S v2.0</span>
              </div>
              <span className="text-gray-600">·</span>
              <div className="text-center">
                <span className="text-gray-400">Fair & Transparent Raffles</span>
              </div>
            </div>

            {/* Right side - Powered by OverBlock */}
            <div className="flex items-center">
              <a
                href="https://x.com/OverBlock_"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-400 text-sm transition-colors duration-200 flex items-center space-x-1"
              >
                <span>Powered by</span>
                <span className="font-semibold text-purple-500 hover:text-purple-400">OverBlock</span>
              </a>
            </div>
          </div>
        </ul>
      </div>
    </div>
  );
};
