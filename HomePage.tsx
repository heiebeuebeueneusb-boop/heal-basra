import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, ArrowRight, Shield, Clock, Award, MapPin,
  Heart, Brain, Eye, Baby, Bone, Smile, Stethoscope,
  Zap, FlaskConical, Wind, Activity, Sparkles, Users,
  ChevronRight, Star, Phone
} from 'lucide-react';
import { supabase, Doctor } from '../lib/supabase';
import DoctorCard from '../components/ui/DoctorCard';

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart, Brain, Eye, Baby, Bone, Smile, Stethoscope, Zap,
  FlaskConical, Wind, Activity, Sparkles, Users,
};

const deptData = [
  { name: 'Cardiology', icon: 'Heart', color: 'from-red-500 to-rose-400', bg: 'bg-red-50', count: '12 Doctors' },
  { name: 'Neurology', icon: 'Brain', color: 'from-teal-500 to-cyan-400', bg: 'bg-teal-50', count: '8 Doctors' },
  { name: 'Pediatrics', icon: 'Baby', color: 'from-pink-500 to-rose-400', bg: 'bg-pink-50', count: '15 Doctors' },
  { name: 'Dentistry', icon: 'Smile', color: 'from-primary-500 to-accent-400', bg: 'bg-primary-50', count: '10 Doctors' },
  { name: 'Orthopedics', icon: 'Bone', color: 'from-orange-500 to-amber-400', bg: 'bg-orange-50', count: '9 Doctors' },
  { name: 'Ophthalmology', icon: 'Eye', color: 'from-cyan-500 to-teal-400', bg: 'bg-cyan-50', count: '7 Doctors' },
  { name: 'Emergency', icon: 'Zap', color: 'from-red-600 to-orange-500', bg: 'bg-red-50', count: '24/7 Service' },
  { name: 'Laboratory', icon: 'FlaskConical', color: 'from-emerald-500 to-green-400', bg: 'bg-emerald-50', count: '6 Services' },
];

const stats = [
  { value: '200+', label: 'Expert Doctors', icon: Stethoscope },
  { value: '25+', label: 'Departments', icon: Activity },
  { value: '10K+', label: 'Patients Served', icon: Heart },
  { value: '4.8', label: 'Average Rating', icon: Star },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredDoctors, setFeaturedDoctors] = useState<Doctor[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from('doctors')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false })
      .limit(4)
      .then(({ data }) => {
        if (data) setFeaturedDoctors(data);
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/doctors?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden gradient-dark">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600 rounded-full blur-3xl opacity-30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-primary-500/20 border border-primary-400/30 text-primary-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Basra's #1 Medical Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Advanced Healthcare
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
                  at Your Fingertips
                </span>
              </h1>

              <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-lg">
                Connect with Basra's finest medical specialists. Book appointments instantly, manage your health records, and get world-class care close to home.
              </p>

              {/* Search */}
              <form onSubmit={handleSearch} className="relative mb-8">
                <div className="flex bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <div className="flex items-center pl-4 text-gray-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search doctors, specialties..."
                    className="flex-1 px-4 py-4 text-gray-800 placeholder-gray-400 focus:outline-none text-sm"
                  />
                  <button
                    type="submit"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-4 font-semibold text-sm transition-colors"
                  >
                    Search
                  </button>
                </div>
              </form>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/doctors"
                  className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-primary-900/50"
                >
                  Book Appointment <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/map"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm"
                >
                  <MapPin className="w-4 h-4" /> View Map
                </Link>
              </div>
            </div>

            {/* Hero card mockup */}
            <div className="hidden lg:block relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="relative mx-auto w-full max-w-sm">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl">
                  <img
                    src="https://images.pexels.com/photos/5214949/pexels-photo-5214949.jpeg?auto=compress&cs=tinysrgb&w=600"
                    alt="Doctor consultation"
                    className="w-full h-56 object-cover object-top rounded-2xl mb-4"
                    loading="lazy"
                  />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm">Dr. Sara Al-Khafaji</p>
                      <p className="text-xs text-primary-300">Specialist Dentist</p>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-400/20 px-2 py-1 rounded-lg">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-amber-400">4.7</span>
                    </div>
                  </div>
                  <div className="bg-primary-600 rounded-xl py-2.5 text-center text-white text-sm font-semibold">
                    Book Appointment
                  </div>
                </div>

                <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-xl p-3 flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">Verified Doctors</p>
                    <p className="text-xs text-gray-400">200+ specialists</p>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-6 bg-white rounded-xl shadow-xl p-3 flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.7s' }}>
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">24/7 Available</p>
                    <p className="text-xs text-gray-400">Emergency care</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-heading mb-2">Medical Departments</h2>
              <p className="section-subheading">Specialized care across all medical fields</p>
            </div>
            <Link to="/departments" className="hidden sm:flex items-center gap-1 text-primary-600 font-semibold text-sm hover:gap-2 transition-all">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {deptData.map((dept) => {
              const Icon = categoryIcons[dept.icon] || Heart;
              return (
                <Link
                  key={dept.name}
                  to={`/doctors?department=${dept.name}`}
                  className="group card p-5 hover:border-primary-200"
                >
                  <div className={`w-12 h-12 rounded-xl ${dept.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <div className={`w-6 h-6 bg-gradient-to-br ${dept.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">{dept.name}</h3>
                  <p className="text-xs text-gray-400">{dept.count}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      {featuredDoctors.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="section-heading mb-2">Top-Rated Doctors</h2>
                <p className="section-subheading">Highly recommended specialists in Basra</p>
              </div>
              <Link to="/doctors" className="hidden sm:flex items-center gap-1 text-primary-600 font-semibold text-sm hover:gap-2 transition-all">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredDoctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="py-16 gradient-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Why Choose HealBasra?</h2>
            <p className="text-primary-100 max-w-xl mx-auto">We're committed to making healthcare accessible, transparent, and convenient for everyone in Basra</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Verified Specialists', desc: 'All doctors are board-certified and thoroughly vetted for your safety and peace of mind.' },
              { icon: Clock, title: 'Instant Booking', desc: 'Book appointments in seconds with real-time availability -- no waiting, no hassle.' },
              { icon: Award, title: 'Trusted Care', desc: 'Join over 10,000 patients who trust HealBasra for their healthcare needs in Basra.' },
              { icon: MapPin, title: 'Basra Coverage', desc: 'Find top doctors in every district of Basra with our comprehensive clinic map.' },
              { icon: Phone, title: '24/7 Support', desc: 'Our support team and emergency doctors are available around the clock for your needs.' },
              { icon: Heart, title: 'Patient First', desc: 'Your health and comfort are our highest priority at every step of your care journey.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-colors">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-primary-100 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-heading mb-4">Ready to Take Control of Your Health?</h2>
          <p className="text-gray-500 mb-8">Join thousands of patients in Basra who manage their health conveniently with HealBasra</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/auth?mode=register"
              className="btn-primary flex items-center gap-2 px-7 py-3.5 shadow-lg"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/doctors"
              className="btn-secondary flex items-center gap-2 px-7 py-3.5"
            >
              Browse Doctors
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
