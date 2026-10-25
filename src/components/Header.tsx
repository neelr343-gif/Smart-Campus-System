import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Calendar, 
  MapPin, 
  Bell, 
  Sparkles, 
  BookOpen, 
  ShieldAlert, 
  CreditCard,
  Radio,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { CampusTab, StudentProfile } from '../types/campus.ts';

interface HeaderProps {
  activeTab: CampusTab;
  setActiveTab: (tab: CampusTab) => void;
  student: StudentProfile;
  onOpenIdCard: () => void;
  onOpenEmergency: () => void;
  unreadNoticesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  student,
  onOpenIdCard,
  onOpenEmergency,
  unreadNoticesCount,
}) => {
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileDrawerOpen) {
        setMobileDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileDrawerOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileDrawerOpen]);

  const navItems: { id: CampusTab; label: string; shortLabel: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'visual-ai',
      label: 'Visual AI Studio',
      shortLabel: 'AI Studio',
      icon: <Camera className="w-4 h-4 shrink-0" />,
      desc: 'Multimodal image solver & campus scanner',
    },
    {
      id: 'schedule',
      label: 'Schedule & Classes',
      shortLabel: 'Schedule',
      icon: <Calendar className="w-4 h-4 shrink-0" />,
      desc: 'Timetable, attendance & assignment tracker',
    },
    {
      id: 'spaces',
      label: 'Campus Spaces',
      shortLabel: 'Campus Map',
      icon: <MapPin className="w-4 h-4 shrink-0" />,
      desc: 'Live occupancy & desk reservation',
    },
    {
      id: 'buzz',
      label: 'Notices & Feed',
      shortLabel: 'Notices',
      icon: <Bell className="w-4 h-4 shrink-0" />,
      desc: 'Official broadcasts & lost & found',
    },
    {
      id: 'planner',
      label: 'Academics & CGPA',
      shortLabel: 'Academics',
      icon: <BookOpen className="w-4 h-4 shrink-0" />,
      desc: 'Grade target calculator & syllabus',
    },
  ];

  const handleTabSelect = (tab: CampusTab) => {
    setActiveTab(tab);
    setMobileDrawerOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 text-white selection:bg-indigo-500/30">
        {/* Top Mini Ticker: System Status, Live Time & SOS */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950/70 to-slate-950 border-b border-indigo-900/30 px-3 sm:px-6 py-1 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            {/* Live Status indicator */}
            <div className="flex items-center space-x-2 min-w-0">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="inline-flex items-center gap-1 uppercase tracking-wider text-[10px] font-bold text-emerald-400 shrink-0">
                <Radio className="w-3 h-3 animate-pulse" /> Live Campus
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="hidden md:inline text-slate-300 text-[11px] truncate">
                Institute of Advanced Research, Gandhinagar • Portal Active • Mid-term seating published
              </span>
            </div>

            {/* Time, Date & Emergency SOS */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 text-slate-400 font-mono text-[11px]">
              <span className="hidden sm:inline text-slate-300 font-sans">{dateStr}</span>
              <span className="bg-slate-800/90 px-2 py-0.5 rounded text-indigo-300 font-semibold border border-slate-700/80">
                {time}
              </span>
              <button
                onClick={onOpenEmergency}
                className="flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded text-[11px] font-bold transition active:scale-95"
                title="Emergency SOS & Helpline"
                aria-label="Campus Emergency SOS"
              >
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                <span>SOS</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Navbar - Top Bar Contract: 3 Zones (Brand, Nav, Identity/Actions) */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
            
            {/* ZONE 1: Brand & College Name */}
            <div 
              className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer shrink-0 select-none group"
              onClick={() => handleTabSelect('visual-ai')}
              role="button"
              tabIndex={0}
              title="Return to IAR SmartCampus System Home"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-600/30 border border-indigo-400/40 group-hover:scale-105 transition-transform shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                    IAR SmartCampus System
                  </span>
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                    Gandhinagar
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate max-w-[220px] sm:max-w-[320px] hidden sm:block">
                  Institute of Advanced Research
                </p>
              </div>
            </div>

            {/* ZONE 2: Clean, Single-Line Desktop Navigation Links (Responsive lg+) */}
            <nav className="hidden lg:flex items-center space-x-1 shrink-0" aria-label="Main Navigation">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabSelect(item.id)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all select-none ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40 ring-1 ring-indigo-400/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80 active:bg-slate-800'
                    }`}
                  >
                    {item.icon}
                    <span>{item.shortLabel}</span>
                    {item.id === 'buzz' && unreadNoticesCount > 0 && (
                      <span className="flex h-2 w-2 relative ml-0.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* ZONE 3: Actions & Student Identity Profile */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              {/* Quick AI Scan Shortcut (Desktop / Tablet) */}
              <button
                onClick={() => handleTabSelect('visual-ai')}
                className="hidden md:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-sm border border-violet-400/30 transition-all active:scale-95"
                title="Open Multimodal Visual AI Scanner"
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Scan Anything</span>
                <span className="xl:hidden">Scan</span>
              </button>

              {/* Student Identity Chip (Neel Rana - IAR/15454) */}
              <button
                onClick={onOpenIdCard}
                className="flex items-center gap-2 p-1 sm:p-1.5 sm:pr-3 rounded-full bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 text-left transition-all group active:scale-95 shrink-0"
                title={`Student Profile: ${student.name} (${student.rollNumber}) • Click to view Digital ID Card`}
                aria-label="View Student Digital ID"
              >
                <div className="relative">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-indigo-500/50 group-hover:ring-indigo-400"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                </div>
                <div className="hidden sm:block text-left">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-semibold text-white group-hover:text-indigo-300 transition leading-tight truncate max-w-[90px] md:max-w-[120px]">
                      {student.name}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight font-mono">
                    {student.rollNumber}
                  </p>
                </div>
                <CreditCard className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition hidden sm:inline ml-0.5" />
              </button>

              {/* Mobile / Tablet Menu Button (Toggles Drawer) */}
              <button
                onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
                className="lg:hidden p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition active:scale-95"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileDrawerOpen}
              >
                {mobileDrawerOpen ? (
                  <X className="w-5 h-5 text-indigo-400" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* MOBILE & TABLET SLIDE-OVER NAVIGATION DRAWER */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <div className="relative ml-auto w-full max-w-sm bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full z-10 overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10 backdrop-blur">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  IAR
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">IAR SmartCampus System</h3>
                  <p className="text-[10px] text-slate-400">Gandhinagar, Gujarat</p>
                </div>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student ID Card Snapshot in Drawer */}
            <div className="p-4 bg-gradient-to-br from-indigo-950/60 to-slate-900 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500 shadow-md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-white truncate">{student.name}</h4>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-indigo-300 font-mono">{student.rollNumber}</p>
                  <p className="text-[11px] text-slate-400 truncate">Sem {student.semester} • {student.department}</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">CGPA</span>
                  <span className="font-bold text-indigo-300">{student.cgpa} / 10.0</span>
                </div>
                <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">College</span>
                  <span className="font-semibold text-slate-300 text-[10px] truncate block">IAR Gandhinagar</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onOpenIdCard();
                }}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>View Full Digital ID Card</span>
              </button>
            </div>

            {/* Navigation List */}
            <div className="p-3 space-y-1 flex-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Campus Modules
              </div>
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabSelect(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition ${
                      isActive
                        ? 'bg-indigo-600/90 text-white shadow-md'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-slate-800 text-indigo-400'}`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-sm font-semibold flex items-center gap-2">
                          <span>{item.label}</span>
                          {item.id === 'buzz' && unreadNoticesCount > 0 && (
                            <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full font-bold">
                              {unreadNoticesCount} new
                            </span>
                          )}
                        </div>
                        <p className={`text-xs ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  </button>
                );
              })}
            </div>

            {/* Quick Actions & Emergency at Drawer Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-2">
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onOpenEmergency();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Campus Emergency SOS & Medical</span>
              </button>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Gemini AI Vision Active
                </span>
                <span className="font-mono text-slate-400">{time}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR (Android & iPhone optimized thumb bar) */}
      <nav 
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-1 pb-[env(safe-area-inset-bottom,0px)] shadow-2xl"
        aria-label="Mobile Bottom Navigation"
      >
        <div className="grid grid-cols-5 h-14 items-center">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabSelect(item.id)}
                className={`relative flex flex-col items-center justify-center h-full py-1 px-1 transition-all select-none touch-manipulation active:scale-95 ${
                  isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                }`}
                aria-selected={isActive}
              >
                <div className="relative">
                  <div className={`p-1 rounded-lg transition-transform ${isActive ? 'scale-110' : ''}`}>
                    {item.icon}
                  </div>
                  {item.id === 'buzz' && unreadNoticesCount > 0 && (
                    <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-900" />
                  )}
                </div>
                <span className={`text-[10px] font-semibold tracking-tight transition-colors ${
                  isActive ? 'text-indigo-300 font-bold' : 'text-slate-400'
                }`}>
                  {item.shortLabel}
                </span>
                {isActive && (
                  <span className="absolute top-0 w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
