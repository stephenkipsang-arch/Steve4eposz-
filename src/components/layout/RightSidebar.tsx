import React from 'react';
import { BrainCircuit, Trophy, CalendarDays, Search, Video, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const RightSidebar: React.FC = () => {
  const { currentUser, allAcademyUsers } = useAuth();
  const { openChatWithUser, setActiveTab } = useApp();
  const otherUsers = allAcademyUsers.filter((u) => u.id !== currentUser.id);

  return (
    <aside aria-label="Arena AI and contacts" className="w-64 xl:w-80 h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto px-2 py-3 hidden lg:flex flex-col gap-4 shrink-0 scrollbar-thin select-none">
      <button
        onClick={() => setActiveTab('arena-ai')}
        className="text-left bg-[#07111F] text-white rounded-2xl p-4 border border-[#D4AF37] shadow-lg hover:shadow-xl transition-shadow"
      >
        <div className="flex items-center gap-2 text-[#F7D774]">
          <BrainCircuit className="w-5 h-5" />
          <span className="text-[11px] font-black uppercase tracking-widest">Arena AI</span>
        </div>
        <h2 className="font-black text-lg mt-2">Next weekly challenge</h2>
        <p className="text-xs text-white/65 mt-1">School knowledge + Grade 10 learning • online • every Saturday</p>
        <div className="mt-3 flex items-center gap-2 text-xs font-bold text-[#F7D774]">
          <CalendarDays className="w-4 h-4" /> Open Arena AI
        </div>
      </button>

      <div className="border-t border-[#E4E6EB] pt-2">
        <div className="flex items-center justify-between px-1 mb-2">
          <div className="text-[11px] font-bold text-[#65676B] uppercase tracking-wider">Contacts ({otherUsers.length})</div>
          <div className="flex items-center gap-2 text-[#65676B]"><Video className="w-4 h-4" /><Search className="w-4 h-4" /><MoreHorizontal className="w-4 h-4" /></div>
        </div>
        {otherUsers.length === 0 ? (
          <div className="p-3 rounded-xl bg-white border border-[#E4E6EB] text-xs text-[#65676B]">
            No other Grade 10 accounts yet.
          </div>
        ) : (
          <div className="space-y-0.5">
            {otherUsers.map((user) => (
              <button key={user.id} onClick={() => openChatWithUser(user)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#F0F2F5] text-left">
                <div className="relative">
                  <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-[#D4AF37]" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#31A24C] border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs truncate flex items-center gap-1">
                    {user.name}
                    {user.isVerifiedAcademy && <CheckCircle2 className="w-3 h-3 text-[#1877F2] fill-[#1877F2] text-white" />}
                  </div>
                  <div className="text-[11px] text-[#65676B] truncate">Grade 10 Learner</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto rounded-2xl bg-white border border-[#D4AF37] p-4">
        <div className="flex items-center gap-2 font-black text-sm"><Trophy className="w-4 h-4 text-[#D4AF37]" /> Weekly Arena reward</div>
        <p className="text-xs text-[#65676B] mt-2">Compete, learn and unlock a preview of the next MFA-VEXPEX improvement.</p>
      </div>
    </aside>
  