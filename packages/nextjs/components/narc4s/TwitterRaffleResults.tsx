"use client";

import { useState } from "react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { Address } from "~~/components/scaffold-eth";
import { formatEther } from "viem";

interface RaffleData {
  id: bigint;
  tweetUrl: string;
  raffleType: number;
  winnerCount: bigint;
  backupCount: bigint;
  creator: string;
  createdAt: bigint;
  status: number;
  participants: readonly string[];
  winners: readonly string[];
  backups: readonly string[];
  vrfRequestId: bigint;
}

export const TwitterRaffleResults = () => {
  const [selectedRaffleId, setSelectedRaffleId] = useState<number | null>(null);

  // Get recent raffles
  const { data: recentRaffleIds, isLoading: isLoadingIds } = useScaffoldReadContract({
    contractName: "TwitterRaffle",
    functionName: "getRecentRaffles",
    args: [10n], // Get last 10 raffles
  });

  // Get total raffles count
  const { data: totalRaffles } = useScaffoldReadContract({
    contractName: "TwitterRaffle",
    functionName: "getTotalRaffles",
  });

  // Get selected raffle details
  const { data: selectedRaffle, isLoading: isLoadingRaffle } = useScaffoldReadContract({
    contractName: "TwitterRaffle",
    functionName: "getRaffle",
    args: selectedRaffleId ? [BigInt(selectedRaffleId)] : undefined,
    watch: true, // Watch for updates
  });

  const getRaffleTypeLabel = (type: number) => {
    switch (type) {
      case 0: return "👍 Likes";
      case 1: return "🔄 Retweets";
      case 2: return "💬 Comments";
      default: return "Unknown";
    }
  };

  const getRaffleStatusLabel = (status: number) => {
    switch (status) {
      case 0: return { label: "🔄 Processing", color: "text-yellow-600" };
      case 1: return { label: "✅ Completed", color: "text-green-600" };
      case 2: return { label: "❌ Cancelled", color: "text-red-600" };
      default: return { label: "Unknown", color: "text-gray-600" };
    }
  };

  const formatTimeAgo = (timestamp: bigint) => {
    const now = Date.now() / 1000;
    const diff = now - Number(timestamp);
    
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const extractTweetId = (url: string) => {
    const match = url.match(/status\/(\d+)/);
    return match ? match[1] : null;
  };

  if (isLoadingIds) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="ml-4 text-lg">Loading recent raffles...</p>
      </div>
    );
  }

  if (!recentRaffleIds || recentRaffleIds.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎲</div>
        <h3 className="text-xl font-semibold mb-4">No Raffles Yet</h3>
        <p className="text-gray-600 mb-6">
          Be the first to create a Twitter raffle! Results will appear here once raffles are created.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-blue-700">
            <strong>Connected to Contract:</strong><br />
            <code className="text-xs">0xBBFF3EbD7709945a46b5956D9fA5FEfED2Aa1594</code>
          </p>
          <p className="text-sm text-blue-700 mt-2">
            Total Raffles: {totalRaffles ? Number(totalRaffles).toString() : "0"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="bg-base-100 rounded-lg p-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{totalRaffles ? Number(totalRaffles).toString() : "0"}</div>
            <div className="text-sm text-gray-600">Total Raffles</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-success">{recentRaffleIds.length}</div>
            <div className="text-sm text-gray-600">Recent Raffles</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-info">0xBBFF...</div>
            <div className="text-sm text-gray-600">Contract Address</div>
          </div>
        </div>
      </div>

      {/* Raffle List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentRaffleIds.map((raffleId) => (
          <RaffleCard
            key={Number(raffleId)}
            raffleId={Number(raffleId)}
            onSelect={() => setSelectedRaffleId(Number(raffleId))}
            isSelected={selectedRaffleId === Number(raffleId)}
          />
        ))}
      </div>

      {/* Selected Raffle Details */}
      {selectedRaffleId && (
        <div className="bg-base-100 rounded-lg p-6 shadow-lg border-2 border-primary">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">🔍 Raffle #{selectedRaffleId} Details</h3>
            <button
              onClick={() => setSelectedRaffleId(null)}
              className="btn btn-sm btn-ghost"
            >
              ✕
            </button>
          </div>
          
          {isLoadingRaffle ? (
            <div className="flex items-center justify-center py-8">
              <span className="loading loading-spinner"></span>
              <p className="ml-2">Loading raffle details...</p>
            </div>
          ) : selectedRaffle ? (
            <RaffleDetails raffle={selectedRaffle as RaffleData} />
          ) : (
            <p className="text-red-600">Failed to load raffle details</p>
          )}
        </div>
      )}
    </div>
  );
};

// Individual Raffle Card Component
const RaffleCard = ({ 
  raffleId, 
  onSelect, 
  isSelected 
}: { 
  raffleId: number; 
  onSelect: () => void; 
  isSelected: boolean;
}) => {
  const { data: raffle, isLoading } = useScaffoldReadContract({
    contractName: "TwitterRaffle",
    functionName: "getRaffle",
    args: [BigInt(raffleId)],
  });

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-base-300 rounded w-3/4"></div>
            <div className="h-3 bg-base-300 rounded w-1/2"></div>
            <div className="h-3 bg-base-300 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!raffle) return null;

  const raffleData = raffle as RaffleData;
  const statusInfo = getRaffleStatusLabel(raffleData.status);
  const tweetId = extractTweetId(raffleData.tweetUrl);

  return (
    <div 
      className={`card bg-base-100 shadow-md cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onSelect}
    >
      <div className="card-body p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold">Raffle #{raffleId}</h4>
          <div className={`text-sm ${statusInfo.color}`}>
            {statusInfo.label}
          </div>
        </div>
        
        <div className="space-y-1 text-sm">
          <p><strong>Type:</strong> {getRaffleTypeLabel(raffleData.raffleType)}</p>
          <p><strong>Winners:</strong> {Number(raffleData.winnerCount)} + {Number(raffleData.backupCount)} backup</p>
          <p><strong>Tweet:</strong> ...{tweetId?.slice(-8) || "Unknown"}</p>
          <p><strong>Created:</strong> {formatTimeAgo(raffleData.createdAt)}</p>
        </div>

        {raffleData.winners.length > 0 && (
          <div className="mt-2 text-xs text-success">
            ✅ {raffleData.winners.length} winners selected
          </div>
        )}
      </div>
    </div>
  );
};

// Detailed Raffle View Component
const RaffleDetails = ({ raffle }: { raffle: RaffleData }) => {
  const statusInfo = getRaffleStatusLabel(raffle.status);

  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-gray-600">Tweet URL</label>
          <a 
            href={raffle.tweetUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-blue-600 hover:underline text-sm break-all"
          >
            {raffle.tweetUrl}
          </a>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Creator</label>
          <div className="text-sm">
            <Address address={raffle.creator} />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Type</label>
          <div className="text-sm">{getRaffleTypeLabel(raffle.raffleType)}</div>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Status</label>
          <div className={`text-sm ${statusInfo.color}`}>{statusInfo.label}</div>
        </div>
      </div>

      {/* Participants */}
      <div>
        <label className="text-sm font-semibold text-gray-600">Participants ({raffle.participants.length})</label>
        <div className="bg-base-200 rounded p-3 max-h-32 overflow-y-auto">
          {raffle.participants.length > 0 ? (
            <div className="grid grid-cols-1 gap-1 text-xs">
              {raffle.participants.map((participant, index) => (
                <Address key={index} address={participant} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No participants yet</p>
          )}
        </div>
      </div>

      {/* Winners */}
      {raffle.winners.length > 0 && (
        <div>
          <label className="text-sm font-semibold text-gray-600">🏆 Winners ({raffle.winners.length})</label>
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <div className="grid grid-cols-1 gap-1 text-sm">
              {raffle.winners.map((winner, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-green-600 font-semibold">#{index + 1}</span>
                  <Address address={winner} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Backup Winners */}
      {raffle.backups.length > 0 && (
        <div>
          <label className="text-sm font-semibold text-gray-600">🔄 Backup Winners ({raffle.backups.length})</label>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <div className="grid grid-cols-1 gap-1 text-sm">
              {raffle.backups.map((backup, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-yellow-600 font-semibold">B{index + 1}</span>
                  <Address address={backup} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions (moved outside component to avoid re-creation)
const getRaffleTypeLabel = (type: number) => {
  switch (type) {
    case 0: return "👍 Likes";
    case 1: return "🔄 Retweets";
    case 2: return "💬 Comments";
    default: return "Unknown";
  }
};

const getRaffleStatusLabel = (status: number) => {
  switch (status) {
    case 0: return { label: "🔄 Processing", color: "text-yellow-600" };
    case 1: return { label: "✅ Completed", color: "text-green-600" };
    case 2: return { label: "❌ Cancelled", color: "text-red-600" };
    default: return { label: "Unknown", color: "text-gray-600" };
  }
};

const formatTimeAgo = (timestamp: bigint) => {
  const now = Date.now() / 1000;
  const diff = now - Number(timestamp);
  
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const extractTweetId = (url: string) => {
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : null;
};
