import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock, ChevronLeft, ChevronRight, CheckCircle,
  MapPin, Star, User, MessageSquare, AlertCircle
} from 'lucide-react';
import { supabase, Doctor, Schedule, ScheduleException, Appointment } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StarRating from '../components/ui/StarRating';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

function generateSlots(start: string, end: string, duration: number): string[] {
  const slots: string[] = [];
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let cur = sh * 60 + sm;
  const endMin = eh * 60 + em;
  while (cur + duration <= endMin) {
    const h = Math.floor(cur / 60);
    const m = cur % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    slots.push(`${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`);
    cur += duration;
  }
  return slots;
}

function to24(slot: string): string {
  const [time, ampm] = slot.split(' ');
  let h = Number(time.split(':')[0]);
  const m = Number(time.split(':')[1]);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

export default function BookingPage() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [exceptions, setExceptions] = useState<ScheduleException[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const [form, setForm] = useState({ fullName: profile?.full_name || '', phone: profile?.phone || '', reason: '' });
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!doctorId) return;
    Promise.all([
      supabase.from('doctors').select('*').eq('id', doctorId).maybeSingle(),
      supabase.from('schedules').select('*').eq('doctor_id', doctorId).eq('is_active', true),
      supabase.from('schedule_exceptions').select('*').eq('doctor_id', doctorId),
    ]).then(([{ data: doc }, { data: sched }, { data: exc }]) => {
      setDoctor(doc);
      setSchedules(sched || []);
      setExceptions(exc || []);
    });
  }, [doctorId]);

  useEffect(() => {
    if (profile) {
      setForm({ fullName: profile.full_name, phone: profile.phone || '', reason: '' });
    }
  }, [profile]);

  useEffect(() => {
    if (!selectedDate || !doctorId) return;

    const dayOfWeek = selectedDate.getDay();
    const sched = schedules.find((s) => s.day_of_week === dayOfWeek);
    if (!sched) { setAvailableSlots([]); setBookedSlots([]); return; }

    const slots = generateSlots(sched.start_time, sched.end_time, sched.slot_duration_minutes);
    const dateStr = selectedDate.toISOString().split('T')[0];

    supabase
      .from('appointments')
      .select('appointment_time')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', dateStr)
      .neq('status', 'cancelled')
      .then(({ data }) => {
        const booked = (data || []).map((a: Pick<Appointment, 'appointment_time'>) => a.appointment_time.substring(0, 5));
        setBookedSlots(booked);
        setAvailableSlots(slots);
      });
  }, [selectedDate, schedules, doctorId]);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDay = (year: number, month: number) => new Date(year, month, 1).getDay();

  const isDateAvailable = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    if (d < today && d.toDateString() !== today.toDateString()) return false;
    const dow = d.getDay();
    const hasSchedule = schedules.some((s) => s.day_of_week === dow);
    if (!hasSchedule) return false;
    const dateStr = d.toISOString().split('T')[0];
    const isException = exceptions.some((e) => e.exception_date === dateStr);
    return !isException;
  };

  const handleDateSelect = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    if (!isDateAvailable(day)) return;
    setSelectedDate(d);
    setSelectedSlot(null);
    setStep(2);
  };

  const handleBook = async () => {
    if (!user) { navigate('/auth'); return; }
    if (!selectedDate || !selectedSlot || !doctorId) return;

    setLoading(true);
    setError('');

    const dateStr = selectedDate.toISOString().split('T')[0];
    const timeStr = to24(selectedSlot);

    const { error: err } = await supabase.from('appointments').insert({
      patient_id: user.id,
      doctor_id: doctorId,
      appointment_date: dateStr,
      appointment_time: timeStr,
      reason: form.reason,
      status: 'pending',
    });

    if (err) {
      setError('Failed to book appointment. Please try again.');
      toast('error', 'Failed to book appointment');
    } else {
      setStep(3);
      toast('success', 'Appointment booked successfully!');
    }
    setLoading(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  if (!doctor) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDay(viewYear, viewMonth);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/doctors" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Doctors
        </Link>

        {/* Doctor info card */}
        <div className="card p-5 mb-6 flex flex-col sm:flex-row gap-4">
          <img
            src={doctor.avatar_url}
            alt={doctor.full_name}
            className="w-20 h-20 rounded-xl object-cover object-top"
            loading="lazy"
          />
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">{doctor.full_name}</h1>
            <p className="text-primary-600 font-medium text-sm mb-2">{doctor.specialty}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <StarRating rating={doctor.rating} />
                <span className="font-medium text-gray-700">{doctor.rating.toFixed(1)}</span>
                <span>({doctor.review_count})</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {doctor.location}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5" /> {doctor.experience_years} yrs exp
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-1">Consultation fee</p>
            <p className="text-lg font-bold text-gray-900">{doctor.consultation_fee.toLocaleString()} IQD</p>
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {(['Select Date', 'Choose Time', 'Confirm'] as const).map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${
                step > i + 1 ? 'text-emerald-600' : step === i + 1 ? 'text-primary-600' : 'text-gray-400'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step > i + 1 ? 'bg-emerald-100 text-emerald-600' : step === i + 1 ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {step > i + 1 ? '\u2713' : i + 1}
                </div>
                <span className="hidden sm:block">{label}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-px w-8 ${step > i + 1 ? 'bg-emerald-300' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {step === 3 ? (
          <div className="card p-8 text-center animate-scale-in">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Appointment Booked!</h2>
            <p className="text-gray-500 mb-1">
              <span className="font-medium text-gray-700">{doctor.full_name}</span>
            </p>
            <p className="text-primary-600 font-semibold mb-6">
              {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {' \u00b7 '}{selectedSlot}
            </p>
            <p className="text-sm text-gray-400 mb-6">Your appointment is pending confirmation. The doctor will review and confirm shortly.</p>
            <div className="flex gap-3 justify-center">
              <Link to="/dashboard/patient" className="btn-primary px-6 py-2.5 text-sm">
                View My Appointments
              </Link>
              <Link to="/doctors" className="btn-secondary px-6 py-2.5 text-sm">
                Find More Doctors
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-3 card p-5">
              <div className="flex items-center justify-between mb-5">
                <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <h3 className="font-bold text-gray-800">{MONTHS[viewMonth]} {viewYear}</h3>
                <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={i} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const d = new Date(viewYear, viewMonth, day);
                  const available = isDateAvailable(day);
                  const isSelected = selectedDate?.toDateString() === d.toDateString();
                  const isPast = d < today && d.toDateString() !== today.toDateString();

                  return (
                    <button
                      key={day}
                      onClick={() => handleDateSelect(day)}
                      disabled={!available}
                      className={`aspect-square rounded-xl text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-primary-600 text-white shadow-md'
                          : available
                          ? 'hover:bg-primary-50 hover:text-primary-600 text-gray-700'
                          : isPast
                          ? 'text-gray-200 cursor-not-allowed'
                          : 'text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-primary-600" /> Selected
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-gray-100" /> Available
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-gray-100 opacity-30" /> Unavailable
                </div>
              </div>
            </div>

            {/* Time slots + form */}
            <div className="lg:col-span-2 space-y-4">
              {step >= 2 && selectedDate && (
                <div className="card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-primary-600" />
                    <h3 className="font-bold text-gray-800 text-sm">
                      {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h3>
                  </div>

                  {availableSlots.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No available slots for this day</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {availableSlots.map((slot) => {
                        const time24 = to24(slot).substring(0, 5);
                        const isBooked = bookedSlots.includes(time24);
                        return (
                          <button
                            key={slot}
                            disabled={isBooked}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                              selectedSlot === slot
                                ? 'bg-primary-600 text-white shadow-sm'
                                : isBooked
                                ? 'bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                                : 'bg-gray-50 hover:bg-primary-50 hover:text-primary-600 text-gray-600'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {selectedSlot && (
                <div className="card p-5">
                  <h3 className="font-bold text-gray-800 text-sm mb-4">Your Details</h3>

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg mb-3">
                      <AlertCircle className="w-3.5 h-3.5" /> {error}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="text"
                          value={form.fullName}
                          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                          className="input-field pl-8"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Reason for Visit</label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400" />
                        <textarea
                          value={form.reason}
                          onChange={(e) => setForm({ ...form, reason: e.target.value })}
                          rows={2}
                          placeholder="Briefly describe your symptoms..."
                          className="input-field pl-8 resize-none"
                        />
                      </div>
                    </div>

                    {!user && (
                      <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                        You need to <Link to="/auth" className="font-semibold underline">sign in</Link> to book an appointment.
                      </p>
                    )}

                    <button
                      onClick={handleBook}
                      disabled={loading || !user}
                      className="btn-primary w-full py-2.5 text-sm disabled:opacity-60"
                    >
                      {loading ? 'Booking...' : 'Confirm Booking'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
