import React from 'react';
import { Users, CalendarCheck, BarChart3, LayoutDashboard, Languages, Shield } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'employees' | 'attendance' | 'reports';
  setActiveTab: (tab: 'dashboard' | 'employees' | 'attendance' | 'reports') => void;
  lang: 'hi' | 'en';
  setLang: (lang: 'hi' | 'en') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, lang, setLang }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo & Portal Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-800 text-base sm:text-lg leading-tight">
                  {lang === 'hi' ? 'कर्मचारी प्रबंधन प्रणाली' : 'Employee Portal'}
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full uppercase tracking-wider">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {lang === 'hi' ? 'उपस्थिति, छुट्टी और रिकॉर्ड प्रबंधन' : 'Attendance, Leave & Records'}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              {lang === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
            </button>

            <button
              onClick={() => setActiveTab('employees')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'employees'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Users className="w-4 h-4" />
              {lang === 'hi' ? 'कर्मचारी खाते' : 'Employees'}
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'attendance'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              {lang === 'hi' ? 'उपस्थिति और छुट्टी' : 'Attendance & Leaves'}
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'reports'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              {lang === 'hi' ? 'रिपोर्ट व आंकड़े' : 'Reports & Analytics'}
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Admin Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
              <Shield className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'प्रबंधक मोड' : 'Admin Access'}</span>
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-2xs"
              title="Toggle Language / भाषा बदलें"
            >
              <Languages className="w-4 h-4 text-blue-600" />
              <span>{lang === 'hi' ? 'English' : 'हिन्दी'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="flex md:hidden border-t border-slate-200 py-2 justify-around">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
              activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            {lang === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
              activeTab === 'employees' ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            <Users className="w-4 h-4" />
            {lang === 'hi' ? 'कर्मचारी' : 'Employees'}
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
              activeTab === 'attendance' ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            {lang === 'hi' ? 'उपस्थिति' : 'Attendance'}
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
              activeTab === 'reports' ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            {lang === 'hi' ? 'रिपोर्ट' : 'Reports'}
          </button>
        </div>
      </div>
    </header>
  );
};
