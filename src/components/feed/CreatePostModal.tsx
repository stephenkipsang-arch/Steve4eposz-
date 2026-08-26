import React, { useState } from 'react';
import {
  X,
  Image as ImageIcon,
  Video as VideoIcon,
  Smile,
  MapPin,
  BarChart2,
  Check,
  Plus,
  Trash2,
  Play,
  Upload,
  Link as LinkIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { House } from '../../types';

const PRESET_POST_PHOTOS = [
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1000&q=80'
];

const SAMPLE_CAMPUS_VIDEOS = [
  {
    title: 'Robotics & Drone Trials',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'Athletics & Rugby Highlights',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    poster: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'Symphony & Performing Arts',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    poster: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=600&q=80'
  }
];

const FEELINGS = [
  '🎓 studying hard for IB Mocks',
  '🏆 feeling triumphant',
  '🔬 in the Chemistry Lab',
  '🤖 debugging robotics code',
  '🎵 in orchestra rehearsal',
  '🏉 ready for the rugby derby',
  '🍕 enjoying dining hall meal',
  '🌿 tree planting for MFA Green'
];

const LOCATIONS = [
  'Uongozi Leadership Centre, Thika',
  'MFA Innovation & Robotics Lab',
  'Main Athletics Arena & Pitch 1',
  'Science Complex Chemistry Lab 3',
  'Performing Arts Amphitheatre',
  'Academy Library Silent Pods',
  'Kenya Dormitory Common Room',
  'Kilimanjaro Dormitory Common Room',
  'Longonot Dormitory Common Room',
  'Elgon Dormitory Common Room',
  'Dining Hall & Food Court'
];

export const CreatePostModal: React.FC = () => {
  const { isCreatePostOpen, setIsCreatePostOpen, addPost } = useApp();
  const { currentUser } = useAuth();

  const [content, setContent] = useState('');
  const [houseTag, setHouseTag] = useState<House | 'All Academy'>('All Academy');
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);

  // Video State
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [showVideoPicker, setShowVideoPicker] = useState(false);
  const [videoInputMode, setVideoInputMode] = useState<'sample' | 'url' | 'upload'>('sample');

  const [feeling, setFeeling] = useState<string | undefined>(undefined);
  const [showFeelingPicker, setShowFeelingPicker] = useState(false);
  const [location, setLocation] = useState<string | undefined>(undefined);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Poll state
  const [isPollActive, setIsPollActive] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['Option 1', 'Option 2']);

  if (!isCreatePostOpen) return null;

  const handleTogglePhoto = (url: string) => {
    setSelectedPhotos((prev) =>
      prev.includes(url) ? prev.filter((p) => p !== url) : [...prev, url]
    );
  };

  const handleAddCustomPhoto = () => {
    if (customPhotoUrl.trim()) {
      setSelectedPhotos((prev) => [...prev, customPhotoUrl.trim()]);
      setCustomPhotoUrl('');
    }
  };

  const handleSelectSampleVideo = (sample: { title: string; url: string }) => {
    setVideoUrl(sample.url);
    setVideoTitle(sample.title);
    setShowVideoPicker(false);
  };

  const handleFileUploadVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localBlobUrl = URL.createObjectURL(file);
      setVideoUrl(localBlobUrl);
      setVideoTitle(file.name.replace(/\.[^/.]+$/, ''));
      setShowVideoPicker(false);
    }
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions((prev) => [...prev, `Option ${prev.length + 1}`]);
    }
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handlePollOptionChange = (index: number, val: string) => {
    setPollOptions((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && selectedPhotos.length === 0 && !videoUrl && !isPollActive) return;

    let pollData = undefined;
    if (isPollActive && pollQuestion.trim()) {
      pollData = {
        question: pollQuestion.trim(),
        options: pollOptions.filter((o) => o.trim().length > 0)
      };
    }

    addPost(
      content.trim(),
      selectedPhotos,
      houseTag,
      feeling,
      location,
      pollData,
      videoUrl.trim() || undefined,
      videoTitle.trim() || undefined
    );

    // Reset & Close
    setContent('');
    setSelectedPhotos([]);
    setVideoUrl('');
    setVideoTitle('');
    setFeeling(undefined);
    setLocation(undefined);
    setIsPollActive(false);
    setShowPhotoPicker(false);
    setShowVideoPicker(false);
    setShowFeelingPicker(false);
    setShowLocationPicker(false);
    setIsCreatePostOpen(false);
  };

  const canSubmit =
    content.trim().length > 0 ||
    selectedPhotos.length > 0 ||
    videoUrl.trim().length > 0 ||
    isPollActive;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#CED0D4] animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#CED0D4] relative">
          <div className="w-8" />
          <h2 className="font-extrabold text-base text-[#050505] text-center">
            Create Campus Post
          </h2>
          <button
            onClick={() => setIsCreatePostOpen(false)}
            className="w-8 h-8 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] flex items-center justify-center text-[#65676B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 flex-1">
          {/* Author info & House selector */}
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-11 h-11 rounded-full object-cover border border-[#CED0D4]"
            />
            <div>
              <div className="font-bold text-sm text-[#050505] flex items-center gap-1">
                {currentUser.name}
                {feeling && (
                  <span className="font-normal text-xs text-[#65676B]">
                    is {feeling}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {/* Audience / House selector */}
                <select
                  value={houseTag}
                  onChange={(e) => setHouseTag(e.target.value as any)}
                  className="text-[11px] font-semibold text-[#050505] bg-[#E4E6EB] px-2 py-0.5 rounded-md border-0 focus:ring-1 focus:ring-[#1877F2] cursor-pointer"
                >
                  <option value="All Academy">🌐 All Academy</option>
                  <option value="Kenya">🦁 Kenya House</option>
                  <option value="Kilimanjaro">🏔️ Kilimanjaro House</option>
                  <option value="Longonot">🦅 Longonot House</option>
                  <option value="Elgon">🦏 Elgon House</option>
                </select>

                {location && (
                  <span className="text-[11px] text-[#65676B] truncate max-w-36">
                    📍 {location.split(',')[0]}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Main Textarea */}
          <textarea
            id="create-post-textarea"
            rows={4}
            placeholder={`What is happening at M-PESA Foundation Academy, ${currentUser.name.split(' ')[0]}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-sm text-[#050505] placeholder-[#65676B] resize-none border-0 focus:outline-hidden focus:ring-0 leading-relaxed"
          />

          {/* Attached Video Preview */}
          {videoUrl && (
            <div className="relative rounded-xl overflow-hidden bg-black border border-[#CED0D4] p-1">
              <div className="flex items-center justify-between px-2 py-1 bg-black/70 text-white text-xs font-semibold rounded-t-lg">
                <span className="flex items-center gap-1.5 truncate">
                  <VideoIcon className="w-3.5 h-3.5 text-[#1877F2]" />
                  {videoTitle || 'Attached Video Clip'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setVideoUrl('');
                    setVideoTitle('');
                  }}
                  className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white cursor-pointer ml-2"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <video
                src={videoUrl}
                controls
                className="w-full max-h-56 object-contain rounded-b-lg bg-black"
              />
            </div>
          )}

          {/* Location Tag Display */}
          {location && (
            <div className="flex items-center justify-between bg-[#F0F2F5] px-3 py-1.5 rounded-lg text-xs text-[#050505]">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FA383E]" />
                At <span className="font-semibold">{location}</span>
              </span>
              <button
                type="button"
                onClick={() => setLocation(undefined)}
                className="text-[#65676B] hover:text-[#DC2626]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Poll Builder View */}
          {isPollActive && (
            <div className="bg-[#F0F2F5] p-3 rounded-xl border border-[#CED0D4] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#050505] flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-[#1877F2]" />
                  Academy Campus Poll
                </span>
                <button
                  type="button"
                  onClick={() => setIsPollActive(false)}
                  className="text-xs text-[#DC2626] font-semibold hover:underline cursor-pointer"
                >
                  Remove Poll
                </button>
              </div>

              <input
                type="text"
                placeholder="Ask the academy a question (e.g. Inter-House predictions)..."
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                className="w-full bg-white text-xs px-3 py-2 rounded-lg border border-[#CED0D4] focus:outline-hidden focus:border-[#1877F2]"
              />

              <div className="space-y-1.5">
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handlePollOptionChange(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1 bg-white text-xs px-3 py-1.5 rounded-lg border border-[#CED0D4] focus:outline-hidden focus:border-[#1877F2]"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePollOption(idx)}
                        className="text-[#65676B] hover:text-[#DC2626] p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {pollOptions.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddPollOption}
                  className="text-xs text-[#1877F2] font-semibold hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add option
                </button>
              )}
            </div>
          )}

          {/* Video Attachment Drawer */}
          {showVideoPicker && (
            <div className="bg-[#F0F2F5] p-3 rounded-xl border border-[#CED0D4] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#050505] flex items-center gap-1.5">
                  <VideoIcon className="w-4 h-4 text-[#E44426]" />
                  Attach Video to Post
                </span>
                <button
                  type="button"
                  onClick={() => setShowVideoPicker(false)}
                  className="text-xs text-[#65676B] hover:text-[#050505] cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Video Mode Tabs */}
              <div className="flex rounded-lg bg-[#E4E6EB] p-0.5 gap-1">
                <button
                  type="button"
                  onClick={() => setVideoInputMode('sample')}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    videoInputMode === 'sample'
                      ? 'bg-white text-[#1877F2] shadow-xs'
                      : 'text-[#65676B] hover:text-[#050505]'
                  }`}
                >
                  Campus Clips
                </button>
                <button
                  type="button"
                  onClick={() => setVideoInputMode('upload')}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    videoInputMode === 'upload'
                      ? 'bg-white text-[#1877F2] shadow-xs'
                      : 'text-[#65676B] hover:text-[#050505]'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setVideoInputMode('url')}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    videoInputMode === 'url'
                      ? 'bg-white text-[#1877F2] shadow-xs'
                      : 'text-[#65676B] hover:text-[#050505]'
                  }`}
                >
                  Paste URL
                </button>
              </div>

              {/* Mode 1: Campus Clips */}
              {videoInputMode === 'sample' && (
                <div className="grid grid-cols-3 gap-2">
                  {SAMPLE_CAMPUS_VIDEOS.map((sample, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectSampleVideo(sample)}
                      className="group relative h-20 rounded-lg overflow-hidden border border-[#CED0D4] bg-black cursor-pointer hover:ring-2 hover:ring-[#1877F2] transition-all"
                    >
                      <img
                        src={sample.poster}
                        alt={sample.title}
                        className="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-white/90 text-[#1877F2] flex items-center justify-center shadow-md">
                          <Play className="w-3.5 h-3.5 fill-[#1877F2] ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-black/80 px-1 py-0.5 text-[9px] font-bold text-white truncate text-center">
                        {sample.title}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Mode 2: Upload File */}
              {videoInputMode === 'upload' && (
                <label className="border-2 border-dashed border-[#CED0D4] hover:border-[#1877F2] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-white transition-colors">
                  <Upload className="w-6 h-6 text-[#1877F2] mb-1" />
                  <span className="text-xs font-bold text-[#050505]">
                    Click or drag video file here
                  </span>
                  <span className="text-[10px] text-[#65676B]">
                    MP4, WebM, or MOV up to 100MB
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUploadVideo}
                    className="hidden"
                  />
                </label>
              )}

              {/* Mode 3: Paste URL */}
              {videoInputMode === 'url' && (
                <div className="space-y-2">
                  <input
                    type="url"
                    placeholder="Paste direct MP4 or video URL (e.g. https://.../demo.mp4)..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full bg-white text-xs px-3 py-2 rounded-lg border border-[#CED0D4] focus:outline-hidden focus:border-[#1877F2]"
                  />
                  <input
                    type="text"
                    placeholder="Optional video title (e.g. 'Kenya House Match Clip')..."
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    className="w-full bg-white text-xs px-3 py-1.5 rounded-lg border border-[#CED0D4] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (videoUrl.trim()) setShowVideoPicker(false);
                    }}
                    className="w-full py-1.5 bg-[#1877F2] text-white text-xs font-bold rounded-lg hover:bg-[#166fe5] cursor-pointer"
                  >
                    Confirm Video
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Photo Picker Drawer */}
          {showPhotoPicker && (
            <div className="bg-[#F0F2F5] p-3 rounded-xl border border-[#CED0D4] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#050505]">
                  Select Campus Photographs
                </span>
                <button
                  type="button"
                  onClick={() => setShowPhotoPicker(false)}
                  className="text-xs text-[#65676B] hover:text-[#050505] cursor-pointer"
                >
                  Done
                </button>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {PRESET_POST_PHOTOS.map((url) => (
                  <div
                    key={url}
                    onClick={() => handleTogglePhoto(url)}
                    className={`relative h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      selectedPhotos.includes(url)
                        ? 'border-[#1877F2] ring-2 ring-[#1877F2]'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="Campus" className="w-full h-full object-cover" />
                    {selectedPhotos.includes(url) && (
                      <div className="absolute inset-0 bg-[#1877F2]/40 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="url"
                  placeholder="Or paste external image URL..."
                  value={customPhotoUrl}
                  onChange={(e) => setCustomPhotoUrl(e.target.value)}
                  className="flex-1 bg-white text-xs px-2.5 py-1.5 rounded-lg border border-[#CED0D4] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddCustomPhoto}
                  className="px-3 py-1 bg-[#1877F2] text-white text-xs font-bold rounded-lg hover:bg-[#166fe5] cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Selected Photos Thumbnails */}
          {selectedPhotos.length > 0 && (
            <div className="flex flex-wrap gap-2 p-2 bg-[#F0F2F5] rounded-xl">
              {selectedPhotos.map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#CED0D4]">
                  <img src={url} alt="Selected" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleTogglePhoto(url)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Feeling / Activity Drawer */}
          {showFeelingPicker && (
            <div className="bg-[#F0F2F5] p-3 rounded-xl border border-[#CED0D4] space-y-2">
              <div className="text-xs font-bold text-[#050505]">Choose Feeling / Activity</div>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                {FEELINGS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      setFeeling(f);
                      setShowFeelingPicker(false);
                    }}
                    className="text-xs px-2.5 py-1 bg-white hover:bg-[#E7F3FF] hover:text-[#1877F2] text-[#050505] rounded-full border border-[#CED0D4] transition-colors cursor-pointer"
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Location Picker Drawer */}
          {showLocationPicker && (
            <div className="bg-[#F0F2F5] p-3 rounded-xl border border-[#CED0D4] space-y-2">
              <div className="text-xs font-bold text-[#050505]">Tag Campus Location</div>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setLocation(loc);
                      setShowLocationPicker(false);
                    }}
                    className="w-full text-left text-xs p-1.5 rounded-lg hover:bg-white transition-colors text-[#050505] cursor-pointer"
                  >
                    📍 {loc}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Your Post Controls Box */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-[#CED0D4] shadow-xs">
            <span className="text-xs font-bold text-[#050505]">Add to your post</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setShowPhotoPicker(!showPhotoPicker);
                  setShowVideoPicker(false);
                }}
                className={`w-8 h-8 rounded-full hover:bg-[#F0F2F5] flex items-center justify-center transition-colors cursor-pointer ${
                  showPhotoPicker ? 'bg-[#E7F3FF] text-[#1877F2]' : 'text-[#45BD62]'
                }`}
                title="Photo"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowVideoPicker(!showVideoPicker);
                  setShowPhotoPicker(false);
                }}
                className={`w-8 h-8 rounded-full hover:bg-[#F0F2F5] flex items-center justify-center transition-colors cursor-pointer ${
                  showVideoPicker || videoUrl ? 'bg-[#FEE2E2] text-[#E44426]' : 'text-[#E44426]'
                }`}
                title="Attach Video"
              >
                <VideoIcon className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setShowFeelingPicker(!showFeelingPicker)}
                className="w-8 h-8 rounded-full hover:bg-[#F0F2F5] flex items-center justify-center text-[#F7B125] transition-colors cursor-pointer"
                title="Feeling/activity"
              >
                <Smile className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setShowLocationPicker(!showLocationPicker)}
                className="w-8 h-8 rounded-full hover:bg-[#F0F2F5] flex items-center justify-center text-[#FA383E] transition-colors cursor-pointer"
                title="Tag location"
              >
                <MapPin className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setIsPollActive(!isPollActive)}
                className="w-8 h-8 rounded-full hover:bg-[#F0F2F5] flex items-center justify-center text-[#1877F2] transition-colors cursor-pointer"
                title="Create a poll"
              >
                <BarChart2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Submit Post Button */}
          <button
            id="submit-post-btn"
            type="submit"
            disabled={!canSubmit}
            className={`w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white transition-all shadow-xs ${
              canSubmit
                ? 'bg-[#1877F2] hover:bg-[#166fe5] cursor-pointer'
                : 'bg-[#E4E6EB] text-[#8A8D91] cursor-not-allowed'
            }`}
          >
            Post to MFA-VEXPEX
          </button>
        </form>
      </div>
    </div>
  );
};
