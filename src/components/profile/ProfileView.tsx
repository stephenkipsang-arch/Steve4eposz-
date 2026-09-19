import React, { useState } from 'react';
import {
  Camera,
  Edit,
  Plus,
  MessageCircle,
  UserPlus,
  MoreHorizontal,
  CheckCircle2,
  GraduationCap,
  Home,
  MapPin,
  Mail,
  Calendar,
  Award,
  Sparkles,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { PostCard } from '../feed/PostCard';

const COVER_OPTIONS = [
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80'
];

export const ProfileView: React.FC = () => {
  const { currentUser, allAcademyUsers, updateProfile } = useAuth();
  const {
    selectedProfileUser,
    posts,
    openChatWithUser,
    setIsCreatePostOpen,
    viewUserProfile
  } = useApp();

  const [activeProfileTab, setActiveProfileTab] = useState<
    'posts' | 'about' | 'friends' | 'photos'
  >('posts');

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(selectedProfileUser.bio);
  const [showCoverModal, setShowCoverModal] = useState(false);

  const isMe = selectedProfileUser.id === currentUser.id;

  // Filter posts by selected user
  const userPosts = posts.filter((p) => p.author.id === selectedProfileUser.id);

  const handleSaveBio = () => {
    updateProfile({ bio: bioInput.trim() });
    setIsEditingBio(false);
  };

  const handleSelectCover = (url: string) => {
    updateProfile({ coverImage: url });
    setShowCoverModal(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-12 select-none">
      {/* Profile Header Card */}
      <div className="bg-white rounded-b-2xl shadow-xs border-x border-b border-[#CED0D4] overflow-hidden mb-4">
        {/* Cover Photo */}
        <div className="relative h-48 sm:h-72 md:h-80 bg-neutral-800">
          <img
            src={selectedProfileUser.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {isMe && (
            <button
              onClick={() => setShowCoverModal(true)}
              className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-[#050505] text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span>Edit Cover Photo</span>
            </button>
          )}
        </div>

        {/* Cover Photo Selection Modal */}
        {showCoverModal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-4 space-y-3 shadow-2xl">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-bold text-sm text-[#050505]">
                  Select Academy Cover Photo
                </span>
                <button
                  onClick={() => setShowCoverModal(false)}
                  className="text-xs text-[#65676B] font-semibold"
                >
                  Cancel
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {COVER_OPTIONS.map((url, i) => (
                  <div
                    key={i}
                    onClick={() => handleSelectCover(url)}
                    className="relative h-24 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-[#1877F2]"
                  >
                    <img src={url} alt="Cover option" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Profile Info Bar */}
        <div className="px-4 sm:px-8 pb-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative">
                <img
                  src={selectedProfileUser.avatar}
                  alt={selectedProfileUser.name}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-lg bg-white"
                />
                <span className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-sm shadow-md">
                  {selectedProfileUser.house === 'Kenya'
                    ? '🦁'
                    : selectedProfileUser.house === 'Kilimanjaro'
                    ? '🏔️'
                    : selectedProfileUser.house === 'Longonot'
                    ? '🦅'
                    : selectedProfileUser.house === 'Elgon'
                    ? '🦏'
                    : '🏛️'}
                </span>
              </div>

              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#050505] flex items-center justify-center sm:justify-start gap-1.5">
                  {selectedProfileUser.name}
                  {selectedProfileUser.isVerifiedAcademy && (
                    <CheckCircle2 className="w-5 h-5 text-[#1877F2] fill-[#1877F2] text-white" />
                  )}
                </h1>
                <p className="text-xs font-semibold text-[#65676B]">
                  {selectedProfileUser.house} House • {selectedProfileUser.gradeOrDept}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-[#1877F2] font-semibold">
                  <span>{selectedProfileUser.friendsCount} Academy Friends</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {isMe ? (
                <>
                  <button
                    onClick={() => setIsCreatePostOpen(true)}
                    className="bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Story</span>
                  </button>
                  <button
                    onClick={() => setIsEditingBio(true)}
                    className="bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => openChatWithUser(selectedProfileUser)}
                    className="bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Message</span>
                  </button>
                  <button className="bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer">
                    <UserPlus className="w-4 h-4" />
                    <span>Friends</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="border-t border-[#CED0D4] pt-1 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveProfileTab('posts')}
              className={`px-4 py-3 text-xs font-bold border-b-4 transition-colors cursor-pointer whitespace-nowrap ${
                activeProfileTab === 'posts'
                  ? 'border-[#1877F2] text-[#1877F2]'
                  : 'border-transparent text-[#65676B] hover:bg-[#F2F2F2]'
              }`}
            >
              Timeline Posts
            </button>
            <button
              onClick={() => setActiveProfileTab('about')}
              className={`px-4 py-3 text-xs font-bold border-b-4 transition-colors cursor-pointer whitespace-nowrap ${
                activeProfileTab === 'about'
                  ? 'border-[#1877F2] text-[#1877F2]'
                  : 'border-transparent text-[#65676B] hover:bg-[#F2F2F2]'
              }`}
            >
              About Academy Track
            </button>
            <button
              onClick={() => setActiveProfileTab('friends')}
              className={`px-4 py-3 text-xs font-bold border-b-4 transition-colors cursor-pointer whitespace-nowrap ${
                activeProfileTab === 'friends'
                  ? 'border-[#1877F2] text-[#1877F2]'
                  : 'border-transparent text-[#65676B] hover:bg-[#F2F2F2]'
              }`}
            >
              Academy Peers ({selectedProfileUser.friendsCount})
            </button>
            <button
              onClick={() => setActiveProfileTab('photos')}
              className={`px-4 py-3 text-xs font-bold border-b-4 transition-colors cursor-pointer whitespace-nowrap ${
                activeProfileTab === 'photos'
                  ? 'border-[#1877F2] text-[#1877F2]'
                  : 'border-transparent text-[#65676B] hover:bg-[#F2F2F2]'
              }`}
            >
              Photos & Campus Albums
            </button>
          </div>
        </div>
      </div>

      {/* Main Profile Grid (Left Intro + Right Posts) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-2 sm:px-0">
        {/* Left Column: Intro & Info */}
        <div className="md:col-span-5 space-y-4">
          {/* Intro Box */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#CED0D4] space-y-3">
            <h3 className="font-extrabold text-sm text-[#050505]">Intro</h3>

            {/* Bio Display / Editor */}
            {isEditingBio ? (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  className="w-full bg-[#F0F2F5] text-xs p-2.5 rounded-xl border border-[#CED0D4] focus:outline-hidden focus:border-[#1877F2]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingBio(false)}
                    className="px-3 py-1 text-xs text-[#65676B] hover:bg-[#F0F2F5] rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBio}
                    className="px-4 py-1 text-xs text-white bg-[#1877F2] rounded-lg font-bold hover:bg-[#166fe5]"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#050505] text-center leading-relaxed italic bg-[#F9FAFB] p-2.5 rounded-xl border border-[#E4E6EB]">
                {selectedProfileUser.bio}
              </p>
            )}

            {isMe && !isEditingBio && (
              <button
                onClick={() => setIsEditingBio(true)}
                className="w-full py-1.5 bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-xs font-semibold rounded-xl transition-colors"
              >
                Edit Bio
              </button>
            )}

            <div className="border-t border-[#CED0D4] pt-2 space-y-2.5 text-xs text-[#050505]">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 text-[#65676B] shrink-0" />
                <span>
                  <span className="font-semibold">{selectedProfileUser.role}</span> at{' '}
                  <span className="font-bold text-[#1877F2]">M-PESA Foundation Academy</span>
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Home className="w-4 h-4 text-[#65676B] shrink-0" />
                <span>
                  Affiliated with <span className="font-bold">{selectedProfileUser.house} House</span>
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#65676B] shrink-0" />
                <span className="truncate text-[#1877F2] font-medium">
                  {selectedProfileUser.email}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#65676B] shrink-0" />
                <span>From <span className="font-semibold">{selectedProfileUser.location}</span></span>
              </div>

              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#65676B] shrink-0" />
                <span>Joined Academy in <span className="font-semibold">{selectedProfileUser.joinedDate}</span></span>
              </div>
            </div>

            {/* Clubs & Badges */}
            <div className="border-t border-[#CED0D4] pt-2">
              <div className="text-[11px] font-bold text-[#65676B] uppercase tracking-wider mb-2">
                Clubs & Leadership
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedProfileUser.clubs.map((club, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] bg-[#E7F3FF] text-[#1877F2] font-semibold px-2.5 py-1 rounded-full border border-[#BEDDFF]"
                  >
                    ✨ {club}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Friends Preview Box */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#CED0D4] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-[#050505]">Academy Friends</h3>
                <p className="text-[11px] text-[#65676B]">
                  {selectedProfileUser.friendsCount} verified peers
                </p>
              </div>
              <button
                onClick={() => setActiveProfileTab('friends')}
                className="text-xs text-[#1877F2] font-semibold hover:underline"
              >
                See all
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {allAcademyUsers.filter((u) => u.id !== selectedProfileUser.id)
                .slice(0, 6)
                .map((peer) => (
                  <div
                    key={peer.id}
                    onClick={() => viewUserProfile(peer)}
                    className="cursor-pointer group"
                  >
                    <img
                      src={peer.avatar}
                      alt={peer.name}
                      className="w-full h-20 rounded-xl object-cover border border-[#CED0D4] group-hover:opacity-90 transition-opacity"
                    />
                    <p className="text-[11px] font-semibold text-[#050505] truncate mt-1 group-hover:underline">
                      {peer.name.split(' ')[0]}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Column: Profile Timeline / Sub Tabs */}
        <div className="md:col-span-7 space-y-4">
          {activeProfileTab === 'posts' && (
            <>
              {isMe && (
                <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-xs border border-[#CED0D4]">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#CED0D4]"
                    />
                    <button
                      onClick={() => setIsCreatePostOpen(true)}
                      className="flex-1 bg-[#F0F2F5] hover:bg-[#E4E6EB] transition-colors rounded-full py-2 px-4 text-left text-xs text-[#65676B] font-medium"
                    >
                      Post to your profile timeline...
                    </button>
                  </div>
                </div>
              )}

              {userPosts.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-[#CED0D4]">
                  <p className="text-xs text-[#65676B]">
                    No timeline posts yet from {selectedProfileUser.name}.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeProfileTab === 'about' && (
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#CED0D4] space-y-4">
              <h3 className="font-extrabold text-base text-[#050505]">
                Academic Details & House Heritage
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-[#F0F2F5] rounded-xl">
                  <span className="text-[#65676B] block">Academic Track</span>
                  <span className="font-bold text-[#050505] text-sm">
                    {selectedProfileUser.gradeOrDept}
                  </span>
                </div>
                <div className="p-3 bg-[#F0F2F5] rounded-xl">
                  <span className="text-[#65676B] block">Assigned Dormitory House</span>
                  <span className="font-bold text-[#1877F2] text-sm">
                    {selectedProfileUser.house} House
                  </span>
                </div>
                <div className="p-3 bg-[#F0F2F5] rounded-xl">
                  <span className="text-[#65676B] block">Campus Location</span>
                  <span className="font-bold text-[#050505] text-sm">
                    M-PESA Foundation Academy, Thika
                  </span>
                </div>
                <div className="p-3 bg-[#F0F2F5] rounded-xl">
                  <span className="text-[#65676B] block">Institutional Domain Status</span>
                  <span className="font-bold text-[#00A884] text-sm">
                    Verified @mpesafoundationacademy.ac.ke
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeProfileTab === 'friends' && (
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#CED0D4] space-y-4">
              <h3 className="font-extrabold text-base text-[#050505]">
                All Academy Peers & Faculty
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allAcademyUsers.length === 0 ? (
                  <p className="text-xs text-[#65676B]">No other academy accounts yet.</p>
                ) : allAcademyUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => viewUserProfile(user)}
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-[#CED0D4] hover:bg-[#F0F2F5] transition-colors cursor-pointer"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-[#050505] truncate">{user.name}</div>
                      <div className="text-[11px] text-[#65676B] truncate">
                        {user.house} House • {user.role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeProfileTab === 'photos' && (
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#CED0D4] space-y-4">
              <h3 className="font-extrabold text-base text-[#050505]">
                Campus Life & Competition Photos
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
                  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
                  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80',
                  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
                  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=600&q=80',
                  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80'
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Album photo"
                    className="w-full h-28 object-cover rounded-xl border border-[#CED0D4] hover:opacity-90 transition-opacity cursor-pointer"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
