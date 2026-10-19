import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Course } from '../../types/index';
import { formatETB } from '../../utils/rules';
import {
  X,
  Clock,
  Calendar,
  Users,
  Award,
  BookOpen,
  Share2,
  Check,
  CheckCircle,
  ExternalLink,
  Copy,
} from 'lucide-react';

interface CourseDetailModalProps {
  courseId: string;
  onClose: () => void;
  onRegister: (course: Course) => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  courseId,
  onClose,
  onRegister,
}) => {
  const { courses, packages, batches, language, t } = useApp();
  const [copiedLink, setCopiedLink] = useState(false);

  const course = courses.find((c) => c.id === courseId);
  if (!course) return null;

  const courseBatches = batches.filter((b) => b.courseId === course.id);

  const shareableUrl = `${window.location.origin}/#course-${course.code.toLowerCase()}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="relative h-44 sm:h-56 bg-slate-950 overflow-hidden shrink-0">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title & Metadata */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white font-mono text-xs font-bold">
                {course.code}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-white/20 text-white backdrop-blur-xs text-xs font-medium">
                {course.durationWeeks} Weeks
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              {language === 'am' ? course.titleAm || course.title : course.title}
            </h2>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200">
          {/* Overview */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
              Course Description
            </h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {language === 'am' ? course.descriptionAm || course.description : course.description}
            </p>
          </div>

          {/* Key Facts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Instructor</span>
              <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                {course.assignedTeacherName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Duration</span>
              <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                {course.durationWeeks} Weeks ({course.hoursPerWeek} hrs/wk)
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Base Tuition</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400 mt-0.5 block">
                {formatETB(course.baseFee)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Registration Deadline</span>
              <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                {course.registrationDeadline}
              </span>
            </div>
          </div>

          {/* Syllabus Modules */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">
              Curriculum & Technical Modules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {(language === 'am' ? course.curriculumAm : course.curriculum).map((module, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-2xs"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="text-slate-700 dark:text-slate-200 font-medium">{module}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Outcomes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
              Verified Learning Outcomes
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {(language === 'am' ? course.learningOutcomesAm : course.learningOutcomes).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Training Packages Comparison for this Course */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">
              Package Options for this Course
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {packages.map((pkg) => {
                const pkgFee = Math.round(course.baseFee * pkg.priceMultiplier);
                return (
                  <div
                    key={pkg.id}
                    className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between ${
                      pkg.recommended
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {language === 'am' ? pkg.nameAm : pkg.name}
                        </span>
                        {pkg.recommended && (
                          <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold uppercase">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                        {pkg.code === 'vip' ? '1-on-1 Mentorship' : `${pkg.minGroupSize}-${pkg.maxGroupSize} Learners`}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 block">
                        {formatETB(pkgFee)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shareable Link Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 truncate">
              <Share2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-slate-500 dark:text-slate-400 truncate">
                Shareable Course Link: <code className="text-slate-800 dark:text-slate-200">{shareableUrl}</code>
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-100 transition shrink-0"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Modal Sticky Footer CTA */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4 shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              Total Standard Fee
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-blue-600 dark:text-blue-400">
              {formatETB(course.baseFee)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onRegister(course);
              }}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition transform active:scale-95"
            >
              Register for this Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
