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


// Extra question bank: multiple checks per CBE subject so "Next learning check" always moves forward.
const extraQuestions: ArenaQuestion[] = [
  { topic: 'Mathematics', level: 'Practice', q: 'Simplify 2(3x - 4) + 5.', options: ['6x - 3','6x + 1','6x - 8','3x + 1'], answer: '6x - 3', explanation: 'Expand 2(3x - 4) to get 6x - 8, then add 5.', misconception: 'Remember to distribute the 2 to both terms inside the bracket.' },
  { topic: 'Mathematics', level: 'Practice', q: 'What is the gradient of y = 3x - 2?', options: ['-2','2','3','5'], answer: '3', explanation: 'In y = mx + c, m is the gradient.', misconception: 'The constant -2 is the y-intercept, not the gradient.' },
  { topic: 'Mathematics', level: 'Challenge', q: 'Solve x² - 5x + 6 = 0.', options: ['x=2 or 3','x=-2 or -3','x=1 or 6','x=-1 or 6'], answer: 'x=2 or 3', explanation: 'Factor as (x - 2)(x - 3)=0.', misconception: 'Look for two numbers whose product is 6 and sum is -5.' },
  { topic: 'Mathematics', level: 'Practice', q: 'If 5² × 5³ = 5ⁿ, what is n?', options: ['2','3','5','6'], answer: '5', explanation: 'When multiplying powers with the same base, add the indices.', misconception: 'Do not multiply the indices; add them.' },
  { topic: 'Physics', level: 'Practice', q: 'A force of 20 N acts on an area of 4 m². What pressure is produced?', options: ['5 Pa','16 Pa','24 Pa','80 Pa'], answer: '5 Pa', explanation: 'P = F/A = 20/4 = 5 Pa.', misconception: 'Pressure is force divided by area, not force multiplied by area.' },
  { topic: 'Physics', level: 'Practice', q: 'What happens to pressure in a liquid as depth increases?', options: ['It decreases','It stays zero','It increases','It becomes negative'], answer: 'It increases', explanation: 'Liquid pressure increases with depth because the liquid column above becomes greater.', misconception: 'Use P = hρg for pressure due to a liquid column.' },
  { topic: 'Physics', level: 'Challenge', q: 'A 12 V supply is connected to a 4 Ω resistor. What current flows?', options: ['0.33 A','3 A','8 A','48 A'], answer: '3 A', explanation: 'Ohm’s law gives I = V/R = 12/4 = 3 A.', misconception: 'Current is voltage divided by resistance.' },
  { topic: 'Physics', level: 'Practice', q: 'Which quantity is measured in joules?', options: ['Energy','Current','Pressure','Resistance'], answer: 'Energy', explanation: 'The joule is the SI unit of energy and work.', misconception: 'Current is measured in amperes and resistance in ohms.' },
  { topic: 'Chemistry', level: 'Practice', q: 'What is the formula of aluminium oxide?', options: ['AlO','Al₂O₃','Al₃O₂','AlO₂'], answer: 'Al₂O₃', explanation: 'Al is 3+ and O is 2-, so the simplest neutral ratio is 2:3.', misconception: 'Cross the valencies and simplify if necessary.' },
  { topic: 'Chemistry', level: 'Practice', q: 'Which particle has a negative charge?', options: ['Proton','Neutron','Electron','Nucleus'], answer: 'Electron', explanation: 'Electrons carry negative charge.', misconception: 'The nucleus contains positive protons and neutral neutrons.' },
  { topic: 'Chemistry', level: 'Challenge', q: 'Balance: 2H₂ + O₂ → ?', options: ['H₂O','2H₂O','H₂O₂','2HO'], answer: '2H₂O', explanation: 'Two H₂ molecules provide four H atoms, so 2H₂O balances both elements.', misconception: 'Change coefficients, not the chemical formula subscripts.' },
  { topic: 'Chemistry', level: 'Practice', q: 'A substance with pH 2 is best described as:', options: ['Strongly acidic','Neutral','Weakly alkaline','Strongly alkaline'], answer: 'Strongly acidic', explanation: 'A pH below 7 is acidic; pH 2 is strongly acidic.', misconception: 'The lower the pH, the greater the acidity.' },
  { topic: 'Biology', level: 'Practice', q: 'Which organelle controls most cell activities?', options: ['Nucleus','Ribosome','Vacuole','Cell wall'], answer: 'Nucleus', explanation: 'The nucleus contains genetic material and controls many cell activities.', misconception: 'Mitochondria mainly support aerobic respiration; the nucleus stores DNA.' },
  { topic: 'Biology', level: 'Practice', q: 'What is photosynthesis mainly used for?', options: ['Making glucose using light energy','Breaking down glucose only','Making proteins from fats','Removing all water'], answer: 'Making glucose using light energy', explanation: 'Plants use light energy to make glucose from carbon dioxide and water.', misconception: 'Light provides energy; it is not itself converted into glucose.' },
  { topic: 'Biology', level: 'Challenge', q: 'Which structure controls substances entering and leaving a cell?', options: ['Cell membrane','Nucleus','Chloroplast','Ribosome'], answer: 'Cell membrane', explanation: 'The cell membrane is selectively permeable and regulates movement of substances.', misconception: 'The cell wall provides support but does not selectively control entry.' },
  { topic: 'Biology', level: 'Practice', q: 'What is the main function of red blood cells?', options: ['Carry oxygen','Digest food','Produce hormones','Make antibodies only'], answer: 'Carry oxygen', explanation: 'Haemoglobin in red blood cells binds oxygen for transport.', misconception: 'White blood cells are mainly involved in defence.' },
  { topic: 'English', level: 'Practice', q: 'Which word is an adjective?', options: ['Quickly','Beautiful','Run','Happiness'], answer: 'Beautiful', explanation: 'An adjective describes a noun or pronoun.', misconception: 'Words ending in -ly are often adverbs, but not every word follows that pattern.' },
  { topic: 'English', level: 'Practice', q: 'What is the purpose of a topic sentence?', options: ['Introduce the main idea of a paragraph','End every essay','List references only','Give a title to a book'], answer: 'Introduce the main idea of a paragraph', explanation: 'A topic sentence signals the main point developed in the paragraph.', misconception: 'A topic sentence is about the paragraph, not necessarily the whole essay.' },
  { topic: 'English', level: 'Challenge', q: 'Which is an example of personification?', options: ['The wind whispered','The boy is tall','The box is heavy','She ran home'], answer: 'The wind whispered', explanation: 'Personification gives a human quality to something non-human.', misconception: 'The key is the human action or quality given to a non-human thing.' },
  { topic: 'English', level: 'Practice', q: 'What does an antonym express?', options: ['Opposite meaning','Same meaning','A sound','A question'], answer: 'Opposite meaning', explanation: 'An antonym is a word with an opposite or contrasting meaning.', misconception: 'A synonym has a similar meaning.' },
  { topic: 'Kiswahili', level: 'Practice', q: 'Wingi wa neno “kitabu” ni upi?', options: ['Vitabu','Mitabu','Kitabui','Batabu'], answer: 'Vitabu', explanation: 'Kitabu ni umoja wa ngeli KI-VI; wingi wake ni vitabu.', misconception: 'Tambua kiambishi cha ngeli katika umoja na wingi.' },
  { topic: 'Kiswahili', level: 'Practice', q: 'Kinyume cha neno “refu” ni:', options: ['Fupi','Ndefu','Kubwa','Juu'], answer: 'Fupi', explanation: 'Fupi ni kinyume cha refu.', misconception: 'Kinyume kinahitaji maana inayopingana, si neno linalohusiana.' },
  { topic: 'Kiswahili', level: 'Challenge', q: 'Katika sentensi “Asha amesoma kitabu”, kitenzi ni kipi?', options: ['Asha','amesoma','kitabu','sentensi'], answer: 'amesoma', explanation: '“Amesoma” kinaonyesha kitendo kilichofanywa.', misconception: 'Kitenzi huonyesha kitendo au hali.' },
  { topic: 'Community Service Learning', level: 'Practice', q: 'Which step helps identify a community problem before acting?', options: ['Needs assessment','Guessing','Ignoring residents','Skipping reflection'], answer: 'Needs assessment', explanation: 'A needs assessment gathers evidence about what the community actually needs.', misconception: 'Good CSL starts with listening and evidence rather than assumptions.' },
  { topic: 'Community Service Learning', level: 'Practice', q: 'Why is reflection important in CSL?', options: ['Connects experience to learning','Replaces action','Avoids responsibility','Only adds decoration'], answer: 'Connects experience to learning', explanation: 'Reflection helps learners examine what happened, what they learned and what to improve.', misconception: 'Reflection is part of learning, not an optional decoration.' },
  { topic: 'General Science', level: 'Practice', q: 'Which state of matter has a fixed volume but no fixed shape?', options: ['Solid','Liquid','Gas','Plasma only'], answer: 'Liquid', explanation: 'A liquid keeps its volume but takes the shape of its container.', misconception: 'Gases have neither fixed shape nor fixed volume.' },
  { topic: 'General Science', level: 'Practice', q: 'Which method separates an insoluble solid from a liquid?', options: ['Filtration','Distillation','Chromatography','Evaporation only'], answer: 'Filtration', explanation: 'Filtration uses a filter to retain an insoluble solid while liquid passes through.', misconception: 'Distillation is mainly for separating liquids or recovering a solvent.' },
  { topic: 'Agriculture', level: 'Practice', q: 'Which nutrient is strongly associated with leafy vegetative growth?', options: ['Nitrogen','Sodium','Chlorine','Silver'], answer: 'Nitrogen', explanation: 'Nitrogen is important for chlorophyll and vegetative growth.', misconception: 'Plants require several nutrients; nitrogen is not the only essential nutrient.' },
  { topic: 'Agriculture', level: 'Practice', q: 'Why is crop rotation useful?', options: ['Can help manage soil fertility and pests','Guarantees rain','Eliminates all weeds','Stops photosynthesis'], answer: 'Can help manage soil fertility and pests', explanation: 'Rotating crops can interrupt pest cycles and improve nutrient management.', misconception: 'Crop rotation helps management but does not guarantee perfect soil or zero pests.' },
  { topic: 'Geography', level: 'Practice', q: 'What is weather?', options: ['Short-term atmospheric conditions','Long-term population change','Shape of land only','Movement of oceans only'], answer: 'Short-term atmospheric conditions', explanation: 'Weather describes atmospheric conditions over short periods.', misconception: 'Climate describes longer-term patterns.' },
  { topic: 'Geography', level: 'Practice', q: 'What instrument measures rainfall?', options: ['Rain gauge','Barometer','Thermometer','Anemometer'], answer: 'Rain gauge', explanation: 'A rain gauge measures the amount of precipitation received.', misconception: 'A barometer measures atmospheric pressure.' },
  { topic: 'History & Citizenship', level: 'Practice', q: 'What is citizenship?', options: ['Membership of a state with rights and responsibilities','Owning a business only','Living without duties','Knowing every historical date'], answer: 'Membership of a state with rights and responsibilities', explanation: 'Citizenship involves belonging to a state and exercising rights while meeting responsibilities.', misconception: 'Citizenship includes both rights and responsibilities.' },
  { topic: 'History & Citizenship', level: 'Practice', q: 'Why should historical evidence be dated?', options: ['To place events in context','To make it fictional','To remove perspective','To avoid comparison'], answer: 'To place events in context', explanation: 'Dates help establish chronology and historical context.', misconception: 'Dating evidence supports interpretation; it does not remove all bias.' },
  { topic: 'Business Studies', level: 'Practice', q: 'What is revenue?', options: ['Income from sales','Total expenses','Owner withdrawal','A business loss'], answer: 'Income from sales', explanation: 'Revenue is income generated from selling goods or services.', misconception: 'Revenue is not the same as profit; costs are deducted to find profit.' },
  { topic: 'Business Studies', level: 'Practice', q: 'Why is budgeting useful?', options: ['Plans income and expenditure','Guarantees profit','Eliminates all costs','Replaces records'], answer: 'Plans income and expenditure', explanation: 'A budget helps plan and control expected income and spending.', misconception: 'A budget supports decisions but cannot guarantee profit.' },
  { topic: 'Computer Studies', level: 'Practice', q: 'What is a variable in programming?', options: ['A named place for a value','A monitor','A keyboard key','A printer'], answer: 'A named place for a value', explanation: 'A variable stores a value that a program can use and often change.', misconception: 'A variable is a programming concept, not a physical component.' },
  { topic: 'Computer Studies', level: 'Practice', q: 'What does debugging mean?', options: ['Finding and fixing program errors','Deleting every program','Buying a computer','Drawing a logo'], answer: 'Finding and fixing program errors', explanation: 'Debugging involves locating and correcting errors in software.', misconception: 'Debugging does not mean removing the whole program.' },
  { topic: 'ICT', level: 'Practice', q: 'What is two-factor authentication?', options: ['Using two types of verification','Using two usernames only','Sharing a password twice','Two computers'], answer: 'Using two types of verification', explanation: '2FA adds another verification factor beyond a password.', misconception: 'Two factors means different verification categories, not simply two passwords.' },
  { topic: 'ICT', level: 'Practice', q: 'Why should strong passwords be unique?', options: ['A breach of one account is less likely to expose others','They increase screen brightness','They remove the need for updates','They make Wi-Fi faster'], answer: 'A breach of one account is less likely to expose others', explanation: 'Unique passwords reduce the damage if one service is compromised.', misconception: 'Password strength and uniqueness both matter.' },
  { topic: 'Home Science', level: 'Practice', q: 'Which nutrient is mainly needed for growth and tissue repair?', options: ['Protein','Water only','Fibre only','Salt'], answer: 'Protein', explanation: 'Proteins provide amino acids needed for growth and tissue repair.', misconception: 'Carbohydrates mainly provide energy; protein has important building and repair roles.' },
  { topic: 'Home Science', level: 'Practice', q: 'Why is food hygiene important?', options: ['Reduces food contamination and illness','Makes all food nutritious','Removes every allergen','Guarantees long storage'], answer: 'Reduces food contamination and illness', explanation: 'Good hygiene reduces the risk of harmful contamination during food handling.', misconception: 'Hygiene reduces risk but cannot guarantee that food is always safe.' },
  { topic: 'Literature in English', level: 'Practice', q: 'What is setting?', options: ['Time and place of a story','Main character only','Writer biography','Book price'], answer: 'Time and place of a story', explanation: 'Setting establishes where and when a narrative occurs.', misconception: 'Setting can include social and cultural context too.' },
  { topic: 'Literature in English', level: 'Practice', q: 'What is a theme?', options: ['A central idea or message','A punctuation mark','A character name','A chapter number'], answer: 'A central idea or message', explanation: 'A theme is an important idea explored through a literary work.', misconception: 'A theme is broader than a single event or character.' },
  { topic: 'Fasihi ya Kiswahili', level: 'Practice', q: 'Methali ni nini?', options: ['Semi yenye hekima na ujumbe','Jina la mhusika','Aina ya ramani','Mstari wa hesabu'], answer: 'Semi yenye hekima na ujumbe', explanation: 'Methali ni usemi mfupi unaobeba hekima au funzo.', misconception: 'Methali hubeba maana pana kuliko maneno yake ya moja kwa moja.' },
  { topic: 'Fasihi ya Kiswahili', level: 'Practice', q: 'Mhusika mkuu ni nani?', options: ['Mhusika anayebeba sehemu kubwa ya matukio','Msomaji','Mchapishaji','Mwandishi pekee'], answer: 'Mhusika anayebeba sehemu kubwa ya matukio', explanation: 'Mhusika mkuu ndiye anayehusishwa kwa kiasi kikubwa na matukio ya kazi.', misconception: 'Mhusika mkuu si lazima awe msimulizi.' },
  { topic: 'Christian Religious Education', level: 'Practice', q: 'What is prayer?', options: ['Communication with God','A science experiment','A map skill','A business transaction'], answer: 'Communication with God', explanation: 'Prayer is a form of communication, worship and relationship with God in Christianity.', misconception: 'Prayer can include praise, thanksgiving, confession and requests.' },
  { topic: 'Christian Religious Education', level: 'Practice', q: 'Why are parables important in the Gospels?', options: ['They teach lessons through stories','They are maps','They are chemical equations','They list all kings'], answer: 'They teach lessons through stories', explanation: 'Parables use familiar situations to communicate spiritual and moral lessons.', misconception: 'A parable is a teaching story, not merely a historical list.' },
  { topic: 'Islamic Religious Education', level: 'Practice', q: 'What is salah?', options: ['The prescribed Muslim prayer','Charity only','Fasting only','Pilgrimage only'], answer: 'The prescribed Muslim prayer', explanation: 'Salah is the formal prayer performed by Muslims.', misconception: 'Salah is distinct from zakat, sawm and hajj.' },
  { topic: 'Islamic Religious Education', level: 'Practice', q: 'What is zakat?', options: ['Obligatory charitable giving','Daily prayer','Pilgrimage','A language'], answer: 'Obligatory charitable giving', explanation: 'Zakat is a prescribed form of charitable giving in Islam.', misconception: 'Zakat is different from voluntary charity (sadaqah).' },
  { topic: 'Hindu Religious Education', level: 'Practice', q: 'What is karma broadly associated with?', options: ['Consequences of actions','A weather instrument','A chemical bond','A map scale'], answer: 'Consequences of actions', explanation: 'Karma broadly concerns the consequences associated with actions.', misconception: 'Karma is a religious/philosophical concept, not simply “luck”.' },
  { topic: 'Hindu Religious Education', level: 'Practice', q: 'What is puja?', options: ['Worship or devotional practice','A sport','A mathematical operation','A type of soil'], answer: 'Worship or devotional practice', explanation: 'Puja refers to forms of Hindu worship and devotional practice.', misconception: 'Puja can take different forms and contexts.' },
  { topic: 'French', level: 'Practice', q: 'What does “merci” mean?', options: ['Thank you','Hello','Goodbye','Sorry'], answer: 'Thank you', explanation: 'Merci is the common French word for thank you.', misconception: 'Bonjour is a greeting; merci expresses thanks.' },
  { topic: 'French', level: 'Practice', q: 'What does “au revoir” mean?', options: ['Goodbye','Good morning','Please','Water'], answer: 'Goodbye', explanation: 'Au revoir is used when saying goodbye.', misconception: 'Bonjour is used as a greeting.' },
  { topic: 'German', level: 'Practice', q: 'What does “Danke” mean?', options: ['Thank you','Hello','Good night','Please'], answer: 'Thank you', explanation: 'Danke is German for thank you.', misconception: 'Bitte can mean please or you’re welcome depending on context.' },
  { topic: 'German', level: 'Practice', q: 'What does “Auf Wiedersehen” mean?', options: ['Goodbye','Good morning','Thank you','Welcome'], answer: 'Goodbye', explanation: 'Auf Wiedersehen is a German farewell.', misconception: 'Guten Morgen means good morning.' },
  { topic: 'Arabic', level: 'Practice', q: 'What does “shukran” commonly mean?', options: ['Thank you','Goodbye','Book','Teacher'], answer: 'Thank you', explanation: 'Shukran is a common Arabic expression of thanks.', misconception: 'Marhaban is a greeting, while shukran expresses thanks.' },
  { topic: 'Arabic', level: 'Practice', q: 'What does “kitab” commonly mean?', options: ['Book','House','Water','School'], answer: 'Book', explanation: 'Kitab (كتاب) commonly means book in Arabic.', misconception: 'Language context matters, but kitab is widely used for book.' },
  { topic: 'Indigenous Languages', level: 'Practice', q: 'How can indigenous languages support education?', options: ['Preserve local knowledge and improve cultural understanding','Remove all science','Prevent communication','Only teach spelling'], answer: 'Preserve local knowledge and improve cultural understanding', explanation: 'Indigenous languages can carry local ecological, historical and cultural knowledge.', misconception: 'They can support learning alongside other languages and subjects.' },
  { topic: 'Indigenous Languages', level: 'Practice', q: 'What is oral tradition?', options: ['Knowledge passed through spoken forms and performance','A computer file','A road map','A chemical test'], answer: 'Knowledge passed through spoken forms and performance', explanation: 'Oral traditions transmit stories, history, values and knowledge through speech and performance.', misconception: 'Oral tradition can include songs, proverbs, narratives and ceremonies.' },
  { topic: 'Music & Dance', level: 'Practice', q: 'What is pitch?', options: ['How high or low a sound is','How loud a sound is','Stage size','Dance costume'], answer: 'How high or low a sound is', explanation: 'Pitch describes the perceived highness or lowness of a sound.', misconception: 'Loudness relates to amplitude, not pitch.' },
  { topic: 'Music & Dance', level: 'Practice', q: 'What is tempo?', options: ['Speed of the beat','Loudness only','Instrument material','Song title'], answer: 'Speed of the beat', explanation: 'Tempo describes how fast or slow a piece is performed.', misconception: 'Tempo concerns speed, while dynamics concern loudness.' },
  { topic: 'Theatre & Film', level: 'Practice', q: 'What is blocking in theatre?', options: ['Planned movement and positions of performers','Stopping the audience','Building a wall','Editing sound only'], answer: 'Planned movement and positions of performers', explanation: 'Blocking plans where performers move and stand during a scene.', misconception: 'Blocking is about stage movement and positioning.' },
  { topic: 'Theatre & Film', level: 'Practice', q: 'What does a director generally do?', options: ['Guides the artistic and performance interpretation','Only sells tickets','Only builds seats','Only writes subtitles'], answer: 'Guides the artistic and performance interpretation', explanation: 'A director coordinates interpretation, performance and many creative decisions.', misconception: 'A production usually involves many specialized roles.' },
  { topic: 'Fine Arts', level: 'Practice', q: 'Which element describes the lightness or darkness of a colour?', options: ['Value','Texture','Shape','Line'], answer: 'Value', explanation: 'Value describes how light or dark a colour or tone appears.', misconception: 'Texture describes surface quality, while value concerns light and dark.' },
  { topic: 'Fine Arts', level: 'Practice', q: 'What is texture in art?', options: ['The surface quality or appearance of a surface','The price of artwork','The artist’s age','The frame size only'], answer: 'The surface quality or appearance of a surface', explanation: 'Texture may be actual or visual and describes surface qualities.', misconception: 'Texture can be represented visually even when the surface is physically smooth.' },
  { topic: 'Physical Education', level: 'Practice', q: 'Which component describes the ability of muscles to exert force?', options: ['Strength','Flexibility','Balance','Reaction time'], answer: 'Strength', explanation: 'Muscular strength is the ability to exert force.', misconception: 'Endurance concerns sustaining activity; strength concerns force production.' },
  { topic: 'Physical Education', level: 'Practice', q: 'Why is hydration important during exercise?', options: ['Supports normal body function and temperature regulation','Makes exercise unnecessary','Guarantees no fatigue','Replaces all nutrients'], answer: 'Supports normal body function and temperature regulation', explanation: 'Adequate fluids support physiological function and temperature regulation.', misconception: 'Hydration helps performance and health but does not eliminate fatigue.' },
  { topic: 'Sports & Recreation', level: 'Practice', q: 'What is teamwork?', options: ['Cooperating toward a shared goal','Playing alone','Ignoring rules','Avoiding communication'], answer: 'Cooperating toward a shared goal', explanation: 'Teamwork involves coordinated effort, communication and shared responsibility.', misconception: 'Teamwork still requires individual responsibility.' },
  { topic: 'Sports & Recreation', level: 'Practice', q: 'What does fair play mean?', options: ['Respecting rules, opponents and officials','Winning at any cost','Ignoring safety','Avoiding teamwork'], answer: 'Respecting rules, opponents and officials', explanation: 'Fair play emphasizes respect, honesty and responsible competition.', misconception: 'Winning does not justify breaking rules.' },
  { topic: 'Aviation', level: 'Practice', q: 'Which force generally acts upward on an aircraft wing?', options: ['Lift','Drag','Weight','Friction'], answer: 'Lift', explanation: 'Lift is the aerodynamic force that generally acts upward.', misconception: 'Drag opposes motion; weight acts downward.' },
  { topic: 'Aviation', level: 'Practice', q: 'What does a runway provide?', options: ['A prepared surface for aircraft takeoff and landing','Fuel only','Weather forecasts','Passenger meals'], answer: 'A prepared surface for aircraft takeoff and landing', explanation: 'Runways are prepared surfaces used for aircraft takeoff and landing.', misconception: 'Airport operations include many other facilities besides the runway.' },
  { topic: 'Building Construction', level: 'Practice', q: 'What is a lintel?', options: ['A structural member over an opening','A floor finish','A roof tile','A water pipe'], answer: 'A structural member over an opening', explanation: 'A lintel supports loads above openings such as doors and windows.', misconception: 'A lintel is structural, not simply decorative.' },
  { topic: 'Building Construction', level: 'Practice', q: 'Why is a plumb line used?', options: ['To check vertical alignment','To measure temperature','To cut timber','To test electricity'], answer: 'To check vertical alignment', explanation: 'A plumb line helps establish or check true vertical.', misconception: 'A level checks horizontal alignment; a plumb line checks vertical.' },
  { topic: 'Electricity', level: 'Practice', q: 'What is electrical power?', options: ['Rate of electrical energy transfer','Amount of resistance only','Charge stored in a wire','Length of cable'], answer: 'Rate of electrical energy transfer', explanation: 'Power is the rate at which electrical energy is transferred, P = VI.', misconception: 'Energy is measured in joules; power is measured in watts.' },
  { topic: 'Electricity', level: 'Challenge', q: 'A 230 V appliance draws 2 A. What is its power?', options: ['115 W','232 W','460 W','0.0087 W'], answer: '460 W', explanation: 'P = VI = 230 × 2 = 460 W.', misconception: 'For electrical power, multiply voltage by current.' },
  { topic: 'Metalwork', level: 'Practice', q: 'What is a file mainly used for?', options: ['Removing small amounts of metal and smoothing surfaces','Joining wires','Measuring voltage','Painting metal'], answer: 'Removing small amounts of metal and smoothing surfaces', explanation: 'Files are hand tools for shaping and smoothing metal.', misconception: 'A file removes material gradually; it is not a measuring instrument.' },
  { topic: 'Metalwork', level: 'Practice', q: 'Why wear eye protection when machining metal?', options: ['Protects eyes from chips and particles','Improves cutting speed','Makes metal softer','Replaces all other safety controls'], answer: 'Protects eyes from chips and particles', explanation: 'Eye protection reduces the risk from flying particles and fragments.', misconception: 'PPE is one part of safe working, not a replacement for other controls.' },
  { topic: 'Power Mechanics', level: 'Practice', q: 'What is torque?', options: ['Turning effect of a force','Heat of an engine','Fuel volume','Tyre pressure only'], answer: 'Turning effect of a force', explanation: 'Torque is the turning effect produced by a force about an axis.', misconception: 'Torque depends on force and perpendicular distance from the pivot.' },
  { topic: 'Power Mechanics', level: 'Practice', q: 'What is the purpose of an engine air filter?', options: ['Remove particles from incoming air','Add fuel','Cool the tyres','Charge the battery'], answer: 'Remove particles from incoming air', explanation: 'The air filter helps prevent dust and particles entering the engine.', misconception: 'The fuel filter performs a different filtering role.' },
  { topic: 'Wood Technology', level: 'Practice', q: 'What is a mortise and tenon joint?', options: ['A joint using a projection fitted into a matching recess','A metal welding joint','A paint finish','A roof covering'], answer: 'A joint using a projection fitted into a matching recess', explanation: 'A tenon fits into a mortise to form a strong timber joint.', misconception: 'It is a woodworking joint, not a welding process.' },
  { topic: 'Wood Technology', level: 'Practice', q: 'Why should timber grain direction be considered when working?', options: ['It affects strength, cutting and surface finish','It changes the species','It removes moisture instantly','It replaces measurement'], answer: 'It affects strength, cutting and surface finish', explanation: 'Grain direction influences how timber behaves during cutting and shaping.', misconception: 'Grain direction matters for both appearance and practical working.' },
  { topic: 'Media Technology', level: 'Practice', q: 'What is video frame rate?', options: ['Number of frames shown per second','Image file name','Speaker size','Screen brightness'], answer: 'Number of frames shown per second', explanation: 'Frame rate is commonly expressed in frames per second (fps).', misconception: 'Frame rate concerns time-based motion, not image resolution.' },
  { topic: 'Media Technology', level: 'Practice', q: 'What is an audio waveform a representation of?', options: ['Variation of sound signal over time','Camera battery level','Screen size','File password'], answer: 'Variation of sound signal over time', explanation: 'A waveform visualizes changes in an audio signal over time.', misconception: 'A waveform is about signal variation, not the physical size of the speaker.' },
  { topic: 'Marine & Fisheries Technology', level: 'Practice', q: 'What is aquaculture?', options: ['Farming aquatic organisms','Measuring rainfall','Building roads','Making aircraft'], answer: 'Farming aquatic organisms', explanation: 'Aquaculture is the controlled farming of aquatic organisms such as fish.', misconception: 'Aquaculture differs from capture fishing because organisms are farmed.' },
  { topic: 'Marine & Fisheries Technology', level: 'Practice', q: 'Why monitor water quality in fish farming?', options: ['Protect fish health and growth','Increase pollution','Remove oxygen','Stop feeding'], answer: 'Protect fish health and growth', explanation: 'Water quality affects oxygen availability, health and growth of cultured fish.', misconception: 'Good water quality is essential for aquatic organisms.' }
];

const allQuestions = [...questions, ...extraQuestions];
const topics = Array.from(new Set(allQuestions.map((q) => q.topic))) as ArenaQuestion['topic'][];

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
    const topicQuestions = allQuestions.filter((item) => item.topic === topic);
    return topicQuestions[questionIndex % Math.max(topicQuestions.length, 1)] || allQuestions[0];
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
