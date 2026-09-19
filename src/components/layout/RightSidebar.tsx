import React from 'react';
import {
  Bell,
  Trophy,
  Cake,
  Search,
  MoreHorizontal,
  Video,
  ShieldCheck,
  Flame,
  CheckCircle2,
  CalendarDays,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { HOUSES_DATA } from '../../data/mockData';

export const RightSidebar: React.FC = () => {
  const { currentUser, allAcademyUsers } = useAuth();
  const { openChatWithUser, setActiveTab, setSelectedHouse, posts } = useApp();

  const otherUsers = allAcademyUsers.filter((u) => u.id !== currentUser.id);

  return (
    <aside aria-label="Campus Activity & Contacts" className="w-64 xl:w-80 h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto px-2 py-3 hidden lg:flex flex-col gap-4 shrink-0 scrollbar-thin select-none">
      {/* Official Academy Noticeboard */}
      <div className="bg-white rounded-xl p-3 shadow-xs border border-[#CED0D4]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#050505] uppercase tracking-wider">
            <Bell className="w-4 h-4 text-[#1877F2]" />
            <span>Academy Noticeboard</span>
          </div>
          <span className="text-[10px] bg-[#E7F3FF] text-[#1877F2] font-semibold px-2 py-0.5 rounded-full">
            Official
          </span>
        </div>

        <div className="space-y-2.5">
          <div className="p-2 rounded-lg bg-[#F0F2F5] hover:bg-[#E4E6EB] transition-colors cursor-pointer" onClick={() => setActiveTab('feed')}>
            <div className="flex items-center justify-between text-[11px] font-bold text-[#1877F2] mb-0.5">
              <span>Thursday Oral Symposium</span>
              <span className="text-[10px] text-[#65676B]">9:00 AM</span>
            </div>
            <p className="text-xs text-[#050505] font-medium leading-snug">
              IB Extended Essay defense at Uongozi Centre Innovation Hall.
            </p>
          </div>

          <div className="p-2 rounded-lg bg-[#F0F2F5] hover:bg-[#E4E6EB] transition-colors cursor-pointer" onClick={() => setActiveTab('events')}>
            <div className="flex items-center justify-between text-[11px] font-bold text-[#00A884] mb-0.5">
              <span>Swahili Dinner Night</span>
              <span className="text-[10px] text-[#65676B]">Sunday 6 PM</span>
            </div>
            <p className="text-xs text-[#050505] font-medium leading-snug">
              Dining Hall special dinner + acoustic live band performance.
            </p>
          </div>
        </div>
      </div>

      {/* Live Inter-House Shield Widget */}
      <div className="bg-white rounded-xl p-3 shadow-xs border border-[#CED0D4]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#050505] uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-[#D97706]" />
            <span>Inter-House Trophy</span>
          </div>
          <button
            onClick={() => setActiveTab('groups')}
            className="text-[11px] text-[#1877F2] font-bold hover:underline"
          >
            Standings
          </button>
        </div>

        <div className="space-y-2">
          {HOUSES_DATA.map((h, index) => {
            const maxPoints = 1500;
            const pct = Math.min(100, Math.round((h.points / maxPoints) * 100));
            return (
              <div
                key={h.name}
                onClick={() => {
                  setSelectedHouse(h.name as any);
                  setActiveTab('groups');
                }}
                className="cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#65676B]">#{index + 1}</span>
                    <span className="group-hover:text-[#1877F2] transition-colors">
                      {h.mascot.slice(-2)} {h.name}
                    </span>
                  </span>
                  <span className="font-bold text-[#050505]">{h.points} pts</span>
                </div>
                <div className="w-full h-2 bg-[#E4E6EB] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: h.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Campus milestones stay empty until real academy events are created. */}
      <div className="border-t border-[#CED0D4] pt-2">
        <div className="text-[11px] font-bold text-[#65676B] uppercase tracking-wider mb-2 px-1">
          Campus Milestones
        </div>
        <div className="p-3 rounded-xl bg-white border border-[#CED0D4] shadow-xs text-xs text-[#65676B]">
          No campus milestones yet.
        </div>
      </div>

      {/* Contacts / Messenger Active List */}
      <div className="border-t border-[#CED0D4] pt-2 flex-1">
        <div className="flex items-center justify-between px-1 mb-2">
          <div className="text-[11px] font-bold text-[#65676B] uppercase tracking-wider">
            Contacts ({otherUsers.length})
          </div>
          <div className="flex items-center gap-2 text-[#65676B]">
            <Video className="w-4 h-4 cursor-pointer hover:text-[#050505]" />
            <Search className="w-4 h-4 cursor-pointer hover:text-[#050505]" />
            <MoreHorizontal className="w-4 h-4 cursor-pointer hover:text-[#050505]" />
          </div>
        </div>

        <div className="space-y-0.5">
          {otherUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => openChatWithUser(user)}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#E4E6EB] transition-colors text-left group"
            >
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border border-[#CED0D4]"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#31A24C] border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs text-[#050505] truncate flex items-center gap-1 group-hover:text-[#1877F2]">
                  {user.name}
                  {user.isVerifiedAcademy && (
                    <CheckCircle2 className="w-3 h-3 text-[#1877F2] fill-[#1877F2] text-white" />
                  )}
                </div>
                <div className="text-[11px] text-[#65676B] truncate">
                  {user.house} House • {user.role.split(' - ')[0]}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
