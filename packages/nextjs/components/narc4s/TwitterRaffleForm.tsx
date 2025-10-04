"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { parseEther } from "viem";
import { useScaffoldWriteContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const TwitterRaffleForm = () => {
  const { address: connectedAddress } = useAccount();
  
  const { writeContractAsync: writeTwitterRaffleAsync } = useScaffoldWriteContract({
    contractName: "TwitterRaffle"
  });

  const { data: raffleFee } = useScaffoldReadContract({
    contractName: "TwitterRaffle",
    functionName: "RAFFLE_FEE",
  });
  
  const [formData, setFormData] = useState({
    tweetUrl: "",
    raffleType: "0", // 0=LIKES, 1=RETWEETS, 2=COMMENTS
    winnerCount: "1",
    backupCount: "1"
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [lastRaffleId, setLastRaffleId] = useState<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateTwitterUrl = (url: string): boolean => {
    const twitterUrlPattern = /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/;
    return twitterUrlPattern.test(url);
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
      const result = await writeTwitterRaffleAsync({
        functionName: "createTwitterRaffle",
        args: [
          formData.tweetUrl,
          parseInt(formData.raffleType),
          BigInt(winnerCount),
          BigInt(backupCount)
        ],
        value: raffleFee ? raffleFee + parseEther("0.01") : parseEther("0.11") // Use contract fee + VRF fee
      });

      console.log("Twitter raffle created with tx:", result);
      
      // Extract raffle ID from logs if possible
      // For now, we'll just show success
      alert("Twitter raffle created successfully! 🎉");
      
      // Reset form
      setFormData({
        tweetUrl: "",
        raffleType: "0",
        winnerCount: "1",
        backupCount: "1"
      });
      
    } catch (error) {
      console.error("Error creating Twitter raffle:", error);
      alert("Failed to create raffle. Please check your balance and try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const getRaffleTypeLabel = (type: string) => {
    switch (type) {
      case "0": return "👍 Likes";
      case "1": return "🔄 Retweets";
      case "2": return "💬 Comments";
      default: return "👍 Likes";
    }
  };

  if (!connectedAddress) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🔗</div>
        <h3 className="text-xl font-semibold mb-4">Connect Your Wallet</h3>
        <p className="text-gray-600 mb-6">
          Please connect your wallet to create Twitter raffles
        </p>
        <div className="btn btn-primary btn-disabled">
          Connect Wallet Required
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tweet URL Input */}
      <div>
        <label className="label">
          <span className="label-text font-semibold">🐦 Tweet URL</span>
        </label>
        <input
          type="url"
          name="tweetUrl"
          value={formData.tweetUrl}
          onChange={handleInputChange}
          placeholder="https://twitter.com/username/status/1234567890"
          className="input input-bordered w-full"
          required
        />
        <label className="label">
          <span className="label-text-alt">Paste the full Twitter/X URL of the giveaway tweet</span>
        </label>
      </div>

      {/* Raffle Type Selection */}
      <div>
        <label className="label">
          <span className="label-text font-semibold">🎯 Raffle Type</span>
        </label>
        <select
          name="raffleType"
          value={formData.raffleType}
          onChange={handleInputChange}
          className="select select-bordered w-full"
        >
          <option value="0">👍 Likes - Select from users who liked the tweet</option>
          <option value="1">🔄 Retweets - Select from users who retweeted</option>
          <option value="2">💬 Comments - Select from users who commented</option>
        </select>
      </div>

      {/* Winner and Backup Count */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">
            <span className="label-text font-semibold">🏆 Winners</span>
          </label>
          <input
            type="number"
            name="winnerCount"
            value={formData.winnerCount}
            onChange={handleInputChange}
            min="1"
            max="50"
            className="input input-bordered w-full"
            required
          />
          <label className="label">
            <span className="label-text-alt">1-50 winners</span>
          </label>
        </div>
        
        <div>
          <label className="label">
            <span className="label-text font-semibold">🔄 Backups</span>
          </label>
          <input
            type="number"
            name="backupCount"
            value={formData.backupCount}
            onChange={handleInputChange}
            min="0"
            max="20"
            className="input input-bordered w-full"
            required
          />
          <label className="label">
            <span className="label-text-alt">0-20 backup winners</span>
          </label>
        </div>
      </div>

      {/* Fee Display */}
      <div className="bg-base-200 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-semibold">💰 Total Fee:</span>
          <span className="text-lg font-bold text-primary">
            {raffleFee ? `${parseFloat((Number(raffleFee + parseEther("0.01")) / 1e18).toFixed(3))} MON` : "0.11 MON"}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          0.1 MON raffle fee + 0.01 MON VRF fee (prevents spam & ensures fair randomness)
        </p>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">📋 Raffle Summary</h4>
        <div className="text-sm text-blue-700">
          <p><strong>Type:</strong> {getRaffleTypeLabel(formData.raffleType)}</p>
          <p><strong>Winners:</strong> {formData.winnerCount} main + {formData.backupCount} backup</p>
          <p><strong>URL:</strong> {formData.tweetUrl || "Not entered yet"}</p>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isCreating}
        className={`btn btn-primary btn-lg w-full ${isCreating ? "loading" : ""}`}
      >
        {isCreating ? (
          <span className="loading loading-spinner"></span>
        ) : (
          <>
            🚀 Create Twitter Raffle
            <span className="text-sm opacity-80">
              ({raffleFee ? `${parseFloat((Number(raffleFee + parseEther("0.01")) / 1e18).toFixed(3))} MON` : "0.11 MON"})
            </span>
          </>
        )}
      </button>
    </form>
  );
};
