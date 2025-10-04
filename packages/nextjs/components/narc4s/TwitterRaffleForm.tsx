"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

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
      // Call backend to process Twitter data directly
      const backendResponse = await fetch('http://localhost:3001/api/process-raffle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raffleId: Date.now(), // Simple ID for now
          tweetUrl: formData.tweetUrl,
          raffleType: parseInt(formData.raffleType),
          winnerCount: winnerCount,
          backupCount: backupCount
        })
      });
      
      const backendResult = await backendResponse.json();
      
      if (backendResult.success) {
        // Display results in a nice format
        const winnersList = backendResult.winners.map((w: any) => `@${w.username}`).join('\n• ');
        const backupsList = backendResult.backups.length > 0 
          ? backendResult.backups.map((b: any) => `@${b.username}`).join('\n• ')
          : 'None';
        
        alert(`🎉 Twitter Raffle Completed Successfully!
        
📊 Results:
• Total Participants: ${backendResult.totalParticipants}
• Raffle Type: ${backendResult.raffleType}

🏆 Winners (${backendResult.winners.length}):
• ${winnersList}

🏅 Backup Winners (${backendResult.backups.length}):
${backupsList === 'None' ? '• None' : '• ' + backupsList}

🔗 Tweet: ${backendResult.tweetUrl}`);
      } else {
        alert(`❌ Raffle processing failed: ${backendResult.error}`);
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
      alert("❌ Failed to process raffle. Please check your connection and try again.");
    } finally {
      setIsCreating(false);
    }
  };

  if (!connectedAddress) {
    return (
      <div className="text-center text-lg text-gray-600">
        Please connect your wallet to create a Twitter raffle.
      </div>
    );
  }

  return (
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
        <p className="text-xs text-gray-500 mt-1">
          Supports both twitter.com and x.com URLs
        </p>
      </div>

      {/* Raffle Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Raffle Type
        </label>
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
            />
            <span className="ml-2">💬 Comments</span>
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

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">📋 Raffle Summary</h4>
        <p className="text-sm text-blue-700">
          Tweet URL: <span className="font-medium">{formData.tweetUrl || "N/A"}</span>
        </p>
        <p className="text-sm text-blue-700">
          Raffle Type: <span className="font-medium">
            {formData.raffleType === "0" ? "Likes" : formData.raffleType === "1" ? "Retweets" : "Comments"}
          </span>
        </p>
        <p className="text-sm text-blue-700">
          Winners: <span className="font-medium">{formData.winnerCount}</span>, Backups: <span className="font-medium">{formData.backupCount}</span>
        </p>
      </div>

      {/* Submit Button */}
      <button type="submit" className="btn btn-primary btn-lg w-full" disabled={isCreating}>
        {isCreating ? (
          <>
            <span className="loading loading-spinner"></span>
            Processing Twitter Raffle...
          </>
        ) : (
          <>
            🎲 Start Twitter Raffle
            <span className="text-sm opacity-80">(Free - No fees required!)</span>
          </>
        )}
      </button>
    </form>
  );
};