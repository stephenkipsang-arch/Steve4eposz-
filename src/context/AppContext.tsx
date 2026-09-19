import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Post,
  Story,
  Reel,
  ReelComment,
  MarketplaceItem,
  CampusEvent,
  ChatThread,
  NotificationItem,
  ReactionType,
  User,
  Comment,
  Message,
  House
} from '../types';
import { CURRENT_USER, ACADEMY_USERS } from '../data/mockData';
import { useAuth } from './AuthContext';
import { getStoredItem, setStoredItem } from '../utils/safeStorage';
import { apiFetch, apiUrl } from '../utils/api';

export type ActiveTab = 'feed' | 'reels' | 'arena-ai' | 'lost-found' | 'marketplace' | 'events' | 'profile' | 'saved' | 'directory';

interface OpenChatWindow {
  threadId: string;
  user: User;
  minimized?: boolean;
}

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedProfileUser: User;
  viewUserProfile: (user: User) => void;
  
  // Posts
  posts: Post[];
  addPost: (
    content: string,
    images?: string[],
    houseTag?: House | 'All Academy',
    feeling?: string,
    location?: string,
    pollData?: { question: string; options: string[] },
    videoUrl?: string,
    videoTitle?: string
  ) => void;
  reactToPost: (postId: string, reaction: ReactionType) => void;
  addComment: (postId: string, content: string, imageUrl?: string) => void;
  likeComment: (postId: string, commentId: string) => void;
  votePoll: (postId: string, optionId: string) => void;
  deletePost: (postId: string) => void;
  savedPostIds: string[];
  toggleSavePost: (postId: string) => void;

  // Stories
  stories: Story[];
  addStory: (mediaUrl: string, caption?: string, backgroundColor?: string) => void;
  activeStoryIndex: number | null;
  openStoryViewer: (index: number) => void;
  closeStoryViewer: () => void;

  // Reels & Shorts
  reels: Reel[];
  activeReelIndex: number;
  setActiveReelIndex: (index: number) => void;
  addReel: (
    videoUrl: string,
    caption: string,
    audioTrack?: string,
    houseTag?: House | 'All Academy',
    location?: string,
    tags?: string[],
    posterUrl?: string
  ) => void;
  likeReel: (reelId: string) => void;
  addReelComment: (reelId: string, content: string) => void;
  likeReelComment: (reelId: string, commentId: string) => void;
  isCreateReelOpen: boolean;
  setIsCreateReelOpen: (open: boolean) => void;
  reelsHouseFilter: House | 'All';
  setReelsHouseFilter: (filter: House | 'All') => void;

  // Marketplace
  marketplaceItems: MarketplaceItem[];
  addMarketplaceItem: (item: Omit<MarketplaceItem, 'id' | 'seller' | 'timestamp'>) => void;
  marketplaceFilterCategory: string;
  setMarketplaceFilterCategory: (cat: string) => void;

  // Events
  events: CampusEvent[];
  addCampusEvent: (event: Omit<CampusEvent, 'id' | 'organizer' | 'attendeesCount' | 'isUserRsvp'>) => void;
  toggleEventRsvp: (eventId: string, status: 'going' | 'interested') => void;

  // Messenger
  chatThreads: ChatThread[];
  openChatWindows: OpenChatWindow[];
  openChatWithUser: (user: User) => void;
  closeChatWindow: (threadId: string) => void;
  toggleMinimizeChatWindow: (threadId: string) => void;
  messages: Record<string, Message[]>;
  sendMessage: (receiverId: string, text: string, imageUrl?: string) => void;

  // Notifications
  notifications: NotificationItem[];
  unreadNotifCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Modals & Search
  isCreatePostOpen: boolean;
  setIsCreatePostOpen: (open: boolean) => void;
  isCreateStoryOpen: boolean;
  setIsCreateStoryOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  feedFilter: 'all' | 'my_house' | 'academic' | 'leadership' | 'announcements';
  setFeedFilter: (f: 'all' | 'my_house' | 'academic' | 'leadership' | 'announcements') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const normalizeGrade10User = (candidate: User): User => ({
  ...candidate,
  role: 'Student - Grade 10',
  gradeOrDept: 'Grade 10',
  graduationYear: '2028',
  bio: candidate.bio && candidate.bio.includes('IB') ? 'Grade 10 learner | M-PESA Foundation Academy' : candidate.bio,
  house: 'Kenya'
});

const resolveStoredUser = (candidate: unknown): User => {
  if (candidate && typeof candidate === 'object') {
    const value = candidate as Partial<User>;
    const knownUser = typeof value.id === 'string'
      ? ACADEMY_USERS.find((user) => user.id === value.id)
      : undefined;

    if (knownUser && (!value.avatar || typeof value.avatar !== 'string')) {
      return normalizeGrade10User(knownUser);
    }

    if (
      typeof value.id === 'string' &&
      typeof value.name === 'string' &&
      typeof value.avatar === 'string' &&
      typeof value.house === 'string'
    ) {
      return normalizeGrade10User(value as User);
    }

    if (knownUser) return normalizeGrade10User(knownUser);
  }

  return normalizeGrade10User(CURRENT_USER);
};

const normalizeStoredPosts = (value: unknown): Post[] => {
  if (!Array.isArray(value)) return [];

  return value.map((post) => {
    if (!post || typeof post !== 'object') return null;

    const item = post as Post;
    return {
      ...item,
      author: resolveStoredUser(item.author),
      comments: Array.isArray(item.comments)
        ? item.comments.map((comment) => ({
            ...comment,
            author: resolveStoredUser(comment?.author)
          }))
        : []
    };
  }).filter((post): post is Post => post !== null);
};

const normalizeStoredReels = (value: unknown): Reel[] => {
  if (!Array.isArray(value)) return [];

  return value.map((reel) => {
    if (!reel || typeof reel !== 'object') return null;

    const item = reel as Reel;
    const rawVideoUrl = typeof item.videoUrl === 'string' ? item.videoUrl.trim() : '';

    // Object URLs are tied to the old browser session and cannot be replayed after reload.
    if (!rawVideoUrl || rawVideoUrl.startsWith('blob:')) return null;

    const videoUrl = rawVideoUrl.startsWith('/')
      ? apiUrl(rawVideoUrl)
      : rawVideoUrl;

    return {
      ...item,
      videoUrl,
      author: resolveStoredUser(item.author),
      comments: Array.isArray(item.comments)
        ? item.comments.map((comment) => ({
            ...comment,
            author: resolveStoredUser(comment?.author)
          }))
        : []
    };
  }).filter((reel): reel is Reel => reel !== null);
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');
  const [selectedProfileUser, setSelectedProfileUser] = useState<User>(currentUser);
  const [feedFilter, setFeedFilter] = useState<'all' | 'my_house' | 'academic' | 'leadership' | 'announcements'>('all');

  // Posts State
  const [posts, setPosts] = useState<Post[]>(() => {
    const storedPosts = getStoredItem<unknown>('mfa_vexpex_posts_v5', []);
    return normalizeStoredPosts(storedPosts);
  });

  const [savedPostIds, setSavedPostIds] = useState<string[]>(() => {
    return getStoredItem<string[]>('mfa_vexpex_saved_posts_v4', []);
  });

  // Stories State
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

  // Reels & Shorts State
  const [reels, setReels] = useState<Reel[]>(() => {
    const storedReels = getStoredItem<unknown>('mfa_vexpex_reels_v7', []);
    return normalizeStoredReels(storedReels);
  });
  const [activeReelIndex, setActiveReelIndex] = useState<number>(0);
  const [isCreateReelOpen, setIsCreateReelOpen] = useState<boolean>(false);
  const [reelsHouseFilter, setReelsHouseFilter] = useState<House | 'All'>('All');

  // Marketplace State
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>(() => {
    return getStoredItem<MarketplaceItem[]>('mfa_vexpex_market_v4', []);
  });
  const [marketplaceFilterCategory, setMarketplaceFilterCategory] = useState<string>('All');

  // Events State
  const [events, setEvents] = useState<CampusEvent[]>([]);

  // Messenger State
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(() => {
    return getStoredItem<ChatThread[]>('mfa_vexpex_chat_threads_v1', []);
  });
  const [openChatWindows, setOpenChatWindows] = useState<OpenChatWindow[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    return getStoredItem<Record<string, Message[]>>('mfa_vexpex_messages_v1', {});
  });

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals & UI
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(!isAuthenticated);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated) setIsAuthModalOpen(true);
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedProfileUser.id === currentUser.id) setSelectedProfileUser(currentUser);
  }, [currentUser, selectedProfileUser.id]);

  // Persist state safely
  useEffect(() => {
    setStoredItem('mfa_vexpex_posts_v5', posts);
  }, [posts]);

  // Sync the feed with the shared server so different devices see the same posts.
  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    const syncSharedPosts = async () => {
      try {
        const response = await apiFetch('/api/posts');
        if (!response.ok) return;

        const data = await response.json();
        const serverPosts = normalizeStoredPosts(data?.posts);

        // Upload any posts that only exist locally, then use the shared feed.
        const serverIds = new Set(serverPosts.map((post) => post.id));
        const localOnlyPosts = posts.filter((post) => !serverIds.has(post.id));

        for (const post of localOnlyPosts) {
          await apiFetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...post,
              createdAt: new Date().toISOString()
            })
          });
        }

        if (cancelled) return;

        if (localOnlyPosts.length > 0) {
          const merged = normalizeStoredPosts([...serverPosts, ...localOnlyPosts]);
          setPosts(merged);
        } else if (serverPosts.length > 0 || posts.length === 0) {
          setPosts(serverPosts);
        }
      } catch (error) {
        console.warn('Shared feed sync unavailable:', error);
      }
    };

    void syncSharedPosts();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, currentUser.id]);

  useEffect(() => {
    setStoredItem('mfa_vexpex_saved_posts_v4', savedPostIds);
  }, [savedPostIds]);

  useEffect(() => {
    setStoredItem('mfa_vexpex_market_v4', marketplaceItems);
  }, [marketplaceItems]);

  useEffect(() => {
    setStoredItem('mfa_vexpex_reels_v7', reels);
  }, [reels]);

  // Persist Messenger conversations so messages survive page refreshes.
  useEffect(() => {
    setStoredItem('mfa_vexpex_messages_v1', messages);
  }, [messages]);

  useEffect(() => {
    setStoredItem('mfa_vexpex_chat_threads_v1', chatThreads);
  }, [chatThreads]);

  const viewUserProfile = (user: User) => {
    setSelectedProfileUser(user);
    setActiveTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addPost = (
    content: string,
    images?: string[],
    houseTag: House | 'All Academy' = 'All Academy',
    feeling?: string,
    location?: string,
    pollData?: { question: string; options: string[] },
    videoUrl?: string,
    videoTitle?: string
  ) => {
    const newPost: Post = {
      id: `post_${Date.now()}`,
      author: currentUser,
      content,
      timestamp: 'Just now',
      images: images && images.length > 0 ? images : undefined,
      videoUrl: videoUrl && videoUrl.trim().length > 0 ? videoUrl.trim() : undefined,
      videoTitle: videoTitle && videoTitle.trim().length > 0 ? videoTitle.trim() : undefined,
      houseTag,
      feeling,
      location,
      poll: pollData
        ? {
            question: pollData.question,
            options: pollData.options.map((opt, idx) => ({
              id: `opt_${idx}_${Date.now()}`,
              text: opt,
              votes: 0,
              votedUserIds: []
            })),
            totalVotes: 0
          }
        : undefined,
      reactions: {
        like: 1,
        love: 0,
        care: 0,
        haha: 0,
        wow: 0,
        sad: 0,
        angry: 0
      },
      userReaction: 'like',
      comments: [],
      sharesCount: 0
    };

    setPosts((prev) => [newPost, ...prev]);

    void apiFetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newPost, createdAt: new Date().toISOString() })
    }).catch((error) => {
      console.warn('Could not sync new post to shared feed:', error);
    });
  };

  const reactToPost = (postId: string, reaction: ReactionType) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const currentReaction = post.userReaction;
        const updatedReactions = { ...post.reactions };

        if (currentReaction === reaction) {
          // Toggle off
          updatedReactions[reaction] = Math.max(0, updatedReactions[reaction] - 1);
          return {
            ...post,
            reactions: updatedReactions,
            userReaction: null
          };
        }

        // Decrement old
        if (currentReaction) {
          updatedReactions[currentReaction] = Math.max(0, updatedReactions[currentReaction] - 1);
        }
        // Increment new
        updatedReactions[reaction] = (updatedReactions[reaction] || 0) + 1;

        return {
          ...post,
          reactions: updatedReactions,
          userReaction: reaction
        };
      })
    );
  };

  const addComment = (postId: string, content: string, imageUrl?: string) => {
    if (!content.trim() && !imageUrl) return;
    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      author: currentUser,
      content,
      timestamp: 'Just now',
      likes: 0,
      imageUrl
    };

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, newComment]
          };
        }
        return post;
      })
    );
  };

  const likeComment = (postId: string, commentId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          comments: post.comments.map((c) => {
            if (c.id === commentId) {
              const isLiked = c.isLikedByMe;
              return {
                ...c,
                isLikedByMe: !isLiked,
                likes: isLiked ? Math.max(0, c.likes - 1) : c.likes + 1
              };
            }
            return c;
          })
        };
      })
    );
  };

  const votePoll = (postId: string, optionId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId || !post.poll) return post;
        const currentPoll = post.poll;
        const alreadyVotedOption = currentPoll.options.find((opt) =>
          opt.votedUserIds.includes(currentUser.id)
        );

        let newTotal = currentPoll.totalVotes;
        const newOptions = currentPoll.options.map((opt) => {
          if (opt.id === optionId) {
            if (opt.votedUserIds.includes(currentUser.id)) {
              // unvote
              newTotal = Math.max(0, newTotal - 1);
              return {
                ...opt,
                votes: Math.max(0, opt.votes - 1),
                votedUserIds: opt.votedUserIds.filter((id) => id !== currentUser.id)
              };
            }
            // new vote
            if (!alreadyVotedOption) {
              newTotal += 1;
            }
            return {
              ...opt,
              votes: opt.votes + 1,
              votedUserIds: [...opt.votedUserIds, currentUser.id]
            };
          } else if (alreadyVotedOption && opt.id === alreadyVotedOption.id) {
            // remove previous vote
            return {
              ...opt,
              votes: Math.max(0, opt.votes - 1),
              votedUserIds: opt.votedUserIds.filter((id) => id !== currentUser.id)
            };
          }
          return opt;
        });

        return {
          ...post,
          poll: {
            ...currentPoll,
            options: newOptions,
            totalVotes: newTotal
          }
        };
      })
    );
  };

  const deletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const toggleSavePost = (postId: string) => {
    setSavedPostIds((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  // Story handlers
  const addStory = (mediaUrl: string, caption?: string, backgroundColor?: string) => {
    const newStory: Story = {
      id: `story_${Date.now()}`,
      user: currentUser,
      mediaUrl,
      mediaType: 'image',
      caption,
      backgroundColor,
      timestamp: 'Just now',
      viewed: false
    };
    setStories((prev) => [newStory, ...prev]);
  };

  const openStoryViewer = (index: number) => {
    setActiveStoryIndex(index);
  };

  const closeStoryViewer = () => {
    setActiveStoryIndex(null);
  };

  // Marketplace Handlers
  const addMarketplaceItem = (
    itemData: Omit<MarketplaceItem, 'id' | 'seller' | 'timestamp'>
  ) => {
    const newItem: MarketplaceItem = {
      ...itemData,
      id: `market_${Date.now()}`,
      seller: currentUser,
      timestamp: 'Just now'
    };
    setMarketplaceItems((prev) => [newItem, ...prev]);
  };

  // Events Handlers
  const addCampusEvent = (
    eventData: Omit<CampusEvent, 'id' | 'organizer' | 'attendeesCount' | 'isUserRsvp'>
  ) => {
    const newEv: CampusEvent = {
      ...eventData,
      id: `event_${Date.now()}`,
      organizer: currentUser,
      attendeesCount: 1,
      isUserRsvp: 'going'
    };
    setEvents((prev) => [newEv, ...prev]);
  };

  const toggleEventRsvp = (eventId: string, status: 'going' | 'interested') => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        const currentRsvp = ev.isUserRsvp;
        if (currentRsvp === status) {
          return {
            ...ev,
            isUserRsvp: null,
            attendeesCount: Math.max(0, ev.attendeesCount - 1)
          };
        }
        return {
          ...ev,
          isUserRsvp: status,
          attendeesCount: currentRsvp ? ev.attendeesCount : ev.attendeesCount + 1
        };
      })
    );
  };

  // Reels & Shorts Handlers
  const addReel = (
    videoUrl: string,
    caption: string,
    audioTrack: string = 'Original Audio • MFA Campus',
    houseTag: House | 'All Academy' = 'All Academy',
    location?: string,
    tags: string[] = ['#MFA', '#VEXPEX'],
    posterUrl?: string
  ) => {
    const newReel: Reel = {
      id: `reel_${Date.now()}`,
      author: currentUser,
      videoUrl,
      posterUrl,
      caption,
      audioTrack,
      houseTag,
      location,
      tags,
      likesCount: 1,
      isLikedByMe: true,
      viewsCount: 1,
      sharesCount: 0,
      timestamp: 'Just now',
      comments: []
    };
    setReels((prev) => [newReel, ...prev]);
    setActiveReelIndex(0);
  };

  const likeReel = (reelId: string) => {
    setReels((prev) =>
      prev.map((r) => {
        if (r.id !== reelId) return r;
        const wasLiked = !!r.isLikedByMe;
        return {
          ...r,
          isLikedByMe: !wasLiked,
          likesCount: wasLiked ? Math.max(0, r.likesCount - 1) : r.likesCount + 1
        };
      })
    );
  };

  const addReelComment = (reelId: string, content: string) => {
    if (!content.trim()) return;
    const newComment: ReelComment = {
      id: `rc_${Date.now()}`,
      author: currentUser,
      content: content.trim(),
      timestamp: 'Just now',
      likes: 0,
      isLikedByMe: false
    };

    setReels((prev) =>
      prev.map((r) => {
        if (r.id !== reelId) return r;
        return {
          ...r,
          comments: [...r.comments, newComment]
        };
      })
    );
  };

  const likeReelComment = (reelId: string, commentId: string) => {
    setReels((prev) =>
      prev.map((r) => {
        if (r.id !== reelId) return r;
        return {
          ...r,
          comments: r.comments.map((c) => {
            if (c.id !== commentId) return c;
            const wasLiked = !!c.isLikedByMe;
            return {
              ...c,
              isLikedByMe: !wasLiked,
              likes: wasLiked ? Math.max(0, c.likes - 1) : c.likes + 1
            };
          })
        };
      })
    );
  };

  // Messenger Handlers
  const openChatWithUser = (user: User) => {
    const threadId = `chat_${user.id.replace('user_', '')}`;
    setOpenChatWindows((prev) => {
      const exists = prev.find((c) => c.threadId === threadId);
      if (exists) {
        return prev.map((c) => (c.threadId === threadId ? { ...c, minimized: false } : c));
      }
      if (prev.length >= 3) {
        // keep max 3 chat windows open
        return [...prev.slice(1), { threadId, user, minimized: false }];
      }
      return [...prev, { threadId, user, minimized: false }];
    });
  };

  const closeChatWindow = (threadId: string) => {
    setOpenChatWindows((prev) => prev.filter((c) => c.threadId !== threadId));
  };

  const toggleMinimizeChatWindow = (threadId: string) => {
    setOpenChatWindows((prev) =>
      prev.map((c) => (c.threadId === threadId ? { ...c, minimized: !c.minimized } : c))
    );
  };

  const sendMessage = (receiverId: string, text: string, imageUrl?: string) => {
    if (!text.trim() && !imageUrl) return;
    const threadId = `chat_${receiverId.replace('user_', '')}`;
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      text,
      imageUrl,
      timestamp: 'Just now',
      read: true
    };

    setMessages((prev) => ({
      ...prev,
      [threadId]: [...(prev[threadId] || []), newMsg]
    }));

    // Update threads preview
    setChatThreads((prev) =>
      prev.map((th) => {
        if (th.user.id === receiverId) {
          return {
            ...th,
            lastMessage: text,
            lastTimestamp: 'Just now'
          };
        }
        return th;
      })
    );
  };

  // Notifications Handlers
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedProfileUser,
        viewUserProfile,
        posts,
        addPost,
        reactToPost,
        addComment,
        likeComment,
        votePoll,
        deletePost,
        savedPostIds,
        toggleSavePost,
        stories,
        addStory,
        activeStoryIndex,
        openStoryViewer,
        closeStoryViewer,
        reels,
        activeReelIndex,
        setActiveReelIndex,
        addReel,
        likeReel,
        addReelComment,
        likeReelComment,
        isCreateReelOpen,
        setIsCreateReelOpen,
        reelsHouseFilter,
        setReelsHouseFilter,
        marketplaceItems,
        addMarketplaceItem,
        marketplaceFilterCategory,
        setMarketplaceFilterCategory,
        events,
        addCampusEvent,
        toggleEventRsvp,
        chatThreads,
        openChatWindows,
        openChatWithUser,
        closeChatWindow,
        toggleMinimizeChatWindow,
        messages,
        sendMessage,
        notifications,
        unreadNotifCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        isCreatePostOpen,
        setIsCreatePostOpen,
        isCreateStoryOpen,
        setIsCreateStoryOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        searchQuery,
        setSearchQuery,
        feedFilter,
        setFeedFilter
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
