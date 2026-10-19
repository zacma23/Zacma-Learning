import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  CheckCircle,
  Users,
  Briefcase,
  Laptop,
  Award,
  Zap,
} from 'lucide-react';

export const Hero: React.FC = () => {
  const { t, language, setActiveView } = useApp();

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-b from-blue-50/50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 transition-colors">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-blue-400/10 via-indigo-500/10 to-red-400/10 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold shadow-xs">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>
                {language === 'am'
                  ? 'የኢትዮጵያ ቀዳሚ የቴክኖሎጂ ማሰልጠኛ ማዕከል'
                  : "Ethiopia's Leading Hands-on Tech Institute"}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              {language === 'am' ? (
                <>
                  የቴክኖሎጂ ሙያዎን በ <span className="text-blue-600 dark:text-blue-400">ዛክማ</span>{' '}
                  ያሳድጉ
                </>
              ) : (
                <>
                  Accelerate Your Tech Career with{' '}
                  <span className="text-blue-600 dark:text-blue-400">Zacma Technology</span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {t('heroSubtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <button
                type="button"
                onClick={() => setActiveView('register')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all transform active:scale-95"
              >
                <span>{t('applyOnline')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveView('courses')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold text-sm transition"
              >
                <span>{t('browseCourses')}</span>
              </button>
            </div>

            {/* Feature Bullets */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 text-xs font-medium text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Telebirr & CBE Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Bole Campus Labs + Online</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Verified Certificates</span>
              </div>
            </div>
          </div>

          {/* Right Visual Card Column */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Addis Ababa • Cohort 2026</span>
                </div>

                {/* Simulated Terminal / Institute Card */}
                <div className="mt-4 space-y-4">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white mb-1">
                      <span>Full-Stack Web Engineering</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                        OPEN
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Mon / Wed / Fri • Turing Lab 1 • 10,000 ETB
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white mb-1">
                      <span>Data Science & Generative AI</span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[10px] font-bold">
                        FEW SEATS
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Tue / Thu / Sat • Hopper Lab 3 • 12,500 ETB
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white mb-1">
                      <span>Mobile App Dev (Flutter)</span>
                      <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 text-[10px] font-bold">
                        WEEKEND
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Sunday Intensive • Turing Lab 1 • 9,500 ETB
                    </p>
                  </div>

                  {/* Highlights Callout */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span className="text-xs font-bold">Registration Perk</span>
                    </div>
                    <p className="text-[11px] text-blue-100">
                      Use code <strong className="underline text-white">EARLYBIRD</strong> for 10% instant tuition discount during online registration!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Row */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-10 border-t border-slate-200 dark:border-slate-800">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">1,850+</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{t('statsStudents')}</div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">92%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{t('statsHired')}</div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">12+</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{t('statsCourses')}</div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-red-600 dark:text-red-400">45+</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{t('statsPartners')}</div>
          </div>
        </div>
      </div>
    </section>
  );
};
