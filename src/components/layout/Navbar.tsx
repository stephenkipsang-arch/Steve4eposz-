import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Home,
  Users,
  Store,
  Calendar,
  Plus,
  MessageCircle,
  Bell,
  CheckCircle2,
  ShieldCheck,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  Bookmark,
  Share2,
  Trophy,
  School,
  Film,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp, ActiveTab } from '../../context/AppContext';
import { ACADEMY_USERS } from '../../data/mockData';

export const Navbar: React.FC = () => {
  const { currentUser, switchUser } = useAuth();
  const {
    activeTab,
    setActiveTab,
    viewUserProfile,
    setIsCreatePostOpen,
    setIsCreateStoryOpen,
    setIsCreateReelOpen,
    setIsAuthModalOpen,
    chatThreads,
    openChatWithUser,
    notifications,
    unreadNotifCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    searchQuery,
    setSearchQuery,
    posts,
    marketplaceItems
  } = useApp();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMessengerMenuOpen, setIsMessengerMenuOpen] = useState(false);
  const [isNotificationsMenuOpen, setIsNotificationsMenuOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);

  const accountMenuRef = useRef<HTMLDivElement>(null);
  const messengerMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
      if (messengerMenuRef.current && !messengerMenuRef.current.contains(event.target as Node)) {
        setIsMessengerMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setIsNotificationsMenuOpen(false);
      }
      if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
        setIsCreateMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter search results
  const matchingUsers = ACADEMY_USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.house.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const matchingPosts = posts.filter((p) =>
    p.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const matchingMarket = marketplaceItems.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#CED0D4] shadow-xs px-2 sm:px-4 h-14 flex items-center justify-between select-none">
      {/* Left Section: Logo & Search */}
      <div className="flex items-center gap-2 relative" ref={searchRef}>
        {/* Facebook Style MFA Logo */}
        <button
          id="nav-logo-btn"
          onClick={() => {
            setActiveTab('feed');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 group cursor-pointer focus:outline-hidden"
          title="MFA-VEXPEX Home"
        >
          <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white font-extrabold flex items-center justify-center text-sm sm:text-base tracking-tighter shadow-xs group-hover:scale-105 transition-transform">
            VP
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="font-extrabold text-[#1877F2] text-lg leading-tight tracking-tight flex items-center gap-1">
              MFA-VEXPEX
              <ShieldCheck className="w-4 h-4 text-[#00A884]" />
            </span>
            <span className="text-[10px] text-[#65676B] font-semibold tracking-wider uppercase">
              M-PESA Foundation Academy
            </span>
          </div>
        </button>

        {/* Search Bar with live autocomplete */}
        <div className="relative">
          <div
            className={`flex items-center bg-[#F0F2F5] hover:bg-[#E4E6EB] transition-colors rounded-full px-3 py-2 w-10 sm:w-48 md:w-64 lg:w-72 ${
              isSearchFocused ? 'ring-2 ring-[#1877F2] bg-white w-64 md:w-80' : ''
            }`}
          >
            <Search className="w-4 h-4 text-[#65676B] shrink-0" />
            <input
              id="global-search-input"
              type="text"
              placeholder="Search MFA-VEXPEX..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="bg-transparent text-[14px] text-[#050505] placeholder-[#65676B] focus:outline-hidden ml-2 w-full hidden sm:block"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#65676B] hover:text-[#050505] p-0.5 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {isSearchFocused && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 top-12 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-[#CED0D4] p-3 max-h-96 overflow-y-auto z-50">
              <div className="text-[11px] font-bold text-[#65676B] uppercase tracking-wider mb-2">
                Academy Members
              </div>
              {matchingUsers.length === 0 ? (
                <div className="text-xs text-[#65676B] py-2">No academy members found</div>
              ) : (
                <div className="space-y-1 mb-3">
                  {matchingUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        viewUserProfile(user);
                        setIsSearchFocused(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0F2F5] transition-colors text-left"
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover border border-[#CED0D4]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs text-[#050505] truncate flex items-center gap-1">
                          {user.name}
                          {user.isVerifiedAcademy && (
                            <CheckCircle2 className="w-3 h-3 text-[#1877F2] fill-[#1877F2] text-white" />
                          )}
                        </div>
                        <div className="text-[11px] text-[#65676B] truncate">
                          {user.house} House • {user.role}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {matchingPosts.length > 0 && (
                <>
                  <div className="text-[11px] font-bold text-[#65676B] uppercase tracking-wider mb-2 border-t border-[#CED0D4] pt-2">
                    Posts & Bulletins ({matchingPosts.length})
                  </div>
                  <div className="space-y-1 mb-2">
                    {matchingPosts.slice(0, 3).map((post) => (
                      <button
                        key={post.id}
                        onClick={() => {
                          setActiveTab('feed');
                          setIsSearchFocused(false);
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-[#F0F2F5] transition-colors text-xs text-[#050505] truncate"
                      >
                        <span className="font-semibold text-[#1877F2]">{post.author.name}: </span>
                        {post.content.slice(0, 60)}...
                      </button>
                    ))}
                  </div>
                </>
              )}

              {matchingMarket.length > 0 && (
                <>
                  <div className="text-[11px] font-bold text-[#65676B] uppercase tracking-wider mb-2 border-t border-[#CED0D4] pt-2">
                    Campus Store Items ({matchingMarket.length})
                  </div>
                  <div className="space-y-1">
                    {matchingMarket.slice(0, 2).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab('marketplace');
                          setIsSearchFocused(false);
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-[#F0F2F5] transition-colors flex items-center justify-between text-xs"
                      >
                        <span className="truncate font-medium text-[#050505]">{item.title}</span>
                        <span className="font-bold text-[#00A884] shrink-0 ml-2">
                          {item.isFreeOrBorrow ? 'FREE' : `KSh ${item.price.toLocaleString()}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center Navigation Tabs (Facebook Style) */}
      <nav aria-label="Main Navigation" className="flex items-center h-full max-w-2xl mx-auto flex-1 justify-center px-1 sm:px-4">
        <button
          id="nav-tab-feed"
          onClick={() => setActiveTab('feed')}
          className={`relative flex items-center justify-center flex-1 max-w-24 h-full rounded-lg transition-colors cursor-pointer group ${
            activeTab === 'feed'
              ? 'text-[#1877F2]'
              : 'text-[#65676B] hover:bg-[#F2F2F2]'
          }`}
          title="Campus Feed"
        >
          <Home className={`w-7 h-7 ${activeTab === 'feed' ? 'stroke-[2.5]' : ''}`} />
          {activeTab === 'feed' && (
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#1877F2] rounded-t-md" />
          )}
        </button>

        <button
          id="nav-tab-reels"
          onClick={() => setActiveTab('reels')}
          className={`relative flex items-center justify-center flex-1 max-w-24 h-full rounded-lg transition-colors cursor-pointer group ${
            activeTab === 'reels'
              ? 'text-[#1877F2]'
              : 'text-[#65676B] hover:bg-[#F2F2F2]'
          }`}
          title="Reels & Shorts"
        >
          <Film className={`w-7 h-7 ${activeTab === 'reels' ? 'stroke-[2.5]' : ''}`} />
          <span className="absolute top-2 right-3 sm:right-5 px-1 bg-[#FA383E] text-white text-[9px] font-extrabold rounded-full scale-90">
            NEW
          </span>
          {activeTab === 'reels' && (
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#1877F2] rounded-t-md" />
          )}
        </button>

        <button
          id="nav-tab-groups"
          onClick={() => setActiveTab('groups')}
          className={`relative flex items-center justify-center flex-1 max-w-24 h-full rounded-lg transition-colors cursor-pointer group ${
            activeTab === 'groups'
              ? 'text-[#1877F2]'
              : 'text-[#65676B] hover:bg-[#F2F2F2]'
          }`}
          title="Houses & Clubs"
        >
          <Users className={`w-7 h-7 ${activeTab === 'groups' ? 'stroke-[2.5]' : ''}`} />
          <span className="absolute top-2 right-4 sm:right-6 w-2 h-2 rounded-full bg-[#FA383E]" />
          {activeTab === 'groups' && (
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#1877F2] rounded-t-md" />
          )}
        </button>

        <button
          id="nav-tab-marketplace"
          onClick={() => setActiveTab('marketplace')}
          className={`relative flex items-center justify-center flex-1 max-w-24 h-full rounded-lg transition-colors cursor-pointer group ${
            activeTab === 'marketplace'
              ? 'text-[#1877F2]'
              : 'text-[#65676B] hover:bg-[#F2F2F2]'
          }`}
          title="Campus Marketplace"
        >
          <Store className={`w-7 h-7 ${activeTab === 'marketplace' ? 'stroke-[2.5]' : ''}`} />
          {activeTab === 'marketplace' && (
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#1877F2] rounded-t-md" />
          )}
        </button>

        <button
          id="nav-tab-events"
          onClick={() => setActiveTab('events')}
          className={`relative flex items-center justify-center flex-1 max-w-24 h-full rounded-lg transition-colors cursor-pointer group ${
            activeTab === 'events'
              ? 'text-[#1877F2]'
              : 'text-[#65676B] hover:bg-[#F2F2F2]'
          }`}
          title="Academy Calendar & Events"
        >
          <Calendar className={`w-7 h-7 ${activeTab === 'events' ? 'stroke-[2.5]' : ''}`} />
          {activeTab === 'events' && (
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#1877F2] rounded-t-md" />
          )}
        </button>
      </nav>

      {/* Right Controls: Create (+), Messenger, Notifications, User Avatar */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Academy Domain Badge (Desktop) */}
        <div
          onClick={() => setIsAuthModalOpen(true)}
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E7F3FF] text-[#1877F2] text-xs font-semibold border border-[#BEDDFF] cursor-pointer hover:bg-[#D9EBFF] transition-colors"
          title="Click to manage academy accounts"
        >
          <School className="w-3.5 h-3.5" />
          <span>@mpesafoundationacademy.ac.ke</span>
        </div>

        {/* Create Button (+) */}
        <div className="relative" ref={createMenuRef}>
          <button
            id="nav-create-btn"
            onClick={() => {
              setIsCreateMenuOpen(!isCreateMenuOpen);
              setIsMessengerMenuOpen(false);
              setIsNotificationsMenuOpen(false);
              setIsAccountMenuOpen(false);
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              isCreateMenuOpen
                ? 'bg-[#E7F3FF] text-[#1877F2]'
                : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505]'
            }`}
            title="Create"
          >
            <Plus className="w-5 h-5" />
          </button>

          {isCreateMenuOpen && (
            <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-2xl border border-[#CED0D4] p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="font-bold text-sm text-[#050505] px-3 py-1.5">Create</div>
              <button
                onClick={() => {
                  setIsCreatePostOpen(true);
                  setIsCreateMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-[#F0F2F5] transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[#E4E6EB] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#1877F2]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#050505]">Campus Post</div>
                  <div className="text-[11px] text-[#65676B]">Share an update with your House or Academy</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsCreateStoryOpen(true);
                  setIsCreateMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-[#F0F2F5] transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[#E4E6EB] flex items-center justify-center">
                  <Plus className="w-5 h-5 text-[#00A884]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#050505]">Story</div>
                  <div className="text-[11px] text-[#65676B]">Share a 24-hr photo or status</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsCreateReelOpen(true);
                  setIsCreateMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-[#F0F2F5] transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[#E4E6EB] flex items-center justify-center">
                  <Film className="w-5 h-5 text-[#FA383E]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#050505] flex items-center gap-1.5">
                    Reel / Short
                    <span className="text-[9px] bg-[#FA383E] text-white px-1 font-bold rounded-sm">NEW</span>
                  </div>
                  <div className="text-[11px] text-[#65676B]">Post vertical campus clips & videos</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('marketplace');
                  setIsCreateMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-[#F0F2F5] transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[#E4E6EB] flex items-center justify-center">
                  <Store className="w-5 h-5 text-[#FA383E]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#050505]">Marketplace Listing</div>
                  <div className="text-[11px] text-[#65676B]">Sell textbooks, calculators, PE gear</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('events');
                  setIsCreateMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-[#F0F2F5] transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[#E4E6EB] flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#F7B125]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#050505]">Academy Event</div>
                  <div className="text-[11px] text-[#65676B]">Host a tournament, debate, or hackathon</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Messenger Button */}
        <div className="relative" ref={messengerMenuRef}>
          <button
            id="nav-messenger-btn"
            onClick={() => {
              setIsMessengerMenuOpen(!isMessengerMenuOpen);
              setIsCreateMenuOpen(false);
              setIsNotificationsMenuOpen(false);
              setIsAccountMenuOpen(false);
            }}
            className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              isMessengerMenuOpen
                ? 'bg-[#E7F3FF] text-[#1877F2]'
                : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505]'
            }`}
            title="Messenger"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#FA383E] text-white text-[10px] font-bold">
              2
            </span>
          </button>

          {isMessengerMenuOpen && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-[#CED0D4] p-3 z-50">
              <div className="flex items-center justify-between mb-2">
                <div className="font-extrabold text-lg text-[#050505]">MFA Messenger</div>
                <button
                  onClick={() => setIsMessengerMenuOpen(false)}
                  className="text-xs text-[#1877F2] font-semibold hover:underline"
                >
                  See all
                </button>
              </div>

              <div className="space-y-1">
                {chatThreads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => {
                      openChatWithUser(thread.user);
                      setIsMessengerMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0F2F5] transition-colors text-left"
                  >
                    <div className="relative">
                      <img
                        src={thread.user.avatar}
                        alt={thread.user.name}
                        className="w-11 h-11 rounded-full object-cover border border-[#CED0D4]"
                      />
                      {thread.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#31A24C] border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-[#050505] truncate">
                          {thread.user.name}
                        </span>
                        <span className="text-[10px] text-[#65676B]">{thread.lastTimestamp}</span>
                      </div>
                      <p className="text-[12px] text-[#65676B] truncate">{thread.lastMessage}</p>
                    </div>
                    {thread.unreadCount > 0 && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2] shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Button */}
        <div className="relative" ref={notifMenuRef}>
          <button
            id="nav-notif-btn"
            onClick={() => {
              setIsNotificationsMenuOpen(!isNotificationsMenuOpen);
              setIsCreateMenuOpen(false);
              setIsMessengerMenuOpen(false);
              setIsAccountMenuOpen(false);
            }}
            className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              isNotificationsMenuOpen
                ? 'bg-[#E7F3FF] text-[#1877F2]'
                : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505]'
            }`}
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#FA383E] text-white text-[10px] font-bold">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {isNotificationsMenuOpen && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-[#CED0D4] p-3 z-50">
              <div className="flex items-center justify-between mb-2">
                <div className="font-extrabold text-lg text-[#050505]">Notifications</div>
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-xs text-[#1877F2] font-semibold hover:underline"
                >
                  Mark all as read
                </button>
              </div>

              <div className="space-y-1 max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => {
                      markNotificationAsRead(notif.id);
                      if (notif.linkTab) setActiveTab(notif.linkTab);
                      setIsNotificationsMenuOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 p-2 rounded-lg transition-colors text-left ${
                      notif.read ? 'hover:bg-[#F0F2F5]' : 'bg-[#E7F3FF] hover:bg-[#DBECFD]'
                    }`}
                  >
                    <img
                      src={notif.actor.avatar}
                      alt={notif.actor.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#CED0D4] shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#050505] leading-snug">
                        <span className="font-bold">{notif.actor.name} </span>
                        {notif.content}
                      </p>
                      <span className="text-[11px] font-semibold text-[#1877F2]">
                        {notif.timestamp}
                      </span>
                    </div>
                    {!notif.read && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2] shrink-0 mt-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Account Avatar & Dropdown */}
        <div className="relative" ref={accountMenuRef}>
          <button
            id="nav-account-btn"
            onClick={() => {
              setIsAccountMenuOpen(!isAccountMenuOpen);
              setIsCreateMenuOpen(false);
              setIsMessengerMenuOpen(false);
              setIsNotificationsMenuOpen(false);
            }}
            className="flex items-center gap-1 p-0.5 rounded-full hover:ring-2 hover:ring-[#1877F2] transition-all cursor-pointer"
            title="Account & Profiles"
          >
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#1877F2]"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[9px] font-bold">
                🦁
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#65676B] hidden sm:block" />
          </button>

          {isAccountMenuOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-[#CED0D4] p-3 z-50">
              {/* User Profile Summary Card */}
              <button
                onClick={() => {
                  viewUserProfile(currentUser);
                  setIsAccountMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-2 rounded-xl shadow-xs border border-[#CED0D4] hover:bg-[#F0F2F5] transition-colors text-left mb-3"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full object-cover border border-[#CED0D4]"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-[#050505] truncate flex items-center gap-1">
                    {currentUser.name}
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1877F2] fill-[#1877F2] text-white" />
                  </div>
                  <div className="text-xs text-[#65676B] truncate">
                    {currentUser.house} House • {currentUser.role}
                  </div>
                  <div className="text-[11px] text-[#1877F2] font-semibold mt-0.5">
                    View your profile
                  </div>
                </div>
              </button>

              <div className="border-t border-[#CED0D4] my-2" />

              <div className="text-[11px] font-bold text-[#65676B] uppercase tracking-wider mb-1.5 px-2">
                Switch Academy Profile
              </div>

              <div className="space-y-1 mb-2">
                {ACADEMY_USERS.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      switchUser(user.id);
                      setIsAccountMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors ${
                      currentUser.id === user.id ? 'bg-[#E7F3FF]' : 'hover:bg-[#F0F2F5]'
                    }`}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#CED0D4]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-[#050505] truncate">{user.name}</div>
                      <div className="text-[10px] text-[#65676B] truncate">
                        {user.house} • {user.role}
                      </div>
                    </div>
                    {currentUser.id === user.id && (
                      <span className="text-[10px] font-bold text-[#1877F2] bg-white px-2 py-0.5 rounded-full shadow-xs">
                        Active
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="border-t border-[#CED0D4] my-2" />

              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                  setIsAccountMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0F2F5] transition-colors text-left text-xs font-medium text-[#050505]"
              >
                <ShieldCheck className="w-4 h-4 text-[#00A884]" />
                <span>Domain Auth & Security</span>
              </button>

              <button
                onClick={() => {
                  viewUserProfile(currentUser);
                  setIsAccountMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0F2F5] transition-colors text-left text-xs font-medium text-[#050505]"
              >
                <UserIcon className="w-4 h-4 text-[#1877F2]" />
                <span>Edit Academy Profile</span>
              </button>

              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                  setIsAccountMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#FEE2E2] text-[#DC2626] transition-colors text-left text-xs font-medium"
              >
                <LogOut className="w-4 h-4 text-[#DC2626]" />
                <span>Sign in with different MFA account</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
