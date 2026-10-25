export type CampusTab = 'visual-ai' | 'schedule' | 'spaces' | 'buzz' | 'planner';

export interface StudentProfile {
  id: string;
  name: string;
  rollNumber: string;
  department: string;
  semester: number;
  email: string;
  avatar: string;
  cgpa: number;
  creditsEarned: number;
  totalCredits: number;
  bloodGroup: string;
  hostelBlock?: string;
  roomNumber?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  professor: string;
  credits: number;
  color: string;
  room: string;
  totalClasses: number;
  attendedClasses: number;
  minAttendancePercent: number;
}

export interface TimetableSlot {
  id: string;
  courseId: string;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  startTime: string; // "09:00"
  endTime: string;   // "10:15"
  room: string;
  type: 'Lecture' | 'Lab' | 'Tutorial';
}

export interface FacilitySpace {
  id: string;
  name: string;
  zone: 'Academic Block A' | 'Main Library' | 'Innovation Hub' | 'Student Center' | 'Sports Complex';
  category: 'library' | 'lab' | 'study_pod' | 'cafeteria' | 'gym';
  capacity: number;
  currentOccupancy: number;
  isOpen: boolean;
  openingHours: string;
  features: string[];
  noiseLevel: 'Silent' | 'Quiet' | 'Collaborative' | 'Lively';
  powerOutletsAvailable: boolean;
  image: string;
}

export interface SpaceBooking {
  id: string;
  spaceId: string;
  spaceName: string;
  seatOrPodNumber: string;
  startTime: string;
  durationHours: number;
  status: 'active' | 'upcoming' | 'completed' | 'cancelled';
  qrCodeToken: string;
  createdAt: string;
}

export interface LostFoundPost {
  id: string;
  title: string;
  category: 'electronics' | 'id_cards' | 'keys' | 'books' | 'clothing' | 'other';
  type: 'lost' | 'found';
  location: string;
  date: string;
  description: string;
  imageUrl?: string;
  status: 'open' | 'claimed' | 'handed_to_security';
  reportedBy: string;
  contactEmail: string;
  aiVerified?: boolean;
}

export interface CampusNotice {
  id: string;
  title: string;
  department: string;
  category: 'academic' | 'events' | 'administrative' | 'exams' | 'placement';
  priority: 'urgent' | 'important' | 'general';
  date: string;
  summary: string;
  content: string;
  attachmentName?: string;
  read?: boolean;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  submittedOn?: string;
}

export interface ImageAnalysisData {
  title: string;
  category: string;
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  extractedText?: string;
  metrics?: Record<string, string | number>;
  urgencyOrImportance?: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  rawText: string;
  modelUsed: string;
  timestamp: string;
  imageUrl?: string;
  mode: string;
  durationMs?: number;
}
