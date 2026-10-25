import React, { useState } from 'react';
import {
  GraduationCap,
  Award,
  BookOpen,
  Calculator,
  TrendingUp,
  CheckCircle,
  FileText,
  BarChart2
} from 'lucide-react';
import { StudentProfile, Course } from '../types/campus.ts';

interface AcademicPlannerProps {
  student: StudentProfile;
  courses: Course[];
}

interface SimulatedCourseGrade {
  courseId: string;
  gradePoint: number;
}

export const AcademicPlanner: React.FC<AcademicPlannerProps> = ({
  student,
  courses,
}) => {
  const [courseGrades, setCourseGrades] = useState<Record<string, number>>({
    'cs-301': 9, // A
    'cs-302': 10, // S/A+
    'cs-303': 8, // B
    'cs-304': 9, // A
    'math-305': 8, // B
  });

  const gradeOptions = [
    { label: 'O / A+ (10 pts)', value: 10 },
    { label: 'A (9 pts)', value: 9 },
    { label: 'B+ (8 pts)', value: 8 },
    { label: 'B (7 pts)', value: 7 },
    { label: 'C (6 pts)', value: 6 },
    { label: 'P / Pass (5 pts)', value: 5 },
  ];

  // Calculate projected SGPA
  const semCredits = courses.reduce((acc, c) => acc + c.credits, 0);
  const semPoints = courses.reduce((acc, c) => {
    const pts = courseGrades[c.id] ?? 9;
    return acc + pts * c.credits;
  }, 0);
  const projectedSGPA = semCredits > 0 ? (semPoints / semCredits).toFixed(2) : '0.00';

  // Calculate projected cumulative CGPA
  // Previous points = student.cgpa * student.creditsEarned
  const prevPoints = student.cgpa * student.creditsEarned;
  const newTotalCredits = student.creditsEarned + semCredits;
  const projectedCGPA = ((prevPoints + semPoints) / newTotalCredits).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Current CGPA (Sem 1-5)</span>
          </span>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white">{student.cgpa}</span>
            <span className="text-xs text-slate-400">/ 10.00</span>
          </div>
          <span className="text-xs text-emerald-400 font-semibold">
            First Class with Distinction
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <span>Degree Credits Progress</span>
          </span>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white">{student.creditsEarned}</span>
            <span className="text-xs text-slate-400">/ {student.totalCredits} required</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full"
              style={{ width: `${(student.creditsEarned / student.totalCredits) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 border border-indigo-800/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" />
            <span>Simulated Semester 6 SGPA</span>
          </span>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white">{projectedSGPA}</span>
            <span className="text-xs text-indigo-300">Target: 9.0+</span>
          </div>
          <p className="text-xs text-slate-400">
            Projected CGPA upon completion: <span className="font-bold text-emerald-400">{projectedCGPA}</span>
          </p>
        </div>
      </div>

      {/* Grade Simulator Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-400" />
              <span>Interactive Semester Grade Simulator</span>
            </h3>
            <p className="text-xs text-slate-400">
              Adjust expected grades per course to see immediate impact on your graduating GPA.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded-lg border border-indigo-500/30">
            Total Semester Credits: {semCredits}
          </span>
        </div>

        <div className="space-y-3">
          {courses.map(course => {
            const currentGrade = courseGrades[course.id] ?? 9;
            return (
              <div
                key={course.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-300">{course.code}</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {course.credits} Credits
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-0.5">{course.name}</h4>
                  <p className="text-xs text-slate-400">{course.professor}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Expected:</span>
                  <select
                    value={currentGrade}
                    onChange={(e) => setCourseGrades({ ...courseGrades, [course.id]: parseInt(e.target.value) })}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {gradeOptions.map(g => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
