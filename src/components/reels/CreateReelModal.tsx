import React, { useState } from 'react';
import { X, Clapperboard, Upload, Hash, Music, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { apiFetch, apiUrl } from '../../utils/api';

const LOCATIONS = ['Academy Learning Centre', 'Science & Technology Lab', 'Academy Library', 'Online Learning Arena'];
const TAGS = ['#Grade10', '#Robotics', '#Academy', '#VEXPEX', '#ScienceCongress'];

export const CreateReelModal: React.FC = () => {
  const { isCreateReelOpen, setIsCreateReelOpen, addReel } = useApp();
  const { currentUser } = useAuth();
  const [videoUrl, setVideoUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [audioTrack, setAudioTrack] = useState('Original Audio');
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [tags, setTags] = useState<string[]>(['#Grade10', '#VEXPEX']);
  const [uploading, setUploading] = useState(false);

  if (!isCreateReelOpen) return null;

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      window.alert('Please choose a video under 50 MB.');
      return;
    }
    setVideoUrl(URL.createObjectURL(file));
    (window as any).__mfaReelFile = file;
    setAudioTrack(`Original Audio • ${currentUser.name.split(' ')[0]}`);
  };

  const toggleTag = (tag: string) => setTags((prev) => prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]);

  const publish = async (event: React.FormEvent) => {
    event.preventDefault();
    const file = (window as any).__mfaReelFile as File | undefined;
    if (!videoUrl && !file) return;
    try {
      setUploading(true);
      let finalUrl = videoUrl;
      if (file) {
        const response = await apiFetch('/api/reels/upload', {
          method: 'POST',
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          body: file
        });
        if (!response.ok) {
          let detail = '';
          try {
            const errorData = await response.json();
            if (errorData?.code === 'REEL_STORAGE_NOT_CONFIGURED') {
              detail = 'Persistent Reel storage is not configured yet on the server.';
            } else if (errorData?.error) {
              detail = String(errorData.error);
            }
          } catch {}
          throw new Error(detail || 'The Reel could not be uploaded. Please try again.');
        }
        const data = await response.json();
        finalUrl = apiUrl(data.url);
      }
      addReel(finalUrl, caption.trim() || 'Grade 10 campus short 🎥', audioTrack.trim() || `Original Audio • ${currentUser.name}`, 'All Academy', location, tags);
      (window as any).__mfaReelFile = undefined;
      setVideoUrl('');
      setCaption('');
      setIsCreateReelOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      window.alert(message || 'The video could not be uploaded. Please try again with a video under 50 MB.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-[#18191A] text-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto border border-[#3A3B3C] shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-[#3A3B3C]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1877F2] flex items-center justify-center"><Clapperboard className="w-4 h-4" /></div>
            <div><h2 className="font-black">Create Academy Reel / Short</h2><p className="text-[11px] text-[#B0B3B8]">Share a video with the Grade 10 community</p></div>
          </div>
          <button type="button" onClick={() => setIsCreateReelOpen(false)} className="p-2 rounded-full hover:bg-[#3A3B3C]"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={publish} className="p-5 space-y-5">
          <label className="block border-2 border-dashed border-[#D4AF37] rounded-2xl p-6 text-center cursor-pointer hover:bg-[#242526]">
            <Upload className="w-8 h-8 mx-auto text-[#D4AF37]" />
            <div className="font-bold mt-2">{videoUrl ? 'Video selected — choose another' : 'Choose a video from your iPad'}</div>
            <div className="text-[11px] text-[#B0B3B8] mt-1">MP4/MOV/WebM • maximum 50 MB</div>
            <input type="file" accept="video/*" onChange={handleFile} className="hidden" />
          </label>

          {videoUrl && <video src={videoUrl} controls playsInline className="w-full max-h-64 rounded-xl bg-black object-contain" />}

          <div>
            <label className="text-xs font-bold flex items-center gap-1 mb-2"><Hash className="w-3.5 h-3.5 text-[#1877F2]" /> Caption</label>
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={3} placeholder="What are you sharing?" className="w-full bg-[#242526] border border-[#3A3B3C] rounded-xl p-3 text-sm outline-none" />
          </div>

          <div>
            <label className="text-xs font-bold flex items-center gap-1 mb-2"><Music className="w-3.5 h-3.5 text-[#00A884]" /> Audio / Soundtrack</label>
            <input value={audioTrack} onChange={(e) => setAudioTrack(e.target.value)} className="w-full bg-[#242526] border border-[#3A3B3C] rounded-xl p-3 text-sm outline-none" />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="text-xs font-bold flex items-center gap-1 mb-2"><MapPin className="w-3.5 h-3.5 text-[#FA383E]" /> Location</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-[#242526] border border-[#3A3B3C] rounded-xl p-3 text-sm">{LOCATIONS.map((x) => <option key={x}>{x}</option>)}</select>
            </div>
            <div><label className="text-xs font-bold mb-2 block">Audience</label><div className="bg-[#242526] border border-[#3A3B3C] rounded-xl p-3 text-sm">Grade 10 • All Academy</div></div>
          </div>

          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => <button type="button" key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1.5 rounded-full text-xs font-bold ${tags.includes(tag) ? 'bg-[#1877F2] text-white' : 'bg-[#242526] text-[#B0B3B8]'}`}>{tag}</button>)}
          </div>

          <button type="submit" disabled={!videoUrl || uploading} className="w-full py-3 rounded-xl bg-[#D4AF37] text-[#07111F] font-black disabled:opacity-50">
            {uploading ? 'Uploading…' : 'Publish Reel / Short'}
          </button>
        </form>
      </div>
    </div>
  );
};
