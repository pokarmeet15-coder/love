import React, { useState } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Edit3,
  Trash2,
  Eye,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  MapPin,
  X,
  CheckCircle2,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import { Employee, Department, EmployeeRole, EmployeeStatus } from '../types';

interface EmployeeManagementViewProps {
  employees: Employee[];
  lang: 'hi' | 'en';
  onAddEmployee: (employeeData: Partial<Employee>) => Promise<void>;
  onUpdateEmployee: (id: string, employeeData: Partial<Employee>) => Promise<void>;
  onDeleteEmployee: (id: string) => Promise<void>;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

const DEPARTMENTS: Department[] = [
  'Engineering',
  'Human Resources',
  'Sales & Marketing',
  'Finance',
  'Operations',
  'Design',
  'Customer Support'
];

const ROLES: EmployeeRole[] = [
  'Manager',
  'Team Lead',
  'Senior Specialist',
  'Executive',
  'Intern',
  'Admin'
];

export const EmployeeManagementView: React.FC<EmployeeManagementViewProps> = ({
  employees,
  lang,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  isAddModalOpen,
  setIsAddModalOpen
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modal / Drawer states
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [deletingEmployeeId, setDeletingEmployeeId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    email: '',
    phone: '',
    department: 'Engineering',
    role: 'Executive',
    status: 'Active',
    joinDate: new Date().toISOString().split('T')[0],
    location: 'Delhi NCR'
  });

  const [formSubmitting, setFormSubmitting] = useState(false);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: 'Engineering',
      role: 'Executive',
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0],
      location: 'Delhi NCR'
    });
    setEditingEmployee(null);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({ ...emp });
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert(lang === 'hi' ? 'कृपया नाम और ईमेल भरें!' : 'Please fill in Name and Email!');
      return;
    }

    try {
      setFormSubmitting(true);
      if (editingEmployee) {
        await onUpdateEmployee(editingEmployee.id, formData);
      } else {
        await onAddEmployee(formData);
      }
      setIsAddModalOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert('Error saving employee data');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEmployeeId) return;
    try {
      await onDeleteEmployee(deletingEmployeeId);
      setDeletingEmployeeId(null);
      if (viewingEmployee?.id === deletingEmployeeId) {
        setViewingEmployee(null);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete employee');
    }
  };

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.empCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDepartment === 'All' || emp.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'All' || emp.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6">

      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            {lang === 'hi' ? 'उपयोगकर्ता एवं कर्मचारी खाता प्रबंधन' : 'Employee Account Management'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'hi'
              ? 'नए उपयोगकर्ता जोड़ें, पुरानी जानकारी अपडेट करें और कर्मचारी विवरण खोजें।'
              : 'Manage employee directories, edit profile details, roles, and status.'}
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          {lang === 'hi' ? '+ नया उपयोगकर्ता जोड़ें' : '+ Add New Employee'}
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">

        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              lang === 'hi'
                ? 'नाम, ID, ईमेल या पद द्वारा खोजें...'
                : 'Search by name, ID, email, role...'
            }
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="All">{lang === 'hi' ? 'सभी विभाग' : 'All Departments'}</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="All">{lang === 'hi' ? 'सभी स्थिति' : 'All Status'}</option>
            <option value="Active">{lang === 'hi' ? 'सक्रिय (Active)' : 'Active'}</option>
            <option value="On Leave">{lang === 'hi' ? 'छुट्टी पर (On Leave)' : 'On Leave'}</option>
            <option value="Inactive">{lang === 'hi' ? 'निष्क्रिय (Inactive)' : 'Inactive'}</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 ml-auto md:ml-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Employee List View */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">{lang === 'hi' ? 'कर्मचारी विवरण' : 'Employee Details'}</th>
                  <th className="py-3.5 px-4">{lang === 'hi' ? 'ID / कोड' : 'Emp ID'}</th>
                  <th className="py-3.5 px-4">{lang === 'hi' ? 'विभाग' : 'Department'}</th>
                  <th className="py-3.5 px-4">{lang === 'hi' ? 'भूमिका / पद' : 'Role'}</th>
                  <th className="py-3.5 px-4">{lang === 'hi' ? 'संपर्क जानकारी' : 'Contact Info'}</th>
                  <th className="py-3.5 px-4">{lang === 'hi' ? 'स्थिति' : 'Status'}</th>
                  <th className="py-3.5 px-4 text-right">{lang === 'hi' ? 'कार्रवाई' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-2xs shrink-0">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{emp.name}</span>
                            <span className="text-[11px] text-slate-400">
                              {lang === 'hi' ? 'शामिल:' : 'Joined:'} {emp.joinDate}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        {emp.empCode}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {emp.department}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {emp.role}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex flex-col gap-0.5 text-[11px]">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {emp.email}
                          </span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {emp.phone}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            emp.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : emp.status === 'On Leave'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              emp.status === 'Active'
                                ? 'bg-emerald-500'
                                : emp.status === 'On Leave'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          {emp.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingEmployee(emp)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={lang === 'hi' ? 'विवरण देखें' : 'View Profile'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              handleOpenEdit(emp);
                              setIsAddModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title={lang === 'hi' ? 'संपादित करें' : 'Edit Employee'}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingEmployeeId(emp.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title={lang === 'hi' ? 'हटाएं' : 'Delete Account'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      {lang === 'hi'
                        ? 'कोई कर्मचारी रिकॉर्ड नहीं मिला'
                        : 'No employee records found matching filter criteria.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-base flex items-center justify-center shadow-md">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{emp.name}</h3>
                        <span className="text-[11px] font-mono text-slate-500">{emp.empCode}</span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        emp.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : emp.status === 'On Leave'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-blue-500" />
                      <span>{emp.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{emp.role}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{emp.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {lang === 'hi' ? 'स्थान:' : 'Location:'} {emp.location || 'HQ'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingEmployee(emp)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        handleOpenEdit(emp);
                        setIsAddModalOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingEmployeeId(emp.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs">
              {lang === 'hi' ? 'कोई रिकॉर्ड नहीं मिला' : 'No records found'}
            </div>
          )}
        </div>
      )}

      {/* Modal: Add or Edit Employee */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
              className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              {editingEmployee
                ? (lang === 'hi' ? 'कर्मचारी विवरण संपादित करें' : 'Edit Employee Details')
                : (lang === 'hi' ? 'नया उपयोगकर्ता/कर्मचारी जोड़ें' : 'Create New Employee')}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'hi'
                ? 'कर्मचारी की बुनियादी जानकारी और भूमिका दर्ज करें।'
                : 'Enter employee credentials and department role information.'}
            </p>

            <form onSubmit={handleSubmitForm} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hi' ? 'पूरा नाम (Full Name) *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma (राहुल शर्मा)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? 'ईमेल (Email) *' : 'Email *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? 'फोन नंबर (Phone)' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? 'विभाग (Department)' : 'Department'}
                  </label>
                  <select
                    value={formData.department || 'Engineering'}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? 'भूमिका (Role)' : 'Role'}
                  </label>
                  <select
                    value={formData.role || 'Executive'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? 'शामिल तिथि' : 'Join Date'}
                  </label>
                  <input
                    type="date"
                    value={formData.joinDate || ''}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? 'स्थिति (Status)' : 'Status'}
                  </label>
                  <select
                    value={formData.status || 'Active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as EmployeeStatus })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? 'स्थान (City)' : 'Location'}
                  </label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Delhi, Mumbai..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  {formSubmitting ? (
                    <span>{lang === 'hi' ? 'सहेजा जा रहा है...' : 'Saving...'}</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editingEmployee ? (lang === 'hi' ? 'अपडेट करें' : 'Update') : (lang === 'hi' ? 'सहेजें' : 'Save Employee')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer / Modal: View Employee Profile */}
      {viewingEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setViewingEmployee(null)}
              className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg">
                {viewingEmployee.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">{viewingEmployee.name}</h3>
                <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  {viewingEmployee.empCode}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                <span className="text-slate-500 font-medium">{lang === 'hi' ? 'विभाग:' : 'Department:'}</span>
                <span className="font-bold text-slate-800">{viewingEmployee.department}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                <span className="text-slate-500 font-medium">{lang === 'hi' ? 'भूमिका / पद:' : 'Role:'}</span>
                <span className="font-bold text-slate-800">{viewingEmployee.role}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                <span className="text-slate-500 font-medium">{lang === 'hi' ? 'ईमेल:' : 'Email:'}</span>
                <span className="font-semibold text-slate-800">{viewingEmployee.email}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                <span className="text-slate-500 font-medium">{lang === 'hi' ? 'फोन:' : 'Phone:'}</span>
                <span className="font-semibold text-slate-800">{viewingEmployee.phone}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                <span className="text-slate-500 font-medium">{lang === 'hi' ? 'शामिल तिथि:' : 'Joined On:'}</span>
                <span className="font-semibold text-slate-800">{viewingEmployee.joinDate}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                <span className="text-slate-500 font-medium">{lang === 'hi' ? 'स्थान:' : 'Location:'}</span>
                <span className="font-semibold text-slate-800">{viewingEmployee.location || 'HQ'}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setViewingEmployee(null)}
                className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800"
              >
                {lang === 'hi' ? 'बंद करें' : 'Close Details'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {deletingEmployeeId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">
              {lang === 'hi' ? 'क्या आप खाता हटाना चाहते हैं?' : 'Delete Employee Account?'}
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              {lang === 'hi'
                ? 'यह कार्रवाई स्थायी है। इस उपयोगकर्ता की जानकारी और उपस्थिति रिकॉर्ड हटा दिए जाएंगे।'
                : 'This action cannot be undone. All associated attendance records will be removed.'}
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingEmployeeId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
              >
                {lang === 'hi' ? 'हाँ, हटाएं' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
