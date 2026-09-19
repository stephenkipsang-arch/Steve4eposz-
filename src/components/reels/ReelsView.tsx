import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  Plus,
  Music,
  MapPin,
  Sparkles,
  Grid,
  Film,
  Send,
  X,
  CheckCircle2,
  Eye,
  RotateCcw,
  AlertCircle,
  Loader2,
  Maximize2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Reel } from '../../types';
import { apiUrl } from '../../utils/api';

export const ReelsView: React.FC = () => {
  const {
    reels,
    activeReelIndex,
    setActiveReelIndex,
    likeReel,
    addReelComment,
    likeReelComment,
    setIsCreateReelOpen,
    viewUserProfile
  } = useApp();
  const { currentUser } = useAuth();

  const [viewMode, setViewMode] = useState<'player' | 'grid'>('player');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true); // Start muted to comply with browser autoplay policies
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isCommentsOpen, setIsCommentsOpen] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>('');
  const [isCopiedToast, setIsCopiedToast] = useState<boolean>(false);
  const [expandedCaption, setExpandedCaption] = useState<boolean>(false);
  const [likedAnimation, setLikedAnimation] = useState<boolean>(false);
  const [showMutePrompt, setShowMutePrompt] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  // Filtered Reels
  const filteredReels = reels;

  const currentReel: Reel | undefined = filteredReels[activeReelIndex] || filteredReels[0] || reels[0];
  const playbackUrl = currentReel?.videoUrl?.startsWith('/') ? apiUrl(currentReel.videoUrl) : currentReel?.videoUrl;

  // Sync mute state directly to video DOM property
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Handle Video Loading and Autoplay on reel switch
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setProgress(0);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = isMuted;

      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch((error) => {
            console.warn('Autoplay handled gracefully:', error?.message || error);
            setIsPlaying(false);
            setIsLoading(false);
            // If autoplay was prevented due to audio, auto-mute and retry cleanly
            if (!isMuted && videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              const retryPromise = videoRef.current.play();
              if (retryPromise !== undefined) {
                retryPromise.then(() => setIsPlaying(true)).catch(() => {});
              }
            }
          });
      }
    }
  }, [activeReelIndex, viewMode, currentReel?.id, currentReel?.videoUrl]);

  // Keyboard navigation (Arrow keys up/down, space for play/pause, m for mute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'player') return;
      if (isCommentsOpen) return;

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        handleNextReel();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        handlePrevReel();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeReelIndex, filteredReels.length, isPlaying, viewMode, isCommentsOpen, isMuted]);

  const handleNextReel = () => {
    if (activeReelIndex < filteredReels.length - 1) {
      setActiveReelIndex(activeReelIndex + 1);
    } else {
      setActiveReelIndex(0); // loop back
    }
    setExpandedCaption(false);
  };

  const handlePrevReel = () => {
    if (activeReelIndex > 0) {
      setActiveReelIndex(activeReelIndex - 1);
    } else {
      setActiveReelIndex(filteredReels.length - 1);
    }
    setExpandedCaption(false);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch((err) => {
              console.warn('Playback toggle handled:', err?.message || err);
              setIsPlaying(false);
            });
        }
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    setShowMutePrompt(false);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
      if (!nextMuted && videoRef.current.paused) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 1;
      setCurrentTime(cur);
      setDuration(dur);
      setProgress((cur / dur) * 100);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && videoRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, clickX / rect.width));
      const targetTime = pct * (videoRef.current.duration || 0);
      videoRef.current.currentTime = targetTime;
      setProgress(pct * 100);
    }
  };

  const handleLikeCurrent = () => {
    if (!currentReel) return;
    likeReel(currentReel.id);
    if (!currentReel.isLikedByMe) {
      setLikedAnimation(true);
      setTimeout(() => setLikedAnimation(false), 900);
    }
  };

  const handleDoubleClick = () => {
    if (!currentReel) return;
    if (!currentReel.isLikedByMe) {
      likeReel(currentReel.id);
    }
    setLikedAnimation(true);
    setTimeout(() => setLikedAnimation(false), 900);
  };

  const handleShare = () => {
    setIsCopiedToast(true);
    setTimeout(() => setIsCopiedToast(false), 2500);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReel || !commentText.trim()) return;
    addReelComment(currentReel.id, commentText.trim());
    setCommentText('');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-4 select-none">
      {/* Toast Notification */}
      {isCopiedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#050505] text-white px-4 py-2 rounded-full shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#00A884]" />
          Reel link copied to clipboard!
        </div>
      )}

      {/* Top Header & Mode Switcher */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 mb-4 border border-[#CED0D4] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1877F2] to-[#7928CA] flex items-center justify-center text-white shadow-xs shrink-0">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-[#050505] leading-tight flex items-center gap-1.5">
              Academy Reels & Shorts
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E7F3FF] text-[#1877F2] font-extrabold">
                {reels.length} CLIPS
              </span>
            </h1>
            <p className="text-xs text-[#65676B]">
              Discover student innovations, sports derby tries, orchestra solos & campus moments
            </p>
          </div>
        </div>

        {/* View Mode & Upload Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Mode Switcher */}
          <div className="flex bg-[#F0F2F5] p-1 rounded-xl border border-[#CED0D4]">
            <button
              onClick={() => setViewMode('player')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'player'
                  ? 'bg-white text-[#1877F2] shadow-xs'
                  : 'text-[#65676B] hover:text-[#050505]'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Stream</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-[#1877F2] shadow-xs'
                  : 'text-[#65676B] hover:text-[#050505]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Explore Grid</span>
            </button>
          </div>

          {/* Upload Reel Button */}
          <button
            id="create-reel-btn"
            onClick={() => setIsCreateReelOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl text-xs font-extrabold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Post Reel</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: IMMERSIVE STREAM PLAYER */}
      {/* ========================================================================= */}
      {viewMode === 'player' && filteredReels.length === 0 && (
        <div className="max-w-[420px] mx-auto min-h-[60vh] rounded-3xl bg-[#07111F] border border-[#D4AF37] flex flex-col items-center justify-center p-8 text-center text-white shadow-2xl">
          <Film className="w-14 h-14 text-[#D4AF37] mb-4" />
          <h2 className="text-xl font-black">No Reels or Shorts yet</h2>
          <p className="text-sm text-white/70 mt-2">Be the first Grade 10 learner to post a short video.</p>
          <button onClick={() => setIsCreateReelOpen(true)} className="mt-5 px-5 py-3 rounded-xl bg-[#D4AF37] text-[#07111F] font-black text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Post a Reel / Short</button>
        </div>
      )}

      {viewMode === 'player' && (
        <div className="relative flex justify-center items-start gap-4">
          {/* Main Reel Card Container (Phone / Reel aspect ratio) */}
          <div className="relative w-full max-w-[420px] h-[78vh] min-h-[580px] max-h-[760px] bg-black rounded-3xl overflow-hidden shadow-2xl border border-[#3A3B3C] flex items-center justify-center">
            {currentReel ? (
              <>
                {/* Background Video Element */}
                <video
                  key={currentReel.id}
                  ref={videoRef}
                  src={playbackUrl}
                  poster={currentReel.posterUrl}
                  loop
                  playsInline
                  autoPlay
                  muted={isMuted}
                  preload="auto"
                  onClick={togglePlayPause}
                  onDoubleClick={handleDoubleClick}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedData={() => setIsLoading(false)}
                  onCanPlay={() => setIsLoading(false)}
                  onWaiting={() => setIsLoading(true)}
                  onPlaying={() => {
                    setIsPlaying(true);
                    setIsLoading(false);
                  }}
                  onPause={() => setIsPlaying(false)}
                  onError={(e) => {
                    console.warn('Video failed to load URL:', currentReel.videoUrl, e);
                    setIsLoading(false);
                    setHasError(true);
                  }}
                  className="w-full h-full object-cover cursor-pointer"
                />

                {/* Loading Spinner */}
                {isLoading && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center z-25 pointer-events-none">
                    <Loader2 className="w-10 h-10 text-white animate-spin mb-2" />
                    <span className="text-xs text-white/90 font-bold drop-shadow-md">
                      Loading Reel Clip...
                    </span>
                  </div>
                )}

                {/* Video Error / Fallback Card */}
                {hasError && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center z-25">
                    <AlertCircle className="w-12 h-12 text-[#FA383E] mb-3" />
                    <p className="text-white font-extrabold text-sm mb-1">
                      Video stream buffer issue
                    </p>
                    <p className="text-xs text-white/70 mb-4 max-w-xs">
                      The video stream is unavailable or taking longer than usual to connect.
                    </p>
                    <button
                      onClick={() => {
                        setHasError(false);
                        setIsLoading(true);
                        if (videoRef.current) {
                          videoRef.current.load();
                          videoRef.current.play().catch(() => {});
                        }
                      }}
                      className="px-4 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-colors shadow-lg"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Retry Playback
                    </button>
                  </div>
                )}

                {/* Big Animated Center Heart on Double Tap / Like */}
                {likedAnimation && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-in zoom-in-50 fade-in duration-300">
                    <Heart className="w-24 h-24 text-[#FA383E] fill-[#FA383E] drop-shadow-2xl scale-125 transition-transform" />
                  </div>
                )}

                {/* Center Play/Pause Indicator when paused */}
                {!isPlaying && !isLoading && !hasError && (
                  <div
                    onClick={togglePlayPause}
                    className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer z-20"
                  >
                    <div className="w-16 h-16 rounded-full bg-black/70 text-white flex items-center justify-center backdrop-blur-xs shadow-xl border border-white/20 hover:scale-105 transition-transform">
                      <Play className="w-8 h-8 fill-white ml-1" />
                    </div>
                  </div>
                )}

                {/* Tap to Unmute Banner (Auto-dismisses or clicks) */}
                {isMuted && showMutePrompt && (
                  <button
                    onClick={toggleMute}
                    className="absolute top-14 left-1/2 -translate-x-1/2 z-30 bg-black/70 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-bold flex items-center gap-2 shadow-xl hover:bg-black/90 transition-all cursor-pointer animate-pulse"
                  >
                    <VolumeX className="w-3.5 h-3.5 text-[#FA383E]" />
                    <span>Tap to Unmute Audio</span>
                  </button>
                )}

                {/* Top Overlay: House Tag & Sound indicator */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20 pointer-events-none">
                  {/* House Pill */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/10">
                    <span>🎓</span>
                    <span>{'Grade 10'}</span>
                  </div>

                  {/* Audio Mute / Unmute Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMute();
                    }}
                    className="pointer-events-auto w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-all border border-white/20 shadow-lg cursor-pointer"
                    title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-[#FA383E]" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-[#00A884]" />
                    )}
                  </button>
                </div>

                {/* Bottom Overlay: Author info, Caption & Sound pill */}
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent text-white z-20 space-y-2">
                  {/* Author Header */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => viewUserProfile(currentReel.author)}
                      className="flex items-center gap-2 group text-left cursor-pointer"
                    >
                      <div className="relative">
                        <img
                          src={currentReel.author.avatar}
                          alt={currentReel.author.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute -bottom-1 -right-1 text-[10px]">
                          🎓
                        </span>
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-white flex items-center gap-1 group-hover:text-[#1877F2] transition-colors">
                          {currentReel.author.name}
                          {currentReel.author.isVerifiedAcademy && (
                            <CheckCircle2 className="w-3 h-3 text-[#1877F2] fill-white" />
                          )}
                        </div>
                        <div className="text-[10px] text-white/80 font-medium">
                          {currentReel.author.role} • {currentReel.timestamp}
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Caption & Expandable text */}
                  <div className="text-xs text-white/95 leading-snug">
                    <p className={expandedCaption ? '' : 'line-clamp-2'}>
                      {currentReel.caption}
                    </p>
                    {currentReel.caption.length > 90 && (
                      <button
                        onClick={() => setExpandedCaption(!expandedCaption)}
                        className="text-[11px] font-bold text-[#60A5FA] hover:underline mt-0.5 cursor-pointer"
                      >
                        {expandedCaption ? 'Show less' : '...more'}
                      </button>
                    )}
                  </div>

                  {/* Location & Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    {currentReel.location && (
                      <span className="flex items-center gap-1 bg-white/15 backdrop-blur-md px-2 py-0.5 rounded-full text-white/90 font-medium">
                        <MapPin className="w-3 h-3 text-[#FA383E]" />
                        {currentReel.location.split(',')[0]}
                      </span>
                    )}
                    {currentReel.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[#93C5FD] font-semibold hover:underline cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Soundtrack Marquee Pill */}
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] text-white/80 border border-white/10 w-fit max-w-full">
                    <Music className="w-3 h-3 text-[#00A884] shrink-0 animate-pulse" />
                    <span className="truncate">{currentReel.audioTrack}</span>
                  </div>

                  {/* Interactive Seek Bar */}
                  <div
                    ref={progressBarRef}
                    onClick={handleSeek}
                    className="relative w-full h-1.5 bg-white/20 rounded-full cursor-pointer hover:h-2.5 transition-all overflow-hidden"
                    title="Click to seek"
                  >
                    <div
                      className="h-full bg-gradient-to-r from-[#1877F2] to-[#00A884] rounded-full transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Floating Right Action Sidebar */}
                <div className="absolute right-3 bottom-20 flex flex-col items-center gap-3.5 z-30">
                  {/* Like Button */}
                  <div className="flex flex-col items-center">
                    <button
                      id="reel-like-btn"
                      onClick={handleLikeCurrent}
                      className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg transition-transform active:scale-75 cursor-pointer ${
                        currentReel.isLikedByMe
                          ? 'bg-[#FA383E] text-white'
                          : 'bg-black/50 hover:bg-black/70 text-white'
                      }`}
                      title="Like Reel"
                    >
                      <Heart
                        className={`w-6 h-6 ${
                          currentReel.isLikedByMe ? 'fill-white' : ''
                        }`}
                      />
                    </button>
                    <span className="text-[11px] font-bold text-white mt-1 drop-shadow-md">
                      {currentReel.likesCount}
                    </span>
                  </div>

                  {/* Comments Button */}
                  <div className="flex flex-col items-center">
                    <button
                      id="reel-comments-btn"
                      onClick={() => setIsCommentsOpen(!isCommentsOpen)}
                      className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg transition-transform active:scale-75 cursor-pointer ${
                        isCommentsOpen
                          ? 'bg-[#1877F2] text-white'
                          : 'bg-black/50 hover:bg-black/70 text-white'
                      }`}
                      title="Comments"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                    <span className="text-[11px] font-bold text-white mt-1 drop-shadow-md">
                      {currentReel.comments.length}
                    </span>
                  </div>

                  {/* Share Button */}
                  <div className="flex flex-col items-center">
                    <button
                      id="reel-share-btn"
                      onClick={handleShare}
                      className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md shadow-lg transition-transform active:scale-75 cursor-pointer"
                      title="Share Reel"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <span className="text-[11px] font-bold text-white mt-1 drop-shadow-md">
                      {currentReel.sharesCount}
                    </span>
                  </div>

                  {/* Rotating Vinyl Icon */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1877F2] to-[#FA383E] p-0.5 shadow-lg animate-spin-slow">
                    <img
                      src={currentReel.author.avatar}
                      alt="Soundtrack"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-white p-6">
                <Film className="w-12 h-12 text-[#65676B] mx-auto mb-2" />
                <p className="font-bold text-sm">No reels in this house channel yet</p>
                <button
                  onClick={() => setIsCreateReelOpen(true)}
                  className="mt-3 px-4 py-2 bg-[#1877F2] text-white rounded-xl text-xs font-bold"
                >
                  Be the first to post
                </button>
              </div>
            )}
          </div>

          {/* Up / Down Navigation Controls (Desktop Floating Buttons) */}
          <div className="hidden lg:flex flex-col gap-2 pt-16">
            <button
              onClick={handlePrevReel}
              className="w-10 h-10 rounded-full bg-white hover:bg-[#F0F2F5] text-[#050505] shadow-md border border-[#CED0D4] flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
              title="Previous Reel (Up Arrow)"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <div className="text-center text-[10px] font-bold text-[#65676B]">
              {activeReelIndex + 1} / {filteredReels.length}
            </div>
            <button
              onClick={handleNextReel}
              className="w-10 h-10 rounded-full bg-white hover:bg-[#F0F2F5] text-[#050505] shadow-md border border-[#CED0D4] flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
              title="Next Reel (Down Arrow)"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* ========================================================================= */}
          {/* SLIDE-OUT COMMENTS DRAWER */}
          {/* ========================================================================= */}
          {isCommentsOpen && currentReel && (
            <div className="w-full max-w-sm h-[78vh] min-h-[580px] max-h-[760px] bg-white rounded-3xl border border-[#CED0D4] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-200">
              {/* Comments Header */}
              <div className="p-3.5 border-b border-[#CED0D4] flex items-center justify-between bg-[#F0F2F5]">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#1877F2]" />
                  <span className="font-extrabold text-xs text-[#050505]">
                    Comments ({currentReel.comments.length})
                  </span>
                </div>
                <button
                  onClick={() => setIsCommentsOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] flex items-center justify-center text-[#65676B] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3 scrollbar-thin">
                {currentReel.comments.length === 0 ? (
                  <div className="text-center py-12 text-[#65676B] space-y-1">
                    <MessageCircle className="w-8 h-8 mx-auto text-[#CED0D4]" />
                    <p className="text-xs font-semibold">No comments yet</p>
                    <p className="text-[11px]">Be the first to share your thoughts!</p>
                  </div>
                ) : (
                  currentReel.comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-2 group">
                      <img
                        src={comment.author.avatar}
                        alt={comment.author.name}
                        className="w-8 h-8 rounded-full object-cover border border-[#CED0D4] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="bg-[#F0F2F5] rounded-2xl p-2.5 inline-block max-w-full">
                          <div className="flex items-center gap-1 font-bold text-xs text-[#050505]">
                            {comment.author.name}
                            <span className="text-[10px] font-normal text-[#65676B]">
                              • {comment.author.house}
                            </span>
                          </div>
                          <p className="text-xs text-[#050505] mt-0.5 leading-relaxed break-words">
                            {comment.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-[#65676B] mt-0.5 px-2">
                          <span>{comment.timestamp}</span>
                          <button
                            onClick={() => likeReelComment(currentReel.id, comment.id)}
                            className={`font-bold hover:underline cursor-pointer ${
                              comment.isLikedByMe ? 'text-[#FA383E]' : 'hover:text-[#050505]'
                            }`}
                          >
                            Like {comment.likes > 0 && `(${comment.likes})`}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input Form */}
              <form
                onSubmit={handlePostComment}
                className="p-3 border-t border-[#CED0D4] bg-white flex items-center gap-2"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-[#CED0D4]"
                />
                <input
                  type="text"
                  placeholder="Add a comment for the academy..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 bg-[#F0F2F5] text-xs text-[#050505] px-3 py-2 rounded-full border-0 focus:outline-hidden focus:ring-1 focus:ring-[#1877F2]"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer ${
                    commentText.trim()
                      ? 'bg-[#1877F2] hover:bg-[#166fe5]'
                      : 'bg-[#E4E6EB] text-[#8A8D91] cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: EXPLORE GRID VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {filteredReels.map((reel, index) => {
            const badge = { emoji: '🎓', name: 'Grade 10' };
            return (
              <div
                key={reel.id}
                onClick={() => {
                  setActiveReelIndex(index);
                  setViewMode('player');
                }}
                className="group relative h-72 sm:h-80 rounded-2xl overflow-hidden bg-black border border-[#CED0D4] cursor-pointer shadow-xs hover:shadow-lg transition-all hover:scale-[1.01]"
              >
                {/* Video / Poster preview */}
                <video
                  src={reel.videoUrl}
                  poster={reel.posterUrl}
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                />

                {/* House Badge Tag */}
                <div className="absolute top-2 left-2 z-10">
                  <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10">
                    <span>{badge.emoji}</span>
                    <span>{reel.houseTag}</span>
                  </span>
                </div>

                {/* Play Button Hover Icon */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/90 group-hover:bg-[#1877F2] text-[#1877F2] group-hover:text-white flex items-center justify-center shadow-lg transition-colors scale-90 group-hover:scale-100">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Bottom Stats & Author */}
                <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white">
                  <div className="flex items-center gap-1.5 mb-1">
                    <img
                      src={reel.author.avatar}
                      alt={reel.author.name}
                      className="w-5 h-5 rounded-full object-cover border border-white/50"
                    />
                    <span className="text-[11px] font-bold truncate">{reel.author.name}</span>
                  </div>
                  <p className="text-[11px] text-white/90 line-clamp-1 leading-tight font-medium">
                    {reel.caption}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-white/70 mt-1.5 pt-1 border-t border-white/15 font-semibold">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-[#1877F2]" /> {reel.viewsCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-[#FA383E] fill-[#FA383E]" /> {reel.likesCount}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
