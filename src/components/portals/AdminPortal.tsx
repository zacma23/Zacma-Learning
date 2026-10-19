import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Course, Batch, Student, UserRole } from '../../types/index';
import { formatETB } from '../../utils/rules';
import {
  Users,
  GraduationCap,
  CreditCard,
  DollarSign,
  BookOpen,
  Calendar,
  Shield,
  Search,
  Filter,
  Download,
  Plus,
  CheckCircle,
  Clock,
  Send,
  Settings,
  Activity,
  UserCheck,
  AlertCircle,
  FileSpreadsheet,
  KeyRound,
  RefreshCw,
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const {
    students,
    registrations,
    courses,
    batches,
    payments,
    receipts,
    auditLogs,
    settings,
    updateSettings,
    addCourse,
    addBatch,
    sendNotification,
    resetDatabase,
    language,
    t,
  } = useApp();

  const { userProfile, promoteUserRole } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'students' | 'courses' | 'batches' | 'logs' | 'settings' | 'broadcast' | 'staff'
  >('overview');

  // Firestore registered staff & student accounts
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [roleUpdateMsg, setRoleUpdateMsg] = useState<{ id: string; msg: string; success: boolean } | null>(null);
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      setDbUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.warn('Users list permission check:', err);
    });
    return () => unsub();
  }, []);

  // Search & Filter state for students
  const [studentSearch, setStudentSearch] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('all');

  // New Course Modal Form
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseFee, setNewCourseFee] = useState<number>(9000);
  const [newCourseDuration, setNewCourseDuration] = useState<number>(10);
  const [newCourseCategory, setNewCourseCategory] = useState<any>('software');
  const [newCourseTeacher, setNewCourseTeacher] = useState('Eng. Dawit Tadesse');

  // New Batch Modal Form
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchCourseId, setNewBatchCourseId] = useState(courses[0]?.id || '');
  const [newBatchClassroom, setNewBatchClassroom] = useState('Lab 1 - Turing Hall');
  const [newBatchStartDate, setNewBatchStartDate] = useState('2026-11-15');

  // Broadcast Message State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'students' | 'teachers'>('all');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Computed Financials
  const totalStudents = students.length;
  const newRegistrationsCount = registrations.filter((r) => r.status === 'pending_payment').length;
  const pendingPaymentsCount = payments.filter((p) => p.status === 'pending_verification').length;
  const verifiedPayments = payments.filter((p) => p.status === 'verified');
  const totalVerifiedRevenue = verifiedPayments.reduce((acc, curr) => acc + curr.amount, 0);
  const totalOutstandingBalance = registrations.reduce((acc, curr) => acc + curr.balanceDue, 0);

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchesStatus = studentStatusFilter === 'all' || s.status === studentStatusFilter;
    const query = studentSearch.toLowerCase().trim();
    const matchesSearch =
      !query ||
      s.fullName.toLowerCase().includes(query) ||
      s.studentId.toLowerCase().includes(query) ||
      s.phone.includes(query);
    return matchesStatus && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = 'ID,Student_ID,Full_Name,Phone,Address,Grade_Level,Registration_Date,Status\n';
    const rows = filteredStudents
      .map(
        (s) =>
          `"${s.id}","${s.studentId}","${s.fullName}","${s.phone}","${s.address}","${s.gradeLevel}","${s.registrationDate}","${s.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zacma_students_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim() || !newCourseCode.trim()) return;

    await addCourse({
      code: newCourseCode.trim().toUpperCase(),
      title: newCourseTitle.trim(),
      titleAm: newCourseTitle.trim(),
      description: 'Production training curriculum prepared by faculty engineers.',
      descriptionAm: 'በፋኩልቲ መምህራን የተዘጋጀ ተግባራዊ የስልጠና መርሃ-ግብር።',
      category: newCourseCategory,
      durationWeeks: Number(newCourseDuration),
      hoursPerWeek: 8,
      baseFee: Number(newCourseFee),
      curriculum: ['Core Foundations', 'Practical Lab Work', 'Capstone Assessment'],
      curriculumAm: ['መሰረታዊ እውቀቶች', 'የላብራቶሪ ስራዎች', 'የምረቃ ፕሮጀክት'],
      learningOutcomes: ['Demonstrate hands-on mastery in technology subject'],
      learningOutcomesAm: ['በተሰለጠኑበት ዘርፍ ተግባራዊ ችሎታ ማሳየት'],
      assignedTeacherId: 'usr-teacher-1',
      assignedTeacherName: newCourseTeacher,
      capacity: 25,
      registrationDeadline: '2026-12-01',
      active: true,
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    });

    setShowAddCourseModal(false);
    setNewCourseTitle('');
    setNewCourseCode('');
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const c = courses.find((course) => course.id === newBatchCourseId);
    if (!c || !newBatchName.trim()) return;

    await addBatch({
      courseId: c.id,
      courseTitle: c.title,
      name: newBatchName.trim(),
      scheduleId: 'sch-mwf-morn',
      scheduleTitle: 'Mon, Wed, Fri (9:00 AM - 12:00 PM EAT)',
      teacherId: c.assignedTeacherId,
      teacherName: c.assignedTeacherName,
      classroom: newBatchClassroom,
      startDate: newBatchStartDate,
      endDate: '2027-02-28',
      capacity: 24,
      status: 'upcoming',
    });

    setShowAddBatchModal(false);
    setNewBatchName('');
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    await sendNotification({
      recipientId: 'all',
      title: broadcastTitle.trim(),
      titleAm: broadcastTitle.trim(),
      message: broadcastMessage.trim(),
      messageAm: broadcastMessage.trim(),
      channel: 'sms',
      status: 'delivered',
    });

    setBroadcastSuccess(true);
    setBroadcastTitle('');
    setBroadcastMessage('');
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

  return (
    <div className="py-8 bg-slate-50 dark:bg-slate-900/60 min-h-[calc(100vh-140px)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Institute Administration Portal
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Master control panel for student enrollments, courses, batches, notifications, and institute logs.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowAddCourseModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Course</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddBatchModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs shadow-xs transition"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Open New Batch</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Total Students</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {totalStudents}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Pending Payment</span>
            <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
              {newRegistrationsCount}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Awaiting Verification</span>
            <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 block">
              {pendingPaymentsCount}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Verified Revenue</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {formatETB(totalVerifiedRevenue)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Active Courses</span>
            <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block">
              {courses.filter((c) => c.active).length}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Outstanding Fees</span>
            <span className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 mt-1 block">
              {formatETB(totalOutstandingBalance)}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            Overview & Batches
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'students'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            Student Directory ({students.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'courses'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            Course Catalog & Prices ({courses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('broadcast')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'broadcast'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            SMS & Notification Dispatch
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'logs'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            Audit Trail ({auditLogs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            Institute Settings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'staff'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Staff & Roles ({dbUsers.length})</span>
          </button>
        </div>

        {/* TAB: Overview & Active Batches */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Batches List */}
              <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>Active & Upcoming Batches</span>
                  </h3>
                  <span className="text-xs text-slate-400">{batches.length} Scheduled Batches</span>
                </div>

                <div className="space-y-3">
                  {batches.map((batch) => (
                    <div
                      key={batch.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {batch.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              batch.status === 'ongoing'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700'
                                : 'bg-blue-100 dark:bg-blue-950 text-blue-700'
                            }`}
                          >
                            {batch.status}
                          </span>
                        </div>
                        <p className="text-slate-500">{batch.courseTitle}</p>
                        <p className="text-[11px] text-slate-400">
                          {batch.scheduleTitle} • {batch.classroom} • Instructor: {batch.teacherName}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] text-slate-400 block">Enrolled Count</span>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {batch.enrolledStudentIds.length} / {batch.capacity} Students
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Center Summary */}
              <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Center Operations</span>
                </h3>

                <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 flex justify-between">
                    <span>Telebirr Merchant Code:</span>
                    <span className="font-mono font-bold text-amber-600">{settings.telebirrMerchantCode}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 flex justify-between">
                    <span>CBE Corporate Account:</span>
                    <span className="font-mono font-bold text-purple-600">{settings.cbeAccount}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 flex justify-between">
                    <span>SMS Gateway:</span>
                    <span className="font-semibold text-emerald-600">CONNECTED (ZACMA-TECH)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 flex justify-between">
                    <span>Campus Location:</span>
                    <span className="font-semibold">Mega Building 4th Fl, Bole</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Student Directory */}
        {activeTab === 'students' && (
          <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search name, ID, phone..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={studentStatusFilter}
                  onChange={(e) => setStudentStatusFilter(e.target.value)}
                  className="text-xs py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="enrolled">Enrolled</option>
                  <option value="paid">Paid</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="pending_payment">Pending Payment</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="p-3.5">Student ID</th>
                    <th className="p-3.5">Full Name</th>
                    <th className="p-3.5">Phone Number</th>
                    <th className="p-3.5">Sub-City Address</th>
                    <th className="p-3.5">Education / Profession</th>
                    <th className="p-3.5">Registered Date</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400">
                        No students found matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                        <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                          {s.studentId}
                        </td>
                        <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                          {s.fullName}
                        </td>
                        <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300">
                          {s.phone}
                        </td>
                        <td className="p-3.5 text-slate-500 truncate max-w-xs">{s.address}</td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">{s.gradeLevel}</td>
                        <td className="p-3.5 text-slate-400">{s.registrationDate}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              s.status === 'enrolled'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700'
                                : s.status === 'paid'
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-700'
                                : s.status === 'partially_paid'
                                ? 'bg-purple-100 dark:bg-purple-950 text-purple-700'
                                : s.status === 'completed'
                                ? 'bg-slate-100 dark:bg-slate-700 text-slate-700'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-800'
                            }`}
                          >
                            {s.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: Course Catalog Management */}
        {activeTab === 'courses' && (
          <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Configured Technology Courses
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCourseModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
              >
                + Add Course
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        {course.code}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 text-[10px] font-bold">
                        {course.enrolledCount} Enrolled
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {course.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {course.durationWeeks} Weeks • Instructor: {course.assignedTeacherName}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Base Fee</span>
                      <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                        {formatETB(course.baseFee)}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      Cap: {course.capacity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: Broadcast Notification Dispatch */}
        {activeTab === 'broadcast' && (
          <div className="max-w-2xl mx-auto rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" />
                <span>Send SMS & In-App Broadcast</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Dispatches urgent announcements to all registered students via normalized Ethiopian SMS (+251) and in-app alerts.
              </p>
            </div>

            {broadcastSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Broadcast dispatched successfully! Notification logged in audit trail.</span>
              </div>
            )}

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Recipient Audience
                </label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value as any)}
                  className="w-full text-xs py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="all">All Institute Students & Instructors</option>
                  <option value="students">Active Enrolled Students Only</option>
                  <option value="teachers">Instructors & Staff Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Announcement Title
                </label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Schedule Change or Guest Lecture Reminder"
                  className="w-full text-xs py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Message Content (English & Amharic supported)
                </label>
                <textarea
                  rows={4}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Type announcement message..."
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition"
                >
                  Send Announcement
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB: Audit Logs */}
        {activeTab === 'logs' && (
          <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Immutable Staff Audit Trail</span>
            </h3>
            <p className="text-xs text-slate-500">
              Every sensitive financial action, attendance recording, and enrollment change is timestamped with user and IP.
            </p>

            <div className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{log.userName}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                        {log.userRole}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                        {log.action}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{log.details}</p>
                  </div>
                  <div className="text-right text-[11px] text-slate-400 font-mono shrink-0">
                    <div>{log.timestamp} EAT</div>
                    {log.ipAddress && <div>IP: {log.ipAddress}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: Institute Settings */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6 sm:p-8 space-y-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-600" />
              <span>Institute & Payment Configuration</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Institute Name (EN)
                </label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => updateSettings({ name: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Institute Name (Amharic)
                </label>
                <input
                  type="text"
                  value={settings.nameAm}
                  onChange={(e) => updateSettings({ nameAm: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Phone
                </label>
                <input
                  type="text"
                  value={settings.phonePrimary}
                  onChange={(e) => updateSettings({ phonePrimary: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Contact
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => updateSettings({ email: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Telebirr Merchant Code
                </label>
                <input
                  type="text"
                  value={settings.telebirrMerchantCode}
                  onChange={(e) => updateSettings({ telebirrMerchantCode: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-amber-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  CBE Account Number
                </label>
                <input
                  type="text"
                  value={settings.cbeAccount}
                  onChange={(e) => updateSettings({ cbeAccount: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-purple-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB: Staff & Role Management (Super Admin & Admin controls) */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Staff Roles & Firebase RBAC Directory
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Manage role permissions in Cloud Firestore with server-verified promotion workflows.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm('Re-seed initial training courses, schedules, packages, and batches to Firestore?')) {
                        await resetDatabase();
                        alert('Cloud Firestore database seeded successfully with Zacma courses & schedules.');
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                    <span>Re-seed Live Courses</span>
                  </button>
                </div>
              </div>

              {/* Status Message */}
              {roleUpdateMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center justify-between ${
                    roleUpdateMsg.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                  }`}
                >
                  <span>{roleUpdateMsg.msg}</span>
                  <button
                    type="button"
                    onClick={() => setRoleUpdateMsg(null)}
                    className="font-bold underline ml-2"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Users Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3">User / Identity</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Current Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Assign Role (Super Admin)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {dbUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400">
                          Loading registered accounts from Cloud Firestore...
                        </td>
                      </tr>
                    ) : (
                      dbUsers.map((u) => {
                        const roleColorMap: Record<string, string> = {
                          super_admin: 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-300',
                          admin: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-300',
                          accountant: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300',
                          secretary: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300',
                          teacher: 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border-purple-300',
                          student: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-300',
                        };
                        const badgeClass = roleColorMap[u.role] || 'bg-slate-100 text-slate-700';

                        return (
                          <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/50">
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-900 dark:text-white">
                                {u.fullName || 'Zacma Member'}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                {u.email || 'No email attached'}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                UID: <span className="font-mono">{u.id}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                              {u.phone || '—'}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] border ${badgeClass}`}
                              >
                                {u.role || 'student'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                {u.status || 'active'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="inline-flex items-center gap-2">
                                <select
                                  id={`role-select-${u.id}`}
                                  defaultValue={u.role || 'student'}
                                  className="py-1 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium"
                                >
                                  <option value="student">Student</option>
                                  <option value="teacher">Teacher / Instructor</option>
                                  <option value="secretary">Secretary / Registrar</option>
                                  <option value="accountant">Accountant (Finance)</option>
                                  <option value="admin">Administrator</option>
                                  <option value="super_admin">Super Admin</option>
                                </select>
                                <button
                                  type="button"
                                  disabled={updatingUid === u.id}
                                  onClick={async () => {
                                    const select = document.getElementById(
                                      `role-select-${u.id}`
                                    ) as HTMLSelectElement;
                                    const newRole = select.value as UserRole;
                                    setUpdatingUid(u.id);
                                    setRoleUpdateMsg(null);
                                    const res = await promoteUserRole(u.id, newRole);
                                    if (res.success) {
                                      setRoleUpdateMsg({
                                        id: u.id,
                                        msg: `Successfully promoted ${u.fullName || u.email} to ${newRole.toUpperCase()} in Firestore.`,
                                        success: true,
                                      });
                                    } else {
                                      setRoleUpdateMsg({
                                        id: u.id,
                                        msg: res.error || 'Failed to update user role.',
                                        success: false,
                                      });
                                    }
                                    setUpdatingUid(null);
                                  }}
                                  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition disabled:opacity-50"
                                >
                                  {updatingUid === u.id ? 'Updating...' : 'Assign'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Add New Course */}
        {showAddCourseModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Create New Course Offering
              </h3>
              <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course Code (e.g. CLD-501)
                  </label>
                  <input
                    type="text"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course Title
                  </label>
                  <input
                    type="text"
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    placeholder="e.g. Cloud Architecture & Kubernetes"
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Base Fee (ETB)
                    </label>
                    <input
                      type="number"
                      value={newCourseFee}
                      onChange={(e) => setNewCourseFee(Number(e.target.value))}
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-blue-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Duration (Weeks)
                    </label>
                    <input
                      type="number"
                      value={newCourseDuration}
                      onChange={(e) => setNewCourseDuration(Number(e.target.value))}
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Lead Instructor
                  </label>
                  <input
                    type="text"
                    value={newCourseTeacher}
                    onChange={(e) => setNewCourseTeacher(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCourseModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    Publish Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Open New Batch */}
        {showAddBatchModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Open New Student Batch
              </h3>
              <form onSubmit={handleCreateBatch} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Course
                  </label>
                  <select
                    value={newBatchCourseId}
                    onChange={(e) => setNewBatchCourseId(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Batch Name (e.g. Full-Stack Cohort 15)
                  </label>
                  <input
                    type="text"
                    value={newBatchName}
                    onChange={(e) => setNewBatchName(e.target.value)}
                    placeholder="e.g. Cohort 15 Evening"
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Classroom / Lab
                  </label>
                  <input
                    type="text"
                    value={newBatchClassroom}
                    onChange={(e) => setNewBatchClassroom(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newBatchStartDate}
                    onChange={(e) => setNewBatchStartDate(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddBatchModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    Open Batch
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
