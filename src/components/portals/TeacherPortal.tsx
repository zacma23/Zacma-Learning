import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Batch, AttendanceStatus, LearningMaterial } from '../../types/index';
import { calculateAttendanceMetrics } from '../../utils/rules';
import {
  BookOpen,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Upload,
  Video,
  FileText,
  AlertCircle,
  Check,
  Plus,
} from 'lucide-react';

export const TeacherPortal: React.FC = () => {
  const {
    batches,
    students,
    courses,
    attendance,
    markBatchAttendance,
    learningMaterials,
    addLearningMaterial,
    currentUser,
    language,
    t,
  } = useApp();

  // Find batches assigned to this teacher (or all active batches if generic test)
  const myBatches = batches.filter(
    (b) => b.teacherName.toLowerCase().includes('dawit') || b.teacherId === currentUser.id || true
  );

  const [selectedBatchId, setSelectedBatchId] = useState<string>(myBatches[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'attendance' | 'materials' | 'roster'>('attendance');

  // Attendance taking form
  const [sessionTopic, setSessionTopic] = useState('');
  const [attendanceStatuses, setAttendanceStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [attendanceSaved, setAttendanceSaved] = useState(false);

  // Material upload form
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialDesc, setMaterialDesc] = useState('');
  const [materialType, setMaterialType] = useState<'pdf' | 'video' | 'code' | 'link'>('pdf');
  const [materialUrl, setMaterialUrl] = useState('');
  const [materialSaved, setMaterialSaved] = useState(false);

  const currentBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];
  const enrolledStudents = students.filter((s) =>
    currentBatch ? currentBatch.enrolledStudentIds.includes(s.id) : false
  );

  // Past attendance records for this batch
  const batchAttendanceHistory = attendance.filter((a) => a.batchId === currentBatch?.id);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBatch || !sessionTopic.trim()) return;

    const records = enrolledStudents.map((s) => ({
      studentId: s.id,
      studentName: s.fullName,
      status: attendanceStatuses[s.id] || ('present' as AttendanceStatus),
    }));

    await markBatchAttendance(currentBatch.id, sessionTopic.trim(), records);
    setAttendanceSaved(true);
    setSessionTopic('');
    setTimeout(() => setAttendanceSaved(false), 3000);
  };

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialTitle.trim() || !currentBatch) return;

    await addLearningMaterial({
      courseId: currentBatch.courseId,
      batchId: currentBatch.id,
      title: materialTitle.trim(),
      description: materialDesc.trim(),
      fileType: materialType,
      url: materialUrl.trim() || '#',
      uploadedBy: currentUser.name,
    });

    setMaterialSaved(true);
    setMaterialTitle('');
    setMaterialDesc('');
    setMaterialUrl('');
    setTimeout(() => setMaterialSaved(false), 3000);
  };

  return (
    <div className="py-8 bg-slate-50 dark:bg-slate-900/60 min-h-[calc(100vh-140px)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Instructor Class Workspace
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Logged in as <strong>{currentUser.name}</strong> • Record session attendance and manage class resources.
            </p>
          </div>

          {/* Batch Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Active Batch:</span>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
            >
              {myBatches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.scheduleTitle})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Batch Info Card */}
        {currentBatch && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-slate-900 dark:text-white">
                  {currentBatch.name}
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 text-[10px] font-bold uppercase">
                  {currentBatch.status}
                </span>
              </div>
              <p className="text-slate-500">{currentBatch.courseTitle}</p>
              <p className="text-[11px] text-slate-400">
                {currentBatch.scheduleTitle} • {currentBatch.classroom}
              </p>
            </div>

            <div className="flex items-center gap-6 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Students</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {enrolledStudents.length} / {currentBatch.capacity}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Past Sessions</span>
                <span className="font-bold text-sm text-purple-600 dark:text-purple-400">
                  {batchAttendanceHistory.length} Recorded
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'attendance'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            Session Attendance Register
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('materials')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'materials'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            Learning Materials ({learningMaterials.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'roster'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            Enrolled Student Roster ({enrolledStudents.length})
          </button>
        </div>

        {/* TAB 1: Attendance Taking */}
        {activeTab === 'attendance' && (
          <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Mark Today's Attendance Register
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Each status update is securely timestamped and accessible in student and administrative portals.
              </p>
            </div>

            {attendanceSaved && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Attendance saved successfully for today's session!</span>
              </div>
            )}

            <form onSubmit={handleSaveAttendance} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Session Topic / Lab Objective
                </label>
                <input
                  type="text"
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                  placeholder="e.g. Express Middleware, JWT Auth & REST API Best Practices"
                  className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  required
                />
              </div>

              {/* Student Attendance List */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                  Students in this Batch:
                </span>

                {enrolledStudents.length === 0 ? (
                  <p className="text-xs text-slate-400 p-4 text-center bg-slate-50 dark:bg-slate-900 rounded-xl">
                    No students currently assigned to this batch.
                  </p>
                ) : (
                  enrolledStudents.map((student) => {
                    const currentStatus = attendanceStatuses[student.id] || 'present';

                    return (
                      <div
                        key={student.id}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {student.fullName}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            ID: {student.studentId} • {student.phone}
                          </span>
                        </div>

                        {/* Status buttons */}
                        <div className="flex items-center gap-1.5">
                          {(['present', 'late', 'excused', 'absent'] as AttendanceStatus[]).map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => handleStatusChange(student.id, status)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                                currentStatus === status
                                  ? status === 'present'
                                    ? 'bg-emerald-600 text-white'
                                    : status === 'late'
                                    ? 'bg-amber-600 text-white'
                                    : status === 'excused'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-red-600 text-white'
                                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {enrolledStudents.length > 0 && (
                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs"
                  >
                    Save & Submit Session Attendance
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* TAB 2: Learning Materials */}
        {activeTab === 'materials' && (
          <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Uploaded Class Handouts & Live Streams
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Resources are instantly available in the Student Portal for enrolled students.
                </p>
              </div>
            </div>

            {materialSaved && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Learning resource uploaded and published to students!</span>
              </div>
            )}

            {/* Upload form */}
            <form onSubmit={handleUploadMaterial} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <span className="font-bold text-slate-900 dark:text-white block uppercase tracking-wider text-[11px]">
                Add New Learning Resource
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={materialTitle}
                    onChange={(e) => setMaterialTitle(e.target.value)}
                    placeholder="Material Title (e.g. Week 3 Lecture Slides & Exercises)"
                    className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    required
                  />
                </div>
                <div>
                  <select
                    value={materialType}
                    onChange={(e) => setMaterialType(e.target.value as any)}
                    className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="pdf">PDF Handbook / Slide</option>
                    <option value="video">Recorded Stream (Video)</option>
                    <option value="code">Code Repository / ZIP</option>
                    <option value="link">Meeting Link (Meet/Zoom)</option>
                  </select>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={materialUrl}
                  onChange={(e) => setMaterialUrl(e.target.value)}
                  placeholder="URL or Resource Link (e.g. https://meet.google.com/... or https://github.com/...)"
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-xs"
                >
                  Upload & Share with Students
                </button>
              </div>
            </form>

            {/* List of materials */}
            <div className="space-y-3">
              {learningMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600">
                      {mat.fileType === 'video' ? (
                        <Video className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{mat.title}</h4>
                      <p className="text-slate-500">{mat.description}</p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Uploaded by {mat.uploadedBy} on {mat.uploadedAt}
                      </span>
                    </div>
                  </div>

                  {mat.url && mat.url !== '#' && (
                    <a
                      href={mat.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-semibold text-xs hover:underline"
                    >
                      Open Link
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Enrolled Student Roster */}
        {activeTab === 'roster' && (
          <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Enrolled Students for {currentBatch?.name}
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3.5">Student ID</th>
                    <th className="p-3.5">Full Name</th>
                    <th className="p-3.5">Phone</th>
                    <th className="p-3.5">Education</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {enrolledStudents.map((s) => (
                    <tr key={s.id}>
                      <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">{s.studentId}</td>
                      <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{s.fullName}</td>
                      <td className="p-3.5 font-mono">{s.phone}</td>
                      <td className="p-3.5 text-slate-500">{s.gradeLevel}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
