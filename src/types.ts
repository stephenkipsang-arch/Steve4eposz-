export type House = 'Kenya' | 'Kilimanjaro' | 'Longonot' | 'Elgon' | 'Staff / Administration';

export type UserRole = 'Student - IB DP2' | 'Student - IB DP1' | 'Student - Grade 10' | 'VEXPEX Council President' | 'VEXPEX House Captain' | 'Faculty / Teacher' | 'House Master / Mistress' | 'Academy Alumni' | 'Dean of Academics';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  coverImage: string;
  role: UserRole;
  house: House;
  graduationYear?: string;
  gradeOrDept: string;
  bio: string;
  location: string;
  isVerifiedAcademy: boolean;
  friendsCount: number;
  joinedDate: string;
  clubs: string[];
}

export type ReactionType = 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry';

export interface ReactionCount {
  like: number;
  love: number;
  care: number;
  haha: number;
  wow: number;
  sad: number;
  angry: number;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  timestamp: string;
  likes: number;
  isLikedByMe?: boolean;
  imageUrl?: string;
  replies?: Comment[];
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  votedUserIds: string[];
}

export interface Post {
  id: string;
  author: User;
  content: string;
  timestamp: string;
  images?: string[];
  videoUrl?: string;
  videoTitle?: string;
  videoPoster?: string;
  houseTag?: House | 'All Academy';
  location?: string;
  feeling?: string;
  poll?: {
    question: string;
    options: PollOption[];
    totalVotes: number;
  };
  reactions: ReactionCount;
  userReaction?: ReactionType | null;
  comments: Comment[];
  sharesCount: number;
  isPinned?: boolean;
  isOfficialAnnouncement?: boolean;
}

export interface Story {
  id: string;
  user: User;
  mediaUrl: string;
  mediaType: 'image' | 'text';
  backgroundColor?: string;
  caption?: string;
  timestamp: string;
  viewed?: boolean;
}

export interface ReelComment {
  id: string;
  author: User;
  content: string;
  timestamp: string;
  likes: number;
  isLikedByMe?: boolean;
}

export interface Reel {
  id: string;
  author: User;
  videoUrl: string;
  posterUrl?: string;
  caption: string;
  audioTrack: string;
  houseTag: House | 'All Academy';
  likesCount: number;
  isLikedByMe?: boolean;
  comments: ReelComment[];
  sharesCount: number;
  tags: string[];
  location?: string;
  viewsCount: number;
  timestamp: string;
}

export interface HouseStats {
  name: House;
  points: number;
  mascot: string;
  color: string;
  motto: string;
  captain: string;
  dormMaster: string;
  leadingCategory: string;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  price: number; // in KSh (0 for free/borrow)
  isFreeOrBorrow: boolean;
  category: 'Textbooks' | 'Calculators & Tech' | 'Lab Coats & Safety' | 'Sports & PE Gear' | 'Dorm Essentials' | 'Uniform & Blazers' | 'Art & Music' | 'Other';
  description: string;
  condition: 'Brand New' | 'Like New' | 'Good' | 'Fair';
  seller: User;
  images: string[];
  location: string; // e.g. "Mara Dorm Room 12", "Uongozi Hub", "Science Complex"
  timestamp: string;
  isSold?: boolean;
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  date: string;
  time: string;
  venue: string; // e.g. "Uongozi Centre Auditorium", "Sports Arena Track", "Amphitheatre"
  organizer: User;
  category: 'Sports & Interhouse' | 'Academic & IB' | 'Arts & Culture' | 'Leadership (VEXPEX)' | 'Clubs & Hackathons' | 'Assembly';
  attendeesCount: number;
  isUserRsvp?: 'going' | 'interested' | null;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  imageUrl?: string;
  read: boolean;
}

export interface ChatThread {
  id: string;
  user: User;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  isOnline: boolean;
}

export interface LostFoundItem {
  id: string;
  kind: 'lost' | 'found';
  item: string;
  details: string;
  location: string;
  reporterId: string;
  reporterName: string;
  reporterAvatar: string;
  timestamp: string;
  resolved?: boolean;
}

export interface NotificationItem {
  id: string;
  actor: User;
  type: 'like' | 'comment' | 'reaction' | 'mention' | 'house_event' | 'marketplace_inquiry' | 'vexpex_poll';
  content: string;
  targetId?: string;
  timestamp: string;
  read: boolean;
  linkTab?: 'feed' | 'groups' | 'marketplace' | 'events' | 'profile';
}
