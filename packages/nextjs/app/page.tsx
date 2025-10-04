"use client";

import type { NextPage } from "next";
import { TwitterRaffleForm } from "~~/components/narc4s";

const Home: NextPage = () => {
  return (
    <>
      {/* Hero Section with Gradient Background */}
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
        <div className="flex items-center flex-col grow pt-16">
          <div className="px-5 text-center mb-12">
            {/* NARC4S Branding */}
            <div className="mb-8">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent mb-4">
                NARC4S
              </h1>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="text-purple-300 text-xl font-semibold">v2.0</span>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              </div>
              <p className="text-purple-200 text-lg font-medium">Twitter Raffle Verifier</p>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-lg mb-8 max-w-3xl mx-auto leading-relaxed">
              Create <span className="text-purple-400 font-semibold">fair</span> and{" "}
              <span className="text-purple-400 font-semibold">transparent</span> Twitter giveaways!
              <br />
              Simply paste a tweet URL, choose raffle type, and get instant results! 🎲
            </p>

            {/* Stats */}
            <div className="flex justify-center items-center space-x-8 mb-12">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">0.11 MON</div>
                <div className="text-sm text-gray-400">Per Raffle</div>
              </div>
              <div className="w-px h-8 bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">⚡</div>
                <div className="text-sm text-gray-400">Instant</div>
              </div>
              <div className="w-px h-8 bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">🔒</div>
                <div className="text-sm text-gray-400">Secure</div>
              </div>
            </div>
          </div>

          {/* Main Twitter Raffle Form */}
          <div className="w-full px-4 sm:px-8 mb-16">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center justify-center space-x-3 mb-8">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">🐦</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Create Twitter Raffle</h2>
                </div>
                <TwitterRaffleForm />
              </div>
            </div>
          </div>

          {/* How it Works Section */}
          <div className="w-full px-4 sm:px-8 py-16 bg-black/20">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-4 text-white">
                How It <span className="text-purple-400">Works</span>
              </h2>
              <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                Four simple steps to create your Twitter raffle
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">🔗</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Paste Tweet</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Copy and paste the Twitter URL of your giveaway tweet
                  </p>
                </div>

                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">⚙️</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Configure</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Choose raffle type (Likes/RTs) and set winner count
                  </p>
                </div>

                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Pay 0.11 MON</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Fair pricing with VRF randomness for transparency
                  </p>
                </div>

                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Get Winners</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Instant results with clickable Twitter profiles
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="w-full px-4 sm:px-8 py-16">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-4 text-white">
                Why Choose <span className="text-purple-400">NARC4S</span>
              </h2>
              <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                Professional raffle system built for transparency and fairness
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-xl">💰</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Fair Pricing</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Only 0.11 MON per raffle. No hidden fees, no subscriptions.
                  </p>
                </div>

                <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-xl">⚡</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Lightning Fast</h3>
                  <p className="text-gray-400 leading-relaxed">Get your winners in seconds. No waiting, no delays.</p>
                </div>

                <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-xl">🔒</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Provably Fair</h3>
                  <p className="text-gray-400 leading-relaxed">
                    VRF-powered randomness ensures transparent winner selection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
