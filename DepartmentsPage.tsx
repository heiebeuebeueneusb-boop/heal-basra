import { Link } from 'react-router-dom';
import {
  Heart, Brain, Eye, Baby, Bone, Smile, Stethoscope, Zap, FlaskConical,
  Wind, Activity, Sparkles, Users, Scissors, Star, Radio, ScanLine,
  Scan, TestTube, Syringe, PersonStanding, Ear, Droplets, BrainCircuit, ChevronRight
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart, Brain, Eye, Baby, Bone, Smile, Stethoscope, Zap, FlaskConical,
  Wind, Activity, Sparkles, Users, Scissors, Star, Radio, ScanLine,
  Scan, TestTube, Syringe, PersonStanding, Ear, Droplets, BrainCircuit,
};

const categories = [
  {
    title: 'Medical Treatment',
    subtitle: 'Comprehensive specialist care',
    color: 'primary',
    departments: [
      { name: 'Cardiology', icon: 'Heart', desc: 'Heart and cardiovascular system', count: 12 },
      { name: 'Dentistry', icon: 'Smile', desc: 'Oral health and dental care', count: 10 },
      { name: 'Dermatology', icon: 'Sparkles', desc: 'Skin, hair and nail disorders', count: 8 },
      { name: 'Pediatrics', icon: 'Baby', desc: "Children's health and development", count: 15 },
      { name: 'Orthopedics', icon: 'Bone', desc: 'Bones, joints and muscles', count: 9 },
      { name: 'Internal Medicine', icon: 'Stethoscope', desc: 'Adult internal diseases', count: 11 },
      { name: 'Neurology', icon: 'Brain', desc: 'Brain and nervous system', count: 7 },
      { name: 'Ophthalmology', icon: 'Eye', desc: 'Eye health and vision care', count: 6 },
      { name: 'ENT', icon: 'Ear', desc: 'Ear, nose and throat', count: 8 },
      { name: 'General Surgery', icon: 'Scissors', desc: 'Surgical procedures', count: 10 },
      { name: 'Plastic Surgery', icon: 'Star', desc: 'Reconstructive and cosmetic', count: 5 },
      { name: 'Pulmonology', icon: 'Wind', desc: 'Lungs and respiratory system', count: 6 },
      { name: 'Gastroenterology', icon: 'Activity', desc: 'Digestive system disorders', count: 7 },
      { name: 'Hematology', icon: 'Droplets', desc: 'Blood disorders and diseases', count: 5 },
    ],
  },
  {
    title: 'Diagnostic Services',
    subtitle: 'Advanced medical diagnostics',
    color: 'emerald',
    departments: [
      { name: 'Radiology', icon: 'Radio', desc: 'X-ray imaging services', count: 8 },
      { name: 'MRI', icon: 'ScanLine', desc: 'Magnetic resonance imaging', count: 4 },
      { name: 'CT Scan', icon: 'Scan', desc: 'Computed tomography scans', count: 4 },
      { name: 'Medical Laboratory', icon: 'FlaskConical', desc: 'Lab tests and analysis', count: 6 },
      { name: 'Clinical Tests', icon: 'TestTube', desc: 'Blood and urine tests', count: 5 },
    ],
  },
  {
    title: 'Specialized Care',
    subtitle: 'Expert specialized medical services',
    color: 'amber',
    departments: [
      { name: 'Anesthesiology', icon: 'Syringe', desc: 'Pain management and sedation', count: 5 },
      { name: 'Emergency Medicine', icon: 'Zap', desc: '24/7 emergency services', count: 8 },
      { name: 'Psychiatry', icon: 'BrainCircuit', desc: 'Mental health and behavioral', count: 6 },
      { name: 'Physiotherapy', icon: 'PersonStanding', desc: 'Rehabilitation and recovery', count: 9 },
      { name: 'Family Medicine', icon: 'Users', desc: 'Primary care for all ages', count: 14 },
    ],
  },
];

const colorMap: Record<string, { badge: string; icon: string; border: string; text: string }> = {
  primary: {
    badge: 'bg-primary-50 text-primary-600 border-primary-100',
    icon: 'bg-primary-50 text-primary-600',
    border: 'border-primary-200',
    text: 'text-primary-600',
  },
  emerald: {
    badge: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    icon: 'bg-emerald-50 text-emerald-600',
    border: 'border-emerald-200',
    text: 'text-emerald-600',
  },
  amber: {
    badge: 'bg-amber-50 text-amber-600 border-amber-100',
    icon: 'bg-amber-50 text-amber-600',
    border: 'border-amber-200',
    text: 'text-amber-600',
  },
};

export default function DepartmentsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="section-heading mb-3">Medical Departments</h1>
          <p className="section-subheading max-w-xl mx-auto">
            Browse all 24 specialized departments at HealBasra. Find the right specialist for your medical needs.
          </p>
        </div>

        {categories.map((cat) => {
          const colors = colorMap[cat.color];
          return (
            <div key={cat.title} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{cat.title}</h2>
                  <p className="text-sm text-gray-500">{cat.subtitle}</p>
                </div>
                <span className={`ml-auto border text-xs font-semibold px-3 py-1 rounded-full ${colors.badge}`}>
                  {cat.departments.length} departments
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {cat.departments.map((dept) => {
                  const Icon = iconMap[dept.icon] || Heart;
                  return (
                    <Link
                      key={dept.name}
                      to={`/doctors?department=${dept.name}`}
                      className={`group card p-5 ${colors.border} border-opacity-50 hover:border-opacity-100`}
                    >
                      <div className={`w-11 h-11 rounded-xl ${colors.icon} bg-opacity-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-gray-800 text-sm mb-1">{dept.name}</h3>
                      <p className="text-xs text-gray-400 mb-3 leading-relaxed">{dept.desc}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{dept.count} doctors</span>
                        <ChevronRight className={`w-3.5 h-3.5 ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
