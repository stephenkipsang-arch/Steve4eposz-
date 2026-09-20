import React, { useEffect, useRef, useState } from 'react';
import { X, Minus, Send, CheckCircle2, Circle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { User, Message } from '../../types';
import { apiFetch } from '../../utils/api';

export const MessengerDock: React.FC = () => {
  const { openChatWindows, closeChatWindow, toggleMinimizeChatWindow } = useApp();

  return (
    <div className="fixed bottom-0 right-4 z-50 flex items-end gap-3 pointer-events-none select-none">
      {openChatWindows.map((chat) => (
        <div key={chat.threadId} className="pointer-events-auto">
          <ChatWindowBox
            threadId={chat.threadId}
            user={chat.user}
            minimized={!!chat.minimized}
            onClose={() => closeChatWindow(chat.threadId)}
            onToggleMinimize={() => toggleMinimizeChatWindow(chat.threadId)}
          />
        </div>
      ))}
    </div>
  );
};

interface ChatWindowBoxProps {
  threadId: string;
  user: User;
  minimized: boolean;
  onClose: () => void;
  onToggleMinimize: () => void;
}

type PresenceUser = User & { online?: boolean; lastSeen?: string };

const ChatWindowBox: React.FC<ChatWindowBoxProps> = ({ user, minimized, onClose, onToggleMinimize }) => {
  const { currentUser } = useAuth();
  const { messages, sendMessage, viewUserProfile } = useApp();
  const [inputText, setInputText] = useState('');
  const [sharedMessages, setSharedMessages] = useState<Message[]>([]);
  const [peerOnline, setPeerOnline] = useState<boolean | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const threadId = `chat_${user.id.replace(/^user_/, '')}`;
  const localMessages = messages[threadId] || [];
  const peer = user as PresenceUser;

  const loadChat = async () => {
    try {
      const response = await apiFetch(`/api/messages?userId=${encodeURIComponent(currentUser.id)}&peerId=${encodeURIComponent(user.id)}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.messages)) setSharedMessages(data.messages);
      }

      const usersResponse = await apiFetch('/api/users');
      if (usersResponse.ok) {
        const data = await usersResponse.json();
        const found = Array.isArray(data.users)
          ? data.users.find((u: PresenceUser) => u.id === user.id)
          : undefined;
        if (found) setPeerOnline(found.online === true);
      }
    } catch {
      if (typeof peer.online === 'boolean') setPeerOnline(peer.online);
    }
  };

  useEffect(() => {
    void loadChat();
    const timer = window.setInterval(() => void loadChat(), 2000);
    return () => window.clearInterval(timer);
  }, [currentUser.id, user.id]);

  const displayedMessages = sharedMessages.length > 0 ? sharedMessages : localMessages;
  const unreadIncoming = displayedMessages.filter((msg) => msg.receiverId === currentUser.id && !msg.read).length;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedMessages.length, minimized]);

  useEffect(() => {
    if (minimized || unreadIncoming === 0) return;
    void apiFetch('/api/messages/read', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id, peerId: user.id })
    }).then(() => loadChat()).catch(() => undefined);
  }, [minimized, unreadIncoming, currentUser.id, user.id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || sending) return;

    setInputText('');
    setSending(true);

    try {
      const response = await apiFetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: currentUser.id, receiverId: user.id, text })
      });

      if (response.ok) {
        await loadChat();
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || `Message failed (${response.status})`);
      }
    } catch (error) {
      console.warn('Message could not be sent to the shared server:', error);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return timestamp;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const statusText = peerOnline === true
    ? 'Online now'
    : peer.lastSeen
      ? `Last seen ${formatMessageTime(peer.lastSeen)}`
      : 'Offline';

  if (minimized) {
    return (
      <div onClick={onToggleMinimize} className="w-56 bg-white rounded-t-xl shadow-2xl border border-[#CED0D4] p-2 flex items-center justify-between cursor-pointer hover:bg-[#F0F2F5]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative">
            <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover border" />
            <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${peerOnline ? 'bg-[#31A24C]' : 'bg-[#9CA3AF]'}`} />
          </div>
          <span className="font-bold text-xs text-[#050505] truncate">{user.name}</span>
          {unreadIncoming > 0 && <span className="min-w-4 h-4 px-1 rounded-full bg-[#1877F2] text-white text-[9px] font-bold flex items-center justify-center">{unreadIncoming}</span>}
        </div>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-[#65676B] p-1" aria-label="Close chat"><X className="w-3.5 h-3.5" /></button>
      </div>
    );
  }

  return (
    <div className="w-80 sm:w-84 h-96 bg-white rounded-t-2xl shadow-2xl border border-[#CED0D4] flex flex-col overflow-hidden">
      <div className="bg-white border-b border-[#E4E6EB] p-2.5 flex items-center justify-between">
        <div onClick={() => viewUserProfile(user)} className="flex items-center gap-2 cursor-pointer min-w-0">
          <div className="relative">
            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border" />
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${peerOnline ? 'bg-[#31A24C]' : 'bg-[#9CA3AF]'}`} />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs text-[#050505] truncate flex items-center gap-1">
              {user.name}
              {user.isVerifiedAcademy && <CheckCircle2 className="w-3 h-3 text-[#1877F2]" />}
            </div>
            <div className={`text-[10px] font-semibold truncate ${peerOnline ? 'text-[#31A24C]' : 'text-[#65676B]'}`}>{statusText} • {user.house} House</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onToggleMinimize} className="w-7 h-7 rounded-full hover:bg-[#F0F2F5] flex items-center justify-center" aria-label="Minimize chat"><Minus className="w-4 h-4" /></button>
          <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-[#F0F2F5] flex items-center justify-center" aria-label="Close chat"><X className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-white text-xs">
        <div className="text-center py-2 border-b border-[#F0F2F5]">
          <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover mx-auto mb-1" />
          <h4 className="font-extrabold text-xs">{user.name}</h4>
          <p className="text-[10px] text-[#65676B]">{user.role} • {user.house} House</p>
        </div>

        {displayedMessages.length === 0 ? (
          <div className="text-center py-4 text-[#65676B] text-[11px]">Say hi to start the conversation!</div>
        ) : displayedMessages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[78%] px-3.5 py-2 rounded-2xl leading-relaxed ${isMe ? 'bg-[#0084FF] text-white rounded-br-sm' : 'bg-[#F0F2F5] text-[#050505] rounded-bl-sm'}`}>{msg.text}</div>
              <span className="text-[9px] text-[#65676B] px-1 mt-0.5 flex items-center gap-1">
                {formatMessageTime(msg.timestamp)}
                {isMe && <Circle className={`w-2 h-2 ${msg.read ? 'fill-[#31A24C] text-[#31A24C]' : 'text-[#9CA3AF]'}`} />}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-2 border-t border-[#E4E6EB] flex items-center gap-1.5 bg-white">
        <input type="text" placeholder="Type a message..." value={inputText} onChange={(e) => setInputText(e.target.value)} disabled={sending} className="flex-1 bg-[#F0F2F5] text-xs px-3 py-2 rounded-full border-0 focus:bg-white focus:ring-1 focus:ring-[#1877F2] focus:outline-none disabled:opacity-60" />
        <button type="submit" disabled={!inputText.trim() || sending} className="w-8 h-8 rounded-full flex items-center justify-center text-[#0084FF] disabled:text-[#CED0D4]" aria-label="Send message"><Send className="w-4 h-4" /></button>
      </form>
    </div>
  );
};
