import React, { useState } from 'react';
import { Award, Trophy, Medal, Building, GraduationCap, MapPin, Sparkles, Filter, Leaf } from 'lucide-react';
import { LEADERBOARD_DATA } from '../data/mockData';
import { LeaderboardEntry } from '../types';

export const LeaderboardView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredData = LEADERBOARD_DATA.filter(
    (item) => selectedCategory === 'ALL' || item.category === selectedCategory
  );

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-xs font-mono font-bold text-slate-400">#{rank}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-yellow-950/50 border border-amber-800/50 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-semibold border border-yellow-500/20">
            <Trophy className="w-3.5 h-3.5" />
            <span>National Circular Economy Honors</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Hostel, University & Municipal Circular Leaderboard
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Gamified circular e-waste collection drive honoring student hostels, academic institutes, corporate IT clusters, and urban local bodies across Bharat.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedCategory === 'ALL'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All India
          </button>
          <button
            onClick={() => setSelectedCategory('Campus / Hostel')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedCategory === 'Campus / Hostel'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Campuses & Hostels
          </button>
          <button
            onClick={() => setSelectedCategory('Tech Park / Corporate')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedCategory === 'Tech Park / Corporate'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tech Parks
          </button>
          <button
            onClick={() => setSelectedCategory('Municipal Ward')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedCategory === 'Municipal Ward'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Municipalities
          </button>
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Ranked Contributors & Green Karma Credits</h3>
          </div>
          <span className="text-xs text-slate-400">Total Entries: {filteredData.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4 text-center w-16">Rank</th>
                <th className="p-4">Institution / Campus / Entity</th>
                <th className="p-4">Category</th>
                <th className="p-4">State</th>
                <th className="p-4 text-right">E-Waste Weight</th>
                <th className="p-4 text-right">CO₂ Offset</th>
                <th className="p-4 text-right">Green Credits</th>
                <th className="p-4 text-center">Honors Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredData.map((item) => (
                <tr
                  key={item.rank}
                  className={`hover:bg-slate-800/40 transition ${
                    item.rank <= 3 ? 'bg-amber-500/[0.03]' : ''
                  }`}
                >
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center">{getRankBadge(item.rank)}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-white text-sm">{item.name}</div>
                    <div className="text-[11px] text-slate-400">{item.devicesRecycled.toLocaleString()} devices safely demanufactured</div>
                  </td>
                  <td className="p-4 text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-[11px]">{item.state}</td>
                  <td className="p-4 text-right font-mono text-white font-bold">
                    {item.kgCollected.toLocaleString()} kg
                  </td>
                  <td className="p-4 text-right font-mono text-emerald-400 font-bold">
                    {item.co2OffsetTonnes.toFixed(1)} MT
                  </td>
                  <td className="p-4 text-right font-mono text-amber-400 font-bold">
                    {item.greenCredits.toLocaleString()} pts
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{item.badge}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
