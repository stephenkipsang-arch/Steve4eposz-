import { User, Post, Story, Reel, HouseStats, MarketplaceItem, CampusEvent, ChatThread, NotificationItem } from '../types';

export const CURRENT_USER: User = {
  id: 'user_stephen',
  name: 'Stephen Kipsang',
  email: 'stephen.kipsang@mpesafoundationacademy.ac.ke',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  coverImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
  role: 'Student - IB DP2',
  house: 'Kenya',
  graduationYear: '2026',
  gradeOrDept: 'IB DP2',
  bio: '🦁 Kenya House Pride | IB DP2 Scholar (Physics & Math HL) | VEXPEX Technology & Innovations Rep | Aspiring Aerospace Engineer 🚀',
  location: 'Thika Campus, Kenya',
  isVerifiedAcademy: true,
  friendsCount: 384,
  joinedDate: 'January 2022',
  clubs: ['Robotics & AI Society', 'Debate Club', 'Kenya Rugby Team', 'VEXPEX Leadership']
};

export const ACADEMY_USERS: User[] = [
  CURRENT_USER,
  {
    id: 'user_wangari',
    name: 'Ms. Wangari Mutua',
    email: 'wangari.mutua@mpesafoundationacademy.ac.ke',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    role: 'Dean of Academics',
    house: 'Staff / Administration',
    gradeOrDept: 'Academic Affairs & IB DP Coordination',
    bio: 'Dean of Academics & IB DP Coordinator at M-PESA Foundation Academy. Passionate about holistic Pan-African leadership & transformative pedagogy.',
    location: 'Administration Block, Thika',
    isVerifiedAcademy: true,
    friendsCount: 520,
    joinedDate: 'September 2018',
    clubs: ['Faculty Mentorship', 'IB Academic Board']
  },
  {
    id: 'user_david',
    name: 'David Otieno',
    email: 'david.otieno@mpesafoundationacademy.ac.ke',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    role: 'VEXPEX House Captain',
    house: 'Kenya',
    graduationYear: '2026',
    gradeOrDept: 'IB DP2',
    bio: 'Kenya House Captain 🦁 | Rugby XV Fly-half 🏉 | Athletics 400m Champion | Leadership through action & integrity.',
    location: 'Kenya Dorms, Room 14',
    isVerifiedAcademy: true,
    friendsCount: 462,
    joinedDate: 'January 2022',
    clubs: ['Kenya Rugby Team', 'Peer Counseling', 'Environmental Green Club']
  },
  {
    id: 'user_joy',
    name: 'Joy Cherop',
    email: 'joy.cherop@mpesafoundationacademy.ac.ke',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    role: 'Student - IB DP1',
    house: 'Kilimanjaro',
    graduationYear: '2027',
    gradeOrDept: 'IB DP1',
    bio: '🏔️ Kilimanjaro House | Head of Robotics & STEM Innovation Hub | FIRST Global Kenya Finalist 🤖 | Python & Hardware dev.',
    location: 'Kilimanjaro Hall, Room 08',
    isVerifiedAcademy: true,
    friendsCount: 390,
    joinedDate: 'January 2023',
    clubs: ['Robotics & AI Society', 'Girls in STEM', 'Kilimanjaro Debate Team']
  },
  {
    id: 'user_kevin',
    name: 'Kevin Mwangi',
    email: 'kevin.mwangi@mpesafoundationacademy.ac.ke',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80',
    role: 'Student - Grade 10',
    house: 'Elgon',
    graduationYear: '2028',
    gradeOrDept: 'Grade 10',
    bio: '🦏 Elgon House | Grade 10 Scholar | MFA Symphony Orchestra Concertmaster (Violin) 🎻 | Drama & Spoken Word | Let the music speak.',
    location: 'Elgon Dorms, Room 21',
    isVerifiedAcademy: true,
    friendsCount: 310,
    joinedDate: 'January 2024',
    clubs: ['Music & Symphony Orchestra', 'Drama Club', 'Elgon Choir']
  },
  {
    id: 'user_faith',
    name: 'Faith Chebet',
    email: 'faith.chebet@mpesafoundationacademy.ac.ke',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    role: 'VEXPEX Council President',
    house: 'Longonot',
    graduationYear: '2026',
    gradeOrDept: 'IB DP2',
    bio: '🦅 Longonot House | VEXPEX Student Body President 2025/2026 🏛️ | Model United Nations Secretary General | Servant Leader.',
    location: 'Longonot Block, Room 03',
    isVerifiedAcademy: true,
    friendsCount: 512,
    joinedDate: 'January 2022',
    clubs: ['VEXPEX Leadership', 'Model UN', 'Longonot Basketball']
  },
  {
    id: 'user_peter',
    name: 'Mr. Peter Kamau',
    email: 'peter.kamau@mpesafoundationacademy.ac.ke',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
    role: 'House Master / Mistress',
    house: 'Kenya',
    gradeOrDept: 'Faculty of Natural Sciences (Chemistry)',
    bio: 'Kenya House Master & Senior Chemistry Faculty. Championing academic rigor, character development, and scientific curiosity.',
    location: 'Science Complex Lab 3, Thika',
    isVerifiedAcademy: true,
    friendsCount: 430,
    joinedDate: 'May 2019',
    clubs: ['Kenya House Mentorship', 'Science Congress Advisory']
  }
];

export const HOUSES_DATA: HouseStats[] = [
  {
    name: 'Kenya',
    points: 1420,
    mascot: 'The Golden Lion 🦁',
    color: '#DC2626', // red
    motto: 'Courage, Honor & Relentless Drive',
    captain: 'David Otieno',
    dormMaster: 'Mr. Peter Kamau',
    leadingCategory: 'Inter-house Rugby & Athletics'
  },
  {
    name: 'Kilimanjaro',
    points: 1385,
    mascot: 'The Summit Leopard 🏔️',
    color: '#2563EB', // blue
    motto: 'Strength in Unity and Wisdom',
    captain: 'Joy Cherop',
    dormMaster: 'Ms. Alice Njeri',
    leadingCategory: 'Robotics & STEM Innovations'
  },
  {
    name: 'Longonot',
    points: 1350,
    mascot: 'The Soaring Falcon 🦅',
    color: '#059669', // emerald
    motto: 'Speed, Agility and Strategic Vision',
    captain: 'Faith Chebet',
    dormMaster: 'Mr. Joseph Omondi',
    leadingCategory: 'Model UN & Public Speaking'
  },
  {
    name: 'Elgon',
    points: 1310,
    mascot: 'The Resilient Rhino 🦏',
    color: '#D97706', // amber/gold
    motto: 'Unyielding Resolve & Creative Expression',
    captain: 'Kevin Mwangi',
    dormMaster: 'Mrs. Grace Wanjiku',
    leadingCategory: 'Symphony Music & Fine Arts'
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post_video_1',
    author: ACADEMY_USERS[3], // Joy Cherop
    content: '🎥 Inter-House Robotics & Autonomous Drone Trials Highlights! 🚁 Watch our student engineers test precision hover and agricultural crop scanning sensors at the Thika campus grounds.',
    timestamp: '1 hr ago',
    houseTag: 'Kilimanjaro',
    location: 'MFA Innovation & STEM Flight Zone',
    feeling: '🚀 feeling thrilled with the Tech Squad',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoTitle: 'MFA Autonomous Drone Field Test - Term 2 Showcase',
    reactions: {
      like: 124,
      love: 76,
      care: 18,
      haha: 1,
      wow: 49,
      sad: 0,
      angry: 0
    },
    userReaction: 'love',
    sharesCount: 32,
    comments: [
      {
        id: 'cv1',
        author: CURRENT_USER,
        content: 'The flight stabilization PID algorithm performed flawlessly in the wind! 👏🔥',
        timestamp: '30 mins ago',
        likes: 15,
        isLikedByMe: true
      }
    ]
  },
  {
    id: 'post_1',
    author: ACADEMY_USERS[1], // Ms. Wangari Mutua
    content: '📢 OFFICIAL ACADEMIC ANNOUNCEMENT: Congratulations to our IB DP2 & DP1 scholars who submitted their final Extended Essays, TOK Exhibitions, and Science Internal Assessments today at the Uongozi Centre! 🎓\n\nThe depth of critical thinking across renewable solar applications in Kenya, bio-enzyme water purification, and African economic integration is unmatched. Grade 10 Personal Project showcases and IB oral presentations commence this Thursday at the Innovation Amphitheatre.',
    timestamp: '2 hrs ago',
    houseTag: 'All Academy',
    location: 'Uongozi Centre Auditorium, Thika',
    images: [
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80'
    ],
    feeling: '🎓 feeling deeply proud with MFA Scholars',
    reactions: {
      like: 98,
      love: 54,
      care: 21,
      haha: 0,
      wow: 15,
      sad: 0,
      angry: 0
    },
    userReaction: 'love',
    isOfficialAnnouncement: true,
    isPinned: true,
    sharesCount: 24,
    comments: [
      {
        id: 'c1',
        author: CURRENT_USER,
        content: 'Thank you Ms. Wangari and the entire IB Faculty team for the mentorship through the long research nights at the library! 🙏',
        timestamp: '1 hr ago',
        likes: 18,
        isLikedByMe: true
      },
      {
        id: 'c2',
        author: ACADEMY_USERS[3], // Joy Cherop
        content: 'Kilimanjaro scholars are fully ready for the oral symposium on Thursday! Let us go 🏔️🚀',
        timestamp: '45 mins ago',
        likes: 12
      }
    ]
  },
  {
    id: 'post_2',
    author: ACADEMY_USERS[3], // Joy Cherop
    content: '🤖 IT HAPPENED! The MFA Robotics & Autonomous Systems team just qualified for the International STEM Championship Finals after today’s regional hackathon at the Innovation Hub!\n\nOur agricultural IoT drone + crop health AI model scored 98.4/100. Huge shoutout to Stephen Kipsang (IB DP2) for the embedded code and David Otieno (Kenya House) for the 3D-printed chassis test!\n\nWatch our live test flight clip below 🚁👇',
    timestamp: '4 hrs ago',
    houseTag: 'Kilimanjaro',
    location: 'MFA Innovation & Robotics Lab',
    feeling: '🚀 feeling ecstatic with Stephen Kipsang and 4 others',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoTitle: 'Autonomous Flight & Sensor Mapping Test • MFA Robotics Lab',
    videoPoster: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80',
    reactions: {
      like: 142,
      love: 89,
      care: 16,
      haha: 2,
      wow: 41,
      sad: 0,
      angry: 0
    },
    userReaction: 'like',
    sharesCount: 38,
    comments: [
      {
        id: 'c3',
        author: CURRENT_USER,
        content: 'Late night soldering and debugging the sensor loop was 100% worth it! Can not wait for the international showcase!',
        timestamp: '3 hrs ago',
        likes: 24,
        isLikedByMe: true
      },
      {
        id: 'c4',
        author: ACADEMY_USERS[5], // Faith Chebet
        content: 'VEXPEX leadership council will be sponsoring the team jerseys and banners! You made all of M-PESA Foundation Academy proud! 🇰🇪✨',
        timestamp: '2 hrs ago',
        likes: 31
      }
    ]
  },
  {
    id: 'post_3',
    author: ACADEMY_USERS[2], // David Otieno
    content: '🦁 KENYA HOUSE DERBY VICTORY! 🏉 Final whistle: Kenya 24 - 17 Kilimanjaro in the Inter-house Rugby Sevens semi-final thriller on Pitch 1!\n\nImmense credit to Kilimanjaro for fighting to the last second. See you all in the Finals against Elgon under the floodlights this Saturday!\n\nWho takes the Inter-house Shield this term? Vote below 👇',
    timestamp: '6 hrs ago',
    houseTag: 'Kenya',
    location: 'MFA Sports Complex - Rugby Field 1',
    feeling: '🏆 feeling unstoppable',
    images: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=80'
    ],
    poll: {
      question: 'Who will lift the 2026 Inter-House Championship Trophy?',
      options: [
        { id: 'opt_1', text: '🦁 Kenya Lions (Current points leaders)', votes: 88, votedUserIds: ['user_stephen', 'user_david'] },
        { id: 'opt_2', text: '🏔️ Kilimanjaro Leopards', votes: 64, votedUserIds: ['user_joy'] },
        { id: 'opt_3', text: '🦏 Elgon Rhinos', votes: 45, votedUserIds: ['user_kevin'] },
        { id: 'opt_4', text: '🦅 Longonot Falcons', votes: 52, votedUserIds: ['user_faith'] }
      ],
      totalVotes: 249
    },
    reactions: {
      like: 110,
      love: 45,
      care: 8,
      haha: 14,
      wow: 12,
      sad: 4,
      angry: 1
    },
    userReaction: 'like',
    sharesCount: 19,
    comments: [
      {
        id: 'c5',
        author: ACADEMY_USERS[4], // Kevin Mwangi
        content: 'Elgon is waiting in the finals, Kenya! Our scrum is ready. Do not celebrate too early 😉🦏',
        timestamp: '5 hrs ago',
        likes: 19
      }
    ]
  },
  {
    id: 'post_4',
    author: ACADEMY_USERS[4], // Kevin Mwangi
    content: '🎻 Open rehearsal sneak peek for the Academy Cultural Arts & Symphony Night! We are merging Vivaldi’s Winter with authentic traditional Nyatiti and Marimba percussion rhythms.\n\nCome watch the live stage tomorrow at 6:30 PM at the Performing Arts Amphitheatre. Free admission for all students and staff.',
    timestamp: '8 hrs ago',
    houseTag: 'Elgon',
    location: 'MFA Performing Arts Center',
    images: [
      'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1000&q=80'
    ],
    feeling: '🎵 feeling inspired',
    reactions: {
      like: 76,
      love: 51,
      care: 12,
      haha: 0,
      wow: 8,
      sad: 0,
      angry: 0
    },
    userReaction: null,
    sharesCount: 14,
    comments: []
  },
  {
    id: 'post_5',
    author: ACADEMY_USERS[5], // Faith Chebet (VEXPEX President)
    content: '🏛️ VEXPEX Student Council Bi-Weekly Update:\n1. 🍕 Weekend Dining Hall Feedback: Special Swahili Biryani & Nyama Choma dinner approved for this Sunday evening!\n2. 💡 Library Silent Study Pods are now officially open until 10:30 PM for IB DP2, DP1 & Grade 10 scholars.\n3. 🌿 Environmental Green Initiative: Kenya, Kilimanjaro, Longonot, and Elgon planted 200 indigenous trees along the perimeter fence this morning.\n\nDrop your suggestions below for the upcoming Student-Administration Townhall!',
    timestamp: '12 hrs ago',
    houseTag: 'Longonot',
    location: 'VEXPEX Council Chambers',
    images: [
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1000&q=80'
    ],
    reactions: {
      like: 165,
      love: 94,
      care: 28,
      haha: 3,
      wow: 11,
      sad: 0,
      angry: 0
    },
    userReaction: 'love',
    sharesCount: 42,
    comments: [
      {
        id: 'c6',
        author: CURRENT_USER,
        content: 'Extended study pod hours are a lifesaver for IB Physics revision. Thank you VEXPEX leadership! 👏',
        timestamp: '10 hrs ago',
        likes: 22
      }
    ]
  }
];

export const INITIAL_STORIES: Story[] = [
  {
    id: 'story_current',
    user: CURRENT_USER,
    mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    mediaType: 'image',
    caption: 'Preparing for the IB DP2 Physics HL lab session 🔬🦁',
    timestamp: '15m ago',
    viewed: false
  },
  {
    id: 'story_1',
    user: ACADEMY_USERS[3], // Joy Cherop
    mediaUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
    mediaType: 'image',
    caption: 'Robotics sensor calibration ready! 🤖✨',
    timestamp: '1h ago',
    viewed: false
  },
  {
    id: 'story_2',
    user: ACADEMY_USERS[2], // David Otieno
    mediaUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80',
    mediaType: 'image',
    caption: 'Kenya House morning drills done 🏉💪',
    timestamp: '2h ago',
    viewed: false
  },
  {
    id: 'story_3',
    user: ACADEMY_USERS[4], // Kevin Mwangi
    mediaUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80',
    mediaType: 'image',
    caption: 'Music hall acoustic test in progress 🎻🎶',
    timestamp: '3h ago',
    viewed: false
  },
  {
    id: 'story_4',
    user: ACADEMY_USERS[5], // Faith Chebet
    mediaUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
    mediaType: 'image',
    caption: 'Longonot House Tree Planting initiative 🌱🦅',
    timestamp: '5h ago',
    viewed: true
  }
];

export const INITIAL_REELS: Reel[] = [
  {
    id: 'reel_1',
    author: ACADEMY_USERS[3], // Joy Cherop (Kilimanjaro)
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    caption: 'Autonomous drone flight & optical sensor calibration test at the Thika campus grounds! 4-minute boundary mapping completed with zero lag. 🤖🚁 #Robotics #MFAInnovators #Kilimanjaro #STEM #Python',
    audioTrack: 'Original Audio - Joy Cherop • MFA Robotics Lab Beats',
    houseTag: 'Kilimanjaro',
    likesCount: 342,
    isLikedByMe: true,
    viewsCount: 1420,
    sharesCount: 56,
    tags: ['#Robotics', '#MFAInnovators', '#Kilimanjaro', '#STEM'],
    location: 'Innovation Complex Flight Arena',
    timestamp: '2h ago',
    comments: [
      {
        id: 'rc1',
        author: CURRENT_USER,
        content: 'That stabilization PID algorithm is silky smooth! Let us run the battery endurance test next.',
        timestamp: '1h ago',
        likes: 18,
        isLikedByMe: true
      },
      {
        id: 'rc2',
        author: ACADEMY_USERS[5], // Faith Chebet
        content: 'VEXPEX Council is sponsoring the international championship banners! Proud of you Kilimanjaro! 🏔️✨',
        timestamp: '45m ago',
        likes: 14
      }
    ]
  },
  {
    id: 'reel_2',
    author: ACADEMY_USERS[2], // David Otieno (Kenya House Captain)
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    caption: '🦁 KENYA LIONS LAST-MINUTE DERBY TRY! 🏉 Inter-house Rugby Sevens thriller against Kilimanjaro. See you all in the grand final this Saturday under floodlights! #KenyaHouse #RugbySevens #InterHouse #LionPride',
    audioTrack: 'Stadium Ambience & Kenya House War Chants 🏉',
    houseTag: 'Kenya',
    likesCount: 489,
    isLikedByMe: true,
    viewsCount: 2310,
    sharesCount: 88,
    tags: ['#KenyaHouse', '#RugbySevens', '#InterHouse', '#LionPride'],
    location: 'Main Athletics Arena - Rugby Field 1',
    timestamp: '4h ago',
    comments: [
      {
        id: 'rc3',
        author: ACADEMY_USERS[4], // Kevin Mwangi
        content: 'Elgon House is waiting in the final David! Our scrum pack is ready 🦏💪',
        timestamp: '3h ago',
        likes: 21
      },
      {
        id: 'rc4',
        author: CURRENT_USER,
        content: 'Unreal sprint on the wing! Roar Lions 🦁🔥',
        timestamp: '2h ago',
        likes: 19,
        isLikedByMe: true
      }
    ]
  },
  {
    id: 'reel_3',
    author: ACADEMY_USERS[4], // Kevin Mwangi (Elgon)
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=800&q=80',
    caption: '🎻 Sneak peek into the Academy Cultural Arts & Symphony rehearsal! Blending Vivaldi’s Winter violin melodies with authentic traditional Nyatiti percussion. #Orchestra #Elgon #AfricanFolk #Violin #MFA',
    audioTrack: 'MFA Symphony Orchestra - Vivaldi Winter x Nyatiti Remix',
    houseTag: 'Elgon',
    likesCount: 295,
    isLikedByMe: false,
    viewsCount: 980,
    sharesCount: 41,
    tags: ['#Orchestra', '#Elgon', '#AfricanFolk', '#Violin'],
    location: 'Performing Arts Amphitheatre',
    timestamp: '6h ago',
    comments: [
      {
        id: 'rc5',
        author: ACADEMY_USERS[1], // Ms. Wangari Mutua
        content: 'Magnificent musical craftsmanship Kevin! The phrasing on the violin is deeply evocative.',
        timestamp: '5h ago',
        likes: 16
      }
    ]
  },
  {
    id: 'reel_4',
    author: CURRENT_USER, // Stephen Kipsang (Kenya)
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    caption: '🔬 Emission flame spectroscopy practical in Chemistry Lab 3! Strontium Crimson vs Copper Emerald flames for our IB DP2 Science Internal Assessment. 🧪🔥 #IBDP #Chemistry #ScienceCongress #IBDP2',
    audioTrack: 'Lo-Fi Study Beats • MFA Chemistry Lab Session',
    houseTag: 'Kenya',
    likesCount: 210,
    isLikedByMe: false,
    viewsCount: 840,
    sharesCount: 29,
    tags: ['#IBDP', '#Chemistry', '#ScienceCongress', '#IBDP2'],
    location: 'Science Complex Chemistry Lab 3',
    timestamp: '9h ago',
    comments: [
      {
        id: 'rc6',
        author: ACADEMY_USERS[6], // Mr. Peter Kamau
        content: 'Excellent observation of quantum electron excitation levels Stephen! Remember to record spectral wavelengths in nm.',
        timestamp: '8h ago',
        likes: 24
      }
    ]
  },
  {
    id: 'reel_5',
    author: ACADEMY_USERS[5], // Faith Chebet (Longonot)
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    caption: '🌱 200 indigenous tree saplings planted around the perimeter fence before morning assembly! Longonot leading the green sustainability charge at MFA. 🦅🌿 #Longonot #GreenCampus #Sustainability #VEXPEX',
    audioTrack: 'Morning Birds & Campus Anthem • MFA Green',
    houseTag: 'Longonot',
    likesCount: 378,
    isLikedByMe: true,
    viewsCount: 1650,
    sharesCount: 64,
    tags: ['#Longonot', '#GreenCampus', '#Sustainability', '#VEXPEX'],
    location: 'Academy Perimeter Green Zone',
    timestamp: '14h ago',
    comments: [
      {
        id: 'rc7',
        author: CURRENT_USER,
        content: 'Proud to see all four houses participating in the conservation drive! 🌳✨',
        timestamp: '12h ago',
        likes: 17
      }
    ]
  }
];

export const INITIAL_MARKETPLACE: MarketplaceItem[] = [
  {
    id: 'item_1',
    title: 'Casio fx-9860GIII Graphing Calculator (IB DP Approved)',
    price: 3500,
    isFreeOrBorrow: false,
    category: 'Calculators & Tech',
    description: 'Barely used graphing calculator in perfect working condition with Python programming support. Ideal for IB DP2 & DP1 Mathematics Analysis & Approaches HL/SL. Comes with original protective slide case.',
    condition: 'Like New',
    seller: ACADEMY_USERS[3], // Joy Cherop
    images: [
      'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80'
    ],
    location: 'Kilimanjaro Dormitory Room 08',
    timestamp: '1 day ago'
  },
  {
    id: 'item_2',
    title: 'IB Higher Level Chemistry (Oxford 2024 Course Companion)',
    price: 1800,
    isFreeOrBorrow: false,
    category: 'Textbooks',
    description: 'Clean textbook, no highlighter marks. Covers organic synthesis, thermodynamics, and spectroscopic analysis. Essential for IB DP1 & DP2 students.',
    condition: 'Good',
    seller: CURRENT_USER,
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
    ],
    location: 'Kenya Dorms Block B',
    timestamp: '2 days ago'
  },
  {
    id: 'item_3',
    title: 'Official MFA Rugby Boots / Studs (Size UK 9 / EU 43)',
    price: 2200,
    isFreeOrBorrow: false,
    category: 'Sports & PE Gear',
    description: 'Nike Tiempo mold studs, high ankle support, only used during inter-house tournament. Cleats in great shape for wet pitch games.',
    condition: 'Like New',
    seller: ACADEMY_USERS[2], // David Otieno
    images: [
      'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80'
    ],
    location: 'Sports Pavilion Locker 14',
    timestamp: '3 days ago'
  },
  {
    id: 'item_4',
    title: 'Laboratory White Coat + Anti-Splash Goggles (Size Medium)',
    price: 0,
    isFreeOrBorrow: true,
    category: 'Lab Coats & Safety',
    description: 'Free to borrow or take for IB DP1 or Grade 10 science practicals. 100% pure cotton lab coat with academy crest embroidered on pocket.',
    condition: 'Good',
    seller: ACADEMY_USERS[4], // Kevin Mwangi
    images: [
      'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80'
    ],
    location: 'Elgon Dorm Room 21',
    timestamp: '4 days ago'
  },
  {
    id: 'item_5',
    title: 'Acoustic Violin Shoulder Rest & Kun Chinrest Cushion',
    price: 950,
    isFreeOrBorrow: false,
    category: 'Art & Music',
    description: 'Adjustable shoulder rest for full size 4/4 violin. Great ergonomic support for long rehearsals with the MFA Orchestra.',
    condition: 'Like New',
    seller: ACADEMY_USERS[4], // Kevin Mwangi
    images: [
      'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?auto=format&fit=crop&w=800&q=80'
    ],
    location: 'Music Academy Studio 2',
    timestamp: '5 days ago'
  }
];

export const INITIAL_EVENTS: CampusEvent[] = [
  {
    id: 'event_1',
    title: '2026 Inter-House Championship Finals Gala',
    description: 'The pinnacle of Academy sports & culture! Witness Kenya, Kilimanjaro, Longonot, and Elgon clash in Rugby Sevens, Track 4x100m, Swimming relays, and the Great House Debate.',
    coverImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=80',
    date: 'Saturday, August 30, 2026',
    time: '8:30 AM - 5:00 PM',
    venue: 'Main Athletics Stadium & Swimming Pavilion, Thika',
    organizer: ACADEMY_USERS[2], // David Otieno
    category: 'Sports & Interhouse',
    attendeesCount: 420,
    isUserRsvp: 'going'
  },
  {
    id: 'event_2',
    title: 'VEXPEX All-Academy Student & Faculty Townhall',
    description: 'Open floor discussion on term projects, dining upgrades, weekend recreational activities, and library innovation pods with the Academy Executive Team.',
    coverImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80',
    date: 'Wednesday, September 3, 2026',
    time: '4:30 PM - 6:00 PM',
    venue: 'Uongozi Centre Main Auditorium',
    organizer: ACADEMY_USERS[5], // Faith Chebet
    category: 'Leadership (VEXPEX)',
    attendeesCount: 280,
    isUserRsvp: 'interested'
  },
  {
    id: 'event_3',
    title: 'National Science & Robotics Hackathon Showcase',
    description: 'Live demonstrations of embedded AI hardware, solar drones, water conservation sensors, and assistive technologies developed by MFA Innovators.',
    coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80',
    date: 'Friday, September 12, 2026',
    time: '2:00 PM - 6:30 PM',
    venue: 'STEM & Robotics Innovation Complex',
    organizer: ACADEMY_USERS[3], // Joy Cherop
    category: 'Clubs & Hackathons',
    attendeesCount: 195,
    isUserRsvp: 'going'
  },
  {
    id: 'event_4',
    title: 'Pan-African Cultural & Performing Arts Evening',
    description: 'A celebration of African heritage through poetry, orchestral fusion, drama, traditional instruments, and contemporary dance choreography.',
    coverImage: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=1000&q=80',
    date: 'Saturday, September 20, 2026',
    time: '6:00 PM - 9:30 PM',
    venue: 'Outdoor Amphitheatre',
    organizer: ACADEMY_USERS[4], // Kevin Mwangi
    category: 'Arts & Culture',
    attendeesCount: 350,
    isUserRsvp: null
  }
];

export const INITIAL_CHATS: ChatThread[] = [
  {
    id: 'chat_joy',
    user: ACADEMY_USERS[3],
    lastMessage: 'Let us check the PID motor calibration values in Lab 2 tomorrow at lunch break.',
    lastTimestamp: '10m ago',
    unreadCount: 1,
    isOnline: true
  },
  {
    id: 'chat_david',
    user: ACADEMY_USERS[2],
    lastMessage: 'Great job supporting the scrum line today Stephen! Kenya pride 🦁',
    lastTimestamp: '1h ago',
    unreadCount: 0,
    isOnline: true
  },
  {
    id: 'chat_faith',
    user: ACADEMY_USERS[5],
    lastMessage: 'Could you review the tech resolution draft for Friday’s council meeting?',
    lastTimestamp: '3h ago',
    unreadCount: 0,
    isOnline: false
  },
  {
    id: 'chat_wangari',
    user: ACADEMY_USERS[1],
    lastMessage: 'Your physics extended essay bibliography looks very rigorous. Keep up the high standards!',
    lastTimestamp: 'Yesterday',
    unreadCount: 0,
    isOnline: false
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    actor: ACADEMY_USERS[3], // Joy Cherop
    type: 'mention',
    content: 'tagged you in the Robotics Championship qualification post: "Huge shoutout to Stephen Kipsang..."',
    targetId: 'post_2',
    timestamp: '4 hours ago',
    read: false,
    linkTab: 'feed'
  },
  {
    id: 'notif_2',
    actor: ACADEMY_USERS[2], // David Otieno
    type: 'like',
    content: 'liked your comment on the Extended Essay announcement.',
    targetId: 'post_1',
    timestamp: '1 hour ago',
    read: false,
    linkTab: 'feed'
  },
  {
    id: 'notif_3',
    actor: ACADEMY_USERS[5], // Faith Chebet
    type: 'vexpex_poll',
    content: 'created a new VEXPEX poll: "Weekend Dining Hall & Extended Study Hours Approval".',
    targetId: 'post_5',
    timestamp: '12 hours ago',
    read: true,
    linkTab: 'feed'
  },
  {
    id: 'notif_4',
    actor: ACADEMY_USERS[1], // Ms. Wangari Mutua
    type: 'house_event',
    content: 'pinned an official academy announcement regarding Oral IB Presentations.',
    targetId: 'post_1',
    timestamp: '2 hours ago',
    read: true,
    linkTab: 'feed'
  }
];
