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
import { apiFetch, apiUrl } from '../../utils/api';
import { apiFetch } from '../../utils/api';

const SAMPLE_CAMPUS_FOOTAGE: Array<{title:string;url:string;poster:string;suggestedAudio:string;tags:string[]}> = [];
 
const SUGGESTED_HASHTAGS = [
  '#Grade10',
  '#Robotics',
  '#AcademyHouse',
  '#Academy',
  '#Academy',
  '#Academy',
  '#InterHouse',
  '#VEXPEX',
  '#RugbySevens',
  '#Orchestra',
  '#ScienceCongress'
];

const CAMPUS_LOCATIONS = ['Academy Learning Centre','Science & Technology Lab','Academy Library','Online Learning Arena'];

export const CreateReelModal: React.FC = () => {
  const { isCreateReelOpen, setIsCreateReelOpen, addReel } = useApp();
  const { currentUser } = useAuth();

  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [posterUrl, setPosterUrl] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [audioTrack, setAudioTrack] = useState<string>('Original Audio');
  const [houseTag, setHouseTag] = useState<'All Academy'>('All Academy');
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
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      window.alert('Please choose a video under 50 MB.');
      return;
    }
    const localUrl = URL.createObjectURL(file);
    setVideoUrl(localUrl);
    setPosterUrl('');
    setAudioTrack(`Original Audio • ${currentUser.name.split(' ')[0]}`);
    (window as any).__mfaReelFile = file;
  };

  const handleToggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = (window as any).__mfaReelFile as File | undefined;
    try {
      let finalVideoUrl = videoUrl;
      if (file) {
        const upload = await apiFetch('/api/reels/upload', {
          method: 'POST',
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          body: file
        });
        if (!upload.ok) throw new Error('upload failed');
        const data = await upload.json();
        finalVideoUrl = apiUrl(data.url);
      }
      if (!finalVideoUrl) return;
      addReel(finalVideoUrl, caption.trim() || 'Grade 10 campus short 🎥', audioTrack.trim() || `Original Audio • ${currentUser.name}`, 'All Academy', location, tags, posterUrl || undefined);
      (window as any).__mfaReelFile = undefined;
      setCaption('');
      setVideoUrl('');
      setIsCreateReelOpen(false);
    } catch {
      window.alert('The video could not be uploaded. Please try again with a video under 50 MB.');
    }
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
          <button type="button" onClick={() => setInputMode('url')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${inputMode === 'url' ? 'bg-[#1877F2] text-white' : 'text-[#B0B3B8]'}`}>Video Link</button>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#E4E6EB]">Audience</label>
              <div className="w-full bg-[#242526] text-xs text-white px-3 py-2 rounded-xl border border-[#3A3B3C]">Grade 10 • All Academy</div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#E4E6EB] flex items-center gap-1"><MapPin className="w-3 h-3 text-[#FA383E]" /> Campus Location</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-[#242526] text-xs text-white px-3 py-2 rounded-xl border border-[#3A3B3C]">{CAMPUS_LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}</select>
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
