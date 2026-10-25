import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { VisualAIHub } from './components/VisualAIHub.tsx';
import { TimetableAttendance } from './components/TimetableAttendance.tsx';
import { CampusSpacesMap } from './components/CampusSpacesMap.tsx';
import { CampusBuzz } from './components/CampusBuzz.tsx';
import { AcademicPlanner } from './components/AcademicPlanner.tsx';
import { StudentIdCardModal } from './components/StudentIdCardModal.tsx';
import { AiTutorModal } from './components/AiTutorModal.tsx';
import {
  initialStudent,
  initialCourses,
  initialTimetable,
  initialFacilities,
  initialNotices,
  initialLostFound,
  initialAssignments,
} from './data/mockCampusData.ts';
import { CampusTab, LostFoundPost, CampusNotice, Assignment } from './types/campus.ts';
import { Bot, Sparkles, MessageSquare, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<CampusTab>('visual-ai');
  const [student, setStudent] = useState(initialStudent);
  const [courses, setCourses] = useState(initialCourses);
  const [timetable] = useState(initialTimetable);
  const [facilities] = useState(initialFacilities);
  const [notices, setNotices] = useState<CampusNotice[]>(initialNotices);
  const [lostFound, setLostFound] = useState<LostFoundPost[]>(initialLostFound);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);

  // Modals
  const [showIdModal, setShowIdModal] = useState<boolean>(false);
  const [showEmergencyOnly, setShowEmergencyOnly] = useState<boolean>(false);
  const [showAiTutor, setShowAiTutor] = useState<boolean>(false);

  // Save courses, attendance, and student profile in localStorage
  useEffect(() => {
    try {
      const savedStudent = localStorage.getItem('smartcampus_student');
      if (savedStudent) {
        setStudent(JSON.parse(savedStudent));
      }
      const savedCourses = localStorage.getItem('smartcampus_courses');
      if (savedCourses) {
        setCourses(JSON.parse(savedCourses));
      }
      const savedAssignments = localStorage.getItem('smartcampus_assignments');
      if (savedAssignments) {
        setAssignments(JSON.parse(savedAssignments));
      }
      const savedLostFound = localStorage.getItem('smartcampus_lostfound');
      if (savedLostFound) {
        setLostFound(JSON.parse(savedLostFound));
      }
    } catch (e) {
      console.error('Failed to load cached campus state:', e);
    }
  }, []);

  const handleUpdateAttendance = (courseId: string, attendedDelta: number, totalDelta: number) => {
    setCourses((prev) => {
      const updated = prev.map((c) => {
        if (c.id === courseId) {
          const newAttended = Math.max(0, c.attendedClasses + attendedDelta);
          const newTotal = Math.max(newAttended, c.totalClasses + totalDelta);
          return {
            ...c,
            attendedClasses: newAttended,
            totalClasses: newTotal,
          };
        }
        return c;
      });
      try {
        localStorage.setItem('smartcampus_courses', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleToggleAssignment = (assignmentId: string) => {
    setAssignments((prev) => {
      const updated = prev.map((a) => {
        if (a.id === assignmentId) {
          return {
            ...a,
            completed: !a.completed,
            submittedOn: !a.completed ? new Date().toISOString().split('T')[0] : undefined,
          };
        }
        return a;
      });
      try {
        localStorage.setItem('smartcampus_assignments', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleAddAssignment = (newAsg: Omit<Assignment, 'id'>) => {
    const created: Assignment = {
      ...newAsg,
      id: `asg-${Date.now()}`,
    };
    const updated = [created, ...assignments];
    setAssignments(updated);
    try {
      localStorage.setItem('smartcampus_assignments', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddLostFoundItem = (item: LostFoundPost) => {
    const updated = [item, ...lostFound];
    setLostFound(updated);
    try {
      localStorage.setItem('smartcampus_lostfound', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddFacilityNotice = (title: string, summary: string) => {
    const newNotice: CampusNotice = {
      id: `not-fac-${Date.now()}`,
      title,
      department: 'Campus Estates & Maintenance Desk',
      category: 'administrative',
      priority: 'important',
      date: 'Just now',
      summary,
      content: `A maintenance dispatch ticket has been logged and assigned to field technicians: ${summary}`,
      read: false,
    };
    setNotices([newNotice, ...notices]);
  };

  const handleMarkNoticeRead = (id: string) => {
    setNotices(notices.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const unreadNoticesCount = notices.filter((n) => !n.read).length;

  // Keyboard shortcuts for Windows/Linux power users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        return;
      }

      if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        setActiveTab('visual-ai');
      } else if (e.altKey && (e.key === 'i' || e.key === 'I')) {
        e.preventDefault();
        setShowIdModal(true);
      } else if (e.key === '1') {
        setActiveTab('visual-ai');
      } else if (e.key === '2') {
        setActiveTab('schedule');
      } else if (e.key === '3') {
        setActiveTab('spaces');
      } else if (e.key === '4') {
        setActiveTab('buzz');
      } else if (e.key === '5') {
        setActiveTab('planner');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        student={student}
        onOpenIdCard={() => {
          setShowEmergencyOnly(false);
          setShowIdModal(true);
        }}
        onOpenEmergency={() => {
          setShowEmergencyOnly(true);
          setShowIdModal(true);
        }}
        unreadNoticesCount={unreadNoticesCount}
      />

      {/* Main App Content Viewport - pb-20 on mobile prevents overlap with bottom thumb nav */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 pb-24 lg:pb-8">
        {activeTab === 'visual-ai' && (
          <VisualAIHub
            student={student}
            onAddLostFoundItem={handleAddLostFoundItem}
            onAddFacilityNotice={handleAddFacilityNotice}
          />
        )}

        {activeTab === 'schedule' && (
          <TimetableAttendance
            courses={courses}
            timetable={timetable}
            assignments={assignments}
            onUpdateAttendance={handleUpdateAttendance}
            onToggleAssignment={handleToggleAssignment}
            onAddAssignment={handleAddAssignment}
          />
        )}

        {activeTab === 'spaces' && (
          <CampusSpacesMap facilities={facilities} student={student} />
        )}

        {activeTab === 'buzz' && (
          <CampusBuzz
            notices={notices}
            lostFound={lostFound}
            student={student}
            onMarkNoticeRead={handleMarkNoticeRead}
            onAddLostFound={handleAddLostFoundItem}
          />
        )}

        {activeTab === 'planner' && (
          <AcademicPlanner student={student} courses={courses} />
        )}
      </main>

      {/* Floating Campus AI Copilot Trigger Button (lifted on mobile to sit above bottom nav) */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40">
        <button
          onClick={() => setShowAiTutor(!showAiTutor)}
          className="group relative flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-xl shadow-indigo-600/40 border border-indigo-400/30 transition-all hover:scale-105 active:scale-95"
          title="Campus AI Copilot (Powered by Gemini)"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-spin" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900" />
          </div>
          <span className="text-xs font-extrabold tracking-tight hidden sm:inline">
            Campus AI Copilot
          </span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono hidden md:inline">
            Gemini
          </span>
        </button>
      </div>

      {/* Modals */}
      <StudentIdCardModal
        student={student}
        isOpen={showIdModal}
        onClose={() => setShowIdModal(false)}
        showEmergencyOnly={showEmergencyOnly}
        onUpdateStudent={(updated) => {
          setStudent(updated);
          try {
            localStorage.setItem('smartcampus_student', JSON.stringify(updated));
          } catch (e) {
            console.error(e);
          }
        }}
      />

      <AiTutorModal
        isOpen={showAiTutor}
        onClose={() => setShowAiTutor(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">IAR SmartCampus System</span>
            <span>•</span>
            <span className="text-slate-300">Institute of Advanced Research, Gandhinagar</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Powered by Gemini Multimodal Vision Engine
            </span>
            <span>•</span>
            <button
              onClick={() => {
                setShowEmergencyOnly(true);
                setShowIdModal(true);
              }}
              className="hover:text-rose-400 transition"
            >
              Emergency Helpline
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
