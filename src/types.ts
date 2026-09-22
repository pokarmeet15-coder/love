export type Department =
  | 'Engineering'
  | 'Human Resources'
  | 'Sales & Marketing'
  | 'Finance'
  | 'Operations'
  | 'Design'
  | 'Customer Support';

export type EmployeeRole =
  | 'Manager'
  | 'Team Lead'
  | 'Senior Specialist'
  | 'Executive'
  | 'Intern'
  | 'Admin';

export type EmployeeStatus = 'Active' | 'On Leave' | 'Inactive';

export interface Employee {
  id: string;
  empCode: string;
  name: string;
  email: string;
  phone: string;
  department: Department | string;
  role: EmployeeRole | string;
  joinDate: string;
  status: EmployeeStatus;
  avatarUrl?: string;
  location?: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Half-Day' | 'On Leave' | 'Holiday';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  workingHours?: number;
  notes?: string;
}

export type LeaveType = 'Sick' | 'Personal' | 'Casual' | 'Maternity/Paternity' | 'Unpaid';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRecord {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  durationDays: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface EmployeeAttendanceStats {
  employeeId: string;
  employeeName: string;
  empCode: string;
  department: string;
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  leaveDays: number;
  attendancePercentage: number;
  leavesByType: Record<LeaveType, number>;
}

export interface DepartmentSummary {
  departmentName: string;
  totalEmployees: number;
  averageAttendancePercentage: number;
  presentToday: number;
  onLeaveToday: number;
}

export interface SystemOverviewStats {
  totalEmployees: number;
  activeEmployees: number;
  presentToday: number;
  onLeaveToday: number;
  averageAttendancePercentage: number;
  pendingLeaveRequests: number;
  departmentsCount: number;
}
