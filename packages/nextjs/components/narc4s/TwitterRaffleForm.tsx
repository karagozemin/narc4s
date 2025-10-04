"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// Helper function to validate Twitter URL
const validateTwitterUrl = (url: string): boolean => {
  const twitterRegex = /^https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/;
  return twitterRegex.test(url);
};

export const TwitterRaffleForm = () => {
  const { address: connectedAddress } = useAccount();
  const [formData, setFormData] = useState({
    tweetUrl: "",
    raffleType: "0", // 0: Likes, 1: Retweets, 2: Comments
    winnerCount: "1",
    backupCount: "0",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [raffleResults, setRaffleResults] = useState<any>(null);

  const { data: raffleFee } = useScaffoldReadContract({
    contractName: "TwitterRaffle",
    functionName: "RAFFLE_FEE",
  });

  // VRF fee is hardcoded to 0.01 MON since contract doesn't expose VRF_FEE
  const vrfFee = parseEther("0.01");

  const { writeContractAsync: writeTwitterRaffleAsync } = useScaffoldWriteContract({
    contractName: "TwitterRaffle",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!connectedAddress) {
      alert("Please connect your wallet to create a raffle!");
      return;
    }

    // Validation
    if (!formData.tweetUrl.trim()) {
      alert("Please enter a tweet URL!");
      return;
    }

    if (!validateTwitterUrl(formData.tweetUrl)) {
      alert("Please enter a valid Twitter/X URL (e.g., https://twitter.com/user/status/123456789)");
      return;
    }

    const winnerCount = parseInt(formData.winnerCount);
    const backupCount = parseInt(formData.backupCount);

    if (winnerCount < 1 || winnerCount > 50) {
      alert("Winner count must be between 1 and 50!");
      return;
    }

    if (backupCount < 0 || backupCount > 20) {
      alert("Backup count must be between 0 and 20!");
      return;
    }

    setIsCreating(true);

    try {
      // 1. First create raffle on-chain (pays 0.1 MON + 0.01 MON VRF)
      console.log("Creating raffle on-chain...");
      const result = await writeTwitterRaffleAsync({
        functionName: "createTwitterRaffle",
        args: [formData.tweetUrl, parseInt(formData.raffleType), BigInt(winnerCount), BigInt(backupCount)],
        value: raffleFee ? raffleFee + vrfFee : parseEther("0.11"),
      });

      console.log("On-chain raffle created:", result);

      // 2. Then call backend to get Twitter data and display results
      const backendResponse = await fetch("http://localhost:3001/api/process-raffle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          raffleId: Date.now(), // Simple ID for now
          tweetUrl: formData.tweetUrl,
          raffleType: parseInt(formData.raffleType),
          winnerCount: winnerCount,
          backupCount: backupCount,
        }),
      });

      const backendResult = await backendResponse.json();

      if (backendResult.success) {
        // Set results to display in UI instead of alert
        setRaffleResults({
          success: true,
          totalParticipants: backendResult.totalParticipants,
          raffleType: backendResult.raffleType,
          winners: backendResult.winners,
          backups: backendResult.backups,
          tweetUrl: backendResult.tweetUrl,
          transactionHash: result,
          totalFee: parseFloat((Number(totalFee) / 1e18).toFixed(3)),
        });
      } else {
        setRaffleResults({
          success: false,
          error: backendResult.error,
        });
      }

      // Reset form
      setFormData({
        tweetUrl: "",
        raffleType: "0",
        winnerCount: "1",
        backupCount: "0",
      });
    } catch (error) {
      console.error("Error processing raffle:", error);
      setRaffleResults({
        success: false,
        error: "Failed to create raffle. Please check your balance and try again.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const totalFee = raffleFee ? raffleFee + vrfFee : parseEther("0.11");

  if (!connectedAddress) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔗</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
        <p className="text-gray-400">Please connect your wallet to create a Twitter raffle</p>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tweet URL Input */}
        <div>
          <label htmlFor="tweetUrl" className="block text-sm font-semibold text-white mb-3">
            <span className="flex items-center space-x-2">
              <span>🔗</span>
              <span>Tweet URL</span>
            </span>
          </label>
          <input
            type="url"
            id="tweetUrl"
            name="tweetUrl"
            value={formData.tweetUrl}
            onChange={handleInputChange}
            placeholder="https://twitter.com/user/status/1234567890 or https://x.com/user/status/1234567890"
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
            required
          />
          <p className="text-xs text-gray-400 mt-2">Supports both twitter.com and x.com URLs</p>
        </div>

        {/* Raffle Type Selection */}
        <div>
          <label className="block text-sm font-semibold text-white mb-3">
            <span className="flex items-center space-x-2">
              <span>⚙️</span>
              <span>Raffle Type</span>
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="relative">
              <input
                type="radio"
                name="raffleType"
                value="0"
                checked={formData.raffleType === "0"}
                onChange={handleInputChange}
                className="sr-only"
              />
              <div
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.raffleType === "0"
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-gray-600 bg-gray-700/30 hover:border-gray-500"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-xl">👍</span>
                  <span className="font-medium text-white">Likes</span>
                </div>
              </div>
            </label>

            <label className="relative">
              <input
                type="radio"
                name="raffleType"
                value="1"
                checked={formData.raffleType === "1"}
                onChange={handleInputChange}
                className="sr-only"
              />
              <div
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.raffleType === "1"
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-gray-600 bg-gray-700/30 hover:border-gray-500"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-xl">🔄</span>
                  <span className="font-medium text-white">Retweets</span>
                </div>
              </div>
            </label>

            <label className="relative opacity-60 cursor-not-allowed">
              <input
                type="radio"
                name="raffleType"
                value="2"
                checked={formData.raffleType === "2"}
                onChange={handleInputChange}
                className="sr-only"
                disabled={true}
              />
              <div className="p-4 rounded-xl border-2 border-gray-700 bg-gray-800/30">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-xl">💬</span>
                  <span className="font-medium text-gray-500">Comments (soon)</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Winner and Backup Count */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="winnerCount" className="block text-sm font-semibold text-white mb-3">
              <span className="flex items-center space-x-2">
                <span>🏆</span>
                <span>Number of Winners (1-50)</span>
              </span>
            </label>
            <input
              type="number"
              id="winnerCount"
              name="winnerCount"
              value={formData.winnerCount}
              onChange={handleInputChange}
              min="1"
              max="50"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
              required
            />
          </div>
          <div>
            <label htmlFor="backupCount" className="block text-sm font-semibold text-white mb-3">
              <span className="flex items-center space-x-2">
                <span>🏅</span>
                <span>Number of Backup Winners (0-20)</span>
              </span>
            </label>
            <input
              type="number"
              id="backupCount"
              name="backupCount"
              value={formData.backupCount}
              onChange={handleInputChange}
              min="0"
              max="20"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
              required
            />
          </div>
        </div>

        {/* Fee Display */}
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold text-white flex items-center space-x-2">
              <span>💰</span>
              <span>Total Fee:</span>
            </span>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {parseFloat((Number(totalFee) / 1e18).toFixed(3))} MON
            </span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            0.1 MON raffle fee + 0.01 MON VRF fee (prevents spam & ensures fair randomness)
          </p>
        </div>

        {/* Summary */}
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
          <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
            <span>📋</span>
            <span>Raffle Summary</span>
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Tweet URL:</span>
              <span className="text-white font-medium text-right max-w-xs truncate">{formData.tweetUrl || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Raffle Type:</span>
              <span className="text-purple-400 font-medium">
                {formData.raffleType === "0" ? "Likes" : formData.raffleType === "1" ? "Retweets" : "Comments (soon)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Winners:</span>
              <span className="text-white font-medium">{formData.winnerCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Backups:</span>
              <span className="text-white font-medium">{formData.backupCount}</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
            isCreating
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-purple-500/25"
          }`}
          disabled={isCreating}
        >
          {isCreating ? (
            <div className="flex items-center justify-center space-x-3">
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Creating Raffle & Processing Twitter Data...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-3">
              <span className="text-xl">🎲</span>
              <span>Create Twitter Raffle</span>
              <span className="text-sm opacity-80 bg-white/10 px-2 py-1 rounded-lg">
                {parseFloat((Number(totalFee) / 1e18).toFixed(3))} MON
              </span>
            </div>
          )}
        </button>
      </form>

      {/* Results Section */}
      {raffleResults && (
        <div className="mt-8">
          {raffleResults.success ? (
            <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-2xl p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-4">
                  <span className="text-3xl">🎉</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Raffle Completed!</h3>
                  <p className="text-green-300">Your Twitter raffle was successful</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
                  <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
                    <span>📊</span>
                    <span>Raffle Info</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-purple-400 font-medium">{raffleResults.raffleType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Participants:</span>
                      <span className="text-white font-medium">{raffleResults.totalParticipants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fee Paid:</span>
                      <span className="text-green-400 font-medium">{raffleResults.totalFee} MON</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
                  <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
                    <span>🔗</span>
                    <span>Links</span>
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400 block mb-1">Tweet:</span>
                      <a
                        href={raffleResults.tweetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                      >
                        View Original Tweet
                      </a>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-1">Transaction:</span>
                      <span className="font-mono text-xs text-gray-300 bg-gray-700/50 px-2 py-1 rounded">
                        {String(raffleResults.transactionHash).slice(0, 20)}...
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Winners Section */}
              <div className="mb-6">
                <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
                  <span className="text-2xl">🏆</span>
                  <span className="text-xl">Winners ({raffleResults.winners.length})</span>
                </h4>
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {raffleResults.winners.map((winner: any, index: number) => (
                      <a
                        key={index}
                        href={`https://twitter.com/${winner.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center space-x-3 p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-xl hover:border-green-400/50 transition-all"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">#{index + 1}</span>
                        </div>
                        <div>
                          <span className="text-white font-medium group-hover:text-green-300 transition-colors">
                            @{winner.username}
                          </span>
                          <div className="text-xs text-gray-400">Click to view profile</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Backup Winners Section */}
              {raffleResults.backups.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
                    <span className="text-2xl">🏅</span>
                    <span className="text-xl">Backup Winners ({raffleResults.backups.length})</span>
                  </h4>
                  <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {raffleResults.backups.map((backup: any, index: number) => (
                        <a
                          key={index}
                          href={`https://twitter.com/${backup.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 rounded-xl hover:border-yellow-400/50 transition-all"
                        >
                          <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">B{index + 1}</span>
                          </div>
                          <div>
                            <span className="text-white font-medium group-hover:text-yellow-300 transition-colors">
                              @{backup.username}
                            </span>
                            <div className="text-xs text-gray-400">Click to view profile</div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={() => setRaffleResults(null)}
                  className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
                >
                  Create Another Raffle
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-red-900/20 to-pink-900/20 border border-red-500/30 rounded-2xl p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4">
                  <span className="text-3xl">❌</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Raffle Failed</h3>
                  <p className="text-red-300">Something went wrong</p>
                </div>
              </div>
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6 mb-6">
                <p className="text-red-300 leading-relaxed">{raffleResults.error}</p>
              </div>
              <div className="text-center">
                <button
                  onClick={() => setRaffleResults(null)}
                  className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
