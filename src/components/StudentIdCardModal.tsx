import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  ShieldAlert,
  Phone,
  Radio,
  CheckCircle,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import { StudentProfile } from '../types/campus.ts';

interface StudentIdCardModalProps {
  student: StudentProfile;
  isOpen: boolean;
  onClose: () => void;
  showEmergencyOnly?: boolean;
  onUpdateStudent?: (updated: StudentProfile) => void;
}

export const StudentIdCardModal: React.FC<StudentIdCardModalProps> = ({
  student,
  isOpen,
  onClose,
  showEmergencyOnly = false,
  onUpdateStudent,
}) => {
  const [activeView, setActiveView] = useState<'card' | 'emergency' | 'edit'>(showEmergencyOnly ? 'emergency' : 'card');
  const [copiedRoll, setCopiedRoll] = useState(false);
  const [nfcTapped, setNfcTapped] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(student.name);
  const [editRoll, setEditRoll] = useState(student.rollNumber);
  const [editDept, setEditDept] = useState(student.department);
  const [editBlood, setEditBlood] = useState(student.bloodGroup);
  const [editHostel, setEditHostel] = useState(student.hostelBlock || '');
  const [editRoom, setEditRoom] = useState(student.roomNumber || '');

  if (!isOpen) return null;

  const handleCopyRoll = () => {
    navigator.clipboard.writeText(student.rollNumber);
    setCopiedRoll(true);
    setTimeout(() => setCopiedRoll(false), 2000);
  };

  const handleNfcSimulate = () => {
    setNfcTapped(true);
    setTimeout(() => setNfcTapped(false), 2500);
  };

  const emergencyContacts = [
    { title: 'IAR Gandhinagar Main Gate & Security', number: '+91 79 3051 4100', desc: '24/7 Campus Security & Koba Gate' },
    { title: 'IAR Student Health & First Aid Clinic', number: '+91 79 3051 4111', desc: 'Medical Officer, Ambulance & Emergency Room' },
    { title: "Student Welfare & Anti-Ragging Helpline", number: '+91 79 3051 4122', desc: 'Confidential student counsellor & grievance' },
    { title: 'Gandhinagar Police Emergency Desk', number: '112 / 100', desc: 'Infocity & Koba Police Station rapid dispatch' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header & Tabs */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveView('card')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeView === 'card'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Digital Student ID
            </button>
            <button
              onClick={() => setActiveView('emergency')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                activeView === 'emergency'
                  ? 'bg-rose-600 text-white'
                  : 'text-rose-400 hover:text-rose-300'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>SOS</span>
            </button>
            <button
              onClick={() => setActiveView('edit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeView === 'edit'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Edit
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View 1: Digital Holographic Student ID Card */}
        {activeView === 'card' && (
          <div className="space-y-4">
            {/* Holographic ID Card */}
            <div className="relative rounded-2xl bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 p-5 shadow-2xl overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl"></div>

              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-indigo-400 block">
                    Institute of Advanced Research, Gandhinagar
                  </span>
                  <span className="text-xs font-bold text-white tracking-tight">IAR Student Smart Identity Card</span>
                </div>
                <div className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  VERIFIED • ACTIVE
                </div>
              </div>

              {/* Profile & Info */}
              <div className="flex gap-4 items-center my-4">
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-20 h-20 rounded-xl object-cover ring-2 ring-indigo-400/60 shadow-lg shrink-0"
                />
                <div className="space-y-0.5 min-w-0">
                  <h3 className="text-base font-extrabold text-white truncate">{student.name}</h3>
                  <p className="text-xs text-indigo-300 font-medium truncate">{student.department}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="font-mono text-xs text-slate-300 font-bold">{student.rollNumber}</span>
                    <button
                      onClick={handleCopyRoll}
                      className="text-slate-400 hover:text-white"
                      title="Copy Roll Number"
                    >
                      {copiedRoll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Hostel: {student.hostelBlock} • {student.roomNumber}
                  </p>
                </div>
              </div>

              {/* Barcode & NFC Simulation */}
              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 flex items-center justify-between">
                <div>
                  {/* Simulated vertical barcode lines */}
                  <div className="flex items-center gap-0.5 h-7">
                    {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 4, 2, 1, 3, 2, 4, 1].map((w, i) => (
                      <div
                        key={i}
                        className="bg-slate-300 h-full rounded-xs"
                        style={{ width: `${w}px` }}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[9px] text-slate-400 mt-1 block tracking-widest">
                    *{student.rollNumber}*
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block">Blood Group</span>
                  <span className="text-xs font-extrabold text-rose-400">{student.bloodGroup}</span>
                </div>
              </div>

              {/* NFC Tap confirmation animation */}
              {nfcTapped && (
                <div className="absolute inset-0 bg-indigo-950/90 backdrop-blur-xs flex flex-col items-center justify-center space-y-2 animate-in fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-white">NFC Attendance Gate Verified!</p>
                  <p className="text-[10px] text-emerald-300">Access Granted: Turnstile 04</p>
                </div>
              )}
            </div>

            {/* Tap Action */}
            <button
              onClick={handleNfcSimulate}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white text-xs font-bold border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <Radio className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Simulate NFC Tap at Campus Turnstile</span>
            </button>
          </div>
        )}

        {/* View 2: Emergency SOS Directory */}
        {activeView === 'emergency' && (
          <div className="space-y-3">
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Instant campus response teams available 24/7 across all quads and hostels.</span>
            </div>

            <div className="space-y-2">
              {emergencyContacts.map((contact, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{contact.title}</h4>
                    <p className="text-[10px] text-slate-400">{contact.desc}</p>
                    <span className="text-xs font-mono font-bold text-indigo-300 mt-0.5 block">{contact.number}</span>
                  </div>
                  <a
                    href={`tel:${contact.number}`}
                    className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md transition"
                    title="Call Now"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View 3: Edit Profile */}
        {activeView === 'edit' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (onUpdateStudent) {
                onUpdateStudent({
                  ...student,
                  name: editName.trim() || student.name,
                  rollNumber: editRoll.trim() || student.rollNumber,
                  department: editDept.trim() || student.department,
                  bloodGroup: editBlood.trim() || student.bloodGroup,
                  hostelBlock: editHostel.trim() || student.hostelBlock,
                  roomNumber: editRoom.trim() || student.roomNumber,
                });
              }
              setActiveView('card');
            }}
            className="space-y-3"
          >
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Student Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Enrollment / Roll No.</label>
                <input
                  type="text"
                  value={editRoll}
                  onChange={(e) => setEditRoll(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Blood Group</label>
                <input
                  type="text"
                  value={editBlood}
                  onChange={(e) => setEditBlood(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Department / Discipline</label>
              <input
                type="text"
                value={editDept}
                onChange={(e) => setEditDept(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Hostel Residence</label>
                <input
                  type="text"
                  value={editHostel}
                  onChange={(e) => setEditHostel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Room No.</label>
                <input
                  type="text"
                  value={editRoom}
                  onChange={(e) => setEditRoom(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveView('card')}
                className="px-3.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow"
              >
                Save Details
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
