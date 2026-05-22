import { useState, useEffect, useCallback } from 'react';
import {
  Stethoscope, Building2, CheckCircle, XCircle, Plus, Trash2,
  Search, Shield, AlertCircle, Eye, X, Save, Calendar,
  Clock, Users, TrendingUp, BarChart3, ArrowUpRight,
  ArrowDownRight, Filter, Phone,
  CreditCard as EditIcon, CalendarX, CalendarCheck
} from 'lucide-react';
import { supabase, Doctor, Profile, Appointment } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

type DoctorWithProfile = Doctor & { profiles?: Profile | null };

type AppointmentWithDetails = Appointment & {
  doctors: { full_name: string; specialty: string; avatar_url: string; id: string };
  profiles: { full_name: string; phone: string };
};

type Tab = 'overview' | 'doctors' | 'appointments' | 'approvals' | 'departments';

const ALL_DEPARTMENTS = [
  'أمراض القلب', 'طب الأسنان', 'الأمراض الجلدية', 'طب الأطفال', 'جراحة العظام',
  'الطب الباطني', 'طب الأعصاب', 'طب العيون', 'أنف أذن حنجرة', 'جراحة عامة',
  'جراحة التجميل', 'أمراض الرئة', 'أمراض الجهاز الهضمي', 'أمراض الدم',
  'الأشعة', 'الرنين المغناطيسي', 'الأشعة المقطعية', 'المختبر الطبي', 'الفحوصات السريرية',
  'التخدير', 'طب الطوارئ', 'الطب النفسي', 'العلاج الطبيعي', 'طب الأسرة',
];

const ALL_SPECIALTIES = [
  'طبيب قلب', 'طبيب أسنان', 'طبيب جلدية', 'طبيب أطفال', 'جراح عظام',
  'طبيب باطني', 'طبيب أعصاب', 'طبيب عيون', 'طبيب أنف أذن حنجرة', 'جراح عام',
  'جراح تجميل', 'طبيب رئة', 'طبيب جهاز هضمي', 'طبيب دم',
  'طبيب أشعة', 'أخصائي رنين مغناطيسي', 'أخصائي أشعة مقطعية', 'مدير مختبر', 'أخصائي أمراض سريرية',
  'طبيب تخدير', 'طبيب طوارئ', 'طبيب نفسي', 'أخصائي علاج طبيعي', 'طبيب أسرة',
];

const statusLabels: Record<string, string> = {
  all: 'الكل',
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

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

function DonutChart({ segments, size = 80 }: { segments: { value: number; color: string; label: string }[]; size?: number }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return <div style={{ width: size, height: size }} className="rounded-full border-4 border-gray-100" />;

  let cumulative = 0;
  const gradientStops = segments.map((seg) => {
    const start = cumulative;
    cumulative += (seg.value / total) * 100;
    return `${seg.color} ${start}% ${cumulative}%`;
  });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="w-full h-full rounded-full"
        style={{ background: `conic-gradient(${gradientStops.join(', ')})` }}
      />
      <div className="absolute inset-2 bg-white rounded-full" />
    </div>
  );
}

export default function AdminPanel() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [doctors, setDoctors] = useState<DoctorWithProfile[]>([]);
  const [pendingDoctors, setPendingDoctors] = useState<DoctorWithProfile[]>([]);
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [apptFilter, setApptFilter] = useState('all');

  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [form, setForm] = useState({
    full_name: '', specialty: '', department: '', bio: '', location: '',
    latitude: 30.5085, longitude: 47.7835, rating: 4.5, experience_years: 0,
    consultation_fee: 25000, whatsapp: '', avatar_url: '',
  });

  const [departments, setDepartments] = useState<string[]>(ALL_DEPARTMENTS);
  const [newDept, setNewDept] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    const [{ data: allDocs }, { data: pendingDocs }, { data: appts }] = await Promise.all([
      supabase.from('doctors').select('*, profiles(*)').order('created_at', { ascending: false }),
      supabase.from('doctors').select('*, profiles(*)').eq('is_active', false).order('created_at', { ascending: false }),
      supabase.from('appointments').select('*, doctors(full_name, specialty, avatar_url, id), profiles(full_name, phone)').order('appointment_date', { ascending: false }).limit(200),
    ]);
    setDoctors((allDocs as DoctorWithProfile[]) || []);
    setPendingDoctors((pendingDocs as DoctorWithProfile[]) || []);
    setAppointments((appts as AppointmentWithDetails[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openAddForm = () => {
    setEditingDoctor(null);
    setForm({
      full_name: '', specialty: ALL_SPECIALTIES[0], department: ALL_DEPARTMENTS[0], bio: '',
      location: 'البصرة', latitude: 30.5085, longitude: 47.7835, rating: 4.5,
      experience_years: 0, consultation_fee: 25000, whatsapp: '', avatar_url: '',
    });
    setShowForm(true);
  };

  const openEditForm = (doc: Doctor) => {
    setEditingDoctor(doc);
    setForm({
      full_name: doc.full_name, specialty: doc.specialty, department: doc.department,
      bio: doc.bio, location: doc.location, latitude: doc.latitude, longitude: doc.longitude,
      rating: doc.rating, experience_years: doc.experience_years,
      consultation_fee: Number(doc.consultation_fee), whatsapp: doc.whatsapp, avatar_url: doc.avatar_url,
    });
    setShowForm(true);
  };

  const saveDoctor = async () => {
    if (!form.full_name.trim()) { toast('error', 'اسم الطبيب مطلوب'); return; }
    if (editingDoctor) {
      const { error } = await supabase.from('doctors').update(form).eq('id', editingDoctor.id);
      if (error) { toast('error', 'فشل تحديث الطبيب'); return; }
      toast('success', `تم تحديث ${form.full_name} بنجاح`);
    } else {
      const { error } = await supabase.from('doctors').insert({ ...form, is_active: true });
      if (error) { toast('error', 'فشل إضافة الطبيب'); return; }
      toast('success', `تمت إضافة ${form.full_name} بنجاح`);
    }
    setShowForm(false);
    loadData();
  };

  const deleteDoctor = async (id: string, name: string) => {
    const { error } = await supabase.from('doctors').delete().eq('id', id);
    if (error) { toast('error', 'فشل حذف الطبيب'); return; }
    toast('success', `تم حذف ${name}`);
    loadData();
  };

  const approveDoctor = async (id: string, name: string) => {
    const { error } = await supabase.from('doctors').update({ is_active: true }).eq('id', id);
    if (error) { toast('error', 'فشل الموافقة على الطبيب'); return; }
    toast('success', `تمت الموافقة على ${name} وهو الآن مرئي للمرضى`);
    loadData();
  };

  const deactivateDoctor = async (id: string, name: string) => {
    const { error } = await supabase.from('doctors').update({ is_active: false }).eq('id', id);
    if (error) { toast('error', 'فشل تعطيل الطبيب'); return; }
    toast('warning', `تم تعطيل ${name}`);
    loadData();
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (error) { toast('error', 'فشل تحديث الموعد'); return; }
    const labels: Record<string, string> = { confirmed: 'تأكيد', cancelled: 'رفض', completed: 'إكمال' };
    toast('success', `تم ${labels[status] || status} الموعد`);
    loadData();
  };

  const addDepartment = () => {
    const trimmed = newDept.trim();
    if (!trimmed) return;
    if (departments.includes(trimmed)) { toast('warning', 'القسم موجود بالفعل'); return; }
    setDepartments((prev) => [...prev, trimmed].sort());
    setNewDept('');
    toast('success', `تمت إضافة قسم "${trimmed}"`);
  };

  const removeDepartment = (dept: string) => {
    setDepartments((prev) => prev.filter((d) => d !== dept));
    toast('success', `تم حذف قسم "${dept}"`);
  };

  const filteredDoctors = doctors.filter((d) =>
    d.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter((a) => a.appointment_date === today);
  const pendingAppts = appointments.filter((a) => a.status === 'pending');
  const confirmedAppts = appointments.filter((a) => a.status === 'confirmed');
  const completedAppts = appointments.filter((a) => a.status === 'completed');
  const cancelledAppts = appointments.filter((a) => a.status === 'cancelled');
  const activeDoctors = doctors.filter((d) => d.is_active);

  const filteredAppointments = apptFilter === 'all'
    ? appointments
    : appointments.filter((a) => a.status === apptFilter);

  // Weekly booking data for chart (last 7 days)
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    return appointments.filter((a) => a.appointment_date === dateStr).length;
  });
  const weeklyMax = Math.max(...weeklyData, 1);

  // Department distribution for donut chart
  const deptCounts = activeDoctors.reduce<Record<string, number>>((acc, d) => {
    acc[d.department] = (acc[d.department] || 0) + 1;
    return acc;
  }, {});
  const topDepts = Object.entries(deptCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  const deptColors = ['#2563eb', '#0891b2', '#059669', '#d97706', '#dc2626'];

  const tabs: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
    { key: 'overview', label: 'نظرة عامة', icon: BarChart3 },
    { key: 'doctors', label: 'الأطباء', icon: Stethoscope, count: doctors.length },
    { key: 'appointments', label: 'المواعيد', icon: Calendar, count: appointments.length },
    { key: 'approvals', label: 'بانتظار الموافقة', icon: Shield, count: pendingDoctors.length },
    { key: 'departments', label: 'الأقسام', icon: Building2, count: departments.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-primary-950 rounded-3xl p-6 sm:p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary-500 rounded-full -translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-accent-500 rounded-full translate-x-1/4 translate-y-1/4" />
          </div>
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-primary-300 text-sm font-medium">لوحة الإدارة</p>
                <h1 className="text-xl font-bold">{profile?.full_name || 'المدير'}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              {new Date().toLocaleDateString('ar-IQ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl border border-gray-100 p-1.5 mb-8 w-fit flex-wrap gap-1 shadow-sm">
          {tabs.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setApptFilter('all'); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === key ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
              {count !== undefined && count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === key ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="card h-24 animate-pulse"></div>)}
          </div>
        ) : activeTab === 'overview' ? (
          /* ===== OVERVIEW TAB ===== */
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: 'إجمالي الحجوزات',
                  value: appointments.length,
                  icon: Calendar,
                  change: pendingAppts.length > 0 ? `+${pendingAppts.length} قيد الانتظار` : '',
                  changeUp: true,
                  color: 'primary',
                  bg: 'bg-primary-50',
                  iconColor: 'text-primary-600',
                },
                {
                  label: 'مواعيد اليوم',
                  value: todayAppts.length,
                  icon: Clock,
                  change: confirmedAppts.filter((a) => a.appointment_date === today).length > 0
                    ? `${confirmedAppts.filter((a) => a.appointment_date === today).length} مؤكد`
                    : '',
                  changeUp: true,
                  color: 'emerald',
                  bg: 'bg-emerald-50',
                  iconColor: 'text-emerald-600',
                },
                {
                  label: 'الأطباء النشطون',
                  value: activeDoctors.length,
                  icon: Stethoscope,
                  change: pendingDoctors.length > 0 ? `${pendingDoctors.length} بانتظار الموافقة` : '',
                  changeUp: false,
                  color: 'amber',
                  bg: 'bg-amber-50',
                  iconColor: 'text-amber-600',
                },
                {
                  label: 'معدل الإكمال',
                  value: appointments.length > 0 ? Math.round((completedAppts.length / appointments.length) * 100) : 0,
                  icon: TrendingUp,
                  change: appointments.length > 0 ? `${completedAppts.length} من ${appointments.length}` : '',
                  changeUp: true,
                  color: 'cyan',
                  bg: 'bg-cyan-50',
                  iconColor: 'text-cyan-600',
                  suffix: '%',
                },
              ].map(({ label, value, icon: Icon, change, changeUp, bg, iconColor, suffix }) => (
                <div key={label} className="card p-5 hover:shadow-card-hover transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    {change && (
                      <span className={`flex items-center gap-0.5 text-xs font-medium ${changeUp ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {changeUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {change}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{value}{suffix || ''}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Weekly Bookings Chart */}
              <div className="lg:col-span-2 card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-gray-900">الحجوزات الأسبوعية</h3>
                    <p className="text-xs text-gray-400 mt-0.5">آخر 7 أيام</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-lg">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {appointments.length} حجز إجمالي
                  </div>
                </div>
                <div className="flex items-end gap-2 h-32">
                  {weeklyData.map((count, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    const dayName = d.toLocaleDateString('ar-IQ', { weekday: 'short' });
                    const isToday = i === 6;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-xs font-semibold text-gray-700">{count}</span>
                        <div
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            isToday
                              ? 'bg-gradient-to-t from-primary-600 to-primary-400'
                              : count > 0
                              ? 'bg-gradient-to-t from-primary-200 to-primary-100 hover:from-primary-300 hover:to-primary-200'
                              : 'bg-gray-50'
                          }`}
                          style={{ height: `${Math.max((count / weeklyMax) * 100, 4)}%` }}
                        />
                        <span className={`text-xs ${isToday ? 'font-bold text-primary-600' : 'text-gray-400'}`}>
                          {dayName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Distribution */}
              <div className="card p-6">
                <h3 className="font-bold text-gray-900 mb-1">توزيع المواعيد</h3>
                <p className="text-xs text-gray-400 mb-6">حسب الحالة</p>
                <div className="flex justify-center mb-6">
                  <DonutChart
                    segments={[
                      { value: pendingAppts.length, color: '#f59e0b', label: 'قيد الانتظار' },
                      { value: confirmedAppts.length, color: '#2563eb', label: 'مؤكد' },
                      { value: completedAppts.length, color: '#059669', label: 'مكتمل' },
                      { value: cancelledAppts.length, color: '#dc2626', label: 'ملغي' },
                    ]}
                    size={100}
                  />
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: 'قيد الانتظار', count: pendingAppts.length, color: 'bg-amber-400' },
                    { label: 'مؤكد', count: confirmedAppts.length, color: 'bg-primary-500' },
                    { label: 'مكتمل', count: completedAppts.length, color: 'bg-emerald-500' },
                    { label: 'ملغي', count: cancelledAppts.length, color: 'bg-red-500' },
                  ].map(({ label, count, color }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                        <span className="text-sm text-gray-600">{label}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Row: Department Distribution + Recent Appointments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Departments */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-gray-900">الأقسام الأكثر نشاطاً</h3>
                    <p className="text-xs text-gray-400 mt-0.5">حسب عدد الأطباء</p>
                  </div>
                  <button onClick={() => setActiveTab('departments')} className="text-xs text-primary-600 font-semibold hover:underline">
                    عرض الكل
                  </button>
                </div>
                {topDepts.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">لا توجد أقسام نشطة</p>
                ) : (
                  <div className="space-y-3">
                    {topDepts.map(([dept, count], i) => {
                      const pct = Math.round((count / activeDoctors.length) * 100);
                      return (
                        <div key={dept}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-gray-700">{dept}</span>
                            <span className="text-xs text-gray-500">{count} طبيب ({pct}%)</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${pct}%`,
                                background: deptColors[i],
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent Appointments */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-gray-900">أحدث المواعيد</h3>
                    <p className="text-xs text-gray-400 mt-0.5">آخر 5 مواعيد</p>
                  </div>
                  <button onClick={() => setActiveTab('appointments')} className="text-xs text-primary-600 font-semibold hover:underline">
                    عرض الكل
                  </button>
                </div>
                <div className="space-y-3">
                  {appointments.slice(0, 5).map((appt) => {
                    const StatusIcon = statusIcons[appt.status] || AlertCircle;
                    return (
                      <div key={appt.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          appt.status === 'completed' ? 'bg-emerald-50' :
                          appt.status === 'confirmed' ? 'bg-primary-50' :
                          appt.status === 'pending' ? 'bg-amber-50' : 'bg-red-50'
                        }`}>
                          <StatusIcon className={`w-4 h-4 ${
                            appt.status === 'completed' ? 'text-emerald-600' :
                            appt.status === 'confirmed' ? 'text-primary-600' :
                            appt.status === 'pending' ? 'text-amber-600' : 'text-red-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{appt.doctors?.full_name}</p>
                          <p className="text-xs text-gray-400 truncate">{appt.profiles?.full_name}</p>
                        </div>
                        <div className="text-left shrink-0">
                          <p className="text-xs font-medium text-gray-600">
                            {new Date(appt.appointment_date).toLocaleDateString('ar-IQ', { month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-xs text-gray-400">{appt.appointment_time.substring(0, 5)}</p>
                        </div>
                      </div>
                    );
                  })}
                  {appointments.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-8">لا توجد مواعيد بعد</p>
                  )}
                </div>
              </div>
            </div>

            {/* Pending Approvals Quick View */}
            {pendingDoctors.length > 0 && (
              <div className="card p-6 border-amber-200 border-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">بانتظار الموافقة</h3>
                    <span className="badge-pending">{pendingDoctors.length}</span>
                  </div>
                  <button onClick={() => setActiveTab('approvals')} className="text-xs text-primary-600 font-semibold hover:underline">
                    إدارة الموافقات
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {pendingDoctors.slice(0, 3).map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 bg-amber-50/50 rounded-xl p-3 border border-amber-100">
                      <img
                        src={doc.avatar_url || 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=200'}
                        alt={doc.full_name}
                        className="w-10 h-10 rounded-xl object-cover object-top shrink-0"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{doc.full_name}</p>
                        <p className="text-xs text-primary-600">{doc.specialty}</p>
                      </div>
                      <button
                        onClick={() => approveDoctor(doc.id, doc.full_name)}
                        className="w-8 h-8 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-lg flex items-center justify-center transition-colors shrink-0"
                        title="موافقة"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'doctors' ? (
          /* ===== DOCTORS TAB ===== */
          <div>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="البحث عن أطباء..."
                  className="input-field pr-9"
                />
              </div>
              <button onClick={openAddForm} className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm">
                <Plus className="w-4 h-4" /> إضافة طبيب
              </button>
            </div>

            <div className="space-y-3">
              {filteredDoctors.map((doc) => (
                <div key={doc.id} className="card p-4 hover:shadow-card-hover transition-shadow">
                  <div className="flex items-center gap-4">
                    <img
                      src={doc.avatar_url || 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=200'}
                      alt={doc.full_name}
                      className="w-14 h-14 rounded-xl object-cover object-top shrink-0"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 text-sm truncate">{doc.full_name}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          doc.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {doc.is_active ? 'نشط' : 'غير نشط'}
                        </span>
                      </div>
                      <p className="text-xs text-primary-600 font-medium">{doc.specialty} &mdash; {doc.department}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{doc.location} &middot; {doc.experience_years} سنوات &middot; {Number(doc.consultation_fee).toLocaleString()} د.ع</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => openEditForm(doc)} className="p-2 rounded-lg hover:bg-primary-50 text-primary-600 transition-colors" title="تعديل">
                        <EditIcon className="w-4 h-4" />
                      </button>
                      {doc.is_active ? (
                        <button onClick={() => deactivateDoctor(doc.id, doc.full_name)} className="p-2 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors" title="تعطيل">
                          <Eye className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => approveDoctor(doc.id, doc.full_name)} className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors" title="تفعيل">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => { if (confirm(`هل تريد حذف ${doc.full_name}؟`)) deleteDoctor(doc.id, doc.full_name); }} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="حذف">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredDoctors.length === 0 && (
                <div className="text-center py-12 card">
                  <Stethoscope className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">لم يتم العثور على أطباء</p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'appointments' ? (
          /* ===== APPOINTMENTS TAB ===== */
          <div>
            {/* Appointment Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'قيد الانتظار', value: pendingAppts.length, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'مؤكد', value: confirmedAppts.length, icon: CalendarCheck, color: 'text-primary-600', bg: 'bg-primary-50' },
                { label: 'مكتمل', value: completedAppts.length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'ملغي', value: cancelledAppts.length, icon: CalendarX, color: 'text-red-600', bg: 'bg-red-50' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="card p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500 font-medium">تصفية:</span>
              {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
                <button
                  key={s}
                  onClick={() => setApptFilter(s)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                    apptFilter === s ? 'bg-primary-100 text-primary-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {statusLabels[s]}
                </button>
              ))}
            </div>

            {/* Appointments List */}
            <div className="space-y-3">
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-16 card">
                  <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-600 mb-1">لم يتم العثور على مواعيد</h3>
                  <p className="text-sm text-gray-400">جرّب تغيير التصفية</p>
                </div>
              ) : (
                filteredAppointments.map((appt) => {
                  const StatusIcon = statusIcons[appt.status] || AlertCircle;
                  return (
                    <div key={appt.id} className="card p-5 hover:shadow-card-hover transition-shadow">
                      <div className="flex items-start gap-4">
                        <img
                          src={appt.doctors?.avatar_url || 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=200'}
                          alt={appt.doctors?.full_name}
                          className="w-12 h-12 rounded-xl object-cover object-top shrink-0"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{appt.doctors?.full_name}</p>
                              <p className="text-xs text-primary-600">{appt.doctors?.specialty}</p>
                            </div>
                            <span className={statusColors[appt.status]}>
                              <StatusIcon className="w-3 h-3" />
                              {statusLabels[appt.status]}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-2 mb-1">
                            <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1">
                              <Users className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-600">{appt.profiles?.full_name}</span>
                            </div>
                            {appt.profiles?.phone && (
                              <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1">
                                <Phone className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-600" dir="ltr">{appt.profiles.phone}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(appt.appointment_date).toLocaleDateString('ar-IQ', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {appt.appointment_time.substring(0, 5)}
                            </span>
                          </div>

                          {appt.reason && (
                            <p className="text-xs text-gray-400 mt-1.5 line-clamp-1">السبب: {appt.reason}</p>
                          )}
                          {appt.notes && (
                            <div className="mt-1.5 bg-primary-50 rounded-lg px-2.5 py-1.5">
                              <p className="text-xs text-primary-700">
                                <span className="font-semibold">ملاحظات المريض:</span> {appt.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-50">
                        {appt.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateAppointmentStatus(appt.id, 'confirmed')}
                              className="flex items-center gap-1 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> تأكيد
                            </button>
                            <button
                              onClick={() => updateAppointmentStatus(appt.id, 'cancelled')}
                              className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" /> رفض
                            </button>
                          </>
                        )}
                        {appt.status === 'confirmed' && (
                          <button
                            onClick={() => updateAppointmentStatus(appt.id, 'completed')}
                            className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> إكمال
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : activeTab === 'approvals' ? (
          /* ===== APPROVALS TAB ===== */
          <div className="space-y-3">
            {pendingDoctors.length === 0 ? (
              <div className="text-center py-16 card">
                <CheckCircle className="w-12 h-12 text-emerald-200 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-600 mb-1">كل شيء محدّث!</h3>
                <p className="text-sm text-gray-400">لا توجد موافقات أطباء معلقة</p>
              </div>
            ) : (
              pendingDoctors.map((doc) => (
                <div key={doc.id} className="card p-5 border-2 border-amber-200 hover:shadow-card-hover transition-shadow">
                  <div className="flex items-start gap-4">
                    <img
                      src={doc.avatar_url || 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=200'}
                      alt={doc.full_name}
                      className="w-16 h-16 rounded-xl object-cover object-top shrink-0"
                      loading="lazy"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-gray-900">{doc.full_name}</p>
                        <span className="badge-pending">قيد الانتظار</span>
                      </div>
                      <p className="text-sm text-primary-600 font-medium">{doc.specialty}</p>
                      <p className="text-xs text-gray-500 mt-1">{doc.department} &middot; {doc.location}</p>
                      {doc.bio && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{doc.bio}</p>}
                      {doc.profiles && (
                        <p className="text-xs text-gray-400 mt-1">الهاتف: {doc.profiles?.phone || 'غير متوفر'}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={() => approveDoctor(doc.id, doc.full_name)} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors">
                        <CheckCircle className="w-3.5 h-3.5" /> موافقة
                      </button>
                      <button onClick={() => { if (confirm(`هل تريد رفض ${doc.full_name}؟`)) deleteDoctor(doc.id, doc.full_name); }} className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-xl text-xs font-semibold transition-colors border border-red-200">
                        <XCircle className="w-3.5 h-3.5" /> رفض
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* ===== DEPARTMENTS TAB ===== */
          <div>
            <div className="card p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4">إضافة قسم جديد</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addDepartment()}
                  placeholder="اسم القسم..."
                  className="input-field"
                />
                <button onClick={addDepartment} disabled={!newDept.trim()} className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-50">
                  <Plus className="w-4 h-4" /> إضافة
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {departments.map((dept) => {
                const docCount = activeDoctors.filter((d) => d.department === dept).length;
                return (
                  <div key={dept} className="card p-4 flex items-center justify-between group hover:border-primary-200 hover:shadow-card-hover transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-700">{dept}</span>
                        {docCount > 0 && (
                          <p className="text-xs text-gray-400">{docCount} طبيب</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeDepartment(dept)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Doctor Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">
                    {editingDoctor ? 'تعديل الطبيب' : 'إضافة طبيب جديد'}
                  </h2>
                  <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">الاسم الكامل *</label>
                    <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input-field" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">التخصص</label>
                      <select value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className="input-field bg-white">
                        {ALL_SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">القسم</label>
                      <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input-field bg-white">
                        {departments.map((d) => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">النبذة</label>
                    <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="input-field resize-none" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">الموقع</label>
                    <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field" />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">الخبرة (سنوات)</label>
                      <input type="number" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: Number(e.target.value) })} className="input-field" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">الرسوم (د.ع)</label>
                      <input type="number" value={form.consultation_fee} onChange={(e) => setForm({ ...form, consultation_fee: Number(e.target.value) })} className="input-field" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">التقييم</label>
                      <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="input-field" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">واتساب</label>
                      <input type="text" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="+964..." className="input-field" dir="ltr" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">رابط الصورة</label>
                      <input type="text" value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} placeholder="https://..." className="input-field" dir="ltr" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">خط العرض</label>
                      <input type="number" step="0.0001" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: Number(e.target.value) })} className="input-field" dir="ltr" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">خط الطول</label>
                      <input type="number" step="0.0001" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: Number(e.target.value) })} className="input-field" dir="ltr" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 py-2.5 text-sm">
                    إلغاء
                  </button>
                  <button onClick={saveDoctor} className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm">
                    <Save className="w-4 h-4" />
                    {editingDoctor ? 'تحديث الطبيب' : 'إضافة طبيب'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
