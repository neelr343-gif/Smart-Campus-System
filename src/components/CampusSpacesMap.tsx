import React, { useState } from 'react';
import {
  MapPin,
  Users,
  Clock,
  Wifi,
  BatteryCharging,
  Volume2,
  CheckCircle,
  QrCode,
  X,
  Compass,
  Bus,
  Shield,
  Layers,
  ChevronRight
} from 'lucide-react';
import { FacilitySpace, SpaceBooking, StudentProfile } from '../types/campus.ts';

interface CampusSpacesMapProps {
  facilities: FacilitySpace[];
  student: StudentProfile;
}

export const CampusSpacesMap: React.FC<CampusSpacesMapProps> = ({
  facilities,
  student,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeBookingModal, setActiveBookingModal] = useState<FacilitySpace | null>(null);
  const [bookingDuration, setBookingDuration] = useState<number>(2);
  const [selectedSeat, setSelectedSeat] = useState<string>('Pod-04');
  const [myBookings, setMyBookings] = useState<SpaceBooking[]>([
    {
      id: 'BK-9941',
      spaceId: 'fac-lib-3',
      spaceName: 'Central Library - 3rd Floor Silent Research Pods',
      seatOrPodNumber: 'Pod-12',
      startTime: '14:00 Today',
      durationHours: 2,
      status: 'active',
      qrCodeToken: 'IAR-LIB-3-IAR15454-772',
      createdAt: '12:30 PM',
    },
  ]);
  const [activePassModal, setActivePassModal] = useState<SpaceBooking | null>(null);

  // Shuttle bus mock live ETAs for Gandhinagar / IAR campus
  const shuttleRoutes = [
    { id: 'sh-1', name: 'IAR Campus Loop Express (Koba)', nextStop: 'IAR Hostels & Canteen', eta: '3 mins', status: 'On Schedule' },
    { id: 'sh-2', name: 'Infocity / GH-0 Connector', nextStop: 'IAR Main Entrance Gate', eta: '8 mins', status: 'Moderate Traffic' },
    { id: 'sh-3', name: 'Gandhinagar Capital Station Express', nextStop: 'Koba Circle Junction', eta: '12 mins', status: 'Boarding' },
  ];

  const filteredFacilities = facilities.filter(f => {
    if (selectedCategory === 'all') return true;
    return f.category === selectedCategory;
  });

  const handleConfirmBooking = () => {
    if (!activeBookingModal) return;
    const newBooking: SpaceBooking = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      spaceId: activeBookingModal.id,
      spaceName: activeBookingModal.name,
      seatOrPodNumber: selectedSeat,
      startTime: 'Immediate (Next Slot)',
      durationHours: bookingDuration,
      status: 'active',
      qrCodeToken: `IAR-SMART-${activeBookingModal.id}-${student.rollNumber}-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMyBookings([newBooking, ...myBookings]);
    setActiveBookingModal(null);
    setActivePassModal(newBooking);
  };

  const handleCancelBooking = (bookingId: string) => {
    setMyBookings(myBookings.filter(b => b.id !== bookingId));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Active Pass alert if any */}
      {myBookings.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-700/50 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active Access Pass
                </span>
                <span className="text-xs text-slate-400 font-mono">#{myBookings[0].id}</span>
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5">
                {myBookings[0].spaceName} • {myBookings[0].seatOrPodNumber}
              </h3>
              <p className="text-xs text-indigo-300">
                Duration: {myBookings[0].durationHours} hrs • Reserved for {student.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActivePassModal(myBookings[0])}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4" />
              <span>Show Digital QR Pass</span>
            </button>
            <button
              onClick={() => handleCancelBooking(myBookings[0].id)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Campus Map & Zone Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <span>Campus Real-Time Spaces & Density</span>
          </h2>
          <p className="text-xs text-slate-400">
            Live occupancy meters, noise levels, power outlet availability, and instant workstation passes.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Zones' },
            { id: 'study_pod', label: 'Study Pods' },
            { id: 'lab', label: 'Labs & Tech' },
            { id: 'cafeteria', label: 'Food Commons' },
            { id: 'gym', label: 'Fitness & Gym' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredFacilities.map(space => {
          const occupancyRate = (space.currentOccupancy / space.capacity) * 100;
          const isHigh = occupancyRate >= 80;
          const isModerate = occupancyRate >= 50 && occupancyRate < 80;

          return (
            <div
              key={space.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 transition flex flex-col justify-between group"
            >
              {/* Image banner with overlay badges */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                <img
                  src={space.image}
                  alt={space.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-950/80 text-indigo-300 border border-slate-700 backdrop-blur-xs">
                    {space.zone}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border backdrop-blur-xs flex items-center gap-1 ${
                    space.isOpen
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                      : 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${space.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                    {space.isOpen ? 'Open Now' : 'Closed'}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-white leading-tight drop-shadow">
                      {space.name}
                    </h3>
                    <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{space.openingHours}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Space Details */}
              <div className="p-4 space-y-3.5">
                {/* Live Occupancy Meter */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>Occupancy Density:</span>
                    </span>
                    <span className={`font-bold ${isHigh ? 'text-rose-400' : isModerate ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {space.currentOccupancy} / {space.capacity} seats ({occupancyRate.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isHigh ? 'bg-rose-500' : isModerate ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>
                </div>

                {/* Features & Noise */}
                <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                  <span className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                    <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{space.noiseLevel} Zone</span>
                  </span>

                  <span className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{space.powerOutletsAvailable ? 'Outlets Available' : 'No Outlets'}</span>
                  </span>

                  <span className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                    <Wifi className="w-3.5 h-3.5 text-indigo-400" />
                    <span>WiFi 6E</span>
                  </span>
                </div>

                {/* Features list */}
                <div className="flex flex-wrap gap-1">
                  {space.features.map((feat, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {feat}
                    </span>
                  ))}
                </div>

                {/* Booking Trigger */}
                <button
                  onClick={() => setActiveBookingModal(space)}
                  disabled={!space.isOpen || isHigh}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    !space.isOpen || isHigh
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>{isHigh ? 'Full Capacity' : 'Reserve Seat / Digital Pass'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Campus Shuttle Transit Tracker */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bus className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Campus Shuttle Network (Live GPS Tracking)</h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Free for Students
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {shuttleRoutes.map(bus => (
            <div key={bus.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{bus.name}</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                  {bus.eta}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Approaching: <span className="text-indigo-300 font-semibold">{bus.nextStop}</span></p>
              <p className="text-[10px] text-slate-500">{bus.status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Form Modal */}
      {activeBookingModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-white">Reserve Study Workstation</h3>
                <p className="text-xs text-indigo-300">{activeBookingModal.name}</p>
              </div>
              <button
                onClick={() => setActiveBookingModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Choose Available Seat / Pod:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['Pod-02', 'Pod-04', 'Pod-09', 'Desk-18'].map(seat => (
                    <button
                      key={seat}
                      type="button"
                      onClick={() => setSelectedSeat(seat)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        selectedSeat === seat
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {seat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Reservation Duration:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 4].map(hours => (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => setBookingDuration(hours)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        bookingDuration === hours
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {hours} {hours === 1 ? 'Hour' : 'Hours'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                <p className="flex justify-between">
                  <span>Student Holder:</span>
                  <span className="font-semibold text-slate-200">{student.name} ({student.rollNumber})</span>
                </p>
                <p className="flex justify-between">
                  <span>Policy:</span>
                  <span className="text-emerald-400">10-min grace period before auto-release</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleConfirmBooking}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Issue Smart QR Pass</span>
            </button>
          </div>
        </div>
      )}

      {/* QR Pass Display Modal */}
      {activePassModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 text-center animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Official Campus Entry Token
              </span>
              <button
                onClick={() => setActivePassModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Card Simulation */}
            <div className="bg-white p-5 rounded-2xl mx-auto shadow-inner inline-block">
              {/* Simulated SVG QR Code */}
              <div className="w-40 h-40 bg-slate-900 rounded-lg p-2.5 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-10 h-10 border-4 border-white bg-slate-900 rounded p-1 flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-xs"></div>
                  </div>
                  <div className="w-10 h-10 border-4 border-white bg-slate-900 rounded p-1 flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-xs"></div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1 my-1">
                  <div className="w-3 h-3 bg-white"></div>
                  <div className="w-6 h-2 bg-indigo-400"></div>
                  <div className="w-2 h-2 bg-white"></div>
                  <div className="w-4 h-4 bg-white"></div>
                </div>
                <div className="flex justify-between items-end">
                  <div className="w-10 h-10 border-4 border-white bg-slate-900 rounded p-1 flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-xs"></div>
                  </div>
                  <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center text-white font-mono text-[8px] font-bold">
                    NFC
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-white">{activePassModal.spaceName}</h4>
              <p className="text-xs text-indigo-300 font-bold">{activePassModal.seatOrPodNumber}</p>
              <p className="font-mono text-[10px] text-slate-400">{activePassModal.qrCodeToken}</p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <p className="flex justify-between">
                <span>Attendee:</span>
                <span className="font-semibold text-white">{student.name}</span>
              </p>
              <p className="flex justify-between">
                <span>Valid for:</span>
                <span className="text-emerald-400 font-semibold">{activePassModal.durationHours} Hours from scan</span>
              </p>
            </div>

            <button
              onClick={() => setActivePassModal(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
            >
              Done & Return to Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
