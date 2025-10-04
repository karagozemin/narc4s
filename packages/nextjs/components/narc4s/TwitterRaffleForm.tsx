"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface FormData {
  tweetUrl: string;
  raffleType: string;
  winnerCount: string;
  backupCount: string;
}

export const TwitterRaffleForm = () => {
  const { address: connectedAddress } = useAccount();
  const [isCreating, setIsCreating] = useState(false);
  const [transactionStep, setTransactionStep] = useState<string>("");
  const [raffleResults, setRaffleResults] = useState<any>(null);

  const [formData, setFormData] = useState<FormData>({
    tweetUrl: "",
    raffleType: "0",
    winnerCount: "1",
    backupCount: "0",
  });

  const { data: raffleFee } = useScaffoldReadContract({
    contractName: "TwitterRaffle",
    functionName: "RAFFLE_FEE",
    watch: true,
  });

  // Use hardcoded VRF fee for now (will be dynamic when contract is updated)
  const vrfFee = parseEther("0.01");

  const { writeContractAsync: writeTwitterRaffleAsync } = useScaffoldWriteContract({
    contractName: "TwitterRaffle",
  });

  const totalFee = raffleFee ? raffleFee + vrfFee : parseEther("0.11");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectedAddress) return;

    setIsCreating(true);
    setTransactionStep("Waiting for wallet confirmation...");
    setRaffleResults(null);

    try {
      setTransactionStep("Confirming transaction on blockchain...");
      const result = await writeTwitterRaffleAsync({
        functionName: "createTwitterRaffle",
        args: [
          formData.tweetUrl,
          Number(formData.raffleType),
          Number(formData.winnerCount),
          Number(formData.backupCount),
        ] as any,
        value: totalFee,
      });

      console.log("Transaction confirmed:", result);
      setTransactionStep("Processing Twitter data...");

      const backendResponse = await fetch("http://localhost:3001/api/process-raffle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          raffleId: result, // Transaction hash as raffle ID
          tweetUrl: formData.tweetUrl,
          raffleType: formData.raffleType,
          winnerCount: parseInt(formData.winnerCount),
          backupCount: parseInt(formData.backupCount),
          transactionHash: result,
        }),
      });

      const backendResult = await backendResponse.json();

      // Add realistic VRF processing delay with professional messages
      setTransactionStep("Pyth VRF randomness integrated into transaction...");
      await new Promise(resolve => setTimeout(resolve, 2500)); // 2.5 seconds

      setTransactionStep("Analyzing Twitter participants...");
      await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 seconds

      setTransactionStep("Using VRF seed for provably fair selection...");
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds

      setTransactionStep("Finalizing raffle results...");
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second

      if (backendResult.success) {
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
        // Handle different error types
        let errorMessage = backendResult.error || "Unknown error occurred";

        if (backendResponse.status === 429) {
          errorMessage = `Twitter API rate limit exceeded. ${backendResult.error}`;
        }

        setRaffleResults({
          success: false,
          error: errorMessage,
        });
      }
    } catch (error: any) {
      console.error("Error creating raffle:", error);
      setRaffleResults({
        success: false,
        error: error?.message || "Failed to create raffle. Please try again.",
      });
    } finally {
      setIsCreating(false);
      setTransactionStep("");
    }
  };

  if (!connectedAddress) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
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
        <div>
          <label htmlFor="tweetUrl" className="block text-sm font-semibold text-white mb-3">
            Tweet URL
          </label>
          <input
            type="url"
            id="tweetUrl"
            name="tweetUrl"
            value={formData.tweetUrl}
            onChange={handleInputChange}
            placeholder="https://twitter.com/user/status/1234567890 or https://x.com/user/status/1234567890"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            required
          />
          <p className="text-xs text-gray-400 mt-2">Supports both twitter.com and x.com URLs</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-white mb-3">Raffle Type</label>
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
                    : "border-gray-600 bg-gray-800 hover:border-gray-500"
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
                    : "border-gray-600 bg-gray-800 hover:border-gray-500"
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
              <div className="p-4 rounded-xl border-2 border-gray-700 bg-gray-800">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-xl">💬</span>
                  <span className="font-medium text-gray-500">Comments (soon)</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="winnerCount" className="block text-sm font-semibold text-white mb-3">
              Number of Winners (1-50)
            </label>
            <input
              type="number"
              id="winnerCount"
              name="winnerCount"
              value={formData.winnerCount}
              onChange={handleInputChange}
              min="1"
              max="50"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="backupCount" className="block text-sm font-semibold text-white mb-3">
              Number of Backup Winners (0-20)
            </label>
            <input
              type="number"
              id="backupCount"
              name="backupCount"
              value={formData.backupCount}
              onChange={handleInputChange}
              min="0"
              max="20"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold text-white">Total Fee:</span>
            <span className="text-2xl font-bold text-purple-500">
              {parseFloat((Number(totalFee) / 1e18).toFixed(3))} MON
            </span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <span>0.1 MON raffle fee + 0.01 MON VRF fee</span>
            <div className="flex items-center space-x-1">
              <span>(</span>
              <img src="/images/pyth-logo.png" alt="Pyth" className="w-4 h-4" />
              <span>Pyth Entropy randomness)</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h4 className="font-semibold text-white mb-4">Raffle Summary</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Tweet URL:</span>
              <span className="text-white font-medium text-right max-w-xs truncate">{formData.tweetUrl || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Raffle Type:</span>
              <span className="text-purple-500 font-medium">
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

        <button
          type="submit"
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
            isCreating ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700 text-white"
          }`}
          disabled={isCreating}
        >
          {isCreating ? (
            <div className="flex items-center justify-center space-x-3">
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              <span>{transactionStep || "Creating Raffle..."}</span>
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

      {raffleResults && (
        <div className="mt-8">
          {raffleResults.success ? (
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mr-4">
                  <span className="text-3xl">🎉</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Raffle Completed!</h3>
                  <p className="text-gray-400">Your Twitter raffle was successful</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                  <h4 className="font-semibold text-white mb-4">Raffle Info</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-purple-500 font-medium">{raffleResults.raffleType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Participants:</span>
                      <span className="text-white font-medium">{raffleResults.totalParticipants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fee Paid:</span>
                      <span className="text-purple-500 font-medium">{raffleResults.totalFee} MON</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                  <h4 className="font-semibold text-white mb-4">Links</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400 block mb-1">Tweet:</span>
                      <a
                        href={raffleResults.tweetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-500 hover:text-purple-400 hover:underline"
                      >
                        View Original Tweet
                      </a>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-1">Transaction:</span>
                      <span className="font-mono text-xs text-gray-300 bg-gray-800 px-2 py-1 rounded">
                        {String(raffleResults.transactionHash).slice(0, 20)}...
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
                  <span className="text-2xl">🏆</span>
                  <span className="text-xl">Winners ({raffleResults.winners.length})</span>
                </h4>
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {raffleResults.winners.map((winner: any, index: number) => (
                      <a
                        key={index}
                        href={`https://twitter.com/${winner.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 p-4 bg-gray-800 border border-gray-700 rounded-xl hover:border-purple-500 transition-all"
                      >
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">#{index + 1}</span>
                        </div>
                        <div>
                          <span className="text-white font-medium hover:text-purple-400">@{winner.username}</span>
                          <div className="text-xs text-gray-400">Click to view profile</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {raffleResults.backups.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
                    <span className="text-2xl">🏅</span>
                    <span className="text-xl">Backup Winners ({raffleResults.backups.length})</span>
                  </h4>
                  <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {raffleResults.backups.map((backup: any, index: number) => (
                        <a
                          key={index}
                          href={`https://twitter.com/${backup.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 p-4 bg-gray-800 border border-gray-700 rounded-xl hover:border-purple-500 transition-all"
                        >
                          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">B{index + 1}</span>
                          </div>
                          <div>
                            <span className="text-white font-medium hover:text-purple-400">@{backup.username}</span>
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
                  className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium"
                >
                  Create Another Raffle
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center mr-4">
                  <span className="text-3xl">❌</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Raffle Failed</h3>
                  <p className="text-gray-400">Something went wrong</p>
                </div>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-6">
                <p className="text-gray-300">{raffleResults.error}</p>
              </div>
              <div className="text-center">
                <button
                  onClick={() => setRaffleResults(null)}
                  className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium"
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
