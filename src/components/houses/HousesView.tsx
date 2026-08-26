import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  Shield,
  Users,
  Award,
  Sparkles,
  ChevronRight,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { HOUSES_DATA } from '../../data/mockData';
import { PostCard } from '../feed/PostCard';
import { House } from '../../types';

export const HousesView: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    houses,
    selectedHouse,
    setSelectedHouse,
    posts,
    setIsCreatePostOpen
  } = useApp();

  const [activeTab, setActiveTab] = useState<'standings' | 'houses' | 'clubs'>('standings');

  const currentSelectedHouseData = houses.find((h) => h.name === selectedHouse) || houses[0];

  const housePosts = posts.filter(
    (p) =>
      p.houseTag === currentSelectedHouseData.name ||
      p.author.house === currentSelectedHouseData.name
  );

  return (
    <div className="w-full max-w-5xl mx-auto py-4 px-2 sm:px-4 select-none space-y-6">
      {/* Top Banner: Inter-House Shield */}
      <div className="bg-gradient-to-r from-[#1877F2] via-[#0866FF] to-[#0052CC] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-3">
            <Trophy className="w-3.5 h-3.5 text-[#F7B125]" />
            <span>2025/2026 Inter-House Championship Shield</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            MFA Inter-House & Dormitory Hub
          </h1>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed mb-4">
            Track real-time points for Kenya, Kilimanjaro, Longonot, and Elgon across athletics, academic Olympiads, robotics showcases, and discipline.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedHouse(currentUser.house as any);
              }}
              className="bg-white text-[#1877F2] hover:bg-neutral-100 font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors"
            >
              My House: {currentUser.house}
            </button>
            <button
              onClick={() => setIsCreatePostOpen(true)}
              className="bg-white/20 hover:bg-white/30 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors"
            >
              Post House Update
            </button>
          </div>
        </div>

        {/* Decorative Mascot Background */}
        <div className="absolute right-4 -bottom-6 text-8xl opacity-20 pointer-events-none hidden sm:block">
          🏆
        </div>
      </div>

      {/* House Standings Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {houses.map((house, idx) => {
          const isLeader = idx === 0;
          const isSelected = selectedHouse === house.name;
          return (
            <div
              key={house.name}
              onClick={() => setSelectedHouse(house.name as any)}
              className={`bg-white rounded-2xl p-4 shadow-xs border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                isSelected
                  ? 'border-[#1877F2] ring-2 ring-[#BEDDFF]'
                  : 'border-[#CED0D4] hover:border-[#1877F2]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{house.mascot.slice(-2)}</span>
                {isLeader && (
                  <span className="text-[10px] font-bold bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded-full flex items-center gap-1">
                    👑 1st Place
                  </span>
                )}
              </div>

              <h3 className="font-extrabold text-base text-[#050505]">{house.name} House</h3>
              <p className="text-xs text-[#65676B] italic mb-3">"{house.motto}"</p>

              <div className="p-2.5 rounded-xl bg-[#F0F2F5] mb-3">
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-[#65676B]">Total Score</span>
                  <span className="font-extrabold text-sm text-[#050505]">
                    {house.points} pts
                  </span>
                </div>
                <div className="w-full h-2 bg-[#E4E6EB] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round((house.points / 1500) * 100)}%`,
                      backgroundColor: house.color
                    }}
                  />
                </div>
              </div>

              <div className="text-[11px] text-[#65676B] space-y-1">
                <div>
                  <span className="font-semibold">Captain:</span> {house.captain}
                </div>
                <div>
                  <span className="font-semibold">Master:</span> {house.dormMaster}
                </div>
                <div className="text-[#1877F2] font-semibold pt-1">
                  ⭐ {house.leadingCategory}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected House Deep Dive & Timeline */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#CED0D4] space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#CED0D4] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{currentSelectedHouseData.mascot.slice(-2)}</span>
              <h2 className="text-2xl font-black text-[#050505]">
                {currentSelectedHouseData.name} House Timeline
              </h2>
            </div>
            <p className="text-xs text-[#65676B] mt-1">
              Dormitory Common Room, Announcements & Inter-house derby preparations.
            </p>
          </div>

          <button
            onClick={() => setIsCreatePostOpen(true)}
            className="px-4 py-2 bg-[#1877F2] text-white font-bold text-xs rounded-xl hover:bg-[#166fe5] shadow-xs"
          >
            Post to {currentSelectedHouseData.name} House
          </button>
        </div>

        {/* House Posts Stream */}
        {housePosts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-xs text-[#65676B]">
              No posts specifically tagged with {currentSelectedHouseData.name} House yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {housePosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
