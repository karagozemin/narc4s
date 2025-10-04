"use client";

import type { NextPage } from "next";
import { TwitterRaffleForm } from "~~/components/narc4s";

const Home: NextPage = () => {
  return (
    <>
      <div className="min-h-screen bg-black">
        <div className="flex items-center flex-col grow pt-16">
          <div className="px-5 text-center mb-12">
            <div className="mb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-3 border-purple-600/40 mr-6 shadow-2xl">
                  <img src="/images/narc4s-logo.jpg" alt="NARC4S Logo" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col items-start">
                  <div className="flex items-center mb-2">
                    <h1 className="text-6xl font-bold text-white mr-4">NARC4S</h1>
                    <span className="text-gray-400 text-xl font-semibold">v2.0</span>
                  </div>
                  <p className="text-gray-400 text-lg font-medium">Twitter Raffle Verifier</p>
                </div>
              </div>
            </div>

            <p className="text-gray-300 text-lg mb-8 max-w-3xl mx-auto leading-relaxed">
              Create fair and transparent Twitter giveaways. Simply paste a tweet URL, choose raffle type, and get
              instant results.
            </p>

            <div className="flex justify-center items-center space-x-8 mb-12">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">0.11 MON</div>
                <div className="text-sm text-gray-400">Per Raffle</div>
              </div>
              <div className="w-px h-8 bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">Instant</div>
                <div className="text-sm text-gray-400">Results</div>
              </div>
              <div className="w-px h-8 bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">Secure</div>
                <div className="text-sm text-gray-400">VRF Random</div>
              </div>
            </div>
          </div>

          <div className="w-full px-4 sm:px-8 mb-16">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8">
                <div className="flex items-center justify-center space-x-3 mb-8">
                  <h2 className="text-2xl font-bold text-white">Create Twitter Raffle</h2>
                </div>
                <TwitterRaffleForm />
              </div>
            </div>
          </div>

          <div className="w-full px-4 sm:px-8 py-16 bg-gray-900">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-4 text-white">How It Works</h2>
              <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                Four simple steps to create your Twitter raffle
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔗</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Paste Tweet</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Copy and paste the Twitter URL of your giveaway tweet
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚙️</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Configure</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Choose raffle type (Likes/RTs) and set winner count
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Pay 0.11 MON</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Fair pricing with VRF randomness for transparency
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
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

          <div className="w-full px-4 sm:px-8 py-16">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-4 text-white">Why Choose NARC4S</h2>
              <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                Professional raffle system built for transparency and fairness
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-xl">💰</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Fair Pricing</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Only 0.11 MON per raffle. No hidden fees, no subscriptions.
                  </p>
                </div>

                <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-xl">⚡</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Lightning Fast</h3>
                  <p className="text-gray-400 leading-relaxed">Get your winners in seconds. No waiting, no delays.</p>
                </div>

                <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
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
