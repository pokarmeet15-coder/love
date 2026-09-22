import {
  Employee,
  AttendanceRecord,
  LeaveRecord,
  EmployeeAttendanceStats,
  DepartmentSummary,
  SystemOverviewStats
} from '../types';

export interface ReportAnalyticsData {
  overviewStats: SystemOverviewStats;
  employeeStats: EmployeeAttendanceStats[];
  departmentSummaries: DepartmentSummary[];
}

export async function fetchEmployees(): Promise<Employee[]> {
  const res = await fetch('/api/employees');
  if (!res.ok) throw new Error('Failed to fetch employees');
  return res.json();
}

export async function createEmployee(data: Partial<Employee>): Promise<Employee> {
  const res = await fetch('/api/employees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create employee');
  const result = await res.json();
  return result.employee;
}

export async function updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
  const res = await fetch(`/api/employees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update employee');
  const result = await res.json();
  return result.employee;
}

export async function deleteEmployee(id: string): Promise<void> {
  const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete employee');
}

export async function fetchAttendance(date?: string, employeeId?: string): Promise<AttendanceRecord[]> {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (employeeId) params.append('employeeId', employeeId);

  const res = await fetch(`/api/attendance?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch attendance');
  return res.json();
}

export async function saveAttendanceRecords(records: AttendanceRecord[]): Promise<void> {
  const res = await fetch('/api/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ records })
  });
  if (!res.ok) throw new Error('Failed to save attendance records');
}

export async function fetchLeaves(employeeId?: string, status?: string): Promise<LeaveRecord[]> {
  const params = new URLSearchParams();
  if (employeeId) params.append('employeeId', employeeId);
  if (status) params.append('status', status);

  const res = await fetch(`/api/leaves?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch leaves');
  return res.json();
}

export async function applyLeave(data: Partial<LeaveRecord>): Promise<LeaveRecord> {
  const res = await fetch('/api/leaves', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to apply leave');
  const result = await res.json();
  return result.leave;
}

export async function updateLeaveStatus(id: string, status: 'Approved' | 'Rejected', reviewedBy?: string): Promise<LeaveRecord> {
  const res = await fetch(`/api/leaves/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, reviewedBy })
  });
  if (!res.ok) throw new Error('Failed to update leave status');
  const result = await res.json();
  return result.leave;
}

export async function deleteLeave(id: string): Promise<void> {
  const res = await fetch(`/api/leaves/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete leave request');
}

export async function fetchReportAnalytics(): Promise<ReportAnalyticsData> {
  const res = await fetch('/api/reports/analytics');
  if (!res.ok) throw new Error('Failed to fetch report analytics');
  return res.json();
}
