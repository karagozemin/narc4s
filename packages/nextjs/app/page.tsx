"use client";

import type { NextPage } from "next";
import { TwitterRaffleForm, TwitterRaffleResults } from "~~/components/narc4s";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold text-primary">NARC4S v2.0</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium text-lg">Twitter Raffle Verifier</p>
            <p className="text-2xl">🎲</p>
          </div>
          <p className="text-center text-lg mb-8 max-w-2xl mx-auto text-gray-600">
            Create fair and transparent Twitter giveaways using VRF technology. 
            Simply paste a tweet URL, choose raffle type, and let blockchain ensure fairness!
          </p>
        </div>

        {/* Main Twitter Raffle Form */}
        <div className="bg-base-300 w-full px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-base-100 rounded-3xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-center mb-6">🐦 Create Twitter Raffle</h2>
              <TwitterRaffleForm />
            </div>
          </div>
        </div>

        {/* Recent Raffles Results */}
        <div className="bg-base-200 w-full px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">📊 Recent Raffles</h2>
            <TwitterRaffleResults />
          </div>
        </div>

        {/* How it Works Section */}
        <div className="bg-base-100 w-full px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">🔧 How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🔗</div>
                <h3 className="text-xl font-semibold mb-2">1. Paste Tweet</h3>
                <p className="text-sm text-gray-600">Copy and paste the Twitter URL of the giveaway tweet</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">⚙️</div>
                <h3 className="text-xl font-semibold mb-2">2. Configure</h3>
                <p className="text-sm text-gray-600">Choose raffle type (Likes/RTs/Comments) and winner count</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-semibold mb-2">3. Pay 0.11 MON</h3>
                <p className="text-sm text-gray-600">0.1 MON raffle fee + 0.01 MON VRF fee for fair randomness</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-2">4. VRF Selection</h3>
                <p className="text-sm text-gray-600">Blockchain ensures provably fair winner selection</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
