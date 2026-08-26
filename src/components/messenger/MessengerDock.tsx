import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Minus,
  Maximize2,
  Send,
  Image as ImageIcon,
  Smile,
  Phone,
  Video,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { User, Message } from '../../types';

export const MessengerDock: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    openChatWindows,
    closeChatWindow,
    toggleMinimizeChatWindow,
    messages,
    sendMessage,
    viewUserProfile
  } = useApp();

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

const ChatWindowBox: React.FC<ChatWindowBoxProps> = ({
  threadId,
  user,
  minimized,
  onClose,
  onToggleMinimize
}) => {
  const { currentUser } = useAuth();
  const { messages, sendMessage, viewUserProfile } = useApp();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const threadMessages = messages[threadId] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [threadMessages.length, minimized]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const sentText = inputText.trim();
    sendMessage(user.id, sentText);
    setInputText('');

    // Simulate realistic intelligent peer reply after 1.5s
    setTimeout(() => {
      const peerReplies = [
        `Got it Stephen! Let's touch base at the ${user.house} common room or the library study pods.`,
        `Sounds great! I'll bring the project notes to the Uongozi Centre tomorrow.`,
        `Awesome! Good luck with your physics lab revision! 🦁`,
        `Perfect! See you at the upcoming inter-house gala.`
      ];
      const randomReply = peerReplies[Math.floor(Math.random() * peerReplies.length)];
      sendMessage(currentUser.id, randomReply);
    }, 1500);
  };

  if (minimized) {
    return (
      <div
        onClick={onToggleMinimize}
        className="w-48 sm:w-56 bg-white rounded-t-xl shadow-2xl border border-[#CED0D4] p-2 flex items-center justify-between cursor-pointer hover:bg-[#F0F2F5] transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-7 h-7 rounded-full object-cover border"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#31A24C] border border-white" />
          </div>
          <span className="font-bold text-xs text-[#050505] truncate">{user.name}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-[#65676B] hover:text-[#050505] p-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 sm:w-84 h-96 bg-white rounded-t-2xl shadow-2xl border border-[#CED0D4] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-150">
      {/* Chat Header */}
      <div className="bg-white border-b border-[#E4E6EB] p-2.5 flex items-center justify-between shadow-xs">
        <div
          onClick={() => viewUserProfile(user)}
          className="flex items-center gap-2 cursor-pointer group min-w-0"
        >
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#31A24C] border-2 border-white" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs text-[#050505] truncate group-hover:underline flex items-center gap-1">
              {user.name}
              {user.isVerifiedAcademy && (
                <CheckCircle2 className="w-3 h-3 text-[#1877F2] fill-[#1877F2] text-white" />
              )}
            </div>
            <div className="text-[10px] text-[#31A24C] font-semibold truncate">
              Active Now • {user.house} House
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[#1877F2]">
          <button
            onClick={onToggleMinimize}
            className="w-6 h-6 rounded-full hover:bg-[#F0F2F5] flex items-center justify-center text-[#65676B]"
            title="Minimize"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full hover:bg-[#F0F2F5] flex items-center justify-center text-[#65676B]"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-white text-xs">
        {/* Intro Profile Snapshot */}
        <div className="text-center py-3 border-b border-[#F0F2F5]">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-14 h-14 rounded-full object-cover mx-auto mb-1 border-2 border-[#1877F2]"
          />
          <h4 className="font-extrabold text-xs text-[#050505]">{user.name}</h4>
          <p className="text-[10px] text-[#65676B]">
            {user.role} • {user.house} House
          </p>
          <p className="text-[10px] text-[#1877F2] font-semibold mt-0.5">
            Verified M-PESA Foundation Academy Intranet
          </p>
        </div>

        {threadMessages.length === 0 ? (
          <div className="text-center py-4 text-[#65676B] text-[11px]">
            Say hi to start the conversation!
          </div>
        ) : (
          threadMessages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[78%] px-3.5 py-2 rounded-2xl leading-relaxed text-xs shadow-2xs ${
                    isMe
                      ? 'bg-[#0084FF] text-white rounded-br-xs'
                      : 'bg-[#F0F2F5] text-[#050505] rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-[#65676B] px-1 mt-0.5">
                  {msg.timestamp}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <form onSubmit={handleSend} className="p-2 border-t border-[#E4E6EB] flex items-center gap-1.5 bg-white">
        <input
          type="text"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-[#F0F2F5] text-xs text-[#050505] placeholder-[#65676B] px-3 py-1.5 rounded-full border-0 focus:bg-white focus:ring-1 focus:ring-[#1877F2] focus:outline-hidden"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
            inputText.trim()
              ? 'text-[#0084FF] hover:bg-[#E7F3FF]'
              : 'text-[#CED0D4] cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
