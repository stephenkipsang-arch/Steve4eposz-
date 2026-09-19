import React, { useState } from 'react';
import { CheckCircle2, Edit, GraduationCap, Mail, MapPin, MessageCircle, UserPlus, BrainCircuit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { PostCard } from '../feed/PostCard';
import { Post } from '../../types';

export const ProfileView: React.FC = () => {
  const { currentUser, allAcademyUsers, updateProfile } = useAuth();
  const { selectedProfileUser, openChatWithUser, setIsCreatePostOpen, posts } = useApp();
  const [bioInput, setBioInput] = useState(selectedProfileUser.bio);
  const [editing, setEditing] = useState(false);
  const isMe = selectedProfileUser.id === currentUser.id;

  const userPosts = posts.filter((post) => post.author.id === selectedProfileUser.id);

  const saveBio = () => {
    updateProfile({ bio: bioInput.trim() || 'Grade 10 learner | M-PESA Foundation Academy' });
    setEditing(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-5 py-5">
      <section className="bg-white rounded-3xl border border-[#D4AF37] shadow-sm overflow-hidden">
        <div className="h-32 sm:h-44 bg-gradient-to-r from-[#07111F] via-[#102A43] to-[#D4AF37]" />
        <div className="px-5 sm:px-8 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-12 sm:-mt-16">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <img src={selectedProfileUser.avatar} alt={selectedProfileUser.name} className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg bg-white" />
              <div>
                <h1 className="text-2xl font-black flex items-center justify-center sm:justify-start gap-1.5">
                  {selectedProfileUser.name}
                  {selectedProfileUser.isVerifiedAcademy && <CheckCircle2 className="w-5 h-5 text-[#1877F2] fill-[#1877F2] text-white" />}
                </h1>
                <p className="text-sm font-bold text-[#8A6800] mt-1">Grade 10 Learner</p>
                <p className="text-xs text-[#65676B] mt-1">{selectedProfileUser.friendsCount} Academy Friends</p>
              </div>
            </div>

            {isMe ? (
              <div className="flex gap-2">
                <button onClick={() => setIsCreatePostOpen(true)} className="px-4 py-2 rounded-xl bg-[#1877F2] text-white text-xs font-bold">Create Post</button>
                <button onClick={() => setEditing(true)} className="px-4 py-2 rounded-xl bg-[#F0F2F5] text-xs font-bold flex items-center gap-1.5"><Edit className="w-4 h-4" /> Edit</button>
              </div>
            ) : (
              <button onClick={() => openChatWithUser(selectedProfileUser)} className="px-4 py-2 rounded-xl bg-[#1877F2] text-white text-xs font-bold flex items-center gap-1.5"><MessageCircle className="w-4 h-4" /> Message</button>
            )}
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-5 gap-4 mt-4">
        <section className="md:col-span-2 bg-white rounded-2xl border border-[#E4E6EB] p-5 space-y-4">
          <h2 className="font-black">Grade 10 Profile</h2>
          {editing ? (
            <div className="space-y-2">
              <textarea value={bioInput} onChange={(e) => setBioInput(e.target.value)} rows={4} className="w-full bg-[#F0F2F5] rounded-xl p-3 text-xs outline-none" />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-xs font-bold">Cancel</button>
                <button onClick={saveBio} className="px-3 py-1.5 rounded-lg bg-[#D4AF37] text-[#07111F] text-xs font-black">Save</button>
              </div>
            </div>
          ) : (
            <p className="text-xs leading-relaxed text-[#65676B] bg-[#F8FAFC] rounded-xl p-3">{selectedProfileUser.bio}</p>
          )}
          <div className="border-t pt-3 space-y-3 text-xs">
            <div className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-[#65676B]" /><span><b>Grade 10</b> at M-PESA Foundation Academy</span></div>
            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#65676B]" /><span className="text-[#1877F2] truncate">{selectedProfileUser.email}</span></div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#65676B]" /><span>{selectedProfileUser.location}</span></div>
            <div className="flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-[#8A6800]" /><span>Arena AI learning path active</span></div>
          </div>
        </section>

        <section className="md:col-span-3 bg-white rounded-2xl border border-[#E4E6EB] p-5">
          <h2 className="font-black mb-3">Timeline</h2>
          {userPosts.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#65676B]">No posts yet. This profile is clean.</div>
          ) : (
            <div className="space-y-4">{userPosts.map((post: Post) => <PostCard key={post.id} post={post} />)}</div>
          )}
        </section>
      </div>

      <section className="bg-white rounded-2xl border border-[#E4E6EB] p-5 mt-4">
        <h2 className="font-black mb-3">Grade 10 Academy Network</h2>
        {allAcademyUsers.length === 0 ? (
          <p className="text-xs text-[#65676B]">No other Grade 10 accounts yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {allAcademyUsers.filter((user) => user.id !== selectedProfileUser.id).map((user) => (
              <button key={user.id} onClick={() => openChatWithUser(user)} className="flex items-center gap-3 p-3 rounded-xl border border-[#E4E6EB] hover:bg-[#F8FAFC] text-left">
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]" />
                <span className="text-xs font-bold truncate">{user.name}</span>
                <UserPlus className="w-4 h-4 text-[#1877F2] ml-auto" />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
