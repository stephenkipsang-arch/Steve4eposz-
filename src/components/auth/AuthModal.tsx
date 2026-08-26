import React, { useState } from 'react';
import {
  ShieldCheck,
  School,
  Lock,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { ACADEMY_USERS } from '../../data/mockData';
import { House, UserRole } from '../../types';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen } = useApp();
  const { currentUser, switchUser, loginWithAcademyEmail, isDomainValid } = useAuth();

  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [houseInput, setHouseInput] = useState<House>('Kenya');
  const [roleInput, setRoleInput] = useState<UserRole>('Student - IB DP2');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const handleDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const res = loginWithAcademyEmail(emailInput, nameInput, houseInput, roleInput);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        setIsAuthModalOpen(false);
      }, 1000);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleQuickSwitch = (userId: string) => {
    switchUser(userId);
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#CED0D4] max-h-[95vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#1877F2] to-[#0866FF] p-6 text-white text-center relative">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-white text-[#1877F2] font-black text-xl flex items-center justify-center mx-auto mb-2 shadow-md">
            VP
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center justify-center gap-1.5">
            MFA-VEXPEX
            <ShieldCheck className="w-5 h-5 text-[#00E5A3]" />
          </h2>
          <p className="text-xs text-white/90 font-medium max-w-md mx-auto mt-1">
            Exclusive Intranet for M-PESA Foundation Academy, Thika, Kenya
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Institutional Exclusivity Notice */}
          <div className="p-3.5 rounded-2xl bg-[#E7F3FF] border border-[#BEDDFF] flex items-start gap-3">
            <School className="w-5 h-5 text-[#1877F2] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-[#1877F2] text-xs">
                Restricted Academy Network
              </div>
              <p className="text-[11px] text-[#050505] leading-relaxed mt-0.5">
                Access is strictly restricted to students, faculty, leadership, and alumni with a verified{' '}
                <span className="font-bold text-[#1877F2]">@mpesafoundationacademy.ac.ke</span> email address.
              </p>
            </div>
          </div>

          {/* Quick Switch Verified Profiles */}
          <div>
            <div className="font-bold text-xs text-[#050505] uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Quick Switch Verified Academy Accounts</span>
              <span className="text-[10px] text-[#1877F2] font-semibold">1-Click Login</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ACADEMY_USERS.map((user) => {
                const isActive = currentUser.id === user.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => handleQuickSwitch(user.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'border-[#1877F2] bg-[#E7F3FF] ring-2 ring-[#BEDDFF]'
                        : 'border-[#CED0D4] hover:bg-[#F0F2F5]'
                    }`}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-[#050505] truncate flex items-center gap-1">
                        {user.name}
                        {user.isVerifiedAcademy && (
                          <CheckCircle2 className="w-3 h-3 text-[#1877F2] fill-[#1877F2] text-white" />
                        )}
                      </div>
                      <div className="text-[10px] text-[#65676B] truncate">
                        {user.house} House • {user.role.split(' - ')[0]}
                      </div>
                    </div>
                    {isActive && (
                      <span className="text-[9px] font-extrabold text-[#1877F2] bg-white px-2 py-0.5 rounded-full shadow-2xs">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[#CED0D4]" />

          {/* Custom MFA Email Login / Registration */}
          <form onSubmit={handleDomainSubmit} className="space-y-3.5">
            <div className="font-bold text-xs text-[#050505] uppercase tracking-wider">
              Or Sign In with Academy Credentials
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-[#FEE2E2] border border-[#FECACA] flex items-start gap-2 text-xs text-[#DC2626] font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-[#DCFCE7] border border-[#BBF7D0] flex items-start gap-2 text-xs text-[#166534] font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-[#050505] mb-1">
                Academy Institutional Email *
              </label>
              <input
                type="email"
                placeholder="e.g. john.doe@mpesafoundationacademy.ac.ke"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-[#F0F2F5] text-xs px-3 py-2.5 rounded-xl border border-[#CED0D4] focus:bg-white focus:border-[#1877F2] focus:outline-hidden"
                required
              />
              <span className="text-[10px] text-[#65676B] mt-1 block">
                Must end with @mpesafoundationacademy.ac.ke
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#050505] mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kiprono Bett"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-[#F0F2F5] text-xs px-3 py-2 rounded-xl border border-[#CED0D4] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#050505] mb-1">
                  Assigned House
                </label>
                <select
                  value={houseInput}
                  onChange={(e) => setHouseInput(e.target.value as any)}
                  className="w-full bg-[#F0F2F5] text-xs px-3 py-2 rounded-xl border border-[#CED0D4] focus:outline-hidden"
                >
                  <option value="Kenya">🦁 Kenya House</option>
                  <option value="Kilimanjaro">🏔️ Kilimanjaro House</option>
                  <option value="Longonot">🦅 Longonot House</option>
                  <option value="Elgon">🦏 Elgon House</option>
                  <option value="Staff / Administration">🏛️ Staff / Admin</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#050505] mb-1">
                Academy Academic Level / Role
              </label>
              <select
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value as any)}
                className="w-full bg-[#F0F2F5] text-xs px-3 py-2 rounded-xl border border-[#CED0D4] focus:outline-hidden"
              >
                <option value="Student - IB DP2">🎓 Student - IB DP2</option>
                <option value="Student - IB DP1">🎓 Student - IB DP1</option>
                <option value="Student - Grade 10">📚 Student - Grade 10</option>
                <option value="VEXPEX Council President">🏛️ VEXPEX Council President</option>
                <option value="VEXPEX House Captain">🎖️ VEXPEX House Captain</option>
                <option value="Faculty / Teacher">👨‍🏫 Faculty / Teacher</option>
                <option value="House Master / Mistress">🏡 House Master / Mistress</option>
                <option value="Academy Alumni">🌟 Academy Alumni</option>
                <option value="Dean of Academics">📖 Dean of Academics</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Verify & Access MFA-VEXPEX</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
