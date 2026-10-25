import React, { useState } from 'react';
import {
  Bell,
  Search,
  Plus,
  Tag,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  ShoppingBag,
  ShieldCheck,
  Send,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Filter
} from 'lucide-react';
import { CampusNotice, LostFoundPost, StudentProfile } from '../types/campus.ts';

interface CampusBuzzProps {
  notices: CampusNotice[];
  lostFound: LostFoundPost[];
  student: StudentProfile;
  onMarkNoticeRead: (id: string) => void;
  onAddLostFound: (item: LostFoundPost) => void;
}

export const CampusBuzz: React.FC<CampusBuzzProps> = ({
  notices,
  lostFound,
  student,
  onMarkNoticeRead,
  onAddLostFound,
}) => {
  const [subTab, setSubTab] = useState<'notices' | 'lostfound' | 'study_groups' | 'market'>('notices');
  const [noticeFilter, setNoticeFilter] = useState<string>('all');
  const [lfTypeFilter, setLfTypeFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddLostFound, setShowAddLostFound] = useState<boolean>(false);

  // New Lost/Found Form State
  const [newTitle, setNewTitle] = useState<string>('');
  const [newType, setNewType] = useState<'lost' | 'found'>('found');
  const [newCategory, setNewCategory] = useState<LostFoundPost['category']>('electronics');
  const [newLocation, setNewLocation] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newImageUrl, setNewImageUrl] = useState<string>('');

  // Mock study groups
  const [studyGroups, setStudyGroups] = useState([
    {
      id: 'sg-1',
      subject: 'Distributed Systems & Cloud (CS-301)',
      topic: 'Raft consensus algorithm walkthrough & Midterm mock questions',
      time: 'Today, 5:30 PM',
      location: 'Library Group Room 4B',
      membersCount: 6,
      maxMembers: 8,
      organizer: 'Sarah Jenkins',
      joined: false,
    },
    {
      id: 'sg-2',
      subject: 'Compiler Design & Lex/Yacc (CS-303)',
      topic: 'LR(1) DFA table creation & AST code generation',
      time: 'Tomorrow, 4:00 PM',
      location: 'Student Hub Terrace',
      membersCount: 4,
      maxMembers: 6,
      organizer: 'Liam Nguyen',
      joined: true,
    },
    {
      id: 'sg-3',
      subject: 'Advanced Probability & Statistics (MATH-305)',
      topic: 'Markov Chains & Poisson processes practice test',
      time: 'Thursday, 6:00 PM',
      location: 'Math Department Lounge',
      membersCount: 7,
      maxMembers: 10,
      organizer: 'Ananya Sharma',
      joined: false,
    },
  ]);

  // Mock marketplace items
  const marketplaceItems = [
    {
      id: 'm-1',
      title: 'Operating System Concepts (Silberschatz - 10th Ed)',
      price: '$25',
      originalPrice: '$80',
      condition: 'Like New (Minimal highlighting)',
      seller: 'Priya K. (Final Year)',
      tag: 'Textbook',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'm-2',
      title: 'Arduino Mega 2560 + Complete IoT Sensor Starter Kit',
      price: '$35',
      originalPrice: '$65',
      condition: 'Good working condition with breadboard',
      seller: 'Dave C. (EE Dept)',
      tag: 'Hardware',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'm-3',
      title: 'Mini Dorm Refrigerator (1.6 Cu Ft - Energy Star)',
      price: '$50',
      originalPrice: '$130',
      condition: 'Used 1 Semester (Hostel Block C)',
      seller: 'Kevin O.',
      tag: 'Dorm Gear',
      image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const handleCreateLostFound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const post: LostFoundPost = {
      id: `lf-user-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      type: newType,
      location: newLocation.trim() || 'Central Campus',
      date: 'Just now',
      description: newDescription.trim() || 'No additional details provided.',
      imageUrl: newImageUrl.trim() || undefined,
      status: 'open',
      reportedBy: `${student.name} (${student.rollNumber})`,
      contactEmail: student.email,
      aiVerified: false,
    };

    onAddLostFound(post);
    setNewTitle('');
    setNewLocation('');
    setNewDescription('');
    setNewImageUrl('');
    setShowAddLostFound(false);
  };

  const handleToggleJoinGroup = (groupId: string) => {
    setStudyGroups(studyGroups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          joined: !g.joined,
          membersCount: g.joined ? g.membersCount - 1 : g.membersCount + 1,
        };
      }
      return g;
    }));
  };

  const filteredNotices = notices.filter(n => {
    if (noticeFilter !== 'all' && n.category !== noticeFilter) return false;
    if (searchQuery.trim() && !n.title.toLowerCase().includes(searchQuery.toLowerCase()) && !n.summary.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const filteredLostFound = lostFound.filter(item => {
    if (lfTypeFilter !== 'all' && item.type !== lfTypeFilter) return false;
    if (searchQuery.trim() && !item.title.toLowerCase().includes(searchQuery.toLowerCase()) && !item.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Navigation Sub-Tabs */}
      <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar gap-1">
        <button
          onClick={() => setSubTab('notices')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            subTab === 'notices'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Official Circulars & Notices</span>
        </button>

        <button
          onClick={() => setSubTab('lostfound')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            subTab === 'lostfound'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Lost & Found Registry</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-indigo-300">
            {lostFound.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('study_groups')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            subTab === 'study_groups'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Peer Study Groups</span>
        </button>

        <button
          onClick={() => setSubTab('market')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            subTab === 'market'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Peer Student Bazaar</span>
        </button>
      </div>

      {/* Subtab 1: Official Notices */}
      {subTab === 'notices' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search circulars, exams, hackathons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All' },
                { id: 'exams', label: 'Exams' },
                { id: 'events', label: 'Fests & Hacks' },
                { id: 'academic', label: 'Academic' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setNoticeFilter(f.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    noticeFilter === f.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredNotices.map(notice => (
              <div
                key={notice.id}
                className={`p-5 rounded-2xl border transition space-y-3 ${
                  notice.read
                    ? 'bg-slate-900/60 border-slate-800/80'
                    : 'bg-slate-900 border-indigo-900/60 shadow-lg'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      notice.priority === 'urgent'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : notice.priority === 'important'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {notice.priority}
                    </span>
                    <span className="text-xs font-mono text-indigo-300">{notice.department}</span>
                    <span className="text-xs text-slate-500">• {notice.date}</span>
                  </div>

                  {!notice.read && (
                    <button
                      onClick={() => onMarkNoticeRead(notice.id)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold self-start sm:self-auto"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{notice.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notice.content}</p>
                </div>

                {notice.attachmentName && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-indigo-300 w-fit">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>{notice.attachmentName}</span>
                    <span className="text-[10px] text-slate-500">(Verified Official PDF)</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 2: Lost & Found */}
      {subTab === 'lostfound' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                {(['all', 'lost', 'found'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setLfTypeFilter(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition ${
                      lfTypeFilter === t
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-400 hidden sm:inline">
                Verified with AI Vision Classifier
              </span>
            </div>

            <button
              onClick={() => setShowAddLostFound(!showAddLostFound)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Report Lost / Found Item</span>
            </button>
          </div>

          {/* Add form */}
          {showAddLostFound && (
            <form onSubmit={handleCreateLostFound} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <h4 className="text-sm font-bold text-white">Create Campus Property Notice</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Item Title (e.g. Casio fx-991 Calculator with blue sticker)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="found">I Found Something</option>
                  <option value="lost">I Lost Something</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Where was it found / last seen?"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Image URL (optional)"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <textarea
                placeholder="Description, distinctive markings, serial cues..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddLostFound(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLostFound.map(item => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg p-4 flex gap-4"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-24 h-24 rounded-xl object-cover shrink-0 bg-slate-950"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 text-slate-600">
                    <Search className="w-8 h-8" />
                  </div>
                )}

                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      item.type === 'found'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {item.type}
                    </span>
                    {item.aiVerified && (
                      <span className="text-[10px] font-semibold text-indigo-300 flex items-center gap-0.5">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        AI Verified
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 ml-auto">{item.date}</span>
                  </div>

                  <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                    <span>📍 {item.location}</span>
                    <a
                      href={`mailto:${item.contactEmail}?subject=Claiming ${item.title}`}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      Contact Claim
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 3: Peer Study Groups */}
      {subTab === 'study_groups' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Active Peer Study Circles & Exam Cram Sessions</h3>
              <p className="text-xs text-slate-400">Join fellow classmates for problem solving, lab assignments, and revision.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {studyGroups.map(group => (
              <div
                key={group.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {group.subject}
                  </span>
                  <h4 className="text-sm font-bold text-white">{group.topic}</h4>
                  <div className="text-xs text-slate-400 space-y-1 pt-1">
                    <p>🕒 {group.time}</p>
                    <p>📍 {group.location}</p>
                    <p>👤 Hosted by {group.organizer}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <span className="text-xs text-slate-400 font-mono">
                    {group.membersCount} / {group.maxMembers} students
                  </span>
                  <button
                    onClick={() => handleToggleJoinGroup(group.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      group.joined
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {group.joined ? 'Attending' : 'Join Circle'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 4: Marketplace */}
      {subTab === 'market' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Peer-to-Peer Student Exchange</h3>
              <p className="text-xs text-slate-400">Verified seniors and classmates selling books, kits, and dorm essentials.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {marketplaceItems.map(item => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg group flex flex-col justify-between"
              >
                <div className="h-40 bg-slate-950 overflow-hidden relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-2.5 right-2.5 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-bold text-indigo-300 border border-slate-700 backdrop-blur-xs">
                    {item.tag}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-extrabold text-white">{item.price}</span>
                    <span className="text-xs text-slate-500 line-through">{item.originalPrice}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{item.title}</h4>
                  <p className="text-[10px] text-slate-400">{item.condition}</p>
                  <p className="text-[10px] text-slate-500">Seller: {item.seller}</p>

                  <button
                    onClick={() => alert(`Connect with seller: ${item.seller} on campus chat!`)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition mt-2"
                  >
                    Message Seller
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
