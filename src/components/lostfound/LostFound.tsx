import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, PackageSearch, Plus, Search, ShieldCheck, MapPin, Clock3, MessageCircle, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { LostFoundItem } from '../../types';
import { apiFetch } from '../../utils/api';

export const LostFound: React.FC = () => {
  const { currentUser, allAcademyUsers } = useAuth();
  const { openChatWithUser } = useApp();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [kind, setKind] = useState<'lost' | 'found'>('lost');
  const [item, setItem] = useState('');
  const [details, setDetails] = useState('');
  const [location, setLocation] = useState('');
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const loadItems = async () => {
    try {
      const response = await apiFetch('/api/lost-found');
      if (!response.ok) throw new Error('load failed');
      const data = await response.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadItems(); }, []);

  const visible = useMemo(
    () => items.filter((entry) => !entry.resolved && (filter === 'all' || entry.kind === filter)),
    [items, filter]
  );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!item.trim()) return;
    try {
      setPosting(true);
      const response = await apiFetch('/api/lost-found', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind, item, details, location,
          reporterId: currentUser.id,
          reporterName: currentUser.name,
          reporterAvatar: currentUser.avatar
        })
      });
      if (!response.ok) throw new Error('post failed');
      const data = await response.json();
      setItems((prev) => [data.item, ...prev]);
      setItem('');
      setDetails('');
      setLocation('');
    } catch {
      window.alert('Could not post this right now. Please check your connection and try again.');
    } finally {
      setPosting(false);
    }
  };

  const resolve = async (entry: LostFoundItem) => {
    const response = await apiFetch(`/api/lost-found/${entry.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reporterId: currentUser.id, resolved: true })
    });
    if (response.ok) setItems((prev) => prev.map((item) => item.id === entry.id ? { ...item, resolved: true } : item));
  };

  const contact = (entry: LostFoundItem) => {
    const user = allAcademyUsers.find((candidate) => candidate.id === entry.reporterId);
    if (user) openChatWithUser(user);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-5 py-5">
      <section className="rounded-3xl overflow-hidden border border-[#D4AF37] shadow-sm bg-white">
        <div className="bg-gradient-to-r from-[#07111F] via-[#102A43] to-[#D4AF37] p-6 sm:p-8 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center"><PackageSearch className="w-7 h-7" /></div>
            <div>
              <h1 className="text-2xl font-black">Lost & Found</h1>
              <p className="text-sm text-white/80 mt-1">Lost something? Report it. Found something? Tell the Grade 10 network.</p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="p-5 sm:p-6 space-y-4 border-b border-[#E4E6EB]">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setKind('lost')} className={`px-4 py-2 rounded-full text-xs font-black ${kind === 'lost' ? 'bg-[#FEE2E2] text-[#991B1B]' : 'bg-[#F0F2F5] text-[#65676B]'}`}>I Lost Something</button>
            <button type="button" onClick={() => setKind('found')} className={`px-4 py-2 rounded-full text-xs font-black ${kind === 'found' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#F0F2F5] text-[#65676B]'}`}>I Found Something</button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <input required value={item} onChange={(e) => setItem(e.target.value)} placeholder="What did you lose/find? e.g. black calculator" className="w-full bg-[#F8FAFC] border border-[#E4E6EB] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]" />
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Where? e.g. Science block" className="w-full bg-[#F8FAFC] border border-[#E4E6EB] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]" />
          </div>
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} placeholder="Optional details: colour, markings, approximate time, or anything that helps identify it." className="w-full bg-[#F8FAFC] border border-[#E4E6EB] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]" />
          <button disabled={posting} className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#07111F] font-black text-sm flex items-center gap-2 disabled:opacity-50"><Plus className="w-4 h-4" /> {posting ? 'Posting…' : 'Post to Lost & Found'}</button>
        </form>

        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-black text-lg">Current reports</h2>
              <p className="text-xs text-[#65676B]">Only active reports are shown.</p>
            </div>
            <div className="flex gap-1 bg-[#F0F2F5] p-1 rounded-xl">
              {(['all','lost','found'] as const).map((value) => (
                <button key={value} onClick={() => setFilter(value)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold capitalize ${filter === value ? 'bg-white shadow-sm text-[#8A6800]' : 'text-[#65676B]'}`}>{value}</button>
              ))}
            </div>
          </div>

          {loading ? <div className="py-10 text-center text-xs text-[#65676B]">Loading reports…</div> :
           visible.length === 0 ? <div className="py-12 text-center border border-dashed border-[#D4AF37] rounded-2xl"><PackageSearch className="w-8 h-8 mx-auto text-[#D4AF37]" /><p className="font-bold text-sm mt-2">No active reports</p><p className="text-xs text-[#65676B] mt-1">This space is ready for the next lost or found item.</p></div> :
           <div className="grid md:grid-cols-2 gap-3">
             {visible.map((entry) => {
               const mine = entry.reporterId === currentUser.id;
               return <article key={entry.id} className="rounded-2xl border border-[#E4E6EB] p-4 bg-white">
                 <div className="flex items-start justify-between gap-3">
                   <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${entry.kind === 'lost' ? 'bg-[#FEE2E2] text-[#991B1B]' : 'bg-[#DCFCE7] text-[#166534]'}`}>{entry.kind}</span>
                   <span className="text-[10px] text-[#65676B] flex items-center gap-1"><Clock3 className="w-3 h-3" /> {new Date(entry.timestamp).toLocaleString()}</span>
                 </div>
                 <h3 className="font-black text-base mt-3">{entry.item}</h3>
                 {entry.details && <p className="text-xs text-[#65676B] mt-1 leading-relaxed">{entry.details}</p>}
                 {entry.location && <p className="text-xs text-[#65676B] mt-2 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {entry.location}</p>}
                 <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#E4E6EB]">
                   {entry.reporterAvatar ? <img src={entry.reporterAvatar} alt="" className="w-8 h-8 rounded-full object-cover border border-[#D4AF37]" /> : <div className="w-8 h-8 rounded-full bg-[#07111F]" />}
                   <div className="min-w-0 flex-1"><div className="text-xs font-bold truncate">{entry.reporterName}</div><div className="text-[10px] text-[#65676B]">Grade 10 learner</div></div>
                   {mine ? <button onClick={() => void resolve(entry)} className="px-3 py-1.5 rounded-lg bg-[#DCFCE7] text-[#166534] text-[10px] font-black flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Resolved</button> :
                    <button onClick={() => contact(entry)} className="px-3 py-1.5 rounded-lg bg-[#E7F3FF] text-[#1877F2] text-[10px] font-black flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> Contact</button>}
                 </div>
               </article>;
             })}
           </div>}
        </div>

        <div className="px-5 pb-5 text-[10px] text-[#65676B] flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-[#8A6800]" /> For safety, do not post passwords, private keys, or sensitive personal information.</div>
      </section>
    </div>
  );
};
