import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BookOpen,
  Plus,
  Flame,
  Check,
  ChevronRight,
  TrendingUp,
  Sliders,
  ShieldCheck,
  CalendarCheck
} from 'lucide-react';
import { Course, TimetableSlot, Assignment } from '../types/campus.ts';

interface TimetableAttendanceProps {
  courses: Course[];
  timetable: TimetableSlot[];
  assignments: Assignment[];
  onUpdateAttendance: (courseId: string, attendedDelta: number, totalDelta: number) => void;
  onToggleAssignment: (assignmentId: string) => void;
  onAddAssignment: (assignment: Omit<Assignment, 'id'>) => void;
}

export const TimetableAttendance: React.FC<TimetableAttendanceProps> = ({
  courses,
  timetable,
  assignments,
  onUpdateAttendance,
  onToggleAssignment,
  onAddAssignment,
}) => {
  const [selectedDay, setSelectedDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'>('Mon');
  const [simulatedSkips, setSimulatedSkips] = useState<number>(0);
  const [selectedCourseForSim, setSelectedCourseForSim] = useState<string>(courses[0]?.id || '');
  const [showAddAssignment, setShowAddAssignment] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCourseId, setNewCourseId] = useState<string>(courses[0]?.id || '');
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');

  // Days list
  const days: { id: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'; label: string }[] = [
    { id: 'Mon', label: 'Monday' },
    { id: 'Tue', label: 'Tuesday' },
    { id: 'Wed', label: 'Wednesday' },
    { id: 'Thu', label: 'Thursday' },
    { id: 'Fri', label: 'Friday' },
  ];

  // Calculate overall attendance
  const totalAttended = courses.reduce((acc, c) => acc + c.attendedClasses, 0);
  const totalHeld = courses.reduce((acc, c) => acc + c.totalClasses, 0);
  const overallPercentage = totalHeld > 0 ? ((totalAttended / totalHeld) * 100).toFixed(1) : '0.0';

  // Find course for slot
  const getCourseForSlot = (courseId: string) => courses.find(c => c.id === courseId);

  // Slots for selected day
  const daySlots = timetable
    .filter(slot => slot.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Safe bunk margin calculation
  // To stay >= 75%: (attended) / (total + x) >= 0.75  =>  attended / 0.75 - total >= x
  // If already < 75%: (attended + y) / (total + y) >= 0.75 => attended + y >= 0.75*total + 0.75*y => 0.25*y >= 0.75*total - attended
  const calculateBunkMargin = (course: Course) => {
    const minPercent = (course.minAttendancePercent || 75) / 100;
    const currentPercent = course.totalClasses > 0 ? (course.attendedClasses / course.totalClasses) : 1;

    if (currentPercent >= minPercent) {
      // How many can miss
      const canSkip = Math.floor((course.attendedClasses / minPercent) - course.totalClasses);
      return {
        safe: true,
        count: Math.max(0, canSkip),
        message: canSkip > 0 ? `Safe to skip ${canSkip} lecture${canSkip > 1 ? 's' : ''}` : 'On the 75% edge (Do not skip)',
      };
    } else {
      // How many must attend sequentially
      const needed = Math.ceil((minPercent * course.totalClasses - course.attendedClasses) / (1 - minPercent));
      return {
        safe: false,
        count: Math.max(1, needed),
        message: `Attendance Deficit: Attend next ${needed} classes consecutively`,
      };
    }
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddAssignment({
      courseId: newCourseId,
      title: newTitle.trim(),
      dueDate: newDueDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      priority: newPriority,
      completed: false,
    });
    setNewTitle('');
    setShowAddAssignment(false);
  };

  // Simulation calculation
  const simCourse = courses.find(c => c.id === selectedCourseForSim) || courses[0];
  const simTotal = (simCourse?.totalClasses || 0) + simulatedSkips;
  const simPercent = simTotal > 0 ? (((simCourse?.attendedClasses || 0) / simTotal) * 100).toFixed(1) : '100';

  return (
    <div className="space-y-6">
      {/* Top Banner & Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Attendance Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Campus Attendance Rating
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              Number(overallPercentage) >= 75
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {Number(overallPercentage) >= 75 ? 'Safe for Exams (>= 75%)' : 'Shortage Alert'}
            </span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white tracking-tight">{overallPercentage}%</span>
            <span className="text-xs text-slate-400">
              ({totalAttended} / {totalHeld} total lectures)
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                Number(overallPercentage) >= 85
                  ? 'bg-emerald-400'
                  : Number(overallPercentage) >= 75
                  ? 'bg-indigo-400'
                  : 'bg-rose-400'
              }`}
              style={{ width: `${Math.min(100, Number(overallPercentage))}%` }}
            />
          </div>
        </div>

        {/* Next Class Countdown Card */}
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 border border-indigo-800/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Next Upcoming Lecture</span>
            </span>
            <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
              Starts in 18 min
            </span>
          </div>

          <div className="my-2">
            <h3 className="text-base font-extrabold text-white">CS-301: Distributed Systems</h3>
            <p className="text-xs text-slate-300 mt-0.5">Hall C-104 • Dr. Evelyn Reed</p>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
            <span>Slot: 09:00 - 10:15 AM</span>
            <span className="text-emerald-400 font-semibold">Attendance recorded via RFID</span>
          </div>
        </div>

        {/* Pending Assignments Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Submissions & Tasks
            </span>
            <button
              onClick={() => setShowAddAssignment(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>

          <div className="my-2 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white">
              {assignments.filter(a => !a.completed).length}
            </span>
            <span className="text-xs text-slate-400">due in the next 10 days</span>
          </div>

          <p className="text-xs text-indigo-300/80">
            Next: {assignments.find(a => !a.completed)?.title || 'All caught up!'}
          </p>
        </div>
      </div>

      {/* Main Grid: Left Timetable (7 cols), Right Attendance & Safe Skip (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Timetable */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-bold text-white">Weekly Academic Schedule</h2>
              </div>

              {/* Day Switcher */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                {days.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDay(d.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      selectedDay === d.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {d.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Slots List */}
            <div className="space-y-3">
              {daySlots.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/60 rounded-xl border border-slate-800">
                  No classes scheduled for {selectedDay}. Enjoy your study & research hours!
                </div>
              ) : (
                daySlots.map((slot, index) => {
                  const course = getCourseForSlot(slot.courseId);
                  return (
                    <div
                      key={slot.id}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className="w-2.5 h-12 rounded-full shrink-0"
                          style={{ backgroundColor: course?.color || '#6366f1' }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-indigo-300">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              {slot.type}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition mt-0.5">
                            {course?.code}: {course?.name}
                          </h4>
                          <p className="text-xs text-slate-400">
                            {course?.professor} • <span className="text-slate-300 font-medium">{slot.room}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/60">
                        <span className="text-xs font-bold text-slate-300">
                          {course ? `${((course.attendedClasses / course.totalClasses) * 100).toFixed(0)}% attendance` : ''}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onUpdateAttendance(slot.courseId, 1, 1)}
                            className="px-2 py-1 rounded bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/50 text-[10px] font-bold flex items-center gap-1 transition"
                            title="Mark Attended"
                          >
                            <Check className="w-3 h-3" />
                            <span>Present</span>
                          </button>
                          <button
                            onClick={() => onUpdateAttendance(slot.courseId, 0, 1)}
                            className="px-2 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-[10px] font-bold flex items-center gap-1 transition"
                            title="Mark Missed"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Absent</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Assignments / Task Manager */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Course Deadlines & Project Milestones</span>
              </h3>
              <button
                onClick={() => setShowAddAssignment(!showAddAssignment)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
              >
                {showAddAssignment ? 'Close Form' : '+ New Deadline'}
              </button>
            </div>

            {showAddAssignment && (
              <form onSubmit={handleCreateAssignment} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <input
                  type="text"
                  placeholder="Task title (e.g. Lab 4 Distributed Database benchmark)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={newCourseId}
                    onChange={(e) => setNewCourseId(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.code}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none"
                  />
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition"
                >
                  Save Deadline
                </button>
              </form>
            )}

            <div className="space-y-2">
              {assignments.map(asg => {
                const course = getCourseForSlot(asg.courseId);
                return (
                  <div
                    key={asg.id}
                    onClick={() => onToggleAssignment(asg.id)}
                    className={`p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                      asg.completed
                        ? 'bg-slate-950/40 border-slate-900 text-slate-500 line-through'
                        : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                        asg.completed
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'border-slate-700 bg-slate-900'
                      }`}>
                        {asg.completed && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{asg.title}</p>
                        <p className="text-[10px] text-slate-400">
                          {course?.code} • Due: {asg.dueDate}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      asg.priority === 'high'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : asg.priority === 'medium'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {asg.priority}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Course Attendance & "Can I Bunk?" Simulator */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Subject Attendance Breakdown</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Min req: 75%</span>
            </div>

            <div className="space-y-3">
              {courses.map(course => {
                const percent = ((course.attendedClasses / course.totalClasses) * 100).toFixed(1);
                const margin = calculateBunkMargin(course);
                const isWarning = Number(percent) < (course.minAttendancePercent || 75);

                return (
                  <div
                    key={course.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate">{course.code}: {course.name}</span>
                        <span className="text-[10px] text-slate-400">{course.professor}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-sm font-extrabold ${isWarning ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {percent}%
                        </span>
                        <p className="text-[10px] text-slate-500">
                          {course.attendedClasses}/{course.totalClasses} held
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full ${isWarning ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, Number(percent))}%` }}
                      />
                    </div>

                    {/* Bunk margin badge */}
                    <div className="flex items-center justify-between pt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        margin.safe
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                      }`}>
                        {margin.safe ? <ShieldCheck className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        <span>{margin.message}</span>
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onUpdateAttendance(course.id, 1, 1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold flex items-center justify-center transition"
                          title="Quick +1 Present"
                        >
                          +
                        </button>
                        <button
                          onClick={() => onUpdateAttendance(course.id, 0, 1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold flex items-center justify-center transition"
                          title="Quick +1 Absent"
                        >
                          -
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Bunk Margin Simulator Slider */}
          <div className="bg-slate-900 border border-indigo-900/40 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>"What If I Skip?" Simulator</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                Calculator
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Test how missing upcoming classes affects your semester exam eligibility:
            </p>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-semibold">Select Course:</label>
              <select
                value={selectedCourseForSim}
                onChange={(e) => setSelectedCourseForSim(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Hypothetical classes to miss:</span>
                <span className="font-bold text-amber-400 font-mono text-sm">{simulatedSkips} classes</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="1"
                value={simulatedSkips}
                onChange={(e) => setSimulatedSkips(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400">Projected Attendance</p>
                <p className={`text-base font-extrabold ${Number(simPercent) >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {simPercent}%
                </p>
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  Number(simPercent) >= 75
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {Number(simPercent) >= 75 ? 'Admit Card Eligible' : 'Debarred from Exam'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
