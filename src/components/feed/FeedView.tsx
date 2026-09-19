import React from 'react';
import {
  Image as ImageIcon,
  Smile,
  Video,
  BarChart2,
  Sparkles,
  Flame,
  ShieldCheck,
  Award,
  BookOpen,
  Filter
} from 'lucide-react';
import { StoryTray } from './StoryTray';
import { ReelsCarousel } from './ReelsCarousel';
import { PostCard } from './PostCard';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const FeedView: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    posts,
    setIsCreatePostOpen,
    feedFilter,
    setFeedFilter,
    savedPostIds
  } = useApp();

  // Filter posts based on active filter
  const filteredPosts = posts.filter((post) => {
    return true;
  });

  return (
    <div className="w-full max-w-2xl mx-auto py-4 px-2 sm:px-4">
      {/* Story Tray */}
      <StoryTray />

      {/* "What's on your mind" Post Trigger Card */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-xs border border-[#CED0D4] mb-4 select-none">
        <div className="flex items-center gap-3 pb-3 border-b border-[#E4E6EB]">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover border border-[#CED0D4]"
          />
          <button
            id="open-create-post-btn"
            onClick={() => setIsCreatePostOpen(true)}
            className="flex-1 bg-[#F0F2F5] hover:bg-[#E4E6EB] transition-colors rounded-full py-2.5 px-4 text-left text-xs sm:text-sm text-[#65676B] font-medium cursor-pointer"
          >
            What is on your mind, {currentUser.name.split(' ')[0]}?
          </button>
        </div>

        {/* Quick action triggers */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setIsCreatePostOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-[#F2F2F2] transition-colors cursor-pointer text-xs font-semibold text-[#65676B]"
          >
            <ImageIcon className="w-4 h-4 text-[#45BD62]" />
            <span className="hidden sm:inline">Photo</span>
          </button>

          <button
            onClick={() => setIsCreatePostOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-[#F2F2F2] transition-colors cursor-pointer text-xs font-semibold text-[#65676B]"
          >
            <Video className="w-4 h-4 text-[#E44426]" />
            <span className="hidden sm:inline">Video Clip</span>
          </button>

          <button
            onClick={() => setIsCreatePostOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-[#F2F2F2] transition-colors cursor-pointer text-xs font-semibold text-[#65676B]"
          >
            <Smile className="w-4 h-4 text-[#F7B125]" />
            <span className="hidden sm:inline">Feeling</span>
          </button>

          <button
            onClick={() => setIsCreatePostOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-[#F2F2F2] transition-colors cursor-pointer text-xs font-semibold text-[#65676B]"
          >
            <BarChart2 className="w-4 h-4 text-[#1877F2]" />
            <span className="hidden sm:inline">Poll</span>
          </button>
        </div>
      </div>

      {/* Campus Reels & Shorts Carousel Highlight */}
      <ReelsCarousel />

      {/* Feed Filters Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-2 scrollbar-none">
        <button
          onClick={() => setFeedFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
            feedFilter === 'all'
              ? 'bg-[#1877F2] text-white shadow-xs'
              : 'bg-white text-[#65676B] border border-[#CED0D4] hover:bg-[#F0F2F5]'
          }`}
        >
          🌐 All Academy
        </button>

      </div>

      {/* Posts Stream */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-[#CED0D4] shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#E7F3FF] text-[#1877F2] flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-[#050505] mb-1">
            The Grade 10 feed is completely empty
          </h3>
          <p className="text-xs text-[#65676B] max-w-sm mx-auto mb-4">
            Nothing has been posted yet. Start the Grade 10 learning community when you are ready.
          </p>
          <button
            onClick={() => setIsCreatePostOpen(true)}
            className="px-4 py-2 bg-[#1877F2] text-white font-bold text-xs rounded-xl hover:bg-[#166fe5]"
          >
            Create First Post
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};
