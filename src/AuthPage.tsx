import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Heart, Eye, EyeOff, User, Mail, Phone, Stethoscope, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [isRegister, setIsRegister] = useState(searchParams.get('mode') === 'register');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    email: '', password: '', fullName: '', phone: '',
  });

  const { signIn, signUp, user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'admin') navigate('/admin');
      else if (profile.role === 'doctor') navigate('/dashboard/doctor');
      else navigate('/dashboard/patient');
    }
  }, [user, profile, navigate]);

  const validateForm = (): boolean => {
    if (!form.email.trim()) { setError('Email address is required'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { setError('Please enter a valid email address'); return false; }
    if (!form.password) { setError('Password is required'); return false; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return false; }
    if (isRegister && !form.fullName.trim()) { setError('Full name is required'); return false; }
    if (isRegister && form.fullName.trim().length < 2) { setError('Name must be at least 2 characters'); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    if (isRegister) {
      const { error: err } = await signUp(form.email, form.password, form.fullName, role, form.phone);
      if (err) {
        setError(err);
      } else {
        toast('success', 'Account created successfully!');
        if (role === 'doctor') {
          setSuccess('Account created! Your doctor profile is pending admin approval. You can sign in now.');
        } else {
          setSuccess('Account created! You can now sign in with your credentials.');
        }
        setIsRegister(false);
        setForm({ email: form.email, password: '', fullName: '', phone: '' });
      }
    } else {
      const { error: err } = await signIn(form.email, form.password);
      if (err) {
        setError(err);
      } else {
        toast('success', 'Welcome back!');
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center pt-16 pb-10 px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white" fill="white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Heal<span className="text-primary-600">Basra</span></span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isRegister ? 'Join thousands of patients and doctors' : 'Sign in to access your dashboard'}
          </p>
        </div>

        <div className="card p-7">
          {/* Toggle */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
            <button
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${!isRegister ? 'bg-white shadow text-primary-600' : 'text-gray-500'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${isRegister ? 'bg-white shadow text-primary-600' : 'text-gray-500'}`}
            >
              Register
            </button>
          </div>

          {/* Role selector for register */}
          {isRegister && (
            <div className="grid grid-cols-2 gap-3 mb-5">
              {([
                { r: 'patient' as const, Icon: User, label: 'Patient', desc: 'Book appointments' },
                { r: 'doctor' as const, Icon: Stethoscope, label: 'Doctor', desc: 'Manage practice' },
              ]).map(({ r, Icon, label, desc }) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all ${
                    role === r
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-semibold">{label}</span>
                  <span className="text-xs opacity-70">{desc}</span>
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 animate-scale-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-4 animate-scale-in">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder={role === 'doctor' ? 'Dr. Ahmed Al-Bassam' : 'Ahmed Al-Bassam'}
                    required
                    className="input-field pl-9"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="input-field pl-9"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+964 770 000 0000"
                    className="input-field pl-9"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {isRegister && (
                <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Please wait...
                </span>
              ) : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {isRegister && role === 'doctor' && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg mt-4">
              Doctor accounts require admin approval before being publicly visible. You can still sign in and set up your schedule while waiting.
            </p>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing, you agree to HealBasra's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
