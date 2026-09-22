import React, { useState, useEffect } from 'react';
import {
  Employee,
  AttendanceRecord,
  LeaveRecord
} from './types';
import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  fetchAttendance,
  saveAttendanceRecords,
  fetchLeaves,
  applyLeave,
  updateLeaveStatus,
  deleteLeave,
  fetchReportAnalytics,
  ReportAnalyticsData
} from './utils/api';

import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { EmployeeManagementView } from './components/EmployeeManagementView';
import { AttendanceLeaveView } from './components/AttendanceLeaveView';
import { ReportsView } from './components/ReportsView';

import { RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'attendance' | 'reports'>('dashboard');
  const [lang, setLang] = useState<'hi' | 'en'>('hi');

  // Application Data States
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([]);
  const [analytics, setAnalytics] = useState<ReportAnalyticsData | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modals visibility state
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  // Auto toast notification auto-hide
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Initial Data Fetching
  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [empsData, attData, leavesData, analyticsData] = await Promise.all([
        fetchEmployees(),
        fetchAttendance(),
        fetchLeaves(),
        fetchReportAnalytics()
      ]);

      setEmployees(empsData);
      setAttendanceRecords(attData);
      setLeaveRecords(leavesData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error fetching portal data:', err);
      showToast(lang === 'hi' ? 'डेटा लोड करने में त्रुटि' : 'Failed to load system data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Employee Handlers
  const handleAddEmployee = async (employeeData: Partial<Employee>) => {
    try {
      await createEmployee(employeeData);
      showToast(lang === 'hi' ? 'नया कर्मचारी सफलतापूर्वक जोड़ा गया!' : 'Employee added successfully!');
      await loadAllData();
    } catch (err) {
      console.error(err);
      showToast(lang === 'hi' ? 'कर्मचारी जोड़ने में त्रुटि' : 'Failed to add employee', 'error');
    }
  };

  const handleUpdateEmployee = async (id: string, employeeData: Partial<Employee>) => {
    try {
      await updateEmployee(id, employeeData);
      showToast(lang === 'hi' ? 'कर्मचारी डेटा अपडेट किया गया!' : 'Employee profile updated!');
      await loadAllData();
    } catch (err) {
      console.error(err);
      showToast(lang === 'hi' ? 'डेटा अपडेट में त्रुटि' : 'Failed to update employee', 'error');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await deleteEmployee(id);
      showToast(lang === 'hi' ? 'कर्मचारी खाता हटाया गया!' : 'Employee account deleted!');
      await loadAllData();
    } catch (err) {
      console.error(err);
      showToast(lang === 'hi' ? 'खाता हटाने में त्रुटि' : 'Failed to delete employee', 'error');
    }
  };

  // Attendance Handlers
  const handleSaveAttendance = async (records: AttendanceRecord[]) => {
    try {
      await saveAttendanceRecords(records);
      showToast(lang === 'hi' ? 'उपस्थिति पंजी सहेजी गई!' : 'Attendance register updated!');
      await loadAllData();
    } catch (err) {
      console.error(err);
      showToast(lang === 'hi' ? 'उपस्थिति सहेजने में विफल' : 'Failed to save attendance', 'error');
    }
  };

  // Leave Handlers
  const handleApplyLeave = async (leaveData: Partial<LeaveRecord>) => {
    try {
      await applyLeave(leaveData);
      showToast(lang === 'hi' ? 'छुट्टी का आवेदन जमा हो गया!' : 'Leave application submitted!');
      await loadAllData();
    } catch (err) {
      console.error(err);
      showToast(lang === 'hi' ? 'आवेदन जमा करने में त्रुटि' : 'Failed to submit leave', 'error');
    }
  };

  const handleUpdateLeaveStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await updateLeaveStatus(id, status);
      showToast(
        status === 'Approved'
          ? (lang === 'hi' ? 'छुट्टी का आवेदन स्वीकृत हुआ!' : 'Leave application approved!')
          : (lang === 'hi' ? 'छुट्टी का आवेदन अस्वीकृत हुआ!' : 'Leave application rejected!')
      );
      await loadAllData();
    } catch (err) {
      console.error(err);
      showToast(lang === 'hi' ? 'स्थिति अपडेट करने में त्रुटि' : 'Failed to update leave status', 'error');
    }
  };

  const handleDeleteLeave = async (id: string) => {
    try {
      await deleteLeave(id);
      showToast(lang === 'hi' ? 'छुट्टी रिकॉर्ड हटाया गया' : 'Leave record removed');
      await loadAllData();
    } catch (err) {
      console.error(err);
      showToast(lang === 'hi' ? 'रिकॉर्ड हटाने में त्रुटि' : 'Failed to delete leave record', 'error');
    }
  };

  const pendingLeaves = leaveRecords.filter(l => l.status === 'Pending');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-sm font-bold text-slate-800">
            {lang === 'hi' ? 'कर्मचारी प्रणाली लोड हो रही है...' : 'Loading Management System...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">

      {/* Top Sticky Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold border ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-rose-600 text-white border-rose-500'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-300" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            analytics={analytics}
            pendingLeaves={pendingLeaves}
            lang={lang}
            onNavigate={setActiveTab}
            onOpenAddEmployee={() => setIsAddEmployeeModalOpen(true)}
            onOpenLeaveModal={() => setIsLeaveModalOpen(true)}
          />
        )}

        {activeTab === 'employees' && (
          <EmployeeManagementView
            employees={employees}
            lang={lang}
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            isAddModalOpen={isAddEmployeeModalOpen}
            setIsAddModalOpen={setIsAddEmployeeModalOpen}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceLeaveView
            employees={employees}
            attendanceRecords={attendanceRecords}
            leaveRecords={leaveRecords}
            lang={lang}
            onSaveAttendance={handleSaveAttendance}
            onApplyLeave={handleApplyLeave}
            onUpdateLeaveStatus={handleUpdateLeaveStatus}
            onDeleteLeave={handleDeleteLeave}
            isLeaveModalOpen={isLeaveModalOpen}
            setIsLeaveModalOpen={setIsLeaveModalOpen}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            analytics={analytics}
            lang={lang}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 font-medium border-t border-slate-200 bg-white">
        <p>
          {lang === 'hi'
            ? '© 2025 कर्मचारी व उपयोगकर्ता प्रबंधन प्रणाली — सर्वाधिकार सुरक्षित'
            : '© 2025 Employee & User Management System — All rights reserved'}
        </p>
      </footer>

    </div>
  );
}
