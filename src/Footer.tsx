import { Link } from 'react-router-dom';
import { Heart, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-400 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" fill="white" />
              </div>
              <span className="text-lg font-bold text-white">Heal<span className="text-primary-400">Basra</span></span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Advanced medical booking platform connecting patients with top-rated doctors across Basra, Iraq.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/', label: 'Home' },
                { to: '/doctors', label: 'Find Doctors' },
                { to: '/departments', label: 'Departments' },
                { to: '/map', label: 'Clinic Map' },
                { to: '/auth?mode=register', label: 'Book Appointment' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="hover:text-primary-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Departments */}
          <div>
            <h4 className="text-white font-semibold mb-4">Departments</h4>
            <ul className="space-y-2.5 text-sm">
              {['Cardiology', 'Dentistry', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology'].map((d) => (
                <li key={d}>
                  <Link to={`/doctors?department=${d}`} className="hover:text-primary-400 transition-colors">{d}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 text-primary-400 shrink-0" />
                Al-Ashar Medical District, Basra, Iraq
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary-400 shrink-0" />
                +964 770 000 0000
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary-400 shrink-0" />
                info@healbasra.iq
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>&copy; 2026 HealBasra. All rights reserved.</p>
          <p>Powered by advanced medical technology for a healthier Basra</p>
        </div>
      </div>
    </footer>
  );
}
