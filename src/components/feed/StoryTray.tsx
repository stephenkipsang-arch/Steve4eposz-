import React from 'react';
import { Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const StoryTray: React.FC = () => {
  const { currentUser } = useAuth();
  const { stories, setIsCreateStoryOpen, openStoryViewer } = useApp();

  return (
    <div className="relative mb-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
        {/* Create Story Card */}
        <div
          onClick={() => setIsCreateStoryOpen(true)}
          className="relative w-28 sm:w-32 h-48 sm:h-52 rounded-xl bg-white shadow-xs border border-[#CED0D4] overflow-hidden flex-col justify-between cursor-pointer group hover:scale-[1.02] transition-all shrink-0 snap-start flex"
        >
          <div className="h-32 sm:h-36 w-full overflow-hidden bg-[#E4E6EB]">
            <img
              src={currentUser.avatar}
              alt="My Avatar"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="relative bg-white pt-5 pb-2 px-1 text-center flex-1 flex flex-col justify-center">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center border-4 border-white shadow-md">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-xs font-semibold text-[#050505] leading-tight">
              Create Story
            </span>
          </div>
        </div>

        {/* Peer Story Cards */}
        {stories.map((story, index) => (
          <div
            key={story.id}
            onClick={() => openStoryViewer(index)}
            className="relative w-28 sm:w-32 h-48 sm:h-52 rounded-xl shadow-xs border border-[#CED0D4] overflow-hidden cursor-pointer group hover:scale-[1.02] transition-all shrink-0 snap-start select-none"
          >
            {/* Background Image */}
            <img
              src={story.mediaUrl}
              alt={story.user.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

            {/* Author Avatar with Blue Ring */}
            <div className="absolute top-2.5 left-2.5 z-10">
              <img
                src={story.user.avatar}
                alt={story.user.name}
                className="w-9 h-9 rounded-full object-cover border-4 border-[#1877F2] shadow-sm"
              />
            </div>

            {/* Caption & User Name */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
              {story.caption && (
                <p className="text-[10px] text-white/90 font-medium line-clamp-1 mb-0.5">
                  {story.caption}
                </p>
              )}
              <p className="text-xs font-bold text-white leading-tight truncate drop-shadow-sm">
                {story.user.id === currentUser.id ? 'Your Story' : story.user.name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
