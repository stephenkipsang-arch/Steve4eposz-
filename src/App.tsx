import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { RightSidebar } from './components/layout/RightSidebar';
import { FeedView } from './components/feed/FeedView';
import { ArenaAI } from './components/arena/ArenaAI';
import { MarketplaceView } from './components/marketplace/MarketplaceView';
import { EventsView } from './components/events/EventsView';
import { ProfileView } from './components/profile/ProfileView';
import { ReelsView } from './components/reels/ReelsView';
import { LostFound } from './components/lostfound/LostFound';
import { CreatePostModal } from './components/feed/CreatePostModal';
import { CreateStoryModal } from './components/feed/CreateStoryModal';
import { CreateReelModal } from './components/reels/CreateReelModal';
import { StoryViewerModal } from './components/feed/StoryViewerModal';
import { AuthModal } from './components/auth/AuthModal';
import { MessengerDock } from './components/messenger/MessengerDock';

const MainLayout: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#050505] font-sans antialiased flex flex-col selection:bg-[#BEDDFF] selection:text-[#1877F2]">
      {/* Facebook Top Navigation */}
      <Navbar />

      {/* Main Body */}
      <div className="flex-1 flex justify-between w-full max-w-[1920px] mx-auto relative">
        {/* Left Facebook Navigation Sidebar */}
        <LeftSidebar />

        {/* Dynamic Center Stage */}
        <main className="flex-1 min-w-0 pb-16 md:pb-8">
          {activeTab === 'feed' && <FeedView />}
          {activeTab === 'reels' && <ReelsView />}
          {activeTab === 'lost-found' && <LostFound />}
          {activeTab === 'arena-ai' && <ArenaAI />}
          {activeTab === 'marketplace' && <MarketplaceView />}
          {activeTab === 'events' && <EventsView />}
          {activeTab === 'profile' && <ProfileView />}
        </main>

        {/* Right Facebook Activity & Contacts Sidebar (shown only on feed or full desktop) */}
        {activeTab === 'feed' && <RightSidebar />}
      </div>

      {/* Floating Messenger Docks */}
      <MessengerDock />

      {/* Modals & Dialogs */}
      <CreatePostModal />
      <CreateStoryModal />
      <CreateReelModal />
      <StoryViewerModal />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  );
}
