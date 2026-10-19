import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, Batch, SupportTicket } from '../../types/index';
import { formatETB, validateEthiopianPhone } from '../../utils/rules';
import {
  ClipboardList,
  UserPlus,
  Users,
  Search,
  CheckCircle,
  Clock,
  Printer,
  Calendar,
  MessageSquare,
  AlertCircle,
  Send,
} from 'lucide-react';

export const SecretaryPortal: React.FC = () => {
  const {
    students,
    registrations,
    courses,
    packages,
    schedules,
    batches,
    supportTickets,
    replySupportTicket,
    registerStudentOnline,
    language,
    t,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'register' | 'students' | 'inquiries' | 'timetables'>('students');

  // Fast registration form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gradeLevel, setGradeLevel] = useState('University Graduate');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [packageId, setPackageId] = useState(packages[0]?.id || '');
  const [scheduleId, setScheduleId] = useState(schedules[0]?.id || '');
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Inquiries response
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  // Print application sheet
  const [printStudent, setPrintStudent] = useState<Student | null>(null);

  const handleRegisterOnBehalf = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const phoneCheck = validateEthiopianPhone(phone);
    if (!phoneCheck.valid) {
      setRegError(phoneCheck.error || 'Invalid Ethiopian phone format.');
      return;
    }

    const res = await registerStudentOnline({
      fullName: fullName.trim(),
      phone: phoneCheck.normalized,
      address: address.trim(),
      gradeLevel,
      courseId,
      packageId,
      scheduleId,
      mode: 'in_person',
      source: 'Registrar Front Desk',
    });

    if (!res.success) {
      setRegError(res.error || 'Failed to complete registration');
      return;
    }

    setRegSuccess(true);
    setFullName('');
    setPhone('');
    setAddress('');
    setTimeout(() => {
      setRegSuccess(false);
      setActiveTab('students');
    }, 2000);
  };

  const handleSendTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    replySupportTicket(selectedTicket.id, replyMessage.trim());
    setReplyMessage('');
    // refresh selectedTicket
    const updated = supportTickets.find((t) => t.id === selectedTicket.id);
    if (updated) setSelectedTicket(updated);
  };

  return (
    <div className="py-8 bg-slate-50 dark:bg-slate-900/60 min-h-[calc(100vh-140px)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Registrar & Student Desk
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              On-behalf student admissions, classroom timetables, batch assignments, and inquiry coordination.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Fast Admission Entry</span>
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'students'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            Student Directory ({students.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'register'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            Register Student On-Behalf
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inquiries')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'inquiries'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            Student Inquiries ({supportTickets.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('timetables')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'timetables'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            Class Timetables & Batches
          </button>
        </div>

        {/* TAB 1: Student Directory & Print Form */}
        {activeTab === 'students' && (
          <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Active Student Roster
              </h3>
              <span className="text-xs text-slate-400">{students.length} Registered Students</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3.5">Student ID</th>
                    <th className="p-3.5">Full Name</th>
                    <th className="p-3.5">Phone</th>
                    <th className="p-3.5">Education / Profession</th>
                    <th className="p-3.5">Address</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                      <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                        {s.studentId}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{s.fullName}</td>
                      <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300">{s.phone}</td>
                      <td className="p-3.5 text-slate-500">{s.gradeLevel}</td>
                      <td className="p-3.5 text-slate-500 truncate max-w-xs">{s.address}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            s.status === 'enrolled'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.status === 'paid'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {s.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => setPrintStudent(s)}
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline font-semibold"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print File</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Register on Behalf Form */}
        {activeTab === 'register' && (
          <div className="max-w-2xl mx-auto rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-600" />
                <span>Registrar Walk-in Student Registration</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter details for a student registering at the front desk.
              </p>
            </div>

            {regSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Student registered! A unique student record and payment request have been generated.</span>
              </div>
            )}

            {regError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterOnBehalf} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Almaz Bekele Girma"
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Phone (09... or 07...)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0911223344"
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Education / Profession
                  </label>
                  <input
                    type="text"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    placeholder="e.g. CS Student"
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sub-City & Residence Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Bole Sub-city, Woreda 05, Addis Ababa"
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course
                  </label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Package
                  </label>
                  <select
                    value={packageId}
                    onChange={(e) => setPackageId(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  >
                    {packages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Schedule
                  </label>
                  <select
                    value={scheduleId}
                    onChange={(e) => setScheduleId(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  >
                    {schedules.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                >
                  Confirm & Submit Admission
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: Student Inquiries */}
        {activeTab === 'inquiries' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 space-y-2 text-xs">
              <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider px-2 py-1">
                Student Tickets
              </h3>
              {supportTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-3 rounded-2xl cursor-pointer transition ${
                    selectedTicket?.id === ticket.id
                      ? 'bg-blue-50 dark:bg-blue-950/50 border border-blue-500'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white mb-1">
                    <span className="truncate">{ticket.studentName}</span>
                    <span className="text-[10px] text-amber-600 uppercase font-semibold">
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{ticket.subject}</p>
                </div>
              ))}
            </div>

            <div className="md:col-span-2 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 space-y-4 text-xs">
              {selectedTicket ? (
                <>
                  <div className="pb-3 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-[11px] text-slate-400 block font-mono">
                      Ticket #{selectedTicket.id}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {selectedTicket.subject}
                    </h3>
                    <p className="text-slate-500 mt-1">
                      From: <strong>{selectedTicket.studentName}</strong> ({selectedTicket.studentPhone})
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 leading-relaxed text-slate-700 dark:text-slate-200">
                    "{selectedTicket.message}"
                  </div>

                  {/* Replies history */}
                  <div className="space-y-3 pt-2">
                    <span className="font-bold text-slate-900 dark:text-white block uppercase tracking-wider text-[11px]">
                      Desk Correspondence:
                    </span>
                    {selectedTicket.replies.map((r) => (
                      <div
                        key={r.id}
                        className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/60 space-y-1"
                      >
                        <div className="flex items-center justify-between font-semibold text-blue-900 dark:text-blue-200 text-[11px]">
                          <span>{r.sender}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{r.date}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300">{r.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Send reply */}
                  <form onSubmit={handleSendTicketReply} className="pt-2 space-y-2">
                    <textarea
                      rows={3}
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type response to student..."
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                      required
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Response</span>
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-16 text-slate-400">
                  Select an inquiry from the list to view message and respond.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Timetables */}
        {activeTab === 'timetables' && (
          <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Class Timetable Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {schedules.map((sch) => (
                <div
                  key={sch.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2"
                >
                  <h4 className="font-bold text-slate-900 dark:text-white">{sch.title}</h4>
                  <p className="text-slate-500">Days: {sch.days.join(', ')}</p>
                  <p className="text-slate-500">Hours: {sch.timeSlot}</p>
                  <p className="text-blue-600 font-semibold">{sch.classroom}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL: Printable Student Application Form */}
        {printStudent && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 p-8 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl print:border-none print:shadow-none print:p-0">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700 print:border-black">
                <div>
                  <h3 className="font-bold text-base uppercase">Student Admission Record File</h3>
                  <p className="text-xs text-slate-500">Zacma Technology Training Center • Addis Ababa</p>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="print:hidden px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                >
                  Print
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Student ID:</span>
                  <span className="font-mono font-bold">{printStudent.studentId}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Full Legal Name:</span>
                  <span className="font-bold">{printStudent.fullName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Ethiopian Phone:</span>
                  <span className="font-mono">{printStudent.phone}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Address:</span>
                  <span>{printStudent.address}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Education Level:</span>
                  <span>{printStudent.gradeLevel}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Registration Date:</span>
                  <span>{printStudent.registrationDate}</span>
                </div>
              </div>

              <div className="pt-4 flex justify-end print:hidden">
                <button
                  type="button"
                  onClick={() => setPrintStudent(null)}
                  className="px-4 py-2 text-xs text-slate-500 hover:text-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
