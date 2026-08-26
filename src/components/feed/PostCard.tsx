import React, { useState } from 'react';
import {
  ThumbsUp,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  CheckCircle2,
  ShieldCheck,
  Send,
  Image as ImageIcon,
  Video as VideoIcon,
  Pin,
  Flame,
  X,
  Smile,
  BarChart2,
  Check
} from 'lucide-react';
import { Post, ReactionType, User, Comment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const REACTION_CONFIG: Record<
  ReactionType,
  { label: string; emoji: string; color: string; bgColor: string }
> = {
  like: { label: 'Like', emoji: '👍', color: '#1877F2', bgColor: '#E7F3FF' },
  love: { label: 'Love', emoji: '❤️', color: '#FA383E', bgColor: '#FEE2E2' },
  care: { label: 'Care', emoji: '🤗', color: '#F7B125', bgColor: '#FEF3C7' },
  haha: { label: 'Haha', emoji: '😆', color: '#F7B125', bgColor: '#FEF3C7' },
  wow: { label: 'Wow', emoji: '😮', color: '#F7B125', bgColor: '#FEF3C7' },
  sad: { label: 'Sad', emoji: '😢', color: '#F7B125', bgColor: '#FEF3C7' },
  angry: { label: 'Angry', emoji: '😡', color: '#E44426', bgColor: '#FEE2E2' }
};

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { currentUser } = useAuth();
  const {
    reactToPost,
    addComment,
    likeComment,
    votePoll,
    deletePost,
    savedPostIds,
    toggleSavePost,
    viewUserProfile,
    addPost
  } = useApp();

  const [isReactionHovered, setIsReactionHovered] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentImageUrl, setCommentImageUrl] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(true);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const isSaved = savedPostIds.includes(post.id);

  // Reaction statistics
  const totalReactions = (Object.values(post.reactions) as number[]).reduce(
    (a: number, b: number) => a + b,
    0
  );
  const topReactions = (Object.entries(post.reactions) as [ReactionType, number][])
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() && !commentImageUrl) return;
    addComment(post.id, commentText.trim(), commentImageUrl || undefined);
    setCommentText('');
    setCommentImageUrl('');
  };

  const handleQuickLike = () => {
    if (post.userReaction) {
      reactToPost(post.id, post.userReaction); // toggles off
    } else {
      reactToPost(post.id, 'like');
    }
  };

  const handleShareToMyFeed = () => {
    addPost(`Shared from ${post.author.name}: "${post.content.slice(0, 100)}..."`, post.images);
    setShowShareModal(false);
  };

  return (
    <article className="bg-white rounded-2xl shadow-xs border border-[#CED0D4] overflow-hidden mb-4 select-none">
      {/* Pinned / Official Badge */}
      {post.isPinned && (
        <div className="bg-[#E7F3FF] border-b border-[#BEDDFF] px-4 py-1.5 flex items-center gap-2 text-xs font-semibold text-[#1877F2]">
          <Pin className="w-3.5 h-3.5 fill-[#1877F2]" />
          <span>Pinned Official Academy Announcement</span>
        </div>
      )}

      {/* Post Header */}
      <div className="p-3 sm:p-4 flex items-start justify-between relative">
        <div className="flex items-center gap-3">
          <button
            onClick={() => viewUserProfile(post.author)}
            className="relative cursor-pointer group"
          >
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover border border-[#CED0D4] group-hover:ring-2 group-hover:ring-[#1877F2] transition-all"
            />
            {post.author.house !== 'Staff / Administration' && (
              <span className="absolute -bottom-1 -right-1 text-xs">
                {post.author.house === 'Kenya'
                  ? '🦁'
                  : post.author.house === 'Kilimanjaro'
                  ? '🏔️'
                  : post.author.house === 'Longonot'
                  ? '🦅'
                  : '🦏'}
              </span>
            )}
          </button>

          <div>
            <div className="flex items-center flex-wrap gap-1">
              <button
                onClick={() => viewUserProfile(post.author)}
                className="font-bold text-sm text-[#050505] hover:underline cursor-pointer flex items-center gap-1"
              >
                {post.author.name}
                {post.author.isVerifiedAcademy && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1877F2] fill-[#1877F2] text-white" />
                )}
              </button>

              {post.feeling && (
                <span className="text-xs text-[#65676B] font-normal">
                  is {post.feeling}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#65676B]">
              <span>{post.timestamp}</span>
              <span>•</span>
              <span className="font-semibold text-[#1877F2]">
                {post.houseTag === 'All Academy' ? '🌐 All Academy' : `${post.houseTag} House`}
              </span>
              {post.location && (
                <>
                  <span>•</span>
                  <span className="truncate max-w-32 sm:max-w-48 text-[#65676B]">
                    📍 {post.location}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Options Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            className="w-8 h-8 rounded-full hover:bg-[#F0F2F5] flex items-center justify-center text-[#65676B] transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showOptionsMenu && (
            <div className="absolute right-0 top-9 w-52 bg-white rounded-xl shadow-xl border border-[#CED0D4] p-1.5 z-30 animate-in fade-in zoom-in-95">
              <button
                onClick={() => {
                  toggleSavePost(post.id);
                  setShowOptionsMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-semibold text-[#050505] hover:bg-[#F0F2F5] rounded-lg transition-colors"
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'text-[#1877F2] fill-[#1877F2]' : ''}`} />
                <span>{isSaved ? 'Unsave Post' : 'Save to MFA Bulletins'}</span>
              </button>

              {post.author.id === currentUser.id && (
                <button
                  onClick={() => {
                    deletePost(post.id);
                    setShowOptionsMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-semibold text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Delete Post</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Text Content */}
      <div className="px-3 sm:px-4 pb-3">
        <p className="text-sm text-[#050505] whitespace-pre-line leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Poll Display */}
      {post.poll && (
        <div className="px-3 sm:px-4 pb-3">
          <div className="bg-[#F0F2F5] p-3.5 rounded-xl border border-[#CED0D4] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#050505] flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-[#1877F2]" />
                {post.poll.question}
              </span>
              <span className="text-[11px] text-[#65676B] font-semibold">
                {post.poll.totalVotes} votes
              </span>
            </div>

            <div className="space-y-2">
              {post.poll.options.map((opt) => {
                const isVoted = opt.votedUserIds.includes(currentUser.id);
                const pct =
                  post.poll && post.poll.totalVotes > 0
                    ? Math.round((opt.votes / post.poll.totalVotes) * 100)
                    : 0;

                return (
                  <div
                    key={opt.id}
                    onClick={() => votePoll(post.id, opt.id)}
                    className={`relative overflow-hidden p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isVoted
                        ? 'border-[#1877F2] bg-[#E7F3FF]/40'
                        : 'border-[#CED0D4] bg-white hover:border-[#1877F2]'
                    }`}
                  >
                    {/* Background Progress Fill */}
                    <div
                      className="absolute inset-y-0 left-0 bg-[#BEDDFF]/40 transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />

                    <div className="relative flex items-center justify-between z-10">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isVoted
                              ? 'border-[#1877F2] bg-[#1877F2] text-white'
                              : 'border-[#65676B]'
                          }`}
                        >
                          {isVoted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-semibold text-[#050505]">
                          {opt.text}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#1877F2]">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Post Video Player */}
      {post.videoUrl && (
        <div className="relative bg-black overflow-hidden border-y border-[#CED0D4]">
          {post.videoTitle && (
            <div className="px-3 py-1.5 bg-black/80 text-white text-xs font-semibold flex items-center gap-1.5 border-b border-white/10">
              <VideoIcon className="w-3.5 h-3.5 text-[#1877F2]" />
              <span className="truncate">{post.videoTitle}</span>
            </div>
          )}
          <video
            src={post.videoUrl}
            poster={post.videoPoster}
            controls
            playsInline
            preload="metadata"
            className="w-full max-h-[460px] object-contain bg-black mx-auto"
          />
        </div>
      )}

      {/* Post Images Grid */}
      {post.images && post.images.length > 0 && (
        <div className="relative bg-black/5 overflow-hidden">
          {post.images.length === 1 ? (
            <img
              src={post.images[0]}
              alt="Post media"
              onClick={() => setLightboxImage(post.images![0])}
              className="w-full max-h-[500px] object-cover cursor-pointer hover:opacity-95 transition-opacity"
            />
          ) : post.images.length === 2 ? (
            <div className="grid grid-cols-2 gap-1 max-h-[400px]">
              {post.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="Post media"
                  onClick={() => setLightboxImage(img)}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1 max-h-[440px]">
              <img
                src={post.images[0]}
                alt="Post media"
                onClick={() => setLightboxImage(post.images![0])}
                className="w-full h-full object-cover cursor-pointer row-span-2"
              />
              <div className="grid grid-rows-2 gap-1 h-full">
                {post.images.slice(1, 3).map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="Post media"
                    onClick={() => setLightboxImage(img)}
                    className="w-full h-full object-cover cursor-pointer"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Full view"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}

      {/* Reaction & Comment Count Summary Bar */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-[#65676B] border-b border-[#E4E6EB]">
        {totalReactions > 0 ? (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center -space-x-1">
              {topReactions.map(([type]) => (
                <span
                  key={type}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] shadow-xs"
                >
                  {REACTION_CONFIG[type].emoji}
                </span>
              ))}
            </div>
            <span className="font-semibold hover:underline cursor-pointer">
              {totalReactions}
            </span>
          </div>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-3">
          {post.comments.length > 0 && (
            <span
              onClick={() => setShowCommentInput(true)}
              className="hover:underline cursor-pointer"
            >
              {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
            </span>
          )}
          {post.sharesCount > 0 && (
            <span>{post.sharesCount} shares</span>
          )}
        </div>
      </div>

      {/* Action Buttons: Like (with hover popover), Comment, Share */}
      <div className="px-2 py-1 flex items-center justify-between relative border-b border-[#E4E6EB]">
        {/* Like Button & Reactions Popover */}
        <div
          className="relative flex-1"
          onMouseEnter={() => setIsReactionHovered(true)}
          onMouseLeave={() => setIsReactionHovered(false)}
        >
          {/* Reaction Float Picker */}
          {isReactionHovered && (
            <div className="absolute -top-12 left-0 bg-white rounded-full shadow-2xl border border-[#CED0D4] px-2 py-1.5 flex items-center gap-1 z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
              {(Object.keys(REACTION_CONFIG) as ReactionType[]).map((type) => {
                const r = REACTION_CONFIG[type];
                return (
                  <button
                    key={type}
                    onClick={() => {
                      reactToPost(post.id, type);
                      setIsReactionHovered(false);
                    }}
                    className="hover:scale-135 transition-transform p-1 rounded-full cursor-pointer text-xl"
                    title={r.label}
                  >
                    {r.emoji}
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={handleQuickLike}
            className={`w-full flex items-center justify-center gap-2 py-1.5 rounded-lg transition-colors cursor-pointer text-xs font-semibold ${
              post.userReaction
                ? 'text-[#1877F2] font-bold bg-[#E7F3FF]'
                : 'text-[#65676B] hover:bg-[#F2F2F2]'
            }`}
          >
            {post.userReaction ? (
              <>
                <span className="text-base">
                  {REACTION_CONFIG[post.userReaction].emoji}
                </span>
                <span style={{ color: REACTION_CONFIG[post.userReaction].color }}>
                  {REACTION_CONFIG[post.userReaction].label}
                </span>
              </>
            ) : (
              <>
                <ThumbsUp className="w-4 h-4" />
                <span>Like</span>
              </>
            )}
          </button>
        </div>

        {/* Comment Button */}
        <button
          onClick={() => setShowCommentInput(!showCommentInput)}
          className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold text-[#65676B] hover:bg-[#F2F2F2] transition-colors cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Comment</span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => setShowShareModal(true)}
          className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold text-[#65676B] hover:bg-[#F2F2F2] transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-2xl border border-[#CED0D4]">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-sm text-[#050505]">Share Post</span>
              <button onClick={() => setShowShareModal(false)}>
                <X className="w-4 h-4 text-[#65676B]" />
              </button>
            </div>
            <p className="text-xs text-[#65676B]">
              Share this update with fellow M-PESA Foundation Academy scholars.
            </p>
            <button
              onClick={handleShareToMyFeed}
              className="w-full py-2 bg-[#1877F2] text-white font-bold text-xs rounded-xl hover:bg-[#166fe5]"
            >
              Share now to Campus Feed
            </button>
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="p-3 sm:p-4 bg-[#F9FAFB] space-y-3">
        {/* Comment List */}
        {post.comments.length > 0 && (
          <div className="space-y-2.5">
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-2.5">
                <button
                  onClick={() => viewUserProfile(comment.author)}
                  className="cursor-pointer shrink-0"
                >
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    className="w-8 h-8 rounded-full object-cover border border-[#CED0D4]"
                  />
                </button>

                <div className="flex-1 min-w-0">
                  {/* Bubble */}
                  <div className="bg-[#F0F2F5] px-3 py-2 rounded-2xl inline-block max-w-full">
                    <button
                      onClick={() => viewUserProfile(comment.author)}
                      className="font-bold text-xs text-[#050505] hover:underline block text-left"
                    >
                      {comment.author.name}
                    </button>
                    <p className="text-xs text-[#050505] leading-relaxed whitespace-pre-line">
                      {comment.content}
                    </p>
                    {comment.imageUrl && (
                      <img
                        src={comment.imageUrl}
                        alt="Comment attachment"
                        className="mt-2 max-h-40 rounded-lg object-cover"
                      />
                    )}
                  </div>

                  {/* Comment Actions (Like & Timestamp) */}
                  <div className="flex items-center gap-3 text-[11px] text-[#65676B] font-semibold ml-2 mt-0.5">
                    <button
                      onClick={() => likeComment(post.id, comment.id)}
                      className={`hover:underline cursor-pointer ${
                        comment.isLikedByMe ? 'text-[#1877F2] font-bold' : ''
                      }`}
                    >
                      Like {comment.likes > 0 && `(${comment.likes})`}
                    </button>
                    <span>•</span>
                    <button className="hover:underline cursor-pointer">Reply</button>
                    <span>•</span>
                    <span>{comment.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comment Input Box */}
        {showCommentInput && (
          <form onSubmit={handleCommentSubmit} className="flex items-start gap-2 pt-1">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-[#CED0D4] shrink-0 mt-0.5"
            />
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={`Write a comment as ${currentUser.name.split(' ')[0]}...`}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full bg-[#F0F2F5] text-xs text-[#050505] placeholder-[#65676B] px-3 py-2 pr-10 rounded-full border border-transparent focus:bg-white focus:border-[#1877F2] focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className={`absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center ${
                  commentText.trim()
                    ? 'text-[#1877F2] hover:bg-[#E7F3FF]'
                    : 'text-[#CED0D4] cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </article>
  );
};
