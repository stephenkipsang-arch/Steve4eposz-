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
import { House, UserRole } from '../../types';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen } = useApp();
  const { loginWithAcademyEmail, isAuthenticated } = useAuth();

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

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#CED0D4] max-h-[95vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#1877F2] to-[#0866FF] p-6 text-white text-center relative">
          {isAuthenticated && (
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

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

          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="font-bold text-xs text-[#050505] uppercase tracking-wider">
              Sign in or create your academy account
            </div>
            <p className="text-[11px] text-[#65676B] leading-relaxed mt-1">
              This is a fresh MFA-VEXPEX network. No demo students, teachers, posts, messages, or marketplace items are preloaded.
              Your account appears only after you sign in with your Academy email.
            </p>
          </div>

          <div className="border-t border-[#CED0D4]" />

          {/* Academy Email Login / Registration */}
          <form onSubmit={handleDomainSubmit} className="space-y-3.5">
            <div className="font-bold text-xs text-[#050505] uppercase tracking-wider">
              Academy Email Sign In / Account Registration
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
                Must end with @mpesafoundationacademy.ac.ke. New accounts start with an empty profile and empty feed.
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
              <span>Sign In / Create Account</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
