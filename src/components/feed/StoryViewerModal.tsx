import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, ThumbsUp, Smile, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const StoryViewerModal: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    stories,
    activeStoryIndex,
    closeStoryViewer,
    openStoryViewer,
    sendMessage,
    openChatWithUser
  } = useApp();

  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');

  const currentStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  useEffect(() => {
    if (activeStoryIndex === null || !currentStory) return;

    setProgress(0);
    const interval = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          if (prev >= 100) {
            // Move to next story or close
            if (activeStoryIndex < stories.length - 1) {
              openStoryViewer(activeStoryIndex + 1);
            } else {
              closeStoryViewer();
            }
            return 0;
          }
          return prev + 1.5;
        });
      }
    }, 70);

    return () => clearInterval(interval);
  }, [activeStoryIndex, isPaused, stories.length]);

  if (!currentStory || activeStoryIndex === null) return null;

  const handlePrev = () => {
    if (activeStoryIndex > 0) {
      openStoryViewer(activeStoryIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeStoryIndex < stories.length - 1) {
      openStoryViewer(activeStoryIndex + 1);
    } else {
      closeStoryViewer();
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    sendMessage(currentStory.user.id, `Replied to your story: "${replyText}"`);
    openChatWithUser(currentStory.user);
    setReplyText('');
  };

  const handleQuickReaction = (emoji: string) => {
    sendMessage(currentStory.user.id, `Reacted ${emoji} to your story!`);
    openChatWithUser(currentStory.user);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center select-none">
      {/* Top Close Button */}
      <button
        onClick={closeStoryViewer}
        className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation Left */}
      {activeStoryIndex > 0 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 sm:left-8 z-40 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors hidden sm:flex"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {/* Story Center Frame */}
      <div
        className="relative w-full max-w-sm h-[90vh] sm:h-[82vh] bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Progress Bar Header */}
        <div className="absolute top-3 left-3 right-3 z-30 flex gap-1">
          {stories.map((s, idx) => (
            <div key={s.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-75"
                style={{
                  width:
                    idx < activeStoryIndex
                      ? '100%'
                      : idx === activeStoryIndex
                      ? `${progress}%`
                      : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* User Info Header */}
        <div className="absolute top-6 left-3 right-3 z-30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={currentStory.user.avatar}
              alt={currentStory.user.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-[#1877F2]"
            />
            <div>
              <div className="font-bold text-sm text-white drop-shadow-md">
                {currentStory.user.name}
              </div>
              <div className="text-[11px] text-white/80 font-medium">
                {currentStory.user.house} House • {currentStory.timestamp}
              </div>
            </div>
          </div>
        </div>

        {/* Story Media */}
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <img
            src={currentStory.mediaUrl}
            alt="Story"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

          {currentStory.caption && (
            <div className="absolute bottom-24 left-4 right-4 z-20 bg-black/40 backdrop-blur-xs p-3 rounded-xl border border-white/20 text-center">
              <p className="text-sm font-semibold text-white leading-relaxed">
                {currentStory.caption}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Reaction & Reply Bar */}
        <div className="absolute bottom-3 left-3 right-3 z-30 space-y-2">
          {/* Quick Reaction Emojis */}
          <div className="flex items-center justify-center gap-3">
            {['❤️', '🦁', '🔥', '👏', '😮', '😂'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleQuickReaction(emoji)}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-lg hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Reply Input Form */}
          {currentStory.user.id !== currentUser.id && (
            <form onSubmit={handleSendReply} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={`Reply to ${currentStory.user.name.split(' ')[0]}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 bg-white/20 backdrop-blur-md text-white placeholder-white/70 text-xs px-4 py-2.5 rounded-full border border-white/30 focus:outline-hidden focus:ring-2 focus:ring-[#1877F2]"
              />
              <button
                type="submit"
                className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center shrink-0 hover:bg-[#166fe5] transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Navigation Right */}
      {activeStoryIndex < stories.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 sm:right-8 z-40 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors hidden sm:flex"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}
    </div>
  );
};
