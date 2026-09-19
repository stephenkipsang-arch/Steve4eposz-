import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  MapPin,
  Clock,
  CheckCircle2,
  Users,
  Check,
  Star,
  Share2,
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { CampusEvent } from '../../types';

const EVENT_CATEGORIES = [
  'All',
  'Sports & Interhouse',
  'Academic & Learning',
  'Arts & Culture',
  'Leadership (VEXPEX)',
  'Clubs & Hackathons'
];

export const EventsView: React.FC = () => {
  const { currentUser } = useAuth();
  const { events, addCampusEvent, toggleEventRsvp } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('Saturday, September 26, 2026');
  const [time, setTime] = useState('2:00 PM - 5:30 PM');
  const [venue, setVenue] = useState('Uongozi Leadership Auditorium');
  const [category, setCategory] = useState<CampusEvent['category']>('Leadership (VEXPEX)');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80');

  const filteredEvents = events.filter(
    (ev) => selectedCategory === 'All' || ev.category === selectedCategory
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addCampusEvent({
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      venue,
      category,
      coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80'
    });

    setIsCreateModalOpen(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 px-2 sm:px-4 select-none space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#CED0D4] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#1877F2]" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#050505]">
              MFA Events & Campus Calendar
            </h1>
          </div>
          <p className="text-xs text-[#65676B] mt-0.5">
            Inter-house galas, Grade 10 learning showcases, orchestral performances, and VEXPEX townhalls.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Host Campus Event</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {EVENT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#1877F2] text-white shadow-xs'
                : 'bg-white text-[#65676B] border border-[#CED0D4] hover:bg-[#F0F2F5]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-2xl shadow-xs border border-[#CED0D4] overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            {/* Event Cover Photo */}
            <div className="relative h-48 bg-neutral-800">
              <img
                src={event.coverImage}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-lg bg-black/70 text-white backdrop-blur-xs">
                {event.category}
              </span>
            </div>

            {/* Event Info */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#1877F2] mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{event.date} • {event.time}</span>
                </div>

                <h3 className="font-extrabold text-base text-[#050505] leading-snug">
                  {event.title}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-[#65676B] mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FA383E] shrink-0" />
                  <span className="truncate">{event.venue}</span>
                </div>

                <p className="text-xs text-[#65676B] leading-relaxed mt-2 line-clamp-2">
                  {event.description}
                </p>
              </div>

              {/* Attendees & Actions */}
              <div className="border-t border-[#E4E6EB] pt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-[#65676B] font-semibold">
                  <Users className="w-3.5 h-3.5 text-[#1877F2]" />
                  <span>{event.attendeesCount} scholars attending</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleEventRsvp(event.id, 'going')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                      event.isUserRsvp === 'going'
                        ? 'bg-[#E7F3FF] text-[#1877F2] border border-[#BEDDFF]'
                        : 'bg-[#F0F2F5] text-[#050505] hover:bg-[#E4E6EB]'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{event.isUserRsvp === 'going' ? 'Going' : 'Attend'}</span>
                  </button>

                  <button
                    onClick={() => toggleEventRsvp(event.id, 'interested')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                      event.isUserRsvp === 'interested'
                        ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                        : 'bg-[#F0F2F5] text-[#050505] hover:bg-[#E4E6EB]'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>Interested</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Host Event Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#CED0D4] max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#CED0D4]">
              <span className="font-extrabold text-base text-[#050505]">
                Host Academy Event
              </span>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#E4E6EB] flex items-center justify-center text-[#65676B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-4 overflow-y-auto space-y-3.5 flex-1">
              <div>
                <label className="block text-xs font-semibold text-[#050505] mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Inter-House Debate Derby, STEM Innovation Fair..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#F0F2F5] text-xs px-3 py-2 rounded-xl border focus:border-[#1877F2] focus:bg-white focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#050505] mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#F0F2F5] text-xs px-3 py-2 rounded-xl border focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#050505] mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-[#F0F2F5] text-xs px-3 py-2 rounded-xl border focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#050505] mb-1">
                    Venue on Campus
                  </label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full bg-[#F0F2F5] text-xs px-3 py-2 rounded-xl border focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#050505] mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#F0F2F5] text-xs px-3 py-2 rounded-xl border focus:outline-hidden"
                  >
                    {EVENT_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#050505] mb-1">
                  Event Cover Image URL
                </label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full bg-[#F0F2F5] text-xs px-3 py-2 rounded-xl border focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#050505] mb-1">
                  Description & Itinerary
                </label>
                <textarea
                  rows={3}
                  placeholder="Outline the schedule, speaker details, or inter-house rules..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#F0F2F5] text-xs px-3 py-2 rounded-xl border focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#65676B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1877F2] text-white font-bold text-xs rounded-xl hover:bg-[#166fe5]"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
