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
      <div className="text-center text-lg text-gray-600">Please connect your wallet to create a Twitter raffle.</div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tweet URL Input */}
        <div>
          <label htmlFor="tweetUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Tweet URL
          </label>
          <input
            type="url"
            id="tweetUrl"
            name="tweetUrl"
            value={formData.tweetUrl}
            onChange={handleInputChange}
            placeholder="https://twitter.com/user/status/1234567890 or https://x.com/user/status/1234567890"
            className="input input-bordered w-full"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Supports both twitter.com and x.com URLs</p>
        </div>

        {/* Raffle Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Raffle Type</label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="raffleType"
                value="0"
                checked={formData.raffleType === "0"}
                onChange={handleInputChange}
                className="radio radio-primary"
              />
              <span className="ml-2">👍 Likes</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="raffleType"
                value="1"
                checked={formData.raffleType === "1"}
                onChange={handleInputChange}
                className="radio radio-primary"
              />
              <span className="ml-2">🔄 Retweets</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="raffleType"
                value="2"
                checked={formData.raffleType === "2"}
                onChange={handleInputChange}
                className="radio radio-primary"
                disabled={true}
              />
              <span className="ml-2 text-gray-400">💬 Comments (soon)</span>
            </label>
          </div>
        </div>

        {/* Winner and Backup Count */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="winnerCount" className="block text-sm font-medium text-gray-700 mb-2">
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
              className="input input-bordered w-full"
              required
            />
          </div>
          <div>
            <label htmlFor="backupCount" className="block text-sm font-medium text-gray-700 mb-2">
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
              className="input input-bordered w-full"
              required
            />
          </div>
        </div>

        {/* Fee Display */}
        <div className="bg-base-200 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-semibold">💰 Total Fee:</span>
            <span className="text-lg font-bold text-primary">
              {parseFloat((Number(totalFee) / 1e18).toFixed(3))} MON
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            0.1 MON raffle fee + 0.01 MON VRF fee (prevents spam & ensures fair randomness)
          </p>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">📋 Raffle Summary</h4>
          <p className="text-sm text-blue-700">
            Tweet URL: <span className="font-medium">{formData.tweetUrl || "N/A"}</span>
          </p>
          <p className="text-sm text-blue-700">
            Raffle Type:{" "}
            <span className="font-medium">
              {formData.raffleType === "0" ? "Likes" : formData.raffleType === "1" ? "Retweets" : "Comments (soon)"}
            </span>
          </p>
          <p className="text-sm text-blue-700">
            Winners: <span className="font-medium">{formData.winnerCount}</span>, Backups:{" "}
            <span className="font-medium">{formData.backupCount}</span>
          </p>
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={isCreating}>
          {isCreating ? (
            <>
              <span className="loading loading-spinner"></span>
              Creating Raffle & Processing Twitter Data...
            </>
          ) : (
            <>
              🎲 Create Twitter Raffle
              <span className="text-sm opacity-80">({parseFloat((Number(totalFee) / 1e18).toFixed(3))} MON)</span>
            </>
          )}
        </button>
      </form>

      {/* Results Section */}
      {raffleResults && (
        <div className="mt-8">
          {raffleResults.success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">🎉</div>
                <h3 className="text-xl font-bold text-green-800">Twitter Raffle Completed Successfully!</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-2">📊 Raffle Info</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Type:</strong> {raffleResults.raffleType}
                    </p>
                    <p>
                      <strong>Total Participants:</strong> {raffleResults.totalParticipants}
                    </p>
                    <p>
                      <strong>Fee Paid:</strong> {raffleResults.totalFee} MON
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-2">🔗 Links</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Tweet:</strong>{" "}
                      <a
                        href={raffleResults.tweetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Tweet
                      </a>
                    </p>
                    <p>
                      <strong>Transaction:</strong>{" "}
                      <span className="font-mono text-xs text-gray-600">
                        {String(raffleResults.transactionHash).slice(0, 20)}...
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Winners Section */}
              <div className="mb-4">
                <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                  <span className="text-xl mr-2">🏆</span>
                  Winners ({raffleResults.winners.length})
                </h4>
                <div className="bg-white rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {raffleResults.winners.map((winner: any, index: number) => (
                      <a
                        key={index}
                        href={`https://twitter.com/${winner.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 p-3 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <span className="text-green-600 font-semibold">#{index + 1}</span>
                        <span className="text-green-800 hover:underline">@{winner.username}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Backup Winners Section */}
              {raffleResults.backups.length > 0 && (
                <div>
                  <h4 className="font-semibold text-yellow-700 mb-3 flex items-center">
                    <span className="text-xl mr-2">🏅</span>
                    Backup Winners ({raffleResults.backups.length})
                  </h4>
                  <div className="bg-white rounded-lg p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {raffleResults.backups.map((backup: any, index: number) => (
                        <a
                          key={index}
                          href={`https://twitter.com/${backup.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 p-3 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors"
                        >
                          <span className="text-yellow-600 font-semibold">B{index + 1}</span>
                          <span className="text-yellow-800 hover:underline">@{backup.username}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 text-center">
                <button onClick={() => setRaffleResults(null)} className="btn btn-sm btn-outline">
                  Create Another Raffle
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">❌</div>
                <h3 className="text-xl font-bold text-red-800">Raffle Failed</h3>
              </div>
              <p className="text-red-700 mb-4">{raffleResults.error}</p>
              <button onClick={() => setRaffleResults(null)} className="btn btn-sm btn-outline btn-error">
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
