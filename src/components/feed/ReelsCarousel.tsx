import React from 'react';
import { Film, Play, ChevronRight, Plus, Eye, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReelsCarousel: React.FC = () => {
  const { reels, setActiveTab, setActiveReelIndex, setIsCreateReelOpen } = useApp();

  const handleOpenReel = (idx: number) => {
    setActiveReelIndex(idx);
    setActiveTab('reels');
  };

  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 mb-4 border border-[#CED0D4] shadow-xs select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FA383E] to-[#7928CA] flex items-center justify-center text-white shadow-xs">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-extrabold text-[#050505] flex items-center gap-1.5">
              Reels & Shorts
              <span className="text-[9px] bg-[#FFEBEF] text-[#FA383E] px-1.5 py-0.5 rounded-full font-extrabold">
                CAMPUS HIGHLIGHTS
              </span>
            </h2>
            <p className="text-[11px] text-[#65676B]">Watch moments from STEM labs, rugby matches & arts gala</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('reels')}
          className="text-xs font-bold text-[#1877F2] hover:text-[#166fe5] flex items-center gap-0.5 hover:underline cursor-pointer"
        >
          <span>See all</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Horizontal Reels Strip */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
        {/* Create Reel Card */}
        <div
          onClick={() => setIsCreateReelOpen(true)}
          className="group relative w-28 sm:w-32 h-44 sm:h-48 rounded-xl overflow-hidden bg-gradient-to-b from-[#1877F2]/10 to-[#1877F2]/30 border-2 border-dashed border-[#1877F2]/40 hover:border-[#1877F2] flex flex-col items-center justify-center p-2 text-center cursor-pointer shrink-0 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform mb-2">
            <Plus className="w-5 h-5 stroke-[3]" />
          </div>
          <span className="text-xs font-extrabold text-[#1877F2] leading-tight">
            Post Reel / Short
          </span>
          <span className="text-[10px] text-[#65676B] mt-1">Share clip</span>
        </div>

        {/* Reel Items */}
        {reels.map((reel, idx) => (
          <div
            key={reel.id}
            onClick={() => handleOpenReel(idx)}
            className="group relative w-28 sm:w-32 h-44 sm:h-48 rounded-xl overflow-hidden bg-black border border-[#CED0D4] cursor-pointer shrink-0 shadow-xs hover:shadow-md transition-transform hover:scale-[1.02]"
          >
            <video
              src={reel.videoUrl}
              poster={reel.posterUrl}
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
            />

            {/* Play overlay */}
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover:bg-black/10 transition-colors">
              <div className="w-8 h-8 rounded-full bg-white/90 text-[#1877F2] flex items-center justify-center shadow-md scale-90 group-hover:scale-100 transition-transform">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
            </div>

            {/* Author Avatar Pill */}
            <div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1 bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded-full text-white text-[9px] font-bold">
              <img
                src={reel.author.avatar}
                alt={reel.author.name}
                className="w-4 h-4 rounded-full object-cover border border-white"
              />
              <span className="truncate max-w-[60px]">{reel.author.name.split(' ')[0]}</span>
            </div>

            {/* Bottom Caption & Views */}
            <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white text-[10px]">
              <p className="line-clamp-1 font-medium leading-tight">{reel.caption}</p>
              <div className="flex items-center justify-between text-white/80 font-bold mt-1 text-[9px]">
                <span className="flex items-center gap-0.5">
                  <Eye className="w-2.5 h-2.5 text-[#1877F2]" /> {reel.viewsCount}
                </span>
                <span className="flex items-center gap-0.5">
                  <Heart className="w-2.5 h-2.5 text-[#FA383E] fill-[#FA383E]" /> {reel.likesCount}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
