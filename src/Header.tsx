import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Heart, User, LogOut, LayoutDashboard, ChevronDown, Shield, Stethoscope } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dropRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setDropOpen(false);
    setMenuOpen(false);
  };

  const isActive = (path: string) =>
    location.pathname === path ? 'text-primary-600 font-semibold' : 'text-gray-600 hover:text-primary-600';

  const getDashboardPath = () => {
    if (profile?.role === 'admin') return '/admin';
    if (profile?.role === 'doctor') return '/dashboard/doctor';
    return '/dashboard/patient';
  };

  const getDashboardLabel = () => {
    if (profile?.role === 'admin') return 'Admin Panel';
    if (profile?.role === 'doctor') return 'Doctor Dashboard';
    return 'My Dashboard';
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    if (dropOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setDropOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/doctors', label: 'Doctors' },
    { to: '/departments', label: 'Departments' },
    { to: '/map', label: 'Find on Map' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">Heal</span>
              <span className="text-lg font-bold text-primary-600">Basra</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-sm px-3 py-2 rounded-lg transition-colors ${isActive(to)}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-xl px-3 py-2 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
                    {profile?.role === 'admin' ? (
                      <Shield className="w-3.5 h-3.5 text-primary-600" />
                    ) : profile?.role === 'doctor' ? (
                      <Stethoscope className="w-3.5 h-3.5 text-primary-600" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-primary-600" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {profile?.full_name || 'Account'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropOpen && (
                  <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-modal border border-gray-100 py-2 z-50 animate-scale-in">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-sm font-semibold text-gray-900 truncate">{profile?.full_name}</p>
                      <p className="text-xs text-gray-400 capitalize">{profile?.role}</p>
                    </div>
                    <Link
                      to={getDashboardPath()}
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      {getDashboardLabel()}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/auth" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors px-3 py-2">
                  Sign In
                </Link>
                <Link to="/auth?mode=register" className="btn-primary text-sm px-4 py-2">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-slide-up">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive(to)}`}
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-gray-100 space-y-1">
            {user ? (
              <>
                <div className="px-3 py-2 mb-2">
                  <p className="text-sm font-semibold text-gray-900">{profile?.full_name}</p>
                  <p className="text-xs text-gray-400 capitalize">{profile?.role}</p>
                </div>
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  <LayoutDashboard className="w-4 h-4" /> {getDashboardLabel()}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/auth" className="flex-1 text-center py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200">
                  Sign In
                </Link>
                <Link to="/auth?mode=register" className="flex-1 text-center py-2.5 rounded-lg text-sm font-medium bg-primary-600 text-white">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
