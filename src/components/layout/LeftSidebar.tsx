import React from 'react';
import { Home, Film, BrainCircuit, Store, Calendar, Bookmark, GraduationCap, UserRound, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const LeftSidebar: React.FC = () => {
  const { currentUser } = useAuth();
  const { activeTab, setActiveTab, viewUserProfile, feedFilter, setFeedFilter, savedPostIds } = useApp();

  const item = (tab: 'feed' | 'reels' | 'arena-ai' | 'marketplace' | 'events', label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors text-left text-sm font-semibold ${activeTab === tab ? 'bg-[#FFF8E1] text-[#8A6800]' : 'text-[#050505] hover:bg-[#F0F2F5]'}`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeTab === tab ? 'bg-[#D4AF37] text-[#07111F]' : 'bg-[#F0F2F5] text-[#65676B]'}`}>
        {icon}
      </div>
      <span>{label}</span>
    </button>
  );

  return (
    <aside aria-label="Grade 10 navigation" className="w-64 xl:w-72 h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto px-2 py-3 hidden md:flex flex-col justify-between shrink-0 scrollbar-thin select-none">
      <div className="space-y-1">
        <button onClick={() => viewUserProfile(currentUser)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#F0F2F5] text-left">
          <img src={currentUser.avatar} alt={currentUser.name} className="w-9 h-9 rounded-full object-cover border border-[#D4AF37]" />
          <div className="min-w-0 flex-1">
            <div className="font-bold text-sm truncate flex items-center gap-1">
              {currentUser.name}
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1877F2] fill-[#1877F2] text-white" />
            </div>
            <div className="text-[11px] text-[#65676B] truncate">Grade 10 Learner</div>
          </div>
        </button>

        {item('feed', 'Academy Feed', <Home className="w-5 h-5" />)}
        {item('reels', 'Reels & Shorts', <Film className="w-5 h-5" />)}
        {item('arena-ai', 'Arena AI', <BrainCircuit className="w-5 h-5" />)}
        {item('marketplace', 'Campus Store', <Store className="w-5 h-5" />)}
        {item('events', 'Academy Calendar', <Calendar className="w-5 h-5" />)}

        <button
          onClick={() => { setActiveTab('feed'); setFeedFilter('announcements'); }}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#F0F2F5] text-left text-sm font-semibold"
        >
          <div className="w-9 h-9 rounded-xl bg-[#F0F2F5] text-[#65676B] flex items-center justify-center"><Bookmark className="w-5 h-5" /></div>
          <div className="flex-1 flex items-center justify-between">
            <span>Saved</span>
            <span className="text-[10px] font-bold text-[#65676B]">{savedPostIds.length}</span>
          </div>
        </button>

        <div className="border-t border-[#E4E6EB] my-3 pt-3">
          <div className="px-2 text-[10px] font-black text-[#8A6800] uppercase tracking-[0.18em]">Learning Network</div>
          <div className="px-2 pt-2 text-xs text-[#65676B] leading-relaxed">
            Grade 10 learning only. No houses, clubs or societies are preloaded.
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-[#E4E6EB] px-2 text-[11px] text-[#65676B] space-y-1">
        <div className="flex items-center gap-1 font-semibold text-[#8A6800]">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>M-PESA Foundation Academy</span>
        </div>
        <p className="text-[10px]">MFA-VEXPEX • Grade 10 learning network</p>
      </div>
    </aside>
  