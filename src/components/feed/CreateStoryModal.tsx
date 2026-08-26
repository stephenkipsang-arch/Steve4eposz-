import React, { useState } from 'react';
import { X, Image as ImageIcon, Sparkles, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const PRESET_STORY_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80', label: 'Academy Quad' },
  { url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80', label: 'Study Hub' },
  { url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80', label: 'Sports Complex' },
  { url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80', label: 'Robotics Lab' },
  { url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=600&q=80', label: 'Arts & Music' }
];

export const CreateStoryModal: React.FC = () => {
  const { isCreateStoryOpen, setIsCreateStoryOpen, addStory } = useApp();
  const { currentUser } = useAuth();

  const [selectedImage, setSelectedImage] = useState(PRESET_STORY_IMAGES[0].url);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [caption, setCaption] = useState('');

  if (!isCreateStoryOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = customImageUrl.trim() || selectedImage;
    addStory(finalUrl, caption.trim());
    setIsCreateStoryOpen(false);
    setCaption('');
    setCustomImageUrl('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#CED0D4] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#CED0D4]">
          <div className="font-extrabold text-base text-[#050505] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#1877F2]" />
            <span>Create Campus Story</span>
          </div>
          <button
            onClick={() => setIsCreateStoryOpen(false)}
            className="w-8 h-8 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] flex items-center justify-center text-[#65676B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* User info */}
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover border border-[#CED0D4]"
            />
            <div>
              <div className="font-bold text-xs text-[#050505]">{currentUser.name}</div>
              <div className="text-[11px] text-[#65676B]">
                Visible to {currentUser.house} House & All Academy
              </div>
            </div>
          </div>

          {/* Caption Input */}
          <div>
            <label className="block text-xs font-semibold text-[#050505] mb-1">
              Story Caption / Shoutout
            </label>
            <input
              type="text"
              placeholder="What's happening right now at the Academy?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-[#F0F2F5] text-xs text-[#050505] px-3 py-2.5 rounded-xl border border-transparent focus:border-[#1877F2] focus:bg-white focus:outline-hidden"
              maxLength={120}
            />
          </div>

          {/* Select Academy Campus Photo */}
          <div>
            <label className="block text-xs font-semibold text-[#050505] mb-2">
              Choose Campus Visual
            </label>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_STORY_IMAGES.map((img) => (
                <div
                  key={img.url}
                  onClick={() => {
                    setSelectedImage(img.url);
                    setCustomImageUrl('');
                  }}
                  className={`relative h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    selectedImage === img.url && !customImageUrl
                      ? 'border-[#1877F2] ring-2 ring-[#1877F2]'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                  {selectedImage === img.url && !customImageUrl && (
                    <div className="absolute inset-0 bg-[#1877F2]/30 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white stroke-[3]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Custom Image URL Option */}
          <div>
            <label className="block text-[11px] font-semibold text-[#65676B] mb-1">
              Or paste custom photo URL:
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={customImageUrl}
              onChange={(e) => setCustomImageUrl(e.target.value)}
              className="w-full bg-[#F0F2F5] text-xs text-[#050505] px-3 py-2 rounded-lg border border-transparent focus:border-[#1877F2] focus:outline-hidden"
            />
          </div>

          {/* Preview */}
          <div className="relative h-44 rounded-xl overflow-hidden bg-neutral-900 flex items-center justify-center">
            <img
              src={customImageUrl.trim() || selectedImage}
              alt="Story Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <p className="text-xs font-bold truncate">{currentUser.name}</p>
              {caption && <p className="text-[11px] text-white/90">{caption}</p>}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateStoryOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-[#65676B] hover:bg-[#F0F2F5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166fe5] shadow-xs"
            >
              Share to Story
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
