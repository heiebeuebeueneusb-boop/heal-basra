import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, FileText, Clock, CheckCircle, XCircle, AlertCircle,
  ChevronRight, MapPin, Stethoscope, Search, User, MessageSquare,
  Filter, Heart
} from 'lucide-react';
import { supabase, Appointment, MedicalRecord } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const statusColors: Record<string, string> = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: AlertCircle,
  confirmed: CheckCircle,
  completed: CheckCircle,
  cancelled: XCircle,
};

type AppointmentWithDoctor = Appointment & {
  doctors: { full_name: string; specialty: string; avatar_url: string; location: string; id: string };
};

type RecordWithDoctor = MedicalRecord & {
  doctors: { full_name: string; specialty: string };
};

export default function PatientDashboard() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<AppointmentWithDoctor[]>([]);
  const [records, setRecords] = useState<RecordWithDoctor[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'records'>('upcoming');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editNotesId, setEditNotesId] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');

  const loadData = useCallback(async () => {
    if (!user) return;
    const [{ data: appts }, { data: recs }] = await Promise.all([
      supabase
        .from('appointments')
        .select('*, doctors(full_name, specialty, avatar_url, location, id)')
        .eq('patient_id', user.id)
        .order('appointment_date', { ascending: false }),
      supabase
        .from('medical_records')
        .select('*, doctors(full_name, specialty)')
        .eq('patient_id', user.id)
        .eq('is_sent_to_patient', true)
        .order('created_at', { ascending: false }),
    ]);
    setAppointments((appts as AppointmentWithDoctor[]) || []);
    setRecords((recs as RecordWithDoctor[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const cancelAppointment = async (id: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id);
    if (!error) {
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: 'cancelled' } : a));
      toast('success', 'Appointment cancelled successfully');
    } else {
      toast('error', 'Failed to cancel appointment');
    }
  };

  const saveNotes = async (id: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ notes: notesValue })
      .eq('id', id);
    if (!error) {
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, notes: notesValue } : a));
      toast('success', 'Notes saved');
    }
    setEditNotesId(null);
  };

  const openNotes = (appt: AppointmentWithDoctor) => {
    setEditNotesId(appt.id);
    setNotesValue(appt.notes || appt.reason || '');
  };

  const upcoming = appointments.filter((a) => a.status === 'pending' || a.status === 'confirmed');
  const past = appointments.filter((a) => a.status === 'completed' || a.status === 'cancelled');

  const filteredAppointments = activeTab === 'upcoming'
    ? upcoming.filter((a) => statusFilter === 'all' || a.status === statusFilter)
    : past.filter((a) => statusFilter === 'all' || a.status === statusFilter);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="gradient-primary rounded-3xl p-6 mb-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-primary-100 text-sm">Welcome back,</p>
              <h1 className="text-xl font-bold">{profile?.full_name || 'Patient'}</h1>
              <p className="text-primary-100 text-xs">{profile?.phone || 'No phone number'}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { label: 'Upcoming', value: upcoming.length, icon: Calendar },
              { label: 'Completed', value: appointments.filter((a) => a.status === 'completed').length, icon: CheckCircle },
              { label: 'Reports', value: records.length, icon: FileText },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
                <Icon className="w-5 h-5 mx-auto mb-1 text-white/80" />
                <p className="text-lg font-bold">{value}</p>
                <p className="text-xs text-primary-100">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { to: '/doctors', icon: Search, label: 'Find Doctor' },
            { to: '/departments', icon: Stethoscope, label: 'Departments' },
            { to: '/map', icon: MapPin, label: 'Clinic Map' },
          ].map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="card p-4 flex flex-col items-center gap-2 hover:border-primary-200"
            >
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary-600" />
              </div>
              <span className="text-xs font-semibold text-gray-700">{label}</span>
            </Link>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl border border-gray-100 p-1 mb-6 w-fit flex-wrap gap-1">
          {[
            { key: 'upcoming', label: 'Upcoming', icon: Calendar },
            { key: 'history', label: 'History', icon: Clock },
            { key: 'records', label: 'Medical Reports', icon: FileText },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key as 'upcoming' | 'history' | 'records'); setStatusFilter('all'); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === key ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Status filter */}
        {activeTab !== 'records' && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-500 font-medium">Filter:</span>
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-5 animate-pulse h-24" />
            ))}
          </div>
        ) : activeTab === 'records' ? (
          <div className="space-y-4">
            {records.length === 0 ? (
              <div className="text-center py-16 card">
                <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-600 mb-2">No medical reports yet</h3>
                <p className="text-sm text-gray-400">Reports from your doctors will appear here after your visits</p>
              </div>
            ) : (
              records.map((record) => (
                <div key={record.id} className="card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                        <Heart className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{record.doctors?.full_name}</p>
                        <p className="text-xs text-primary-600">{record.doctors?.specialty}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(record.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {record.diagnosis && (
                      <div className="bg-red-50 rounded-xl p-3">
                        <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">Diagnosis</p>
                        <p className="text-sm text-gray-700">{record.diagnosis}</p>
                      </div>
                    )}
                    {record.treatment_plan && (
                      <div className="bg-emerald-50 rounded-xl p-3">
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Treatment Plan</p>
                        <p className="text-sm text-gray-700">{record.treatment_plan}</p>
                      </div>
                    )}
                    {record.notes && (
                      <div className="bg-primary-50 rounded-xl p-3">
                        <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-1">Notes</p>
                        <p className="text-sm text-gray-700">{record.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-16 card">
                <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-600 mb-2">
                  {activeTab === 'upcoming' ? 'No upcoming appointments' : 'No past appointments'}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {activeTab === 'upcoming' ? 'Book your first appointment with a specialist' : 'Your appointment history will appear here'}
                </p>
                {activeTab === 'upcoming' && (
                  <Link to="/doctors" className="inline-flex items-center gap-1 text-primary-600 font-semibold text-sm hover:underline">
                    Find a Doctor <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            ) : (
              filteredAppointments.map((appt) => {
                const StatusIcon = statusIcons[appt.status];
                const isEditing = editNotesId === appt.id;
                return (
                  <div key={appt.id} className="card p-5">
                    <div className="flex items-start gap-4">
                      <img
                        src={appt.doctors?.avatar_url || ''}
                        alt={appt.doctors?.full_name}
                        className="w-12 h-12 rounded-xl object-cover object-top shrink-0"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              to={`/doctor/${appt.doctors?.id}`}
                              className="font-bold text-gray-900 text-sm hover:text-primary-600 transition-colors"
                            >
                              {appt.doctors?.full_name}
                            </Link>
                            <p className="text-xs text-primary-600">{appt.doctors?.specialty}</p>
                          </div>
                          <span className={statusColors[appt.status]}>
                            <StatusIcon className="w-3 h-3" />
                            {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(appt.appointment_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {appt.appointment_time.substring(0, 5)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {appt.doctors?.location}
                          </div>
                        </div>

                        {appt.reason && (
                          <p className="text-xs text-gray-400 mt-1.5 line-clamp-1">
                            Reason: {appt.reason}
                          </p>
                        )}

                        {isEditing ? (
                          <div className="mt-3 pt-3 border-t border-gray-50">
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Symptoms / Notes for Doctor</label>
                            <textarea
                              value={notesValue}
                              onChange={(e) => setNotesValue(e.target.value)}
                              rows={2}
                              placeholder="Describe your symptoms, concerns, or questions..."
                              className="input-field resize-none mb-2"
                            />
                            <div className="flex gap-2">
                              <button onClick={() => saveNotes(appt.id)} className="text-xs font-semibold text-primary-600 hover:text-primary-700">
                                Save Notes
                              </button>
                              <button onClick={() => setEditNotesId(null)} className="text-xs font-semibold text-gray-400 hover:text-gray-600">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : appt.notes ? (
                          <div className="mt-2 pt-2 border-t border-gray-50">
                            <p className="text-xs text-gray-500">
                              <span className="font-semibold">Your notes:</span> {appt.notes}
                            </p>
                            <button
                              onClick={() => openNotes(appt)}
                              className="text-xs text-primary-500 hover:text-primary-700 font-medium mt-1"
                            >
                              Edit notes
                            </button>
                          </div>
                        ) : (appt.status === 'pending' || appt.status === 'confirmed') && (
                          <button
                            onClick={() => openNotes(appt)}
                            className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-700 font-medium mt-2"
                          >
                            <MessageSquare className="w-3 h-3" /> Add symptoms / notes
                          </button>
                        )}
                      </div>
                    </div>

                    {(appt.status === 'pending' || appt.status === 'confirmed') && (
                      <div className="flex justify-end mt-3 pt-3 border-t border-gray-50 gap-2">
                        <Link
                          to={`/doctor/${appt.doctors?.id}`}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          View Doctor
                        </Link>
                        <button
                          onClick={() => cancelAppointment(appt.id)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                          Cancel Appointment
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
