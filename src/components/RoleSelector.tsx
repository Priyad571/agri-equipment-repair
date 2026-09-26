import { Tractor, Wrench, ClipboardList, Handshake, Star } from 'lucide-react';

type Role = 'farmer' | 'technician';

interface Props {
  onSelect: (role: Role) => void;
}

export default function RoleSelector({ onSelect }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-green-50 via-stone-50 to-amber-50">
      <div className="text-center mb-10 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-600 text-white mb-4 shadow-lg shadow-green-600/30">
          <Tractor className="w-9 h-9" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
          One-Stop Agri Equipment Repair
        </h1>
        <p className="mt-3 text-stone-600 max-w-md mx-auto">
          Get your farm equipment back to work fast. Choose how you'd like to continue.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 w-full max-w-2xl">
        <button
          onClick={() => onSelect('farmer')}
          className="group relative flex flex-col items-center text-center p-8 rounded-2xl bg-white border-2 border-stone-200 hover:border-green-500 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 animate-slide-up"
        >
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-green-100 text-green-700 mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
            <Tractor className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-semibold text-stone-900">I'm a Farmer</h2>
          <p className="mt-2 text-sm text-stone-500">
            Submit a repair request and track its status
          </p>
          <span className="mt-4 text-sm font-medium text-green-600 group-hover:translate-x-1 transition-transform">
            Continue →
          </span>
        </button>

        <button
          onClick={() => onSelect('technician')}
          className="group relative flex flex-col items-center text-center p-8 rounded-2xl bg-white border-2 border-stone-200 hover:border-amber-500 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 animate-slide-up"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-amber-100 text-amber-700 mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
            <Wrench className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-semibold text-stone-900">I'm a Technician</h2>
          <p className="mt-2 text-sm text-stone-500">
            View incoming jobs and manage assignments
          </p>
          <span className="mt-4 text-sm font-medium text-amber-600 group-hover:translate-x-1 transition-transform">
            Continue →
          </span>
        </button>
      </div>

      <button
        onClick={() => onSelect('farmer')}
        className="mt-8 text-sm text-stone-400 hover:text-stone-600 transition-colors animate-fade-in"
      >
        Just exploring? Start as a Farmer
      </button>

      {/* How it works */}
      <div className="mt-16 w-full max-w-3xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-center text-sm font-semibold text-stone-500 uppercase tracking-wide mb-6">
          How it works
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 text-green-700 mb-3">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-xs font-semibold flex items-center justify-center">1</span>
              <h3 className="font-semibold text-stone-900 text-sm">Post your issue</h3>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed">
              Describe the problem and select the symptoms you're seeing.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100 text-amber-700 mb-3">
              <Handshake className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-xs font-semibold flex items-center justify-center">2</span>
              <h3 className="font-semibold text-stone-900 text-sm">Get matched</h3>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed">
              A nearby technician accepts your request and gets to work.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-stone-100 text-stone-700 mb-3">
              <Star className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-xs font-semibold flex items-center justify-center">3</span>
              <h3 className="font-semibold text-stone-900 text-sm">Track &amp; rate</h3>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed">
              Follow progress and rate the service when the repair is done.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
