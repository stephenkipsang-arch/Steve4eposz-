import React, { useEffect, useMemo, useState } from 'react';
import {
  BrainCircuit,
  Trophy,
  CalendarDays,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Clock3,
  Target,
  Zap,
  CheckCircle2,
  Flame,
  Medal,
  TrendingUp,
  Star,
  LockKeyhole
} from 'lucide-react';
import { getStoredItem, setStoredItem } from '../../utils/safeStorage';

type ArenaStats = {
  xp: number;
  bestScore: number;
  answered: number;
  correct: number;
  streak: number;
  lastPracticeDate: string;
  badges: string[];
  weeklyPoints: number;
};

type ArenaQuestion = {
  topic: 'Mathematics' | 'Physics' | 'Chemistry' | 'Biology';
  level: 'Foundation' | 'Practice' | 'Challenge';
  q: string;
  options: string[];
  answer: string;
};

const STORAGE_KEY = 'mfa_vexpex_arena_v1';

const defaultStats: ArenaStats = {
  xp: 0,
  bestScore: 0,
  answered: 0,
  correct: 0,
  streak: 0,
  lastPracticeDate: '',
  badges: [],
  weeklyPoints: 0
};

const questions: ArenaQuestion[] = [
  { topic: 'Mathematics', level: 'Foundation', q: 'If 3x + 7 = 25, what is x?', options: ['4', '6', '8', '10'], answer: '6' },
  { topic: 'Mathematics', level: 'Practice', q: 'What is the value of 2² × 2³?', options: ['16', '32', '64', '8'], answer: '32' },
  { topic: 'Mathematics', level: 'Challenge', q: 'If x² - 5x + 6 = 0, which pair can be the roots?', options: ['1 and 6', '2 and 3', '-2 and -3', '3 and 5'], answer: '2 and 3' },
  { topic: 'Physics', level: 'Foundation', q: 'Which formula gives pressure when force and area are known?', options: ['P = F/A', 'P = F×A', 'P = A/F', 'P = mgh'], answer: 'P = F/A' },
  { topic: 'Physics', level: 'Practice', q: 'A force of 20 N acts on an area of 4 m². What pressure is produced?', options: ['5 Pa', '16 Pa', '24 Pa', '80 Pa'], answer: '5 Pa' },
  { topic: 'Physics', level: 'Challenge', q: 'Which quantity is measured in pascals?', options: ['Force', 'Energy', 'Pressure', 'Power'], answer: 'Pressure' },
  { topic: 'Chemistry', level: 'Foundation', q: 'What is the chemical symbol for sodium?', options: ['S', 'So', 'Na', 'Sn'], answer: 'Na' },
  { topic: 'Chemistry', level: 'Practice', q: 'Which particle has a negative relative charge?', options: ['Proton', 'Neutron', 'Electron', 'Nucleus'], answer: 'Electron' },
  { topic: 'Biology', level: 'Foundation', q: 'Which organelle is mainly responsible for releasing energy from food?', options: ['Nucleus', 'Mitochondrion', 'Ribosome', 'Cell wall'], answer: 'Mitochondrion' },
  { topic: 'Biology', level: 'Challenge', q: 'Which process produces genetically identical daughter cells for growth and repair?', options: ['Meiosis', 'Mitosis', 'Fertilisation', 'Diffusion'], answer: 'Mitosis' }
];

const topics = ['Mathematics', 'Physics', 'Chemistry', 'Biology'] as const;

const getNextSaturday = () => {
  const now = new Date();
  const next = new Date(now);
  const daysUntilSaturday = (6 - now.getDay() + 7) % 7;
  next.setDate(now.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday));
  next.setHours(10, 0, 0, 0);
  return next;
};

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const getCountdown = (target: Date) => {
  const ms = Math.max(0, target.getTime() - Date.now());
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return days > 0
    ? `${days}d ${hours}h ${minutes}m`
    : `${hours}h ${minutes}m ${seconds}s`;
};

const getBadgeList = (stats: ArenaStats) => [
  { id: 'first', label: 'First Strike', icon: '⚡', unlocked: stats.answered >= 1, note: 'Answer your first Arena question' },
  { id: 'five', label: 'Five Correct', icon: '🎯', unlocked: stats.correct >= 5, note: 'Get 5 questions correct' },
  { id: 'ten', label: 'Ten Correct', icon: '🏅', unlocked: stats.correct >= 10, note: 'Get 10 questions correct' },
  { id: 'streak', label: '3-Day Streak', icon: '🔥', unlocked: stats.streak >= 3, note: 'Practice on 3 different days' },
  { id: 'scholar', label: 'Arena Scholar', icon: '🧠', unlocked: stats.xp >= 250, note: 'Earn 250 XP' }
];

export const ArenaAI: React.FC = () => {
  const [topic, setTopic] = useState<(typeof topics)[number]>('Mathematics');
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const [stats, setStats] = useState<ArenaStats>(() => getStoredItem<ArenaStats>(STORAGE_KEY, defaultStats));
  const [countdown, setCountdown] = useState(() => getCountdown(getNextSaturday()));
  const nextCompetition = useMemo(getNextSaturday, []);

  const question = useMemo(() => {
    const topicQuestions = questions.filter((item) => item.topic === topic);
    const preferredLevel: ArenaQuestion['level'] =
      stats.correct >= 8 ? 'Challenge' : stats.correct >= 3 ? 'Practice' : 'Foundation';
    return topicQuestions.find((item) => item.level === preferredLevel) || topicQuestions[0];
  }, [topic, stats.correct]);

  const accuracy = stats.answered ? Math.round((stats.correct / stats.answered) * 100) : 0;
  const badges = getBadgeList(stats);

  useEffect(() => {
    setStoredItem(STORAGE_KEY, stats);
  }, [stats]);

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getCountdown(nextCompetition)), 1000);
    return () => window.clearInterval(timer);
  }, [nextCompetition]);

  const resetQuestion = (nextTopic: (typeof topics)[number]) => {
    setTopic(nextTopic);
    setAnswer('');
    setChecked(false);
  };

  const checkAnswer = () => {
    if (!answer || checked) return;
    const isCorrect = answer === question.answer;
    const today = new Date().toISOString().slice(0, 10);
    const previousDate = stats.lastPracticeDate;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    const nextStreak = previousDate === today
      ? stats.streak
      : previousDate === yesterdayKey
        ? stats.streak + 1
        : 1;

    const nextCorrect = stats.correct + (isCorrect ? 1 : 0);
    const nextXp = stats.xp + (isCorrect ? (question.level === 'Challenge' ? 35 : question.level === 'Practice' ? 25 : 15) : 5);
    const nextAnswered = stats.answered + 1;

    setStats({
      ...stats,
      xp: nextXp,
      bestScore: Math.max(stats.bestScore, isCorrect ? 100 : 0),
      answered: nextAnswered,
      correct: nextCorrect,
      streak: nextStreak,
      lastPracticeDate: today,
      weeklyPoints: stats.weeklyPoints + (isCorrect ? 10 : 2),
      badges: badges.filter((badge) => badge.unlocked || (
        badge.id === 'first' ? nextAnswered >= 1 :
        badge.id === 'five' ? nextCorrect >= 5 :
        badge.id === 'ten' ? nextCorrect >= 10 :
        badge.id === 'streak' ? nextStreak >= 3 :
        nextXp >= 250
      )).map((badge) => badge.id)
    });
    setChecked(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-5 py-5">
      <section className="relative overflow-hidden rounded-3xl bg-[#07111F] text-white border border-[#D4AF37] shadow-xl">
        <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_top_right,#D4AF37,transparent_38%),radial-gradient(circle_at_bottom_left,#1877F2,transparent_42%)]" />
        <div className="relative p-6 sm:p-9">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/60 text-[#F7D774] text-[11px] font-black tracking-widest uppercase">Grade 10 only</span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-[11px] font-bold">Weekly online arena</span>
            <span className="px-3 py-1 rounded-full bg-[#1877F2]/20 text-blue-100 text-[11px] font-bold">Progress saved on this device</span>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#D4AF37] text-[#07111F] flex items-center justify-center shadow-lg shrink-0"><BrainCircuit className="w-8 h-8" /></div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Arena AI</h1>
              <p className="mt-2 text-sm sm:text-base text-white/75 max-w-2xl leading-relaxed">Your Grade 10 learning arena: practise, build a streak, earn XP and prepare for the weekly Saturday challenge.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-3 mt-7">
            <div className="rounded-2xl bg-white/8 border border-white/10 p-4">
              <CalendarDays className="w-5 h-5 text-[#F7D774] mb-2" />
              <div className="text-[11px] text-white/55 uppercase tracking-wider font-bold">Next competition</div>
              <div className="font-extrabold mt-1">{formatDate(nextCompetition)}</div>
              <div className="text-xs text-white/60 mt-1">10:00 AM • Online</div>
            </div>
            <div className="rounded-2xl bg-white/8 border border-white/10 p-4">
              <Clock3 className="w-5 h-5 text-[#F7D774] mb-2" />
              <div className="text-[11px] text-white/55 uppercase tracking-wider font-bold">Countdown</div>
              <div className="font-extrabold mt-1 tabular-nums">{countdown}</div>
              <div className="text-xs text-white/60 mt-1">Until the next weekly arena</div>
            </div>
            <div className="rounded-2xl bg-white/8 border border-white/10 p-4">
              <Trophy className="w-5 h-5 text-[#F7D774] mb-2" />
              <div className="text-[11px] text-white/55 uppercase tracking-wider font-bold">Weekly points</div>
              <div className="font-extrabold mt-1">{stats.weeklyPoints}</div>
              <div className="text-xs text-white/60 mt-1">Competition foundation</div>
            </div>
            <div className="rounded-2xl bg-white/8 border border-white/10 p-4">
              <Flame className="w-5 h-5 text-[#F7D774] mb-2" />
              <div className="text-[11px] text-white/55 uppercase tracking-wider font-bold">Practice streak</div>
              <div className="font-extrabold mt-1">{stats.streak} day{stats.streak === 1 ? '' : 's'}</div>
              <div className="text-xs text-white/60 mt-1">Keep learning consistently</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-4 mt-5">
        <section className="lg:col-span-2 bg-white rounded-3xl border border-[#D4AF37] shadow-sm p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF8E1] text-[#9A7600] flex items-center justify-center"><BookOpen className="w-5 h-5" /></div>
              <div>
                <h2 className="font-black text-lg">AI Study Coach</h2>
                <p className="text-xs text-[#65676B]">Practice changes level as your results improve.</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black uppercase tracking-wider text-[#8A6800]">Accuracy</div>
              <div className="font-black text-lg">{accuracy}%</div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mb-4">
            {topics.map((item) => (
              <button key={item} onClick={() => resetQuestion(item)} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${topic === item ? 'bg-[#07111F] text-white border-[#07111F]' : 'bg-white text-[#65676B] border-[#CED0D4] hover:bg-[#F0F2F5]'}`}>{item}</button>
            ))}
          </div>

          <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-4">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-[#9A7600] uppercase tracking-wider">
              <Target className="w-4 h-4" />
              {question.level} level
              <span className="text-[#94A3B8]">•</span>
              {question.topic}
            </div>
            <p className="font-bold text-sm mt-2 leading-relaxed">{question.q}</p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {question.options.map((option) => (
                <button key={option} onClick={() => { if (!checked) { setAnswer(option); setChecked(false); } }} className={`p-2.5 rounded-xl text-xs font-semibold text-left border ${answer === option ? 'border-[#D4AF37] bg-[#FFF8E1]' : 'border-[#E4E6EB] bg-white hover:bg-[#F0F2F5]'}`}>{option}</button>
              ))}
            </div>
            <button onClick={checkAnswer} disabled={!answer || checked} className="mt-3 w-full py-2.5 rounded-xl bg-[#D4AF37] text-[#07111F] font-black text-xs disabled:opacity-40">Check my answer</button>
            {checked && (
              <div className={`mt-3 p-3 rounded-xl text-xs font-bold flex items-start gap-2 ${answer === question.answer ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEF3C7] text-[#92400E]'}`}>
                {answer === question.answer ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Sparkles className="w-4 h-4 shrink-0" />}
                <span>{answer === question.answer ? 'Correct! You earned XP. Your next question will adapt to your progress.' : `Not quite. The correct answer is ${question.answer}. Review the concept and try another question.`}</span>
              </div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-[#D4AF37] shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4"><TrendingUp className="w-5 h-5 text-[#8A6800]" /><h2 className="font-black text-lg">Your progress</h2></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-3"><div className="text-[10px] text-[#65676B] uppercase font-bold">XP</div><div className="text-xl font-black mt-1">{stats.xp}</div></div>
            <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-3"><div className="text-[10px] text-[#65676B] uppercase font-bold">Answered</div><div className="text-xl font-black mt-1">{stats.answered}</div></div>
            <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-3"><div className="text-[10px] text-[#65676B] uppercase font-bold">Correct</div><div className="text-xl font-black mt-1">{stats.correct}</div></div>
            <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-3"><div className="text-[10px] text-[#65676B] uppercase font-bold">Best score</div><div className="text-xl font-black mt-1">{stats.bestScore}%</div></div>
          </div>
          <div className="mt-4 p-4 rounded-2xl bg-[#07111F] text-white">
            <div className="flex items-center gap-2 text-[#F7D774] font-black text-sm"><Star className="w-4 h-4" /> Learning path</div>
            <p className="text-xs text-white/70 mt-2 leading-relaxed">
              {accuracy >= 80 ? 'Challenge mode: keep stretching your understanding with harder questions.' : accuracy >= 50 ? 'Practice mode: strengthen your foundations before the next level.' : 'Foundation mode: focus on core concepts first, then build upward.'}
            </p>
          </div>
        </section>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <section className="bg-white rounded-3xl border border-[#D4AF37] shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4"><Medal className="w-5 h-5 text-[#D4AF37]" /><h2 className="font-black text-lg">Achievements</h2></div>
          <div className="grid sm:grid-cols-2 gap-2">
            {badges.map((badge) => (
              <div key={badge.id} className={`rounded-2xl border p-3 ${badge.unlocked ? 'border-[#F7D774] bg-[#FFF8E1]' : 'border-[#E2E8F0] bg-[#F8FAFC] opacity-70'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{badge.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-xs">{badge.label}</div>
                    <div className="text-[10px] text-[#65676B] mt-0.5">{badge.note}</div>
                  </div>
                  {badge.unlocked ? <CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> : <LockKeyhole className="w-4 h-4 text-[#94A3B8]" />}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-[#D4AF37] shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4"><ShieldCheck className="w-5 h-5 text-[#07111F]" /><h2 className="font-black text-lg">Fair-play rules</h2></div>
          <div className="space-y-3 text-xs text-[#65676B] leading-relaxed">
            <div className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" /><span>Use AI as a study coach, not as a replacement for your own thinking.</span></div>
            <div className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" /><span>Competition results should be based on the published rules for that week's challenge.</span></div>
            <div className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" /><span>Any AI-use signal is only a prompt for review, never automatic proof of misconduct.</span></div>
            <div className="flex gap-2"><Zap className="w-4 h-4 text-[#D4AF37] shrink-0" /><span>Winner rewards can be connected later without changing your learning history.</span></div>
          </div>
          <div className="mt-4 text-[10px] text-[#94A3B8]">Arena progress is currently saved locally on the device. A future competition backend can make scores and winner records shared across the Grade 10 network.</div>
        </section>
      </div>
    </div>
  );
};
