import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  Employee,
  AttendanceRecord,
  LeaveRecord,
  EmployeeAttendanceStats,
  DepartmentSummary,
  SystemOverviewStats,
  LeaveType
} from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Data Storage directory & files
const DATA_DIR = path.join(process.cwd(), 'data');
const EMPLOYEES_FILE = path.join(DATA_DIR, 'employees.json');
const ATTENDANCE_FILE = path.join(DATA_DIR, 'attendance.json');
const LEAVES_FILE = path.join(DATA_DIR, 'leaves.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Seed Data
const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp_001',
    empCode: 'EMP-1001',
    name: 'Aarav Sharma (आरव शर्मा)',
    email: 'aarav.sharma@company.com',
    phone: '+91 98765 43210',
    department: 'Engineering',
    role: 'Senior Specialist',
    joinDate: '2022-01-15',
    status: 'Active',
    location: 'Delhi NCR'
  },
  {
    id: 'emp_002',
    empCode: 'EMP-1002',
    name: 'Priya Verma (प्रिया वर्मा)',
    email: 'priya.verma@company.com',
    phone: '+91 98765 43211',
    department: 'Human Resources',
    role: 'Manager',
    joinDate: '2021-06-10',
    status: 'Active',
    location: 'Mumbai'
  },
  {
    id: 'emp_003',
    empCode: 'EMP-1003',
    name: 'Rohan Gupta (रोहन गुप्ता)',
    email: 'rohan.gupta@company.com',
    phone: '+91 98765 43212',
    department: 'Sales & Marketing',
    role: 'Executive',
    joinDate: '2023-03-20',
    status: 'Active',
    location: 'Bengaluru'
  },
  {
    id: 'emp_004',
    empCode: 'EMP-1004',
    name: 'Ananya Patel (अनन्या पटेल)',
    email: 'ananya.patel@company.com',
    phone: '+91 98765 43213',
    department: 'Finance',
    role: 'Team Lead',
    joinDate: '2020-11-05',
    status: 'On Leave',
    location: 'Ahmedabad'
  },
  {
    id: 'emp_005',
    empCode: 'EMP-1005',
    name: 'Vikram Singh (विक्रम सिंह)',
    email: 'vikram.singh@company.com',
    phone: '+91 98765 43214',
    department: 'Operations',
    role: 'Manager',
    joinDate: '2019-08-12',
    status: 'Active',
    location: 'Jaipur'
  },
  {
    id: 'emp_006',
    empCode: 'EMP-1006',
    name: 'Kavya Joshi (काव्या जोशी)',
    email: 'kavya.joshi@company.com',
    phone: '+91 98765 43215',
    department: 'Design',
    role: 'Senior Specialist',
    joinDate: '2022-09-01',
    status: 'Active',
    location: 'Pune'
  }
];

function generateSeedAttendance(employees: Employee[]): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date();

  // Generate last 30 days attendance
  for (let i = 0; i < 30; i++) {
    const dateObj = new Date(today);
    dateObj.setDate(today.getDate() - i);

    // Skip weekends (0 = Sunday, 6 = Saturday)
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dateStr = dateObj.toISOString().split('T')[0];

    employees.forEach((emp, index) => {
      // Create realistic attendance pattern
      let status: AttendanceRecord['status'] = 'Present';
      let hours = 8;
      let checkIn = '09:30 AM';
      let checkOut = '05:30 PM';

      // Slight variation based on employee index and day
      if ((i + index) % 11 === 0) {
        status = 'On Leave';
        hours = 0;
        checkIn = '-';
        checkOut = '-';
      } else if ((i + index) % 17 === 0) {
        status = 'Half-Day';
        hours = 4;
        checkIn = '09:30 AM';
        checkOut = '01:30 PM';
      } else if ((i + index) % 23 === 0) {
        status = 'Absent';
        hours = 0;
        checkIn = '-';
        checkOut = '-';
      }

      records.push({
        id: `att_${emp.id}_${dateStr}`,
        employeeId: emp.id,
        date: dateStr,
        status,
        checkIn,
        checkOut,
        workingHours: hours,
        notes: status === 'Half-Day' ? 'Personal work in second half' : undefined
      });
    });
  }

  return records;
}

const INITIAL_LEAVES: LeaveRecord[] = [
  {
    id: 'leave_101',
    employeeId: 'emp_004',
    leaveType: 'Sick',
    startDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    durationDays: 5,
    reason: 'Viral fever and doctor recommended rest (वायरल बुखार)',
    status: 'Approved',
    appliedOn: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    reviewedBy: 'Priya Verma',
    reviewedAt: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]
  },
  {
    id: 'leave_102',
    employeeId: 'emp_001',
    leaveType: 'Personal',
    startDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    durationDays: 3,
    reason: 'Family event and personal work (पारिवारिक कार्यक्रम)',
    status: 'Pending',
    appliedOn: new Date().toISOString().split('T')[0]
  },
  {
    id: 'leave_103',
    employeeId: 'emp_003',
    leaveType: 'Casual',
    startDate: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    endDate: new Date(Date.now() - 9 * 86400000).toISOString().split('T')[0],
    durationDays: 2,
    reason: 'Out of town travel (बाहर जाना)',
    status: 'Approved',
    appliedOn: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0],
    reviewedBy: 'Vikram Singh',
    reviewedAt: new Date(Date.now() - 11 * 86400000).toISOString().split('T')[0]
  }
];

// File I/O Helpers
function readEmployees(): Employee[] {
  try {
    if (!fs.existsSync(EMPLOYEES_FILE)) {
      fs.writeFileSync(EMPLOYEES_FILE, JSON.stringify(INITIAL_EMPLOYEES, null, 2));
      return INITIAL_EMPLOYEES;
    }
    return JSON.parse(fs.readFileSync(EMPLOYEES_FILE, 'utf-8'));
  } catch (err) {
    console.error('Error reading employees:', err);
    return INITIAL_EMPLOYEES;
  }
}

function writeEmployees(employees: Employee[]) {
  fs.writeFileSync(EMPLOYEES_FILE, JSON.stringify(employees, null, 2));
}

function readAttendance(): AttendanceRecord[] {
  try {
    if (!fs.existsSync(ATTENDANCE_FILE)) {
      const emps = readEmployees();
      const seed = generateSeedAttendance(emps);
      fs.writeFileSync(ATTENDANCE_FILE, JSON.stringify(seed, null, 2));
      return seed;
    }
    return JSON.parse(fs.readFileSync(ATTENDANCE_FILE, 'utf-8'));
  } catch (err) {
    console.error('Error reading attendance:', err);
    return [];
  }
}

function writeAttendance(records: AttendanceRecord[]) {
  fs.writeFileSync(ATTENDANCE_FILE, JSON.stringify(records, null, 2));
}

function readLeaves(): LeaveRecord[] {
  try {
    if (!fs.existsSync(LEAVES_FILE)) {
      fs.writeFileSync(LEAVES_FILE, JSON.stringify(INITIAL_LEAVES, null, 2));
      return INITIAL_LEAVES;
    }
    return JSON.parse(fs.readFileSync(LEAVES_FILE, 'utf-8'));
  } catch (err) {
    console.error('Error reading leaves:', err);
    return INITIAL_LEAVES;
  }
}

function writeLeaves(leaves: LeaveRecord[]) {
  fs.writeFileSync(LEAVES_FILE, JSON.stringify(leaves, null, 2));
}

// REST API ROUTES

// GET /api/employees
app.get('/api/employees', (_req, res) => {
  const employees = readEmployees();
  res.json(employees);
});

// POST /api/employees (Create)
app.post('/api/employees', (req, res) => {
  const body = req.body;
  const employees = readEmployees();

  const newId = `emp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const empCode = body.empCode || `EMP-${1000 + employees.length + 1}`;

  const newEmployee: Employee = {
    id: newId,
    empCode,
    name: body.name || 'New Employee',
    email: body.email || '',
    phone: body.phone || '',
    department: body.department || 'Engineering',
    role: body.role || 'Executive',
    joinDate: body.joinDate || new Date().toISOString().split('T')[0],
    status: body.status || 'Active',
    location: body.location || 'Headquarters'
  };

  employees.push(newEmployee);
  writeEmployees(employees);

  res.status(201).json({ success: true, employee: newEmployee });
});

// PUT /api/employees/:id (Update)
app.put('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  const body = req.body;
  let employees = readEmployees();

  const index = employees.findIndex(e => e.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }

  employees[index] = {
    ...employees[index],
    ...body,
    id // preserve original ID
  };

  writeEmployees(employees);
  res.json({ success: true, employee: employees[index] });
});

// DELETE /api/employees/:id
app.delete('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  let employees = readEmployees();
  
  const initialLen = employees.length;
  employees = employees.filter(e => e.id !== id);

  if (employees.length === initialLen) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }

  writeEmployees(employees);

  // Clean up associated attendance & leave records optionally or retain for history
  res.json({ success: true, message: 'Employee deleted successfully' });
});

// GET /api/attendance
app.get('/api/attendance', (req, res) => {
  const { date, employeeId } = req.query;
  let records = readAttendance();

  if (date) {
    records = records.filter(r => r.date === date);
  }
  if (employeeId) {
    records = records.filter(r => r.employeeId === employeeId);
  }

  res.json(records);
});

// POST /api/attendance (Bulk update or record daily attendance)
app.post('/api/attendance', (req, res) => {
  const { records } = req.body; // array of AttendanceRecord
  if (!Array.isArray(records)) {
    res.status(400).json({ error: 'Invalid payload, expected array of records' });
    return;
  }

  const existing = readAttendance();
  const map = new Map<string, AttendanceRecord>();

  // Map existing records by unique key (employeeId + date)
  existing.forEach(r => map.set(`${r.employeeId}_${r.date}`, r));

  // Merge/override new records
  records.forEach((r: AttendanceRecord) => {
    const key = `${r.employeeId}_${r.date}`;
    const id = r.id || `att_${r.employeeId}_${r.date}`;
    map.set(key, { ...r, id });
  });

  const updatedList = Array.from(map.values());
  writeAttendance(updatedList);

  res.json({ success: true, updatedCount: records.length });
});

// GET /api/leaves
app.get('/api/leaves', (req, res) => {
  const { employeeId, status } = req.query;
  let leaves = readLeaves();

  if (employeeId) {
    leaves = leaves.filter(l => l.employeeId === employeeId);
  }
  if (status) {
    leaves = leaves.filter(l => l.status === status);
  }

  res.json(leaves);
});

// POST /api/leaves (Apply leave)
app.post('/api/leaves', (req, res) => {
  const body = req.body;
  const leaves = readLeaves();

  const newLeave: LeaveRecord = {
    id: `leave_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    employeeId: body.employeeId,
    leaveType: body.leaveType || 'Personal',
    startDate: body.startDate,
    endDate: body.endDate,
    durationDays: Number(body.durationDays) || 1,
    reason: body.reason || '',
    status: 'Pending',
    appliedOn: new Date().toISOString().split('T')[0]
  };

  leaves.unshift(newLeave);
  writeLeaves(leaves);

  res.status(201).json({ success: true, leave: newLeave });
});

// PUT /api/leaves/:id (Approve/Reject)
app.put('/api/leaves/:id', (req, res) => {
  const { id } = req.params;
  const { status, reviewedBy } = req.body;
  let leaves = readLeaves();

  const index = leaves.findIndex(l => l.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Leave request not found' });
    return;
  }

  leaves[index].status = status || leaves[index].status;
  leaves[index].reviewedBy = reviewedBy || 'Admin Manager';
  leaves[index].reviewedAt = new Date().toISOString().split('T')[0];

  writeLeaves(leaves);

  // Optionally update employee status if leave is currently active
  if (status === 'Approved') {
    const employees = readEmployees();
    const empIndex = employees.findIndex(e => e.id === leaves[index].employeeId);
    if (empIndex !== -1) {
      employees[empIndex].status = 'On Leave';
      writeEmployees(employees);
    }
  }

  res.json({ success: true, leave: leaves[index] });
});

// DELETE /api/leaves/:id
app.delete('/api/leaves/:id', (req, res) => {
  const { id } = req.params;
  let leaves = readLeaves();
  leaves = leaves.filter(l => l.id !== id);
  writeLeaves(leaves);
  res.json({ success: true });
});

// GET /api/reports/analytics (Detailed reports and metrics)
app.get('/api/reports/analytics', (_req, res) => {
  const employees = readEmployees();
  const attendance = readAttendance();
  const leaves = readLeaves();

  const todayStr = new Date().toISOString().split('T')[0];

  // System Overview Stats
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'Active').length;

  const todayAttendance = attendance.filter(a => a.date === todayStr);
  const presentToday = todayAttendance.filter(a => a.status === 'Present' || a.status === 'Half-Day').length;
  const onLeaveToday = todayAttendance.filter(a => a.status === 'On Leave').length;

  const pendingLeaveRequests = leaves.filter(l => l.status === 'Pending').length;

  const deptsSet = new Set(employees.map(e => e.department));
  const departmentsCount = deptsSet.size;

  // Employee-wise Stats
  const employeeStats: EmployeeAttendanceStats[] = employees.map(emp => {
    const empAttendance = attendance.filter(a => a.employeeId === emp.id);
    const totalWorkingDays = empAttendance.length || 1;
    const presentDays = empAttendance.filter(a => a.status === 'Present').length;
    const absentDays = empAttendance.filter(a => a.status === 'Absent').length;
    const halfDays = empAttendance.filter(a => a.status === 'Half-Day').length;
    const leaveDays = empAttendance.filter(a => a.status === 'On Leave').length;

    // Calculate Attendance Percentage: (Present + 0.5 * HalfDay) / TotalWorkingDays
    const effectivePresent = presentDays + halfDays * 0.5;
    const attendancePercentage = Math.round((effectivePresent / totalWorkingDays) * 100);

    const empLeaves = leaves.filter(l => l.employeeId === emp.id && l.status === 'Approved');
    const leavesByType: Record<LeaveType, number> = {
      'Sick': 0,
      'Personal': 0,
      'Casual': 0,
      'Maternity/Paternity': 0,
      'Unpaid': 0
    };

    empLeaves.forEach(l => {
      if (leavesByType[l.leaveType] !== undefined) {
        leavesByType[l.leaveType] += l.durationDays;
      }
    });

    return {
      employeeId: emp.id,
      employeeName: emp.name,
      empCode: emp.empCode,
      department: emp.department,
      totalWorkingDays,
      presentDays,
      absentDays,
      halfDays,
      leaveDays,
      attendancePercentage: isNaN(attendancePercentage) ? 100 : attendancePercentage,
      leavesByType
    };
  });

  // Calculate Overall Average Attendance %
  const totalAttendanceSum = employeeStats.reduce((acc, curr) => acc + curr.attendancePercentage, 0);
  const averageAttendancePercentage = employeeStats.length > 0
    ? Math.round(totalAttendanceSum / employeeStats.length)
    : 100;

  // Department Summaries
  const departmentSummaries: DepartmentSummary[] = Array.from(deptsSet).map(dept => {
    const deptEmployees = employees.filter(e => e.department === dept);
    const deptEmpIds = new Set(deptEmployees.map(e => e.id));

    const deptStats = employeeStats.filter(s => deptEmpIds.has(s.employeeId));
    const deptAttendanceSum = deptStats.reduce((acc, curr) => acc + curr.attendancePercentage, 0);
    const avgPct = deptStats.length > 0 ? Math.round(deptAttendanceSum / deptStats.length) : 100;

    const deptTodayAtt = todayAttendance.filter(a => deptEmpIds.has(a.employeeId));
    const presentTodayDept = deptTodayAtt.filter(a => a.status === 'Present' || a.status === 'Half-Day').length;
    const onLeaveTodayDept = deptTodayAtt.filter(a => a.status === 'On Leave').length;

    return {
      departmentName: dept,
      totalEmployees: deptEmployees.length,
      averageAttendancePercentage: avgPct,
      presentToday: presentTodayDept,
      onLeaveToday: onLeaveTodayDept
    };
  });

  const overviewStats: SystemOverviewStats = {
    totalEmployees,
    activeEmployees,
    presentToday,
    onLeaveToday,
    averageAttendancePercentage,
    pendingLeaveRequests,
    departmentsCount
  };

  res.json({
    overviewStats,
    employeeStats,
    departmentSummaries
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Employee & User Management Server running on http://localhost:${PORT}`);
  });
}

startServer();
