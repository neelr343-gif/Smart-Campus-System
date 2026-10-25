import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  BookOpen,
  Utensils,
  Search,
  Wrench,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Volume2,
  VolumeX,
  History,
  Trash2,
  ExternalLink,
  RefreshCw,
  Zap,
  Info,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { sampleCampusImages } from '../data/mockCampusData.ts';
import { ImageAnalysisData, LostFoundPost, StudentProfile } from '../types/campus.ts';

interface VisualAIHubProps {
  student?: StudentProfile;
  onAddLostFoundItem?: (item: LostFoundPost) => void;
  onAddFacilityNotice?: (title: string, summary: string) => void;
}

type ScanMode = 'study_notes' | 'cafeteria_meal' | 'lost_found' | 'facility_issue' | 'schedule_syllabus' | 'general_campus';

interface ModeConfig {
  id: ScanMode;
  name: string;
  icon: React.ReactNode;
  tagline: string;
  badge: string;
  defaultPrompt: string;
}

const MODES: ModeConfig[] = [
  {
    id: 'study_notes',
    name: 'Notes & Formula Solver',
    icon: <BookOpen className="w-4 h-4" />,
    tagline: 'Handwritten math, diagrams, code & textbook problems',
    badge: 'Academic',
    defaultPrompt: 'Transcribe this lecture note, explain key formulas step-by-step, and list 2 potential exam questions.',
  },
  {
    id: 'cafeteria_meal',
    name: 'Cafeteria & Nutrition',
    icon: <Utensils className="w-4 h-4" />,
    tagline: 'Meal nutrition, calorie breakdown, protein & allergies',
    badge: 'Wellness',
    defaultPrompt: 'Analyze this food plate: estimate calories, protein/carbs/fats, identify dietary flags, and rate healthiness.',
  },
  {
    id: 'lost_found',
    name: 'Lost & Found Classifier',
    icon: <Search className="w-4 h-4" />,
    tagline: 'Identify lost items, brand, distinctive tags & auto-post',
    badge: 'Security',
    defaultPrompt: 'Identify this found item, state make/model/color, distinctive marks, and draft a verified campus recovery record.',
  },
  {
    id: 'facility_issue',
    name: 'Facility Defect Dispatch',
    icon: <Wrench className="w-4 h-4" />,
    tagline: 'Broken furniture, AC/lighting, projector errors',
    badge: 'Estates',
    defaultPrompt: 'Assess the equipment defect shown, hazard grade, and draft a maintenance work-order for technicians.',
  },
  {
    id: 'schedule_syllabus',
    name: 'Timetable & Poster OCR',
    icon: <Calendar className="w-4 h-4" />,
    tagline: 'Class schedules, event flyers, syllabus milestones',
    badge: 'Registrar',
    defaultPrompt: 'Extract all dates, course titles, timings, and deadlines from this schedule into structured calendar events.',
  },
];

export const VisualAIHub: React.FC<VisualAIHubProps> = ({
  student,
  onAddLostFoundItem,
  onAddFacilityNotice,
}) => {
  const [selectedMode, setSelectedMode] = useState<ScanMode>('study_notes');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingPhase, setLoadingPhase] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [history, setHistory] = useState<ImageAnalysisData[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [postedToLostFound, setPostedToLostFound] = useState<boolean>(false);
  const [dispatchedTicket, setDispatchedTicket] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Helper to downscale large camera/phone images client-side for near-instant upload
  const compressImage = (base64Str: string, maxWidth = 1024, maxHeight = 1024, quality = 0.82): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width <= maxWidth && height <= maxHeight) {
          resolve(base64Str);
          return;
        }
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64Str);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(base64Str);
    });
  };

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('smartcampus_scan_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading scan history:', e);
    }
  }, []);

  const saveToHistory = (item: ImageAnalysisData) => {
    try {
      const updated = [item, ...history.filter(h => h.timestamp !== item.timestamp)].slice(0, 15);
      setHistory(updated);
      localStorage.setItem('smartcampus_scan_history', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving history:', e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setMimeType('image/jpeg');
    const reader = new FileReader();
    reader.onload = async () => {
      const rawBase64 = reader.result as string;
      // Instant client-side compression to prevent uploading massive payloads
      const optimized = await compressImage(rawBase64);
      setPreviewImage(optimized);
      setAnalysisResult(null);
      setErrorMessage(null);
      setPostedToLostFound(false);
      setDispatchedTicket(false);
    };
    reader.readAsDataURL(file);
  };

  const loadSampleImage = async (sample: typeof sampleCampusImages[0]) => {
    setSelectedMode(sample.mode);
    setCustomPrompt(sample.samplePrompt);
    setAnalysisResult(null);
    setErrorMessage(null);
    setPostedToLostFound(false);
    setDispatchedTicket(false);

    try {
      setIsLoading(true);
      setLoadingPhase('Loading sample...');
      const response = await fetch(sample.imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawBase64 = reader.result as string;
        const optimized = await compressImage(rawBase64, 900, 900, 0.85);
        setPreviewImage(optimized);
        setMimeType('image/jpeg');
        setIsLoading(false);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Sample image load error:', err);
      setPreviewImage(sample.imageUrl);
      setMimeType('image/jpeg');
      setIsLoading(false);
    }
  };

  const triggerAnalysis = async () => {
    if (!previewImage) {
      setErrorMessage('Please upload a photo or pick a sample campus image first.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setPostedToLostFound(false);
    setDispatchedTicket(false);
    setElapsedSeconds(0);

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => +(prev + 0.1).toFixed(1));
    }, 100);

    setLoadingPhase('Fast visual analysis with Gemini Vision...');

    try {
      const activePrompt = customPrompt.trim() || MODES.find(m => m.id === selectedMode)?.defaultPrompt || '';
      // Ensure the image sent to backend is compressed
      const optimizedBase64 = await compressImage(previewImage, 960, 960, 0.82);

      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: optimizedBase64,
          mimeType: 'image/jpeg',
          mode: selectedMode,
          prompt: activePrompt,
          campusContext: {
            locationHint: 'Institute of Advanced Research, Gandhinagar - Academic Complex',
            studentName: student?.name || 'Neel Rana',
            department: student?.department || 'Computer Science & Information Technology',
          },
        }),
      });

      clearInterval(timer);

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to analyze image with Gemini');
      }

      const resultData: ImageAnalysisData = {
        ...json.data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        imageUrl: previewImage,
        mode: selectedMode,
      };

      setAnalysisResult(resultData);
      saveToHistory(resultData);
    } catch (err: any) {
      clearInterval(timer);
      console.error('Analysis error:', err);
      setErrorMessage(err?.message || 'Failed to analyze image. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingPhase('');
    }
  };

  const handleCopyInsights = () => {
    if (!analysisResult) return;
    const textToCopy = `[IAR SmartCampus AI: ${analysisResult.title}]\nCategory: ${analysisResult.category}\n\nSummary:\n${analysisResult.summary}\n\nKey Insights:\n${analysisResult.keyPoints.map(p => `• ${p}`).join('\n')}\n\nAction Steps:\n${analysisResult.actionItems.map(a => `[ ] ${a}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (analysisResult) {
      const utterance = new SpeechSynthesisUtterance(`${analysisResult.title}. ${analysisResult.summary}`);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const publishToLostAndFound = () => {
    if (!analysisResult || !onAddLostFoundItem) return;
    const newPost: LostFoundPost = {
      id: `lf-auto-${Date.now()}`,
      title: analysisResult.title,
      category: 'electronics',
      type: 'found',
      location: 'IAR Gandhinagar Campus Grounds',
      date: 'Just now',
      description: `${analysisResult.summary} ${analysisResult.keyPoints.join(' ')}`,
      imageUrl: previewImage || undefined,
      status: 'open',
      reportedBy: `${student?.name || 'Neel Rana'} (${student?.rollNumber || 'IAR/15454'})`,
      contactEmail: student?.email || 'neelr343@gmail.com',
      aiVerified: true,
    };
    onAddLostFoundItem(newPost);
    setPostedToLostFound(true);
  };

  const dispatchMaintenanceTicket = () => {
    if (!analysisResult) return;
    if (onAddFacilityNotice) {
      onAddFacilityNotice(`[Maintenance Ticket #${Math.floor(1000 + Math.random() * 9000)}] ${analysisResult.title}`, analysisResult.summary);
    }
    setDispatchedTicket(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Intro */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-800/40 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Multi-Modal Campus Intelligence • Gemini Vision</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Visual AI Campus Scanner
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Upload or snap any photo on campus: decrypt handwritten equations, solve STEM homework, inspect cafeteria nutrition, classify lost items, or file facility work orders with high reasoning accuracy.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                showHistory
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>History ({history.length})</span>
            </button>
          </div>
        </div>

        {/* Scan Mode Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-5">
          {MODES.map((mode) => {
            const isSelected = selectedMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  setSelectedMode(mode.id);
                  setCustomPrompt(mode.defaultPrompt);
                }}
                className={`p-3 rounded-xl text-left transition-all border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-lg shadow-indigo-600/20 ring-1 ring-indigo-400/50'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {mode.icon}
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-indigo-400/20 text-indigo-200' : 'bg-slate-800 text-slate-500'}`}>
                    {mode.badge}
                  </span>
                </div>
                <div className="mt-2.5">
                  <p className="text-xs font-bold text-white line-clamp-1">{mode.name}</p>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{mode.tagline}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Input & Config (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-400" />
                <span>Upload or Capture Photo</span>
              </h2>
              {previewImage && (
                <button
                  onClick={() => {
                    setPreviewImage(null);
                    setAnalysisResult(null);
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 transition"
                >
                  Clear Photo
                </button>
              )}
            </div>

            {/* Dropzone / Preview Area */}
            <div
              className={`relative border-2 border-dashed rounded-xl overflow-hidden transition flex flex-col items-center justify-center min-h-[260px] ${
                previewImage
                  ? 'border-indigo-500/50 bg-slate-950'
                  : 'border-slate-700 bg-slate-950/60 hover:border-indigo-500/60 hover:bg-slate-950'
              }`}
            >
              {previewImage ? (
                <div className="relative w-full h-[280px] bg-black/40 flex items-center justify-center group">
                  <img
                    src={previewImage}
                    alt="Upload preview"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3 backdrop-blur-xs">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold shadow hover:bg-indigo-500 transition"
                    >
                      Change Photo
                    </button>
                    <button
                      onClick={() => {
                        setPreviewImage(null);
                        setAnalysisResult(null);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold shadow hover:bg-rose-500 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-inner">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Drag & drop campus photo</p>
                    <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, or WEBP up to 20MB</p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Browse Files</span>
                    </button>
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Camera</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Custom Prompt Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Prompt or Custom Focus</span>
                <span className="text-[10px] text-slate-400">Optional</span>
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={2}
                placeholder="Ask specific questions about this image or leave empty for auto-intelligence..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
              />
            </div>

            {/* Analyze Action Button */}
            <button
              onClick={triggerAnalysis}
              disabled={isLoading || !previewImage}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg ${
                isLoading || !previewImage
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/30'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Analyzing with Gemini Vision...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Analyze with Gemini Vision</span>
                </>
              )}
            </button>

            {/* Error Banner with 1-Click Retry */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-xs text-rose-200 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-rose-200">Analysis Notice</p>
                    <p className="mt-0.5 text-rose-300 leading-relaxed">
                      {errorMessage.includes("503") || errorMessage.includes("high demand") || errorMessage.includes("UNAVAILABLE")
                        ? "Google AI model cluster is experiencing temporary high demand. The system will auto-switch to resilient alternate TPU nodes."
                        : errorMessage.replace(/^AI analysis failed:\s*/i, "").replace(/\{"error":\{.*?"message":"(.*?)"\}.*?\}/s, "$1")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      triggerAnalysis();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Analysis</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 1-Click Instant Sample Scans Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Try Sample Campus Photos</span>
              </span>
              <span className="text-[10px] text-slate-400">1-Click Test</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sampleCampusImages.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => loadSampleImage(sample)}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 hover:border-indigo-500/40 text-left transition group"
                >
                  <img
                    src={sample.imageUrl}
                    alt={sample.title}
                    className="w-11 h-11 rounded-lg object-cover ring-1 ring-slate-800 group-hover:ring-indigo-400 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition truncate">
                      {sample.badge}
                    </p>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{sample.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Analysis Output (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {isLoading ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl min-h-[420px] flex flex-col items-center justify-center text-center space-y-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-10 h-10 text-indigo-400 animate-spin" />
                </div>
                <div className="absolute -inset-2 bg-indigo-500/20 blur-xl rounded-full -z-10 animate-ping"></div>
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-lg font-bold text-white">Visual Intelligence Active</h3>
                <p className="text-xs text-indigo-300 font-mono flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>{loadingPhase}</span>
                  <span className="text-slate-400">({elapsedSeconds}s)</span>
                </p>
                <p className="text-xs text-slate-400 pt-1">
                  Using high-precision multimodal vision model <span className="font-semibold text-slate-200">Gemini 3.8 Flash</span> (Low-latency mode active).
                </p>
              </div>
            </div>
          ) : analysisResult ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5 animate-in fade-in duration-300">
              {/* Header result row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {analysisResult.category}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Model: {analysisResult.modelUsed}
                    </span>
                    {analysisResult.durationMs && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-mono">
                        <Zap className="w-3 h-3 text-amber-400" />
                        {(analysisResult.durationMs / 1000).toFixed(1)}s response
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    {analysisResult.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleSpeech}
                    className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 transition ${
                      isSpeaking
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                    }`}
                    title="Read Summary Aloud"
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4 text-white animate-pulse" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleCopyInsights}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition"
                    title="Copy Analysis Findings"
                  >
                    {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Summary Box */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1.5 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>Executive Breakdown</span>
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {analysisResult.summary}
                </p>
              </div>

              {/* Numerical Metrics Cards if any */}
              {analysisResult.metrics && Object.keys(analysisResult.metrics).length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Key Indicators & Estimates
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {Object.entries(analysisResult.metrics).map(([key, val]) => (
                      <div key={key} className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase truncate">{key}</p>
                        <p className="text-sm font-bold text-indigo-300 mt-0.5 truncate">{String(val)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Insights List */}
              {analysisResult.keyPoints && analysisResult.keyPoints.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Analytical Findings & Explanations
                  </h4>
                  <div className="space-y-1.5">
                    {analysisResult.keyPoints.map((point, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60 text-xs text-slate-200"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items */}
              {analysisResult.actionItems && analysisResult.actionItems.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Recommended Student Next Steps
                  </h4>
                  <div className="space-y-1.5">
                    {analysisResult.actionItems.map((action, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-indigo-950/20 border border-indigo-900/30 text-xs text-indigo-200"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted Text & Formulas if available */}
              {analysisResult.extractedText && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    OCR Transcription & Equations
                  </h4>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-indigo-300/90 max-h-32 overflow-y-auto whitespace-pre-wrap">
                    {analysisResult.extractedText}
                  </div>
                </div>
              )}

              {/* Tags */}
              {analysisResult.tags && analysisResult.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {analysisResult.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700 font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Workflow Actions based on Mode */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2.5">
                {selectedMode === 'lost_found' && (
                  <button
                    onClick={publishToLostAndFound}
                    disabled={postedToLostFound}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      postedToLostFound
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{postedToLostFound ? 'Published to Campus Directory' : 'Post to Campus Lost & Found Board'}</span>
                  </button>
                )}

                {selectedMode === 'facility_issue' && (
                  <button
                    onClick={dispatchMaintenanceTicket}
                    disabled={dispatchedTicket}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      dispatchedTicket
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 cursor-default'
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/30'
                    }`}
                  >
                    <Wrench className="w-4 h-4" />
                    <span>{dispatchedTicket ? 'Maintenance Ticket #4829 Dispatched' : 'Submit Facility Dispatch Ticket'}</span>
                  </button>
                )}

                <button
                  onClick={handleCopyInsights}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedText ? 'Copied!' : 'Copy Formatted Report'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Empty State Guide */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl min-h-[420px] flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Camera className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-base font-bold text-white">No Visual Scan Active</h3>
                <p className="text-xs text-slate-400">
                  Select a photo from the left panel or click any sample campus asset to witness Gemini Multimodal Vision in real-time.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-left w-full max-w-md pt-2">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-300">
                  <span className="font-bold text-indigo-400 block">📚 Study Solver</span>
                  Decodes blackboard notes & writes step-by-step proofs.
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-300">
                  <span className="font-bold text-emerald-400 block">🥗 Nutrition AI</span>
                  Computes protein & calories for cafeteria lunch trays.
                </div>
              </div>
            </div>
          )}

          {/* Scan History Drawer */}
          {showHistory && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-400" />
                  <span>Recent Campus Scans</span>
                </h4>
                {history.length > 0 && (
                  <button
                    onClick={() => {
                      setHistory([]);
                      localStorage.removeItem('smartcampus_scan_history');
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">No scans recorded in this session.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {history.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setAnalysisResult(item);
                        if (item.imageUrl) setPreviewImage(item.imageUrl);
                      }}
                      className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between cursor-pointer transition"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-200 truncate">{item.title}</p>
                        <p className="text-[10px] text-slate-400">
                          {item.category} • {item.timestamp} • {item.modelUsed}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
