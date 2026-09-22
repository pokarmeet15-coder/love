import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Search,
  Building2,
  Users,
  CheckCircle,
  CalendarOff,
  TrendingUp,
  FileSpreadsheet,
  PieChart
} from 'lucide-react';
import { ReportAnalyticsData } from '../utils/api';

interface ReportsViewProps {
  analytics: ReportAnalyticsData | null;
  lang: 'hi' | 'en';
}

export const ReportsView: React.FC<ReportsViewProps> = ({ analytics, lang }) => {
  const [reportType, setReportType] = useState<'user' | 'dept'>('user');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');

  const employeeStats = analytics?.employeeStats || [];
  const departmentSummaries = analytics?.departmentSummaries || [];

  // Filtered employee stats
  const filteredEmpStats = employeeStats.filter(e => {
    const matchesSearch =
      e.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.empCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || e.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Export CSV Handler
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'user') {
      csvContent += 'Employee Code,Employee Name,Department,Total Working Days,Present Days,Absent Days,Half Days,Leave Days,Attendance Percentage,Sick Leave,Personal Leave,Casual Leave\n';
      filteredEmpStats.forEach(e => {
        const row = [
          `"${e.empCode}"`,
          `"${e.employeeName}"`,
          `"${e.department}"`,
          e.totalWorkingDays,
          e.presentDays,
          e.absentDays,
          e.halfDays,
          e.leaveDays,
          `"${e.attendancePercentage}%"`,
          e.leavesByType.Sick || 0,
          e.leavesByType.Personal || 0,
          e.leavesByType.Casual || 0
        ].join(',');
        csvContent += row + '\n';
      });
    } else {
      csvContent += 'Department Name,Total Employees,Average Attendance Percentage,Present Today,On Leave Today\n';
      departmentSummaries.forEach(d => {
        const row = [
          `"${d.departmentName}"`,
          d.totalEmployees,
          `"${d.averageAttendancePercentage}%"`,
          d.presentToday,
          d.onLeaveToday
        ].join(',');
        csvContent += row + '\n';
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">

      {/* Top Banner & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            {lang === 'hi' ? 'डेटा विश्लेषण और रिपोर्ट' : 'Reports & Analytics Portal'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'hi'
              ? 'उपस्थिति दर, छुट्टी विश्लेषण और उपयोगकर्ता व विभाग-वार विस्तृत डेटा देखें।'
              : 'Generate actionable insights, attendance metrics, and export CSV reports.'}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          {lang === 'hi' ? 'CSV रिपोर्ट डाउनलोड करें' : 'Export CSV Report'}
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-200/60">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
            {lang === 'hi' ? 'कुल कार्य दिवस' : 'Total Evaluated Days'}
          </span>
          <span className="text-2xl font-extrabold text-blue-950 mt-2 block">
            30 {lang === 'hi' ? 'दिन (कार्य दिवस)' : 'Working Days'}
          </span>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-200/60">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
            {lang === 'hi' ? 'समग्र उपस्थिति औसत' : 'Overall Attendance Avg'}
          </span>
          <span className="text-2xl font-extrabold text-emerald-950 mt-2 block">
            {analytics?.overviewStats.averageAttendancePercentage ?? 100}%
          </span>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-200/60">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
            {lang === 'hi' ? 'स्वीकृत छुट्टी दिवस' : 'Approved Leave Days'}
          </span>
          <span className="text-2xl font-extrabold text-amber-950 mt-2 block">
            {employeeStats.reduce((acc, curr) => acc + curr.leaveDays, 0)} {lang === 'hi' ? 'दिन' : 'days'}
          </span>
        </div>
      </div>

      {/* Report Controls & Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">

        {/* Toggle Report Type */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-full md:w-auto">
          <button
            onClick={() => setReportType('user')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              reportType === 'user'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            {lang === 'hi' ? 'उपयोगकर्ता-वार आंकड़े' : 'User-Wise Statistics'}
          </button>

          <button
            onClick={() => setReportType('dept')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              reportType === 'dept'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            {lang === 'hi' ? 'विभाग-वार विश्लेषण' : 'Department-Wise Analytics'}
          </button>
        </div>

        {/* User Search & Filters */}
        {reportType === 'user' && (
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={lang === 'hi' ? 'नाम या ID से खोजें...' : 'Filter by name or ID...'}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
            >
              <option value="All">{lang === 'hi' ? 'सभी विभाग' : 'All Departments'}</option>
              {departmentSummaries.map(d => (
                <option key={d.departmentName} value={d.departmentName}>{d.departmentName}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Table or Department Summary Grid */}
      {reportType === 'user' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">{lang === 'hi' ? 'कर्मचारी' : 'Employee'}</th>
                  <th className="py-3.5 px-4">{lang === 'hi' ? 'विभाग' : 'Department'}</th>
                  <th className="py-3.5 px-4 text-center">{lang === 'hi' ? 'कुल दिन' : 'Total Days'}</th>
                  <th className="py-3.5 px-4 text-center">{lang === 'hi' ? 'उपस्थित दिन' : 'Present Days'}</th>
                  <th className="py-3.5 px-4 text-center">{lang === 'hi' ? 'आधा दिन' : 'Half Days'}</th>
                  <th className="py-3.5 px-4 text-center">{lang === 'hi' ? 'छुट्टी / गैरहाजिर' : 'Leave / Absent'}</th>
                  <th className="py-3.5 px-4 text-right">{lang === 'hi' ? 'उपस्थिति %' : 'Attendance %'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredEmpStats.length > 0 ? (
                  filteredEmpStats.map((stat) => (
                    <tr key={stat.employeeId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{stat.employeeName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{stat.empCode}</span>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        {stat.department}
                      </td>

                      <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                        {stat.totalWorkingDays}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                        {stat.presentDays}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-blue-600">
                        {stat.halfDays}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-amber-600">
                        {stat.leaveDays + stat.absentDays}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold ${
                            stat.attendancePercentage >= 85
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : stat.attendancePercentage >= 70
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {stat.attendancePercentage}%
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      {lang === 'hi' ? 'कोई रिकॉर्ड उपलब्ध नहीं है' : 'No records found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Department Summary Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departmentSummaries.map((dept) => (
            <div key={dept.departmentName} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{dept.departmentName}</h3>
                  <span className="text-xs text-slate-500">{dept.totalEmployees} {lang === 'hi' ? 'कुल कर्मचारी' : 'members'}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span className="text-slate-600">{lang === 'hi' ? 'उपस्थिति दर:' : 'Attendance Rate:'}</span>
                  <span className="text-blue-700">{dept.averageAttendancePercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${dept.averageAttendancePercentage}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800">
                  <span className="block text-[10px] uppercase font-bold text-emerald-600">{lang === 'hi' ? 'आज उपस्थित' : 'Present Today'}</span>
                  <span className="text-lg font-extrabold">{dept.presentToday}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800">
                  <span className="block text-[10px] uppercase font-bold text-amber-600">{lang === 'hi' ? 'आज छुट्टी पर' : 'On Leave Today'}</span>
                  <span className="text-lg font-extrabold">{dept.onLeaveToday}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
