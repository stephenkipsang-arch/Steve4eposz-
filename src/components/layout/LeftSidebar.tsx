import React from 'react';
import {
  Users,
  Store,
  Calendar,
  Bookmark,
  Sparkles,
  Trophy,
  Cpu,
  Music,
  ShieldAlert,
  Flame,
  Award,
  BookOpen,
  HelpCircle,
  GraduationCap,
  Home,
  CheckCircle2,
  Film
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { HOUSES_DATA } from '../../data/mockData';

import { House } from '../../types';

export const LeftSidebar: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    activeTab,
    setActiveTab,
    viewUserProfile,
    setSelectedHouse,
    feedFilter,
    setFeedFilter,
    savedPostIds
  } = useApp();

  const handleHouseClick = (houseName: House) => {
    setSelectedHouse(houseName);
    setActiveTab('groups');
  };

  return (
    <aside aria-label="Campus Navigation Shortcuts" className="w-64 xl:w-72 h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto px-2 py-3 hidden md:flex flex-col justify-between shrink-0 scrollbar-thin select-none">
      <div className="space-y-1">
        {/* Current User Shortcut */}
        <button
          id="left-profile-shortcut"
          onClick={() => viewUserProfile(currentUser)}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#E4E6EB] transition-colors text-left group"
        >
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover border border-[#CED0D4]"
            />
            <span className="absolute -bottom-1 -right-1 text-[11px]">🦁</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-[#050505] truncate flex items-center gap-1">
              {currentUser.name}
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1877F2] fill-[#1877F2] text-white" />
            </div>
            <div className="text-[11px] text-[#65676B] truncate font-medium">
              {currentUser.house} House • {currentUser.gradeOrDept}
            </div>
          </div>
        </button>

        {/* Main Feed Filters */}
        <button
          id="left-feed-btn"
          onClick={() => {
            setActiveTab('feed');
            setFeedFilter('all');
          }}
          className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors text-left text-sm font-semibold ${
            activeTab === 'feed' && feedFilter === 'all'
              ? 'bg-[#E7F3FF] text-[#1877F2]'
              : 'text-[#050505] hover:bg-[#E4E6EB]'
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center">
            <Home className="w-5 h-5" />
          </div>
          <span>All Academy Feed</span>
        </button>

        <button
          id="left-my-house-feed-btn"
          onClick={() => {
            setActiveTab('feed');
            setFeedFilter('my_house');
          }}
          className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors text-left text-sm font-semibold ${
            activeTab === 'feed' && feedFilter === 'my_house'
              ? 'bg-[#E7F3FF] text-[#1877F2]'
              : 'text-[#050505] hover:bg-[#E4E6EB]'
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-[#D97706] text-white flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
          <div className="flex-1 flex items-center justify-between">
            <span>{currentUser.house} House Feed</span>
            <span className="text-[10px] bg-[#FEF3C7] text-[#92400E] font-bold px-1.5 py-0.5 rounded-full">
              My House
            </span>
          </div>
        </button>

        {/* Reels & Shorts */}
        <button
          id="left-reels-btn"
          onClick={() => setActiveTab('reels')}
          className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors text-left text-sm font-semibold ${
            activeTab === 'reels'
              ? 'bg-[#E7F3FF] text-[#1877F2]'
              : 'text-[#050505] hover:bg-[#E4E6EB]'
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FA383E] to-[#7928CA] text-white flex items-center justify-center shadow-xs">
            <Film className="w-5 h-5" />
          </div>
          <div className="flex-1 flex items-center justify-between">
            <span>Reels & Shorts</span>
            <span className="text-[10px] bg-[#FFEBEF] text-[#FA383E] font-extrabold px-1.5 py-0.5 rounded-full">
              NEW
            </span>
          </div>
        </button>

        {/* Houses & Dormitories Hub */}
        <button
          id="left-houses-btn"
          onClick={() => setActiveTab('groups')}
          className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors text-left text-sm font-semibold ${
            activeTab === 'groups'
              ? 'bg-[#E7F3FF] text-[#1877F2]'
              : 'text-[#050505] hover:bg-[#E4E6EB]'
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-[#059669] text-white flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="flex-1 flex items-center justify-between">
            <span>Inter-House Shield</span>
            <span className="text-[10px] bg-[#DCFCE7] text-[#166534] font-bold px-1.5 py-0.5 rounded-full">
              Live
            </span>
          </div>
        </button>

        {/* Campus Marketplace */}
        <button
          id="left-market-btn"
          onClick={() => setActiveTab('marketplace')}
          className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors text-left text-sm font-semibold ${
            activeTab === 'marketplace'
              ? 'bg-[#E7F3FF] text-[#1877F2]'
              : 'text-[#050505] hover:bg-[#E4E6EB]'
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-[#00A884] text-white flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <span>MFA Campus Store</span>
        </button>

        {/* Events & Calendar */}
        <button
          id="left-events-btn"
          onClick={() => setActiveTab('events')}
          className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors text-left text-sm font-semibold ${
            activeTab === 'events'
              ? 'bg-[#E7F3FF] text-[#1877F2]'
              : 'text-[#050505] hover:bg-[#E4E6EB]'
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-[#FA383E] text-white flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <span>Academy Events</span>
        </button>

        {/* Saved Posts */}
        <button
          id="left-saved-btn"
          onClick={() => {
            setActiveTab('feed');
            setFeedFilter('announcements');
          }}
          className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors text-left text-sm font-semibold ${
            activeTab === 'feed' && feedFilter === 'announcements'
              ? 'bg-[#E7F3FF] text-[#1877F2]'
              : 'text-[#050505] hover:bg-[#E4E6EB]'
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center">
            <Bookmark className="w-5 h-5" />
          </div>
          <div className="flex-1 flex items-center justify-between">
            <span>Saved Bulletins</span>
            <span className="text-[10px] text-[#65676B] font-bold">
              {savedPostIds.length}
            </span>
          </div>
        </button>

        <div className="border-t border-[#CED0D4] my-2 pt-2" />

        {/* Academy Houses Section */}
        <div className="px-2 pb-1 text-[11px] font-bold text-[#65676B] uppercase tracking-wider flex items-center justify-between">
          <span>Academy Houses</span>
          <span className="text-[10px] text-[#1877F2] font-semibold">Points</span>
        </div>

        {HOUSES_DATA.map((house) => (
          <button
            key={house.name}
            onClick={() => handleHouseClick(house.name as any)}
            className="w-full flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#E4E6EB] transition-colors text-left"
          >
            <span className="text-base">{house.mascot.slice(-2)}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[#050505] truncate flex items-center justify-between">
                <span>{house.name} House</span>
                <span className="text-[11px] font-bold text-[#1877F2]">
                  {house.points} pts
                </span>
              </div>
              <div className="text-[10px] text-[#65676B] truncate">{house.motto}</div>
            </div>
          </button>
        ))}

        <div className="border-t border-[#CED0D4] my-2 pt-2" />

        {/* Clubs & Societies Shortcuts */}
        <div className="px-2 pb-1 text-[11px] font-bold text-[#65676B] uppercase tracking-wider">
          Clubs & Societies
        </div>

        <button
          onClick={() => {
            setActiveTab('feed');
            setFeedFilter('academic');
          }}
          className="w-full flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#E4E6EB] transition-colors text-left"
        >
          <div className="w-7 h-7 rounded-lg bg-[#DBEAFE] text-[#1E40AF] flex items-center justify-center">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-[#050505] truncate">Robotics & AI Lab</div>
            <div className="text-[10px] text-[#65676B]">STEM Championship Finalists</div>
          </div>
        </button>

        <button
          onClick={() => {
            setActiveTab('feed');
            setFeedFilter('academic');
          }}
          className="w-full flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#E4E6EB] transition-colors text-left"
        >
          <div className="w-7 h-7 rounded-lg bg-[#FCE7F3] text-[#BE185D] flex items-center justify-center">
            <Music className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-[#050505]">MFA Symphony & Arts</div>
            <div className="text-[10px] text-[#65676B]">Concerts & Productions</div>
          </div>
        </button>

        <button
          onClick={() => {
            setActiveTab('feed');
            setFeedFilter('leadership');
          }}
          className="w-full flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#E4E6EB] transition-colors text-left"
        >
          <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] text-[#92400E] flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-[#050505]">VEXPEX Student Council</div>
            <div className="text-[10px] text-[#65676B]">Uongozi Leadership Hub</div>
          </div>
        </button>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-[#CED0D4] px-2 text-[11px] text-[#65676B] space-y-1">
        <div className="flex items-center gap-1 font-semibold text-[#1877F2]">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>M-PESA Foundation Academy</span>
        </div>
        <p className="text-[10px] leading-tight">
          Exclusive intranet for verified students & staff in Thika, Kenya.
        </p>
        <p className="text-[10px] text-[#8A8D91]">
          MFA-VEXPEX © 2026 • All rights reserved
        </p>
      </div>
    </aside>
  );
};
