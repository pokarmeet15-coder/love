import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CalendarOff,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  FileText,
  AlertCircle,
  X,
  Check,
  Trash2,
  UserCheck
} from 'lucide-react';
import {
  Employee,
  AttendanceRecord,
  LeaveRecord,
  AttendanceStatus,
  LeaveType
} from '../types';

interface AttendanceLeaveViewProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  leaveRecords: LeaveRecord[];
  lang: 'hi' | 'en';
  onSaveAttendance: (records: AttendanceRecord[]) => Promise<void>;
  onApplyLeave: (leaveData: Partial<LeaveRecord>) => Promise<void>;
  onUpdateLeaveStatus: (id: string, status: 'Approved' | 'Rejected') => Promise<void>;
  onDeleteLeave: (id: string) => Promise<void>;
  isLeaveModalOpen: boolean;
  setIsLeaveModalOpen: (open: boolean) => void;
}

const LEAVE_TYPES: LeaveType[] = ['Sick', 'Personal', 'Casual', 'Maternity/Paternity', 'Unpaid'];

export const AttendanceLeaveView: React.FC<AttendanceLeaveViewProps> = ({
  employees,
  attendanceRecords,
  leaveRecords,
  lang,
  onSaveAttendance,
  onApplyLeave,
  onUpdateLeaveStatus,
  onDeleteLeave,
  isLeaveModalOpen,
  setIsLeaveModalOpen
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'attendance' | 'leaves'>('attendance');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Attendance logger form state (employeeId -> status)
  const [dailyAttendanceState, setDailyAttendanceState] = useState<Record<string, AttendanceStatus>>({});
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);

  // Leave Form State
  const [leaveForm, setLeaveForm] = useState({
    employeeId: employees[0]?.id || '',
    leaveType: 'Personal' as LeaveType,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: ''
  });
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

  // Sync attendance for selected date
  useEffect(() => {
    const map: Record<string, AttendanceStatus> = {};
    const dateRecords = attendanceRecords.filter(r => r.date === selectedDate);

    employees.forEach((emp) => {
      const match = dateRecords.find(r => r.employeeId === emp.id);
      if (match) {
        map[emp.id] = match.status;
      } else {
        // Default to Present if active, or On Leave if employee status is On Leave
        map[emp.id] = emp.status === 'On Leave' ? 'On Leave' : 'Present';
      }
    });

    setDailyAttendanceState(map);
  }, [selectedDate, attendanceRecords, employees]);

  // Ensure leaveForm employeeId valid
  useEffect(() => {
    if (employees.length > 0 && !leaveForm.employeeId) {
      setLeaveForm(prev => ({ ...prev, employeeId: employees[0].id }));
    }
  }, [employees]);

  const handleStatusChange = (empId: string, status: AttendanceStatus) => {
    setDailyAttendanceState(prev => ({ ...prev, [empId]: status }));
  };

  const handleSaveDailyAttendance = async () => {
    try {
      setIsSavingAttendance(true);
      const recordsToSave: AttendanceRecord[] = employees.map(emp => {
        const st = dailyAttendanceState[emp.id] || 'Present';
        let workingHours = 8;
        if (st === 'Half-Day') workingHours = 4;
        if (st === 'Absent' || st === 'On Leave') workingHours = 0;

        return {
          id: `att_${emp.id}_${selectedDate}`,
          employeeId: emp.id,
          date: selectedDate,
          status: st,
          checkIn: st === 'Present' || st === 'Half-Day' ? '09:30 AM' : '-',
          checkOut: st === 'Present' ? '05:30 PM' : st === 'Half-Day' ? '01:30 PM' : '-',
          workingHours
        };
      });

      await onSaveAttendance(recordsToSave);
      alert(lang === 'hi' ? 'उपस्थिति सफलतापूर्वक सहेजी गई!' : 'Attendance saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Error saving attendance');
    } finally {
      setIsSavingAttendance(false);
    }
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.employeeId || !leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
      alert(lang === 'hi' ? 'कृपया सभी जानकारी भरें!' : 'Please fill all required fields');
      return;
    }

    // Calculate duration
    const start = new Date(leaveForm.startDate);
    const end = new Date(leaveForm.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    try {
      setIsSubmittingLeave(true);
      await onApplyLeave({
        employeeId: leaveForm.employeeId,
        leaveType: leaveForm.leaveType,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        durationDays: diffDays,
        reason: leaveForm.reason
      });

      setIsLeaveModalOpen(false);
      setLeaveForm({
        employeeId: employees[0]?.id || '',
        leaveType: 'Personal',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: ''
      });
      alert(lang === 'hi' ? 'छुट्टी का आवेदन जमा किया गया!' : 'Leave application submitted successfully!');
    } catch (err) {
      console.error(err);
      alert('Error submitting leave');
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Sub Tab Switching Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('attendance')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'attendance'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-blue-600" />
            {lang === 'hi' ? 'दैनिक उपस्थिति (Attendance)' : 'Daily Attendance'}
          </button>

          <button
            onClick={() => setActiveSubTab('leaves')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'leaves'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarOff className="w-4 h-4 text-amber-500" />
            {lang === 'hi' ? 'छुट्टी रिकॉर्ड व अर्जियां' : 'Leave Applications'}
          </button>
        </div>

        {activeSubTab === 'leaves' && (
          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {lang === 'hi' ? 'छुट्टी के लिए आवेदन करें' : 'Apply For Leave'}
          </button>
        )}
      </div>

      {/* Sub Tab 1: Daily Attendance Management */}
      {activeSubTab === 'attendance' && (
        <div className="space-y-6">
          {/* Date Selector & Save Control */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
                {lang === 'hi' ? 'तिथि चुनें:' : 'Select Date:'}
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleSaveDailyAttendance}
              disabled={isSavingAttendance}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSavingAttendance
                ? (lang === 'hi' ? 'सहेजा जा रहा है...' : 'Saving...')
                : (lang === 'hi' ? 'उपस्थिति रिकॉर्ड सहेजें' : 'Save Today Attendance')}
            </button>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                {lang === 'hi' ? 'कर्मचारी उपस्थिति पंजी' : 'Employee Attendance Register'} ({selectedDate})
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {employees.length} {lang === 'hi' ? 'कुल कर्मचारी' : 'Total Employees'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">{lang === 'hi' ? 'कर्मचारी' : 'Employee'}</th>
                    <th className="py-3 px-4">{lang === 'hi' ? 'विभाग' : 'Department'}</th>
                    <th className="py-3 px-4">{lang === 'hi' ? 'उपस्थिति स्थिति (Status)' : 'Attendance Status'}</th>
                    <th className="py-3 px-4">{lang === 'hi' ? 'समय दर्ज' : 'Working Shift'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {employees.map((emp) => {
                    const currentStatus = dailyAttendanceState[emp.id] || 'Present';
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                              {emp.name.charAt(0)}
                            </div>
                            <div>
                              <span className="block font-bold">{emp.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{emp.empCode}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-slate-600">
                          {emp.department}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1.5">
                            {(['Present', 'Half-Day', 'On Leave', 'Absent'] as AttendanceStatus[]).map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => handleStatusChange(emp.id, status)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                                  currentStatus === status
                                    ? status === 'Present'
                                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                      : status === 'Half-Day'
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                      : status === 'On Leave'
                                      ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                                      : 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {status === 'Present' && (lang === 'hi' ? 'उपस्थित' : 'Present')}
                                {status === 'Half-Day' && (lang === 'hi' ? 'आधा दिन' : 'Half-Day')}
                                {status === 'On Leave' && (lang === 'hi' ? 'छुट्टी' : 'On Leave')}
                                {status === 'Absent' && (lang === 'hi' ? 'अनुपस्थित' : 'Absent')}
                              </button>
                            ))}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {currentStatus === 'Present' && '09:30 AM - 05:30 PM (8 hrs)'}
                          {currentStatus === 'Half-Day' && '09:30 AM - 01:30 PM (4 hrs)'}
                          {currentStatus === 'On Leave' && (lang === 'hi' ? 'स्वीकृत छुट्टी' : 'Approved Leave')}
                          {currentStatus === 'Absent' && (lang === 'hi' ? 'गैरहाजिर' : 'Absent')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab 2: Leave Applications Tracker */}
      {activeSubTab === 'leaves' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {lang === 'hi' ? 'छुट्टी आवेदन रिकॉर्ड (Leave Tracker)' : 'Leave Applications Log'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'hi'
                  ? 'कर्मचारियों द्वारा दिए गए छुट्टी के आवेदनों पर स्वीकृति या अस्वीकृति की कार्रवाई करें।'
                  : 'Approve or reject leave applications submitted by team members.'}
              </p>
            </div>
            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              {leaveRecords.length} {lang === 'hi' ? 'रिकॉर्ड' : 'records'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">{lang === 'hi' ? 'कर्मचारी' : 'Employee'}</th>
                  <th className="py-3 px-4">{lang === 'hi' ? 'छुट्टी प्रकार' : 'Type'}</th>
                  <th className="py-3 px-4">{lang === 'hi' ? 'अवधि' : 'Duration'}</th>
                  <th className="py-3 px-4">{lang === 'hi' ? 'कारण (Reason)' : 'Reason'}</th>
                  <th className="py-3 px-4">{lang === 'hi' ? 'आवेदन तिथि' : 'Applied On'}</th>
                  <th className="py-3 px-4">{lang === 'hi' ? 'स्थिति' : 'Status'}</th>
                  <th className="py-3 px-4 text-right">{lang === 'hi' ? 'कार्रवाई' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {leaveRecords.length > 0 ? (
                  leaveRecords.map((leave) => {
                    const emp = employees.find(e => e.id === leave.employeeId);
                    return (
                      <tr key={leave.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {emp ? emp.name : leave.employeeId}
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {leave.leaveType}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-700">
                          <span className="font-bold">{leave.durationDays} {lang === 'hi' ? 'दिन' : 'days'}</span>
                          <span className="block text-[10px] text-slate-400">
                            {leave.startDate} → {leave.endDate}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                          {leave.reason}
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {leave.appliedOn}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              leave.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : leave.status === 'Rejected'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                            }`}
                          >
                            {leave.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {leave.status === 'Pending' ? (
                              <>
                                <button
                                  onClick={() => onUpdateLeaveStatus(leave.id, 'Approved')}
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg flex items-center gap-1 text-[11px] font-bold border border-emerald-200"
                                  title="Approve"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{lang === 'hi' ? 'स्वीकार' : 'Approve'}</span>
                                </button>
                                <button
                                  onClick={() => onUpdateLeaveStatus(leave.id, 'Rejected')}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1 text-[11px] font-bold border border-rose-200"
                                  title="Reject"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>{lang === 'hi' ? 'अस्वीकार' : 'Reject'}</span>
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => onDeleteLeave(leave.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                title="Delete Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      {lang === 'hi' ? 'कोई छुट्टी का आवेदन नहीं है' : 'No leave records available.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsLeaveModalOpen(false)}
              className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              {lang === 'hi' ? 'छुट्टी का आवेदन करें' : 'Apply For Leave'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'hi' ? 'छुट्टी की अवधि और कारण दर्ज करें' : 'Enter duration and reason for requested leave.'}
            </p>

            <form onSubmit={handleLeaveSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hi' ? 'कर्मचारी चुनें *' : 'Select Employee *'}
                </label>
                <select
                  required
                  value={leaveForm.employeeId}
                  onChange={(e) => setLeaveForm({ ...leaveForm, employeeId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.empCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hi' ? 'छुट्टी का प्रकार *' : 'Leave Type *'}
                </label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value as LeaveType })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  {LEAVE_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? 'प्रारंभ तिथि *' : 'Start Date *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? 'अंतिम तिथि *' : 'End Date *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hi' ? 'छुट्टी का कारण *' : 'Reason for Leave *'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder={lang === 'hi' ? 'उदा. बुखार और चिकित्सक की सलाह...' : 'e.g. Health issues, personal matter...'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLeave}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  {isSubmittingLeave ? (lang === 'hi' ? 'जमा हो रहा है...' : 'Submitting...') : (lang === 'hi' ? 'आवेदन जमा करें' : 'Submit Application')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
