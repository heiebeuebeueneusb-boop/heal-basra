export type Department = {
  name: string;
  icon: string;
  category: 'treatment' | 'diagnostic' | 'specialized';
  color: string;
};

export const departments: Department[] = [
  // Treatment
  { name: 'Cardiology', icon: 'Heart', category: 'treatment', color: 'text-red-500 bg-red-50' },
  { name: 'Dentistry', icon: 'SmilePlus', category: 'treatment', color: 'text-blue-500 bg-blue-50' },
  { name: 'Dermatology', icon: 'Sparkles', category: 'treatment', color: 'text-amber-500 bg-amber-50' },
  { name: 'Pediatrics', icon: 'Baby', category: 'treatment', color: 'text-pink-500 bg-pink-50' },
  { name: 'Orthopedics', icon: 'Bone', category: 'treatment', color: 'text-orange-500 bg-orange-50' },
  { name: 'Internal Medicine', icon: 'Stethoscope', category: 'treatment', color: 'text-teal-500 bg-teal-50' },
  { name: 'Neurology', icon: 'Brain', category: 'treatment', color: 'text-violet-500 bg-violet-50' },
  { name: 'Ophthalmology', icon: 'Eye', category: 'treatment', color: 'text-cyan-500 bg-cyan-50' },
  { name: 'ENT', icon: 'Ear', category: 'treatment', color: 'text-emerald-500 bg-emerald-50' },
  { name: 'General Surgery', icon: 'Scissors', category: 'treatment', color: 'text-slate-500 bg-slate-50' },
  { name: 'Plastic Surgery', icon: 'Star', category: 'treatment', color: 'text-rose-500 bg-rose-50' },
  { name: 'Pulmonology', icon: 'Wind', category: 'treatment', color: 'text-sky-500 bg-sky-50' },
  { name: 'Gastroenterology', icon: 'Activity', category: 'treatment', color: 'text-lime-600 bg-lime-50' },
  { name: 'Hematology', icon: 'Droplets', category: 'treatment', color: 'text-red-600 bg-red-50' },
  // Diagnostic
  { name: 'Radiology', icon: 'Radio', category: 'diagnostic', color: 'text-blue-600 bg-blue-50' },
  { name: 'MRI', icon: 'ScanLine', category: 'diagnostic', color: 'text-indigo-500 bg-indigo-50' },
  { name: 'CT Scan', icon: 'Scan', category: 'diagnostic', color: 'text-purple-500 bg-purple-50' },
  { name: 'Medical Laboratory', icon: 'FlaskConical', category: 'diagnostic', color: 'text-green-600 bg-green-50' },
  { name: 'Clinical Tests', icon: 'TestTube', category: 'diagnostic', color: 'text-yellow-600 bg-yellow-50' },
  // Specialized
  { name: 'Anesthesiology', icon: 'Syringe', category: 'specialized', color: 'text-gray-600 bg-gray-50' },
  { name: 'Emergency Medicine', icon: 'Zap', category: 'specialized', color: 'text-red-500 bg-red-50' },
  { name: 'Psychiatry', icon: 'BrainCircuit', category: 'specialized', color: 'text-violet-600 bg-violet-50' },
  { name: 'Physiotherapy', icon: 'PersonStanding', category: 'specialized', color: 'text-green-500 bg-green-50' },
  { name: 'Family Medicine', icon: 'Users', category: 'specialized', color: 'text-blue-500 bg-blue-50' },
];
