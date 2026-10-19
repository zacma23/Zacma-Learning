import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Receipt, Certificate } from '../../types/index';
import { formatETB, calculateAttendanceMetrics } from '../../utils/rules';
import {
  GraduationCap,
  CreditCard,
  Printer,
  Calendar,
  Clock,
  BookOpen,
  Award,
  MessageSquare,
  CheckCircle,
  FileText,
  Video,
  User,
  ShieldCheck,
  Send,
  AlertCircle,
} from 'lucide-react';

interface StudentPortalProps {
  onOpenReceiptModal: (receipt: Receipt) => void;
  onOpenCertificateModal: (cert: Certificate) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  onOpenReceiptModal,
  onOpenCertificateModal,
}) => {
  const {
    students,
    registrations,
    receipts,
    payments,
    batches,
    attendance,
    learningMaterials,
    certificates,
    supportTickets,
    addSupportTicket,
    settings,
    currentUser,
    recordPaymentTransaction,
  } = useApp();

  // Active student profile: strictly matched to currentUser to prevent opening another student's records
  const myStudent = React.useMemo(() => {
    if (currentUser.studentId) {
      const match = students.find((s) => s.studentId === currentUser.studentId);
      if (match) return match;
    }
    if (currentUser.id && currentUser.id !== 'usr-guest') {
      const match = students.find((s) => s.id === currentUser.id);
      if (match) return match;
    }
    if (currentUser.email && currentUser.email !== 'guest@zacmaa.net') {
      const match = students.find((s) => s.email?.toLowerCase() === currentUser.email?.toLowerCase());
      if (match) return match;
    }
    if (currentUser.phone && currentUser.phone !== '+251 91 000 0000') {
      const match = students.find((s) => s.phone === currentUser.phone);
      if (match) return match;
    }
    return null;
  }, [students, currentUser]);

  const myRegistrations = React.useMemo(() => {
    return registrations.filter((r) => {
      if (myStudent) {
        return r.studentId === myStudent.id || r.studentPhone === myStudent.phone || (myStudent.email && r.studentEmail?.toLowerCase() === myStudent.email.toLowerCase());
      }
      return (currentUser.email && currentUser.email !== 'guest@zacmaa.net' && r.studentEmail?.toLowerCase() === currentUser.email.toLowerCase()) ||
             (currentUser.phone && currentUser.phone !== '+251 91 000 0000' && r.studentPhone === currentUser.phone) ||
             (currentUser.id && r.studentId === currentUser.id);
    });
  }, [registrations, myStudent, currentUser]);

  const myPayments = React.useMemo(() => {
    return payments.filter((p) => {
      if (myStudent) {
        return p.studentId === myStudent.id || p.studentName === myStudent.fullName;
      }
      return myRegistrations.some((r) => r.id === p.registrationId);
    });
  }, [payments, myStudent, myRegistrations]);

  const myReceipts = React.useMemo(() => {
    return receipts.filter((r) => {
      if (myStudent) {
        return r.studentId === myStudent.studentId || r.studentId === myStudent.id || r.studentName === myStudent.fullName;
      }
      return myRegistrations.some((reg) => reg.id === r.registrationId);
    });
  }, [receipts, myStudent, myRegistrations]);

  const myBatches = React.useMemo(() => {
    return batches.filter((b) =>
      myStudent ? b.enrolledStudentIds.includes(myStudent.id) : false
    );
  }, [batches, myStudent]);

  // Student Attendance
  const myAttendanceRecords: { status: 'present' | 'absent' | 'late' | 'excused'; date: string; topic: string }[] = [];
  attendance.forEach((att) => {
    att.records.forEach((r) => {
      if (r.studentId === myStudent?.id || r.studentName === myStudent?.fullName) {
        myAttendanceRecords.push({
          status: r.status,
          date: att.sessionDate,
          topic: att.topic,
        });
      }
    });
  });

  const attendanceMetrics = calculateAttendanceMetrics(myAttendanceRecords);

  // Certificates for this student
  const myCertificates = certificates.filter(
    (c) => c.studentId === myStudent?.studentId || c.studentName === myStudent?.fullName
  );

  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'courses' | 'payments' | 'attendance' | 'materials' | 'certificates' | 'support'
  >('overview');

  // Submit payment form state
  const [showSubmitPayment, setShowSubmitPayment] = useState(false);
  const [payRegId, setPayRegId] = useState(myRegistrations[0]?.id || '');
  const [payAmount, setPayAmount] = useState<number>(myRegistrations[0]?.balanceDue || 5000);
  const [payMethod, setPayMethod] = useState<'telebirr' | 'cbe_birr' | 'bank_transfer_cbe'>('telebirr');
  const [payTxRef, setPayTxRef] = useState('');
  const [paySubmitted, setPaySubmitted] = useState(false);

  // Support inquiry form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const handleSendPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payTxRef.trim()) return;

    await recordPaymentTransaction({
      registrationId: payRegId,
      amount: Number(payAmount),
      method: payMethod,
      transactionReference: payTxRef.trim(),
      evidenceNotes: 'Submitted by student via portal.',
    });

    setPaySubmitted(true);
    setPayTxRef('');
    setTimeout(() => {
      setPaySubmitted(false);
      setShowSubmitPayment(false);
    }, 2500);
  };

  const handleSendTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    await addSupportTicket(ticketSubject.trim(), ticketMessage.trim());
    setTicketSubmitted(true);
    setTicketSubject('');
    setTicketMessage('');
    setTimeout(() => setTicketSubmitted(false), 2500);
  };

  return (
    <div className="py-8 bg-slate-50 dark:bg-slate-900/60 min-h-[calc(100vh-140px)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Student Profile Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-2xl text-white">
              {(myStudent?.fullName || currentUser.name || 'S').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  {myStudent?.fullName || currentUser.name || 'Student Learner'}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold uppercase">
                  {myStudent?.status || (myRegistrations.length > 0 ? myRegistrations[0].status : 'Active')}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Official Student ID: <strong className="font-mono text-white">{myStudent?.studentId || currentUser.studentId || 'ZACMA-STU-ENROLLED'}</strong> • {myStudent?.phone || currentUser.phone || 'Ethiopia'}
              </p>
              <p className="text-[11px] text-blue-300 mt-1">
                {myStudent?.address || 'Addis Ababa, Ethiopia'} • {myStudent?.gradeLevel || 'Technology Boot Camp Learner'}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-blue-600/40 pt-4 md:pt-0 md:pl-6 text-center">
            <div>
              <span className="text-[10px] text-blue-300 uppercase block font-semibold">Attendance Rate</span>
              <span className="text-xl sm:text-2xl font-black text-white">
                {attendanceMetrics.attendanceRate}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-blue-300 uppercase block font-semibold">Enrolled Classes</span>
              <span className="text-xl sm:text-2xl font-black text-white">
                {myBatches.length}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-blue-300 uppercase block font-semibold">Receipts</span>
              <span className="text-xl sm:text-2xl font-black text-white">
                {myReceipts.length}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
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
            My Overview
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
            My Registrations & Schedule ({myRegistrations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'payments'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            Payments & Receipts ({myReceipts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'attendance'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            My Attendance ({myAttendanceRecords.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('materials')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'materials'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            Learning Materials ({learningMaterials.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('certificates')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'certificates'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            Certificates ({myCertificates.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('support')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'support'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            Support & Help Desk
          </button>
        </div>

        {/* TAB 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Digital Student ID Card */}
            <div className="rounded-3xl bg-white dark:bg-slate-800 border-2 border-blue-500/30 p-6 shadow-md space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs">
                    ZT
                  </div>
                  <span className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    Zacma Student Card
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">Addis Ababa</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-xl text-blue-600">
                  {myStudent?.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {myStudent?.fullName}
                  </h3>
                  <p className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                    {myStudent?.studentId}
                  </p>
                  <p className="text-[10px] text-slate-500">{myStudent?.phone}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Primary Course:</span>
                  <span className="font-semibold">{myRegistrations[0]?.courseTitle || 'Software Engineering'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Campus Lab:</span>
                  <span className="font-semibold">Lab 1 - Turing Hall</span>
                </div>
              </div>
            </div>

            {/* Next Scheduled Class */}
            <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>My Enrolled Cohort</span>
                </h3>
              </div>

              {myBatches.length > 0 ? (
                myBatches.map((b) => (
                  <div key={b.id} className="space-y-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white block">
                      {b.name}
                    </span>
                    <p className="text-slate-500">{b.courseTitle}</p>
                    <div className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        <span>{b.scheduleTitle}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                        <span>Instructor: {b.teacherName}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-500">
                  <p>You are registered for: <strong>{myRegistrations[0]?.courseTitle}</strong>.</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Your batch schedule is: {myRegistrations[0]?.scheduleTitle}. Class will meet at Bole campus.
                  </p>
                </div>
              )}
            </div>

            {/* Account & Payment Balance Card */}
            <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Tuition Balance</span>
                </h3>
              </div>

              {myRegistrations.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Course Fee:</span>
                    <span className="font-semibold">{formatETB(myRegistrations[0].totalFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Paid:</span>
                    <span className="font-bold text-emerald-600">{formatETB(myRegistrations[0].amountPaid)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-bold text-slate-900 dark:text-white">Remaining Balance:</span>
                    <span className="font-extrabold text-blue-600 text-sm">
                      {formatETB(myRegistrations[0].balanceDue)}
                    </span>
                  </div>

                  {myRegistrations[0].balanceDue > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowSubmitPayment(true);
                        setActiveTab('payments');
                      }}
                      className="w-full mt-2 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition"
                    >
                      Submit Payment Slip / TxID
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-slate-400">No active registration invoices.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Registrations & Course Details */}
        {activeTab === 'courses' && (
          <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              My Course Registrations
            </h3>

            <div className="space-y-4">
              {myRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {reg.registrationNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 text-[10px] font-bold uppercase">
                        {reg.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {reg.courseTitle}
                    </h4>
                    <p className="text-slate-500">
                      Package: <strong>{reg.packageName}</strong> • Mode: <strong>{reg.mode.toUpperCase()}</strong>
                    </p>
                    <p className="text-[11px] text-slate-400">Schedule: {reg.scheduleTitle}</p>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Balance Due</span>
                    <span className="font-extrabold text-base text-slate-900 dark:text-white block">
                      {formatETB(reg.balanceDue)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Paid: {formatETB(reg.amountPaid)} of {formatETB(reg.totalFee)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Payments & Receipts */}
        {activeTab === 'payments' && (
          <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-6 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Payment History & Official Receipts
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official receipts issued by Zacma finance department with QR authentication.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSubmitPayment(!showSubmitPayment)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
              >
                {showSubmitPayment ? 'Cancel' : '+ Submit Payment Reference'}
              </button>
            </div>

            {/* Submit Payment Reference Box */}
            {showSubmitPayment && (
              <form onSubmit={handleSendPayment} className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-3">
                <span className="font-bold text-slate-900 dark:text-white block uppercase tracking-wider text-[11px]">
                  Submit Payment Reference for Verification
                </span>

                {paySubmitted ? (
                  <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 font-semibold">
                    ✓ Transaction reference submitted! Accountant will verify and issue your receipt.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Payment Method</label>
                      <select
                        value={payMethod}
                        onChange={(e) => setPayMethod(e.target.value as any)}
                        className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      >
                        <option value="telebirr">Telebirr ({settings.telebirrMerchantCode})</option>
                        <option value="cbe_birr">CBE Birr</option>
                        <option value="bank_transfer_cbe">CBE Bank Deposit</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Amount Paid (ETB)</label>
                      <input
                        type="number"
                        value={payAmount}
                        onChange={(e) => setPayAmount(Number(e.target.value))}
                        className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">TxID / Reference</label>
                      <input
                        type="text"
                        value={payTxRef}
                        onChange={(e) => setPayTxRef(e.target.value)}
                        placeholder="e.g. TB99120045"
                        className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3 flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      >
                        Submit to Finance
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}

            {/* Issued Receipts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myReceipts.map((rec) => (
                <div
                  key={rec.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {rec.receiptNumber}
                    </span>
                    <span className="text-[10px] text-slate-400">{rec.issuedAt.substring(0, 10)}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{rec.courseTitle}</h4>
                    <p className="text-[11px] text-slate-500">Method: {rec.paymentMethod.replace(/_/g, ' ').toUpperCase()}</p>
                    <p className="text-[10px] text-slate-400 font-mono">TxID: {rec.transactionReference}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {formatETB(rec.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenReceiptModal(rec)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Print Receipt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Attendance History */}
        {activeTab === 'attendance' && (
          <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                My Class Attendance Record
              </h3>
              <span className="font-bold text-blue-600">
                Attendance Rate: {attendanceMetrics.attendanceRate}%
              </span>
            </div>

            <div className="space-y-2">
              {myAttendanceRecords.length === 0 ? (
                <p className="text-slate-400 py-6 text-center">No attendance sessions recorded yet.</p>
              ) : (
                myAttendanceRecords.map((att, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {att.topic}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Date: {att.date}</span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        att.status === 'present'
                          ? 'bg-emerald-100 text-emerald-800'
                          : att.status === 'late'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {att.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: Learning Materials */}
        {activeTab === 'materials' && (
          <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Authorized Course Learning Materials
            </h3>

            <div className="space-y-3">
              {learningMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600">
                      {mat.fileType === 'video' ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{mat.title}</h4>
                      <p className="text-slate-500">{mat.description}</p>
                    </div>
                  </div>

                  {mat.url && mat.url !== '#' && (
                    <a
                      href={mat.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                    >
                      Open Link
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: Certificates */}
        {activeTab === 'certificates' && (
          <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              My Official Certificates of Completion
            </h3>

            {myCertificates.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <Award className="w-10 h-10 text-slate-300 mx-auto" />
                <p>Certificate will be issued automatically upon course graduation and payment clearance.</p>
              </div>
            ) : (
              myCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono font-bold text-blue-600">{cert.certificateNumber}</span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                      {cert.courseTitle}
                    </h4>
                    <p className="text-[11px] text-slate-500">Issued: {cert.issueDate} • Grade: {cert.grade}</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      Verification Code: {cert.verificationCode}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenCertificateModal(cert)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>View & Print Certificate</span>
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 7: Support Inquiry */}
        {activeTab === 'support' && (
          <div className="max-w-xl mx-auto rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6 sm:p-8 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Ask Registrar or Academic Desk</span>
            </h3>

            {ticketSubmitted && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Ticket sent! Registrar team will respond shortly.</span>
              </div>
            )}

            <form onSubmit={handleSendTicket} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Subject</label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Request for weekend lab access"
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Message Details</label>
                <textarea
                  rows={4}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Explain your inquiry or request..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  required
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Send Inquiry
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
