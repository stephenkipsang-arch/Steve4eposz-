import React, { useMemo, useState } from 'react';
import {
  BrainCircuit,
  Trophy,
  CalendarDays,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Clock3,
  ArrowRight,
  Target,
  Zap,
  CheckCircle2
} from 'lucide-react';

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

const questions = [
  { topic: 'Mathematics', q: 'If 3x + 7 = 25, what is x?', options: ['4', '6', '8', '10'], answer: '6' },
  { topic: 'Physics', q: 'Which formula gives pressure when force and area are known?', options: ['P = F/A', 'P = F×A', 'P = A/F', 'P = mgh'], answer: 'P = F/A' },
  { topic: 'Chemistry', q: 'What is the chemical symbol for sodium?', options: ['S', 'So', 'Na', 'Sn'], answer: 'Na' },
  { topic: 'Biology', q: 'Which organelle is mainly responsible for releasing energy from food?', options: ['Nucleus', 'Mitochondrion', 'Ribosome', 'Cell wall'], answer: 'Mitochondrion' }
];

export const ArenaAI: React.FC = () => {
  const [topic, setTopic] = useState('Mathematics');
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const nextCompetition = useMemo(getNextSaturday, []);

  const question = questions.find((item) => item.topic === topic) || questions[0];
  const correct = answer === question.answer;

  const resetQuestion = (nextTopic: string) => {
    setTopic(nextTopic);
    setAnswer('');
    setChecked(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-5 py-5">
      <section className="relative overflow-hidden rounded-3xl bg-[#07111F] text-white border border-[#D4AF37] shadow-xl">
        <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_top_right,#D4AF37,transparent_38%),radial-gradient(circle_at_bottom_left,#1877F2,transparent_42%)]" />
        <div className="relative p-6 sm:p-9">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/60 text-[#F7D774] text-[11px] font-black tracking-widest uppercase">
              Grade 10 only
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-[11px] font-bold">
              Weekly online arena
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#D4AF37] text-[#07111F] flex items-center justify-center shadow-lg shrink-0">
              <BrainCircuit className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Arena AI</h1>
              <p className="mt-2 text-sm sm:text-base text-white/75 max-w-2xl leading-relaxed">
                A Grade 10 learning arena for weekly challenges, adaptive study support and responsible AI-learning tools.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3 mt-7">
            <div className="rounded-2xl bg-white/8 border border-white/10 p-4">
              <CalendarDays className="w-5 h-5 text-[#F7D774] mb-2" />
              <div className="text-[11px] text-white/55 uppercase tracking-wider font-bold">Next competition</div>
              <div className="font-extrabold mt-1">{formatDate(nextCompetition)}</div>
              <div className="text-xs text-white/60 mt-1">10:00 AM • Online</div>
            </div>
            <div className="rounded-2xl bg-white/8 border border-white/10 p-4">
              <Trophy className="w-5 h-5 text-[#F7D774] mb-2" />
              <div className="text-[11px] text-white/55 uppercase tracking-wider font-bold">Weekly promise</div>
              <div className="font-extrabold mt-1">A new challenge + app improvement preview</div>
              <div className="text-xs text-white/60 mt-1">Every competition cycle</div>
            </div>
            <div className="rounded-2xl bg-white/8 border border-white/10 p-4">
              <Zap className="w-5 h-5 text-[#F7D774] mb-2" />
              <div className="text-[11px] text-white/55 uppercase tracking-wider font-bold">Challenge theme</div>
              <div className="font-extrabold mt-1">School life + Grade 10 learning</div>
              <div className="text-xs text-white/60 mt-1">Fast, fair and fun</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-4 mt-5">
        <section className="bg-white rounded-3xl border border-[#D4AF37] shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#FFF8E1] text-[#9A7600] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-lg">AI Study Coach</h2>
              <p className="text-xs text-[#65676B]">Adjusts practice to your pace.</p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mb-4">
            {questions.map((item) => (
              <button
                key={item.topic}
                onClick={() => resetQuestion(item.topic)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${topic === item.topic ? 'bg-[#07111F] text-white border-[#07111F]' : 'bg-white text-[#65676B] border-[#CED0D4] hover:bg-[#F0F2F5]'}`}
              >
                {item.topic}
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-4">
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#9A7600] uppercase tracking-wider">
              <Target className="w-4 h-4" /> Pace check
            </div>
            <p className="font-bold text-sm mt-2">{question.q}</p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {question.options.map((option) => (
                <button
                  key={option}
                  onClick={() => { setAnswer(option); setChecked(false); }}
                  className={`p-2.5 rounded-xl text-xs font-semibold text-left border ${answer === option ? 'border-[#D4AF37] bg-[#FFF8E1]' : 'border-[#E4E6EB] bg-white hover:bg-[#F0F2F5]'}`}
                >
                  {option}
                </button>
              ))}
            </div>
            <button
              onClick={() => setChecked(true)}
              disabled={!answer}
              className="mt-3 w-full py-2.5 rounded-xl bg-[#D4AF37] text-[#07111F] font-black text-xs disabled:opacity-40"
            >
              Check my answer
            </button>
            {checked && (
              <div className={`mt-3 p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${correct ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEF3C7] text-[#92400E]'}`}>
                {correct ? <CheckCircle2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                {correct ? 'Correct. Your next practice can become more challenging.' : `Not quite. Review the concept and try again at your pace.`}
              </div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-[#D4AF37] shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#07111F] text-[#F7D774] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-lg">AI Learning & Integrity</h2>
              <p className="text-xs text-[#65676B]">Use AI to learn, not to replace learning.</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="flex items-center gap-2 font-bold text-sm">
                <BrainCircuit className="w-4 h-4 text-[#1877F2]" />
                AI-use signal checker
              </div>
              <p className="text-xs text-[#65676B] leading-relaxed mt-2">
                Arena AI can flag writing patterns that may deserve a closer look and can help learners understand how to use AI responsibly. It should never be treated as proof that a learner used AI.
              </p>
              <button className="mt-3 inline-flex items-center gap-2 text-xs font-black text-[#1877F2]">
                Check a study draft <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFF8E1] border border-[#F7D774]">
              <div className="flex items-center gap-2 font-bold text-sm text-[#7A5B00]">
                <Sparkles className="w-4 h-4" />
                Personal learning path
              </div>
              <p className="text-xs text-[#7A5B00] leading-relaxed mt-2">
                Practice can be adjusted from foundation → practice → challenge as your answers show progress. The goal is steady improvement at your own pace.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#65676B]">
              <Clock3 className="w-4 h-4" />
              Weekly arena resets every Saturday.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
