import React from 'react';
import {
  Users,
  CheckCircle2,
  CalendarOff,
  Clock,
  TrendingUp,
  UserPlus,
  FileText,
  ArrowRight,
  Building2,
  AlertCircle
} from 'lucide-react';
import { LeaveRecord } from '../types';
import { ReportAnalyticsData } from '../utils/api';

interface DashboardViewProps {
  analytics: ReportAnalyticsData | null;
  pendingLeaves: LeaveRecord[];
  lang: 'hi' | 'en';
  onNavigate: (tab: 'dashboard' | 'employees' | 'attendance' | 'reports') => void;
  onOpenAddEmployee: () => void;
  onOpenLeaveModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analytics,
  pendingLeaves,
  lang,
  onNavigate,
  onOpenAddEmployee,
  onOpenLeaveModal
}) => {
  const stats = analytics?.overviewStats;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-md mb-3">
            ✨ {lang === 'hi' ? 'स्मार्ट प्रबंधन डैशबोर्ड' : 'Smart Management Dashboard'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {lang === 'hi' ? 'स्वागत है, टीम प्रबंधक!' : 'Welcome Back, Manager!'}
          </h2>
          <p className="mt-2 text-blue-100 text-sm sm:text-base leading-relaxed">
            {lang === 'hi'
              ? 'यहाँ आप अपनी टीम के सदस्यों की जानकारी, उपस्थिति दर और छुट्टी आवेदनों को वास्तविक समय में आसानी से देख और प्रबंधित कर सकते हैं।'
              : 'Effortlessly track employee accounts, monitor real-time attendance, process leave requests, and analyze performance metrics.'}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onOpenAddEmployee}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 transition-all shadow-md active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              {lang === 'hi' ? '+ नया उपयोगकर्ता जोड़ें' : '+ Add New Employee'}
            </button>

            <button
              onClick={onOpenLeaveModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs backdrop-blur-md transition-all active:scale-95"
            >
              <FileText className="w-4 h-4" />
              {lang === 'hi' ? 'छुट्टी आवेदन जमा करें' : 'Apply For Leave'}
            </button>
          </div>
        </div>

        {/* Decorative Background Patterns */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-20 top-0 w-48 h-48 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Employees */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {lang === 'hi' ? 'कुल कर्मचारी' : 'Total Employees'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats?.totalEmployees ?? 0}
            </span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {stats?.activeEmployees ?? 0} {lang === 'hi' ? 'सक्रिय' : 'Active'}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {stats?.departmentsCount ?? 0} {lang === 'hi' ? 'अलग विभागों में' : 'across departments'}
          </p>
        </div>

        {/* Present Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {lang === 'hi' ? 'आज उपस्थित' : 'Present Today'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats?.presentToday ?? 0}
            </span>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              {stats?.totalEmployees ? Math.round(((stats?.presentToday || 0) / stats.totalEmployees) * 100) : 0}%
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {lang === 'hi' ? 'दैनिक उपस्थिति ट्रैकिंग' : 'Daily attendance log'}
          </p>
        </div>

        {/* Average Attendance Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {lang === 'hi' ? 'औसत उपस्थिति %' : 'Avg Attendance %'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats?.averageAttendancePercentage ?? 100}%
            </span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {lang === 'hi' ? 'मासिक' : 'Monthly'}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {lang === 'hi' ? '30 दिनों के आधार पर' : 'Based on last 30 working days'}
          </p>
        </div>

        {/* Pending Leaves */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {lang === 'hi' ? 'लंबित छुट्टियां' : 'Pending Leaves'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats?.pendingLeaveRequests ?? 0}
            </span>
            {pendingLeaves.length > 0 && (
              <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full animate-pulse">
                {lang === 'hi' ? 'ध्यान दें' : 'Action Needed'}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {lang === 'hi' ? 'स्वीकृति का इंतजार' : 'Awaiting manager approval'}
          </p>
        </div>
      </div>

      {/* Main Analytics Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Department Attendance Summary */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                {lang === 'hi' ? 'विभाग-वार उपस्थिति सारांश' : 'Department Attendance Overview'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'hi' ? 'विभागों का प्रदर्शन व उपस्थिति प्रतिशत' : 'Overall performance & attendance rate by department'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {lang === 'hi' ? 'विस्तृत रिपोर्ट देखें' : 'View Full Report'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {analytics?.departmentSummaries && analytics.departmentSummaries.length > 0 ? (
              analytics.departmentSummaries.map((dept) => (
                <div key={dept.departmentName} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-bold text-sm text-slate-800">{dept.departmentName}</span>
                      <span className="ml-2 text-xs text-slate-500">
                        ({dept.totalEmployees} {lang === 'hi' ? 'सदस्य' : 'members'})
                      </span>
                    </div>
                    <span className="text-sm font-extrabold text-blue-700">
                      {dept.averageAttendancePercentage}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        dept.averageAttendancePercentage >= 85
                          ? 'bg-emerald-500'
                          : dept.averageAttendancePercentage >= 70
                          ? 'bg-blue-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${dept.averageAttendancePercentage}%` }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {lang === 'hi' ? 'आज उपस्थित:' : 'Present Today:'} <strong className="text-slate-700">{dept.presentToday}</strong>
                    </span>
                    <span>
                      {lang === 'hi' ? 'छुट्टी पर:' : 'On Leave:'} <strong className="text-slate-700">{dept.onLeaveToday}</strong>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                {lang === 'hi' ? 'कोई विभाग डेटा उपलब्ध नहीं है' : 'No department data available'}
              </div>
            )}
          </div>
        </div>

        {/* Action Needed: Pending Leave Requests */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <CalendarOff className="w-5 h-5 text-amber-500" />
              {lang === 'hi' ? 'नवीनतम छुट्टी अनुरोध' : 'Pending Leave Requests'}
            </h3>
            <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
              {pendingLeaves.length}
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-4">
            {lang === 'hi'
              ? 'प्रबंधक समीक्षा के लिए लंबित छुट्टी की अर्जियां:'
              : 'Requests pending manager approval:'}
          </p>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[320px] pr-1">
            {pendingLeaves.length > 0 ? (
              pendingLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="p-3.5 rounded-xl border border-amber-200/60 bg-amber-50/40 hover:bg-amber-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {leave.employeeId} ({leave.leaveType})
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                        "{leave.reason}"
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md whitespace-nowrap">
                      {leave.durationDays} {lang === 'hi' ? 'दिन' : 'days'}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-amber-200/40 pt-2">
                    <span>
                      {leave.startDate} → {leave.endDate}
                    </span>
                    <button
                      onClick={() => onNavigate('attendance')}
                      className="font-bold text-blue-600 hover:text-blue-800 underline"
                    >
                      {lang === 'hi' ? 'निर्णय लें' : 'Review'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-medium text-slate-600">
                  {lang === 'hi' ? 'कोई लंबित अनुरोध नहीं' : 'No pending requests'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {lang === 'hi' ? 'सभी छुट्टी अनुरोधों पर निर्णय ले लिया गया है।' : 'All leave applications have been reviewed.'}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('attendance')}
            className="mt-4 w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
          >
            {lang === 'hi' ? 'छुट्टी प्रबंधन पर जाएं' : 'Go to Leave Management'}
          </button>
        </div>

      </div>
    </div>
  );
};
