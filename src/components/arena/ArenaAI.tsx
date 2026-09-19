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
  explanation: string;
  misconception: string;
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
  { topic: 'Mathematics', level: 'Foundation', q: 'If 3x + 7 = 25, what is x?', options: ['4','6','8','10'], answer: '6', explanation: 'Subtract 7 from both sides to get 3x = 18, then divide by 3.', misconception: 'Do not divide before removing the constant term.' },
  { topic: 'Physics', level: 'Foundation', q: 'Which formula gives pressure when force and area are known?', options: ['P = F/A','P = F×A','P = A/F','P = mgh'], answer: 'P = F/A', explanation: 'Pressure is force divided by area.', misconception: 'For the same force, increasing area reduces pressure.' },
  { topic: 'Chemistry', level: 'Foundation', q: 'Why does sodium form Na+?', options: ['It gains one electron','It loses one electron','It gains two electrons','It loses two electrons'], answer: 'It loses one electron', explanation: 'Sodium has one outer electron and loses it to form a stable Na+ ion.', misconception: 'Positive ions form when electrons are lost.' },
  { topic: 'Biology', level: 'Foundation', q: 'What is the main role of mitochondria?', options: ['Protein synthesis','Energy release in respiration','Photosynthesis','Cell division'], answer: 'Energy release in respiration', explanation: 'Mitochondria are major sites of aerobic respiration.', misconception: 'The nucleus controls cell activities; mitochondria mainly support aerobic respiration.' },
  { topic: 'English', level: 'Foundation', q: 'Which sentence uses a metaphor?', options: ['The boy ran quickly.','Her voice is music to my ears.','The rain fell heavily.','She opened the door.'], answer: 'Her voice is music to my ears.', explanation: 'A metaphor compares by saying one thing is another without like or as.', misconception: 'A metaphor is not meant literally.' },
  { topic: 'Kiswahili', level: 'Foundation', q: 'Neno “watoto” liko katika ngeli gani?', options: ['A-WA','KI-VI','U-I','LI-YA'], answer: 'A-WA', explanation: 'Watoto ni wingi wa mtoto na hupatana na ngeli ya A-WA.', misconception: 'Check both noun agreement and singular/plural form.' },
  { topic: 'Community Service Learning', level: 'Foundation', q: 'What is the main purpose of Community Service Learning?', options: ['Only to earn marks','Connect learning with meaningful community action','Replace all classroom lessons','Avoid teamwork'], answer: 'Connect learning with meaningful community action', explanation: 'CSL connects learning, reflection and responsible action in response to community needs.', misconception: 'CSL is more than volunteering because learning and reflection are part of it.' },
  { topic: 'General Science', level: 'Foundation', q: 'Which is a physical change?', options: ['Burning paper','Rusting iron','Melting ice','Cooking an egg'], answer: 'Melting ice', explanation: 'Melting changes state without forming a new substance.', misconception: 'A change of state can be physical rather than chemical.' },
  { topic: 'Agriculture', level: 'Foundation', q: 'Why is soil testing useful before planting?', options: ['Changes weather','Shows soil properties and nutrient needs','Guarantees no pests','Removes all weeds'], answer: 'Shows soil properties and nutrient needs', explanation: 'Testing can guide decisions about soil pH and nutrient management.', misconception: 'Testing informs management; it does not guarantee a harvest.' },
  { topic: 'Geography', level: 'Foundation', q: 'What does a contour line join?', options: ['Places of equal height','Equal rainfall','Equal population','Equal temperature'], answer: 'Places of equal height', explanation: 'Contour lines join points of equal elevation.', misconception: 'Contours show relief/elevation, not population.' },
  { topic: 'History & Citizenship', level: 'Foundation', q: 'Why compare historical sources?', options: ['Make history longer','Check evidence and perspectives','Remove evidence','Avoid dates'], answer: 'Check evidence and perspectives', explanation: 'Comparing sources helps assess evidence, purpose and perspective.', misconception: 'Different sources can have different reliability and perspectives.' },
  { topic: 'Business Studies', level: 'Foundation', q: 'What is profit?', options: ['Sales minus cost','Cost minus sales','Sales plus cost','Assets minus cash'], answer: 'Sales minus cost', explanation: 'Profit is revenue minus the costs incurred.', misconception: 'High sales do not automatically mean high profit.' },
  { topic: 'Computer Studies', level: 'Foundation', q: 'What is an algorithm?', options: ['A screen','A step-by-step procedure for solving a problem','A printer','A storage device'], answer: 'A step-by-step procedure for solving a problem', explanation: 'An algorithm is an ordered procedure for accomplishing a task.', misconception: 'An algorithm is the procedure; a program implements instructions in code.' },
  { topic: 'ICT', level: 'Foundation', q: 'What is phishing?', options: ['Backup','A deceptive attempt to obtain information','Keyboard','Spreadsheet formula'], answer: 'A deceptive attempt to obtain information', explanation: 'Phishing uses deceptive messages or sites to trick people into revealing information.', misconception: 'Phishing is mainly social engineering, not a hardware fault.' },
  { topic: 'Home Science', level: 'Foundation', q: 'Why is a balanced diet important?', options: ['Provides needed nutrients in suitable amounts','Removes need for water','Prevents every disease','Means one food'], answer: 'Provides needed nutrients in suitable amounts', explanation: 'A balanced diet supplies required nutrients and energy in appropriate proportions.', misconception: 'Balance means variety and appropriate amounts.' },
  { topic: 'Literature in English', level: 'Foundation', q: 'What is characterization?', options: ['Chapters only','How a writer presents a character','Setting only','Title only'], answer: 'How a writer presents a character', explanation: 'Characterization uses actions, speech, thoughts, description and relationships.', misconception: 'Characterization is broader than physical description.' },
  { topic: 'Fasihi ya Kiswahili', level: 'Foundation', q: 'Fasihi simulizi husambazwa hasa kupitia nini?', options: ['Masimulizi na utendaji','Vitabu pekee','Ramani','Michoro pekee'], answer: 'Masimulizi na utendaji', explanation: 'Fasihi simulizi is transmitted orally and through performance.', misconception: 'It includes performance forms such as songs, narratives and proverbs.' },
  { topic: 'Christian Religious Education', level: 'Foundation', q: 'What is a key purpose of CRE?', options: ['Memorise names only','Understand Christian teachings and values','Avoid moral discussion','Replace other subjects'], answer: 'Understand Christian teachings and values', explanation: 'CRE supports understanding, interpretation and application of Christian teachings and values.', misconception: 'Religious education involves application, not memorisation alone.' },
  { topic: 'Islamic Religious Education', level: 'Foundation', q: 'What does Sunnah generally refer to?', options: ['Prophetic practices and teachings','A map','A formula','A language family'], answer: 'Prophetic practices and teachings', explanation: 'Sunnah refers to the practices, teachings and example associated with Prophet Muhammad.', misconception: 'Sunnah is broader than one quotation.' },
  { topic: 'Hindu Religious Education', level: 'Foundation', q: 'What does dharma broadly relate to?', options: ['Duties, right conduct and moral order','Electricity','Map scale','Chemical element'], answer: 'Duties, right conduct and moral order', explanation: 'Dharma broadly concerns duty, ethical conduct and moral order.', misconception: 'Its meaning is broader than simply “religion”.' },
  { topic: 'French', level: 'Foundation', q: 'What does “bonjour” mean?', options: ['Hello/good morning','Goodbye','Thank you','Please'], answer: 'Hello/good morning', explanation: 'Bonjour is a common French greeting used during the day.', misconception: 'Au revoir is used for goodbye.' },
  { topic: 'German', level: 'Foundation', q: 'What does “Guten Morgen” mean?', options: ['Good morning','Good night','Thank you','See you later'], answer: 'Good morning', explanation: 'Guten Morgen is the German greeting for good morning.', misconception: 'Gute Nacht means good night.' },
  { topic: 'Arabic', level: 'Foundation', q: 'What does “marhaban” commonly mean?', options: ['Hello/welcome','Goodbye','Book','Water'], answer: 'Hello/welcome', explanation: 'Marhaban is a common Arabic greeting.', misconception: 'It is a greeting, not an object.' },
  { topic: 'Indigenous Languages', level: 'Foundation', q: 'Why is learning an indigenous language valuable?', options: ['Supports cultural knowledge and communication','Removes identity','Prevents communication','Only helps exams'], answer: 'Supports cultural knowledge and communication', explanation: 'Languages carry cultural knowledge, identity and oral traditions.', misconception: 'Language carries culture and knowledge, not vocabulary alone.' },
  { topic: 'Music & Dance', level: 'Foundation', q: 'What is rhythm?', options: ['Pattern of beats and durations','Instrument colour','Stage size','Singer name'], answer: 'Pattern of beats and durations', explanation: 'Rhythm organizes sounds and silences over time.', misconception: 'Rhythm concerns timing; pitch concerns how high or low a sound is.' },
  { topic: 'Theatre & Film', level: 'Foundation', q: 'What is a script?', options: ['Written plan of dialogue and action','Camera lens','Seat','Costume only'], answer: 'Written plan of dialogue and action', explanation: 'A script provides dialogue, actions and directions for performance or film.', misconception: 'A script can contain more than dialogue.' },
  { topic: 'Fine Arts', level: 'Foundation', q: 'What is composition in visual art?', options: ['Arrangement of elements','Price','Artist name','Frame only'], answer: 'Arrangement of elements', explanation: 'Composition is how visual elements are organized to create structure and meaning.', misconception: 'Composition is about arrangement, not just materials.' },
  { topic: 'Physical Education', level: 'Foundation', q: 'Why warm up before physical activity?', options: ['Prepare the body','Guarantee no injury','Replace hydration','Stop heart rate rising'], answer: 'Prepare the body', explanation: 'A suitable warm-up gradually prepares the body for activity.', misconception: 'A warm-up helps prepare the body but cannot guarantee no injury.' },
  { topic: 'Sports & Recreation', level: 'Foundation', q: 'Why are rules important in sport?', options: ['Support fair and safe participation','Stop competition','Remove teamwork','Make skills unnecessary'], answer: 'Support fair and safe participation', explanation: 'Rules provide a common framework for fair play and safety.', misconception: 'Rules structure competition rather than removing it.' },
  { topic: 'Aviation', level: 'Foundation', q: 'What force opposes an aircraft moving through air?', options: ['Drag','Lift','Weight','Thrust'], answer: 'Drag', explanation: 'Drag is aerodynamic resistance acting opposite motion through air.', misconception: 'Lift acts generally upward; drag opposes forward motion.' },
  { topic: 'Building Construction', level: 'Foundation', q: 'Why is a foundation important?', options: ['Transfers loads safely to ground','Decoration only','Replaces roof','Supplies electricity'], answer: 'Transfers loads safely to ground', explanation: 'Foundations distribute structural loads to the ground and support stability.', misconception: 'A foundation is structural, not decorative.' },
  { topic: 'Electricity', level: 'Foundation', q: 'What does a circuit breaker mainly do?', options: ['Interrupt a circuit during a fault','Increase voltage','Store electricity','Create fuel'], answer: 'Interrupt a circuit during a fault', explanation: 'A circuit breaker opens a circuit when excessive current or a defined fault occurs.', misconception: 'It protects the circuit; it is not an energy source.' },
  { topic: 'Metalwork', level: 'Foundation', q: 'Why is marking out important before cutting metal?', options: ['Guides accurate cutting','Makes metal softer','Replaces safety equipment','Removes need for measurement'], answer: 'Guides accurate cutting', explanation: 'Marking out transfers required dimensions and shapes before cutting or machining.', misconception: 'Marking out supports accuracy but does not replace safe working.' },
  { topic: 'Power Mechanics', level: 'Foundation', q: 'What is a main purpose of engine lubrication?', options: ['Reduce friction and wear','Increase corrosion','Remove fuel','Stop movement'], answer: 'Reduce friction and wear', explanation: 'Lubricant reduces friction between moving surfaces and limits wear.', misconception: 'Lubrication supports smooth movement; it does not stop the engine.' },
  { topic: 'Wood Technology', level: 'Foundation', q: 'Why is timber seasoned?', options: ['Reduce excess moisture and improve stability','Turn it into metal','Remove grain','Avoid measurement'], answer: 'Reduce excess moisture and improve stability', explanation: 'Seasoning reduces moisture to a suitable level and improves stability.', misconception: 'Seasoning does not remove the timber grain.' },
  { topic: 'Media Technology', level: 'Foundation', q: 'What does image resolution relate to?', options: ['Amount of image detail represented','Battery size','File name','Speaker volume'], answer: 'Amount of image detail represented', explanation: 'Resolution describes the amount of detail represented, often using pixel dimensions.', misconception: 'Resolution is not the same as file size or volume.' },
  { topic: 'Marine & Fisheries Technology', level: 'Foundation', q: 'Why is responsible fishing important?', options: ['Conserve aquatic resources','Remove all fish','Prevent monitoring','Increase waste'], answer: 'Conserve aquatic resources', explanation: 'Responsible fishing supports sustainable use and healthy aquatic ecosystems.', misconception: 'Sustainability is about maintaining resources, not maximizing the immediate catch.' }
];

const topics = Array.from(new Set(questions.map((q) => q.topic))) as ArenaQuestion['topic'][];

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
  const [questionIndex, setQuestionIndex] = useState(0);
  const [stats, setStats] = useState<ArenaStats>(() => getStoredItem<ArenaStats>(STORAGE_KEY, defaultStats));
  const [countdown, setCountdown] = useState(() => getCountdown(getNextSaturday()));
  const nextCompetition = useMemo(getNextSaturday, []);

  const question = useMemo(() => {
    const topicQuestions = questions.filter((item) => item.topic === topic);
    return topicQuestions[questionIndex % Math.max(topicQuestions.length, 1)] || questions[0];
  }, [topic, questionIndex]);

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
    setQuestionIndex(0);
    setAnswer('');
    setChecked(false);
  };

  const nextQuestion = () => {
    setQuestionIndex((index) => index + 1);
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
              <p className="mt-2 text-sm sm:text-base text-white/75 max-w-2xl leading-relaxed">Your Grade 10 learning coach: find misunderstandings, teach the concept clearly, earn points and build mastery.</p>
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
                <h2 className="font-black text-lg">AI Learning Coach</h2>
                <p className="text-xs text-[#65676B]">Diagnose a misunderstanding, learn why, earn points, then move on.</p>
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
              <div className={`mt-3 p-3 rounded-xl text-xs ${answer === question.answer ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEF3C7] text-[#92400E]'}`}>
                <div className="flex items-start gap-2 font-bold">
                  {answer === question.answer ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Sparkles className="w-4 h-4 shrink-0" />}
                  <span>{answer === question.answer ? 'Correct! You earned learning points. Reinforce the idea before moving on.' : `Misunderstanding detected: ${question.misconception}`}</span>
                </div>
                <div className="mt-2 font-medium leading-relaxed"><b>Teach me:</b> {question.explanation}</div>
                <button onClick={nextQuestion} className="mt-3 w-full py-2 rounded-xl bg-[#07111F] text-white font-black">Next learning check →</button>
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
