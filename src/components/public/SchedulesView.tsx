import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  MapPin,
  Monitor,
  CheckCircle,
  Filter,
} from 'lucide-react';

export const SchedulesView: React.FC = () => {
  const { schedules, language, t, setActiveView } = useApp();
  const [filterMode, setFilterMode] = useState<'all' | 'in_person' | 'online'>('all');

  const filtered = schedules.filter((s) => {
    if (filterMode === 'all') return true;
    return s.mode === filterMode;
  });

  return (
    <section className="py-16 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
            {language === 'am' ? 'የስልጠና የጊዜ ሰሌዳዎች' : 'Timetables & Batches'}
          </h2>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('schedulesTitle')}
          </p>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            {t('schedulesSubtitle')} - All times shown in Addis Ababa EAT (UTC+3).
          </p>
        </div>

        {/* Mode Filter */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Timetables
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('in_person')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterMode === 'in_person'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              In-Person Labs (Bole)
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('online')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterMode === 'online'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Online Live Classes
            </button>
          </div>
        </div>

        {/* Schedules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((sch) => {
            const isOnline = sch.mode === 'online';

            return (
              <div
                key={sch.id}
                className="rounded-2xl p-6 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        isOnline
                          ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {isOnline ? (
                        <>
                          <Monitor className="w-3 h-3" />
                          <span>Online Live Stream</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3 h-3" />
                          <span>In-Person Classroom</span>
                        </>
                      )}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Addis Ababa Time</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {language === 'am' ? sch.titleAm : sch.title}
                  </h3>

                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>{sch.timeSlot}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>
                        {(language === 'am' ? sch.daysAm : sch.days).join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>{sch.classroom}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Recurring Weekly
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveView('register')}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
                  >
                    Select Schedule
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
