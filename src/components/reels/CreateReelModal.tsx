import React, { useState } from 'react';
import {
  X,
  Clapperboard,
  Music,
  MapPin,
  Upload,
  Play,
  Sparkles,
  Hash,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { House } from '../../types';

const SAMPLE_CAMPUS_FOOTAGE = [
  {
    title: 'Drone & Autonomous Flight Test',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
    suggestedAudio: 'Robotics Lab Beats • Tech Hub Original',
    suggestedHouse: 'Kilimanjaro' as House,
    tags: ['#Robotics', '#STEM', '#Kilimanjaro']
  },
  {
    title: 'Inter-House Rugby Sevens Match',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    poster: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80',
    suggestedAudio: 'Stadium Crowds & Derby Day Chants 🏉',
    suggestedHouse: 'Kenya' as House,
    tags: ['#Rugby', '#KenyaHouse', '#InterHouse']
  },
  {
    title: 'Symphony Strings & African Folk',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    poster: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80',
    suggestedAudio: 'MFA Symphony Orchestra - Vivaldi x Nyatiti',
    suggestedHouse: 'Elgon' as House,
    tags: ['#Orchestra', '#Elgon', '#ArtsGala']
  },
  {
    title: 'Chemistry Lab Flame Spectroscopy',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    poster: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    suggestedAudio: 'Lo-Fi Study Beats • Chemistry Lab',
    suggestedHouse: 'Kenya' as House,
    tags: ['#IBDP', '#Chemistry', '#Science']
  },
  {
    title: 'Green Academy Conservation Drive',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    poster: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
    suggestedAudio: 'Morning Ambience & Campus Anthem',
    suggestedHouse: 'Longonot' as House,
    tags: ['#Longonot', '#GreenCampus', '#VEXPEX']
  }
];

const SUGGESTED_HASHTAGS = [
  '#IBDP',
  '#Robotics',
  '#KenyaHouse',
  '#Kilimanjaro',
  '#Longonot',
  '#Elgon',
  '#InterHouse',
  '#VEXPEX',
  '#RugbySevens',
  '#Orchestra',
  '#ScienceCongress'
];

const CAMPUS_LOCATIONS = [
  'MFA Innovation & Robotics Lab',
  'Main Athletics Arena & Rugby Pitch 1',
  'Science Complex Chemistry Lab 3',
  'Performing Arts Amphitheatre',
  'Uongozi Leadership Centre Auditorium',
  'Academy Library Silent Pods',
  'Dining Hall & Quad Pavilion'
];

export const CreateReelModal: React.FC = () => {
  const { isCreateReelOpen, setIsCreateReelOpen, addReel } = useApp();
  const { currentUser } = useAuth();

  const [inputMode, setInputMode] = useState<'sample' | 'upload' | 'url'>('sample');
  const [videoUrl, setVideoUrl] = useState<string>(SAMPLE_CAMPUS_FOOTAGE[0].url);
  const [posterUrl, setPosterUrl] = useState<string>(SAMPLE_CAMPUS_FOOTAGE[0].poster);
  const [caption, setCaption] = useState<string>('');
  const [audioTrack, setAudioTrack] = useState<string>(SAMPLE_CAMPUS_FOOTAGE[0].suggestedAudio);
  const [houseTag, setHouseTag] = useState<House | 'All Academy'>(currentUser.house);
  const [location, setLocation] = useState<string>(CAMPUS_LOCATIONS[0]);
  const [tags, setTags] = useState<string[]>(['#MFA', '#VEXPEX']);

  if (!isCreateReelOpen) return null;

  const handleSelectSample = (sample: typeof SAMPLE_CAMPUS_FOOTAGE[0]) => {
    setVideoUrl(sample.url);
    setPosterUrl(sample.poster);
    setAudioTrack(sample.suggestedAudio);
    setHouseTag(sample.suggestedHouse);
    setTags((prev) => Array.from(new Set([...prev, ...sample.tags])));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localBlobUrl = URL.createObjectURL(file);
      setVideoUrl(localBlobUrl);
      setPosterUrl('');
      setAudioTrack(`Original Audio • ${currentUser.name.split(' ')[0]}`);
    }
  };

  const handleToggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) return;

    addReel(
      videoUrl,
      caption.trim() || 'Exciting highlights from M-PESA Foundation Academy! ✨🎥',
      audioTrack.trim() || `Original Audio • ${currentUser.name}`,
      houseTag,
      location,
      tags,
      posterUrl || undefined
    );

    // Reset & close
    setCaption('');
    setIsCreateReelOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-[#18191A] text-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#3A3B3C] animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3A3B3C]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white shadow-xs">
              <Clapperboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white">Create Academy Reel / Short</h2>
              <p className="text-[11px] text-[#B0B3B8]">Share vertical video moments with the student community</p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateReelOpen(false)}
            className="w-8 h-8 rounded-full bg-[#3A3B3C] hover:bg-[#4E4F50] flex items-center justify-center text-[#B0B3B8] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 flex-1 scrollbar-thin">
          {/* Video Preview & Source Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#E4E6EB] flex items-center justify-between">
              <span>1. Choose Video Source</span>
              <span className="text-[11px] text-[#1877F2] font-normal">HD 1080p Support</span>
            </label>

            {/* Source Mode Tabs */}
            <div className="flex rounded-lg bg-[#242526] p-1 gap-1 border border-[#3A3B3C]">
              <button
                type="button"
                onClick={() => setInputMode('sample')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  inputMode === 'sample'
                    ? 'bg-[#1877F2] text-white shadow-xs'
                    : 'text-[#B0B3B8] hover:text-white'
                }`}
              >
                Campus Footage
              </button>
              <button
                type="button"
                onClick={() => setInputMode('upload')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  inputMode === 'upload'
                    ? 'bg-[#1877F2] text-white shadow-xs'
                    : 'text-[#B0B3B8] hover:text-white'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setInputMode('url')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  inputMode === 'url'
                    ? 'bg-[#1877F2] text-white shadow-xs'
                    : 'text-[#B0B3B8] hover:text-white'
                }`}
              >
                Video Link
              </button>
            </div>

            {/* Mode 1: Preset Footage Cards */}
            {inputMode === 'sample' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SAMPLE_CAMPUS_FOOTAGE.map((sample, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectSample(sample)}
                    className={`group relative h-24 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                      videoUrl === sample.url
                        ? 'border-[#1877F2] ring-2 ring-[#1877F2]/50'
                        : 'border-[#3A3B3C] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={sample.poster}
                      alt={sample.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-between p-1.5">
                      <div className="self-end">
                        <div className="w-5 h-5 rounded-full bg-white/90 text-[#1877F2] flex items-center justify-center shadow-xs">
                          <Play className="w-2.5 h-2.5 fill-[#1877F2] ml-0.5" />
                        </div>
                      </div>
                      <div className="text-[10px] font-bold text-white leading-tight truncate">
                        {sample.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Mode 2: Upload File */}
            {inputMode === 'upload' && (
              <label className="border-2 border-dashed border-[#3A3B3C] hover:border-[#1877F2] rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-[#242526] transition-colors">
                <Upload className="w-8 h-8 text-[#1877F2] mb-2" />
                <span className="text-xs font-bold text-white">Click or drag a vertical video clip here</span>
                <span className="text-[11px] text-[#B0B3B8] mt-0.5">MP4, WebM, or MOV up to 100MB (9:16 recommended)</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}

            {/* Mode 3: URL Input */}
            {inputMode === 'url' && (
              <div className="space-y-1.5">
                <input
                  type="url"
                  placeholder="Paste direct MP4 or video URL (e.g. https://.../reel.mp4)..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-[#242526] text-xs text-white px-3 py-2 rounded-xl border border-[#3A3B3C] focus:outline-hidden focus:border-[#1877F2]"
                />
              </div>
            )}
          </div>

          {/* Active Video Player Preview */}
          {videoUrl && (
            <div className="relative rounded-xl overflow-hidden bg-black border border-[#3A3B3C] flex items-center justify-center max-h-48">
              <video
                src={videoUrl}
                controls
                className="max-h-48 w-full object-contain"
              />
            </div>
          )}

          {/* Caption & Hashtags */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#E4E6EB] flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-[#1877F2]" />
              2. Caption & Story
            </label>
            <textarea
              rows={3}
              placeholder="What makes this campus moment special? Describe the event, match, or experiment..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-[#242526] text-xs text-white placeholder-[#8A8D91] p-3 rounded-xl border border-[#3A3B3C] focus:outline-hidden focus:border-[#1877F2] resize-none"
            />

            {/* Hashtag quick picks */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SUGGESTED_HASHTAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  className={`text-[11px] px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                    tags.includes(tag)
                      ? 'bg-[#1877F2] text-white shadow-xs'
                      : 'bg-[#242526] text-[#B0B3B8] hover:bg-[#3A3B3C] hover:text-white border border-[#3A3B3C]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Audio Track */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#E4E6EB] flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-[#00A884]" />
              3. Audio / Soundtrack Tag
            </label>
            <input
              type="text"
              placeholder="e.g. Original Audio • Joy & MFA Tech Hub"
              value={audioTrack}
              onChange={(e) => setAudioTrack(e.target.value)}
              className="w-full bg-[#242526] text-xs text-white px-3 py-2 rounded-xl border border-[#3A3B3C] focus:outline-hidden focus:border-[#1877F2]"
            />
          </div>

          {/* House Channel & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#E4E6EB]">House Channel</label>
              <select
                value={houseTag}
                onChange={(e) => setHouseTag(e.target.value as any)}
                className="w-full bg-[#242526] text-xs text-white px-3 py-2 rounded-xl border border-[#3A3B3C] focus:outline-hidden focus:border-[#1877F2] cursor-pointer"
              >
                <option value="All Academy">🌐 All Academy</option>
                <option value="Kenya">🦁 Kenya House</option>
                <option value="Kilimanjaro">🏔️ Kilimanjaro House</option>
                <option value="Longonot">🦅 Longonot House</option>
                <option value="Elgon">🦏 Elgon House</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#E4E6EB] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#FA383E]" />
                Campus Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#242526] text-xs text-white px-3 py-2 rounded-xl border border-[#3A3B3C] focus:outline-hidden focus:border-[#1877F2] cursor-pointer"
              >
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Publish Button */}
          <button
            type="submit"
            disabled={!videoUrl}
            className={`w-full py-2.5 rounded-xl font-extrabold text-sm text-white transition-all shadow-md flex items-center justify-center gap-2 ${
              videoUrl
                ? 'bg-[#1877F2] hover:bg-[#166fe5] cursor-pointer'
                : 'bg-[#3A3B3C] text-[#8A8D91] cursor-not-allowed'
            }`}
          >
            <Clapperboard className="w-4 h-4" />
            Publish Reel to MFA-VEXPEX
          </button>
        </form>
      </div>
    </div>
  );
};
