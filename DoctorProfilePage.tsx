import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Clock, DollarSign, Calendar, MessageCircle,
  ChevronLeft, Shield, Award, Users, Heart
} from 'lucide-react';
import { supabase, Doctor, Schedule } from '../lib/supabase';
import StarRating from '../components/ui/StarRating';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export default function DoctorProfilePage() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctorId) return;
    Promise.all([
      supabase.from('doctors').select('*').eq('id', doctorId).maybeSingle(),
      supabase.from('schedules').select('*').eq('doctor_id', doctorId).eq('is_active', true).order('day_of_week'),
    ]).then(([{ data: doc }, { data: sched }]) => {
      setDoctor(doc);
      setSchedules(sched || []);
      setLoading(false);
    });
  }, [doctorId]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Doctor not found</h2>
          <Link to="/doctors" className="text-primary-600 font-medium hover:underline">Browse all doctors</Link>
        </div>
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/${doctor.whatsapp.replace(/\D/g, '')}`;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/doctors" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Doctors
        </Link>

        {/* Hero Card */}
        <div className="card overflow-hidden mb-6">
          <div className="h-40 gradient-primary relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/3 -translate-x-1/4" />
            </div>
          </div>

          <div className="px-6 sm:px-8 pb-8 -mt-16 relative">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <img
                src={doctor.avatar_url}
                alt={doctor.full_name}
                className="w-28 h-28 rounded-2xl object-cover object-top border-4 border-white shadow-lg"
                loading="lazy"
              />
              <div className="flex-1 pt-2 sm:pt-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{doctor.full_name}</h1>
                    <p className="text-primary-600 font-semibold mt-0.5">{doctor.specialty}</p>
                    <p className="text-sm text-gray-500 mt-1">{doctor.department} Department</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/book/${doctor.id}`)}
                      className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
                    >
                      <Calendar className="w-4 h-4" /> Book Appointment
                    </button>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors border border-emerald-200"
                    >
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </a>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={doctor.rating} size="md" />
                    <span className="font-bold text-gray-800">{doctor.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-400">({doctor.review_count} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {doctor.location}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary-600" /> About
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">{doctor.bio}</p>
            </div>

            {/* Working Schedule */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-600" /> Working Schedule
              </h2>
              {schedules.length === 0 ? (
                <p className="text-sm text-gray-400">No schedule information available</p>
              ) : (
                <div className="space-y-2">
                  {schedules.map((s) => (
                    <div key={s.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                      <span className="font-semibold text-sm text-gray-700">{DAYS[s.day_of_week]}</span>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>{formatTime(s.start_time)}</span>
                        <span className="text-gray-300">&mdash;</span>
                        <span>{formatTime(s.end_time)}</span>
                        <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-md border border-gray-100">
                          {s.slot_duration_minutes}min slots
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Location */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-600" /> Clinic Location
              </h2>
              <p className="text-sm text-gray-600 mb-4">{doctor.location}, Basra, Iraq</p>
              <Link
                to={`/map?doctor=${doctor.id}`}
                className="inline-flex items-center gap-2 bg-primary-50 hover:bg-primary-100 text-primary-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border border-primary-200"
              >
                <MapPin className="w-4 h-4" /> View on Map
              </Link>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-4">Quick Info</h2>
              <div className="space-y-4">
                {[
                  { icon: Award, label: 'Experience', value: `${doctor.experience_years} years` },
                  { icon: DollarSign, label: 'Consultation Fee', value: `${doctor.consultation_fee.toLocaleString()} IQD` },
                  { icon: Users, label: 'Reviews', value: `${doctor.review_count} patients` },
                  { icon: Shield, label: 'Status', value: doctor.is_active ? 'Accepting Patients' : 'Unavailable' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="text-sm font-semibold text-gray-800">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="gradient-primary rounded-2xl p-6 text-white text-center">
              <Calendar className="w-8 h-8 mx-auto mb-3 text-white/80" />
              <h3 className="font-bold mb-1">Book an Appointment</h3>
              <p className="text-sm text-primary-100 mb-4">Schedule a visit with {doctor.full_name.split(' ').slice(-1)[0]}</p>
              <button
                onClick={() => navigate(`/book/${doctor.id}`)}
                className="w-full bg-white hover:bg-gray-50 text-primary-600 py-2.5 rounded-xl font-semibold text-sm transition-colors"
              >
                Book Now
              </button>
            </div>

            {/* Contact */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-4">Contact</h2>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl px-4 py-3 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-emerald-700">WhatsApp</p>
                  <p className="text-xs text-emerald-600">{doctor.whatsapp}</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
