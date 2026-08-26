import React, { useState } from 'react';
import {
  Store,
  Plus,
  Search,
  Tag,
  MapPin,
  MessageCircle,
  CheckCircle2,
  X,
  Sparkles,
  Filter,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { MarketplaceItem } from '../../types';

const CATEGORIES = [
  'All',
  'Textbooks',
  'Calculators & Tech',
  'Lab Coats & Safety',
  'Sports & PE Gear',
  'Dorm Essentials',
  'Uniform & Blazers',
  'Art & Music',
  'Other'
];

export const MarketplaceView: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    marketplaceItems,
    addMarketplaceItem,
    openChatWithUser,
    marketplaceFilterCategory,
    setMarketplaceFilterCategory
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [selectedItemDetail, setSelectedItemDetail] = useState<MarketplaceItem | null>(null);

  // Form states for selling
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('0');
  const [isFreeOrBorrow, setIsFreeOrBorrow] = useState(false);
  const [category, setCategory] = useState<MarketplaceItem['category']>('Textbooks');
  const [condition, setCondition] = useState<MarketplaceItem['condition']>('Like New');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Kenya Dorms / Quad');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80');

  // Filter items
  const filteredItems = marketplaceItems.filter((item) => {
    const matchesCat =
      marketplaceFilterCategory === 'All' || item.category === marketplaceFilterCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addMarketplaceItem({
      title: title.trim(),
      price: isFreeOrBorrow ? 0 : parseFloat(price) || 0,
      isFreeOrBorrow,
      category,
      condition,
      description: description.trim(),
      location: location.trim(),
      images: [imageUrl.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80']
    });

    setIsSellModalOpen(false);
    setTitle('');
    setPrice('0');
    setDescription('');
  };

  const handleContactSeller = (item: MarketplaceItem) => {
    openChatWithUser(item.seller);
    setSelectedItemDetail(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-4 px-2 sm:px-4 select-none space-y-6">
      {/* Header & Action Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-[#CED0D4] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Store className="w-6 h-6 text-[#1877F2]" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#050505]">
              MFA Campus Marketplace & Exchange
            </h1>
          </div>
          <p className="text-xs text-[#65676B] mt-0.5">
            Buy, sell, or borrow academic materials, calculators, rugby gear, and dorm items within the academy.
          </p>
        </div>

        <button
          onClick={() => setIsSellModalOpen(true)}
          className="bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create New Listing</span>
        </button>
      </div>

      {/* Search & Category Filter Pills */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#65676B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search calculators, revision textbooks, lab coats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white text-xs text-[#050505] pl-9 pr-4 py-2.5 rounded-xl border border-[#CED0D4] focus:outline-hidden focus:border-[#1877F2] shadow-xs"
          />
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setMarketplaceFilterCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                marketplaceFilterCategory === cat
                  ? 'bg-[#1877F2] text-white shadow-xs'
                  : 'bg-white text-[#65676B] border border-[#CED0D4] hover:bg-[#F0F2F5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Marketplace Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItemDetail(item)}
            className="bg-white rounded-2xl shadow-xs border border-[#CED0D4] overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            {/* Image Box */}
            <div className="relative h-48 bg-neutral-100 overflow-hidden">
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/70 text-white backdrop-blur-xs">
                {item.condition}
              </span>
              {item.isFreeOrBorrow && (
                <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#00A884] text-white shadow-xs">
                  FREE / BORROW
                </span>
              )}
            </div>

            {/* Info Box */}
            <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
              <div>
                <div className="text-base font-extrabold text-[#050505]">
                  {item.isFreeOrBorrow ? (
                    <span className="text-[#00A884]">Free</span>
                  ) : (
                    <span>KSh {item.price.toLocaleString()}</span>
                  )}
                </div>
                <h3 className="font-semibold text-xs text-[#050505] line-clamp-2 mt-0.5">
                  {item.title}
                </h3>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#E4E6EB] text-[11px] text-[#65676B]">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3 h-3 text-[#FA383E] shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-medium text-[#1877F2] truncate">
                    {item.seller.name}
                  </span>
                  <span>{item.timestamp}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Item Detail Modal */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#CED0D4] max-h-[90vh] flex flex-col md:flex-row">
            {/* Image Preview */}
            <div className="md:w-1/2 h-64 md:h-auto bg-neutral-900 relative">
              <img
                src={selectedItemDetail.images[0]}
                alt={selectedItemDetail.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="md:w-1/2 p-5 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#1877F2] bg-[#E7F3FF] px-2.5 py-0.5 rounded-full">
                    {selectedItemDetail.category}
                  </span>
                  <button
                    onClick={() => setSelectedItemDetail(null)}
                    className="w-7 h-7 rounded-full bg-[#E4E6EB] flex items-center justify-center text-[#65676B]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <h2 className="text-lg font-black text-[#050505] leading-snug mb-1">
                  {selectedItemDetail.title}
                </h2>

                <div className="text-xl font-extrabold text-[#1877F2] mb-3">
                  {selectedItemDetail.isFreeOrBorrow
                    ? 'FREE TO BORROW'
                    : `KSh ${selectedItemDetail.price.toLocaleString()}`}
                </div>

                <div className="space-y-2 text-xs text-[#050505] mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Condition:</span>
                    <span>{selectedItemDetail.condition}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Location:</span>
                    <span>📍 {selectedItemDetail.location}</span>
                  </div>
                </div>

                <div className="border-t border-[#CED0D4] pt-2 mb-4">
                  <h4 className="font-bold text-xs text-[#050505] mb-1">Description</h4>
                  <p className="text-xs text-[#65676B] leading-relaxed whitespace-pre-line">
                    {selectedItemDetail.description}
                  </p>
                </div>

                {/* Seller Card */}
                <div className="flex items-center gap-3 p-2.5 bg-[#F0F2F5] rounded-xl mb-4">
                  <img
                    src={selectedItemDetail.seller.avatar}
                    alt={selectedItemDetail.seller.name}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <div>
                    <div className="font-bold text-xs text-[#050505]">
                      {selectedItemDetail.seller.name}
                    </div>
                    <div className="text-[11px] text-[#65676B]">
                      {selectedItemDetail.seller.house} House • {selectedItemDetail.seller.role}
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Seller CTA */}
              <button
                onClick={() => handleContactSeller(selectedItemDetail)}
                className="w-full py-2.5 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message Seller on MFA Messenger</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Listing Modal */}
      {isSellModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#CED0D4] max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#CED0D4]">
              <span className="font-extrabold text-base text-[#050505]">
                List Item on MFA Campus Store
              </span>
              <button
                onClick={() => setIsSellModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#E4E6EB] flex items-center justify-center text-[#65676B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSellSubmit} className="p-4 overflow-y-auto space-y-3.5 flex-1">
              <div>
                <label className="block text-xs font-semibold text-[#050505] mb-1">
                  Item Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Oxford IB Physics HL Course Book, Casio Calculator..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#F0F2F5] text-xs px-3 py-2 rounded-xl border focus:border-[#1877F2] focus:bg-white focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#050505] mb-1">
                    Price (KSh)
                  </label>
                  <input
                    type="number"
                    disabled={isFreeOrBorrow}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-[#F0F2F5] text-xs px-3 py-2 rounded-xl border focus:border-[#1877F2] focus:bg-white focus:outline-hidden disabled:opacity-50"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#050505] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFreeOrBorrow}
                      onChange={(e) => setIsFreeOrBorrow(e.target.checked)}
                      className="rounded-sm text-[#1877F2]"
                    />
                    <span>Free to borrow / take</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#050505] mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#F0F2F5] text-xs px-3 py-2 rounded-xl border focus:outline-hidden"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#050505] mb-1">
                    Condition
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full bg-[#F0F2F5] text-xs px-3 py-2 rounded-xl border focus:outline-hidden"
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#050505] mb-1">
                  Pickup Location on Campus
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kenya Dormitory Room 14, Uongozi Hub, Science Lab"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#F0F2F5] text-xs px-3 py-2 rounded-xl border focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#050505] mb-1">
                  Photo URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-[#F0F2F5] text-xs px-3 py-2 rounded-xl border focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#050505] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide details on condition, edition, or notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#F0F2F5] text-xs px-3 py-2 rounded-xl border focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSellModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#65676B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1877F2] text-white font-bold text-xs rounded-xl hover:bg-[#166fe5]"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
