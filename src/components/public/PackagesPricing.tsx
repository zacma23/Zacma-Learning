import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatETB } from '../../utils/rules';
import {
  Check,
  Zap,
  Users,
  Shield,
  Star,
  Award,
} from 'lucide-react';

export const PackagesPricing: React.FC = () => {
  const { packages, courses, language, t, setActiveView } = useApp();
  const [selectedCourseForCalc, setSelectedCourseForCalc] = useState<string>(
    courses[0]?.id || ''
  );

  const selectedCourse = courses.find((c) => c.id === selectedCourseForCalc) || courses[0];

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-900/50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
            {language === 'am' ? 'የስልጠና ፓኬጆች' : 'Flexible Training Packages'}
          </h2>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('trainingPackagesTitle')}
          </p>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            {t('trainingPackagesSubtitle')}
          </p>
        </div>

        {/* Live Course Selector for Calculator */}
        <div className="max-w-md mx-auto mb-12 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-3">
          <label
            htmlFor="course-calculator-select"
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0"
          >
            Calculate for Course:
          </label>
          <select
            id="course-calculator-select"
            value={selectedCourseForCalc}
            onChange={(e) => setSelectedCourseForCalc(e.target.value)}
            className="w-full text-xs font-medium py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({formatETB(c.baseFee)})
              </option>
            ))}
          </select>
        </div>

        {/* 3 Packages Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg) => {
            const calculatedPrice = selectedCourse
              ? Math.round(selectedCourse.baseFee * pkg.priceMultiplier)
              : 10000;

            const isVIP = pkg.code === 'vip';
            const isGroup = pkg.code === 'group';

            return (
              <div
                key={pkg.id}
                className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all ${
                  pkg.recommended
                    ? 'bg-white dark:bg-slate-800 border-2 border-blue-600 shadow-xl ring-2 ring-blue-500/10 md:-translate-y-2'
                    : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg'
                }`}
              >
                {/* Popular Badge */}
                {pkg.recommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold tracking-wider uppercase shadow-md flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>Most Popular</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {language === 'am' ? pkg.nameAm : pkg.name}
                    </h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {isVIP
                        ? '1-on-1 Dedicated'
                        : `${pkg.minGroupSize}-${pkg.maxGroupSize} Students`}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                    {language === 'am' ? pkg.descriptionAm : pkg.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Estimated Tuition Fee
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                        {formatETB(calculatedPrice)}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {pkg.priceMultiplier === 1.0
                        ? 'Standard Institute Tuition'
                        : `${pkg.priceMultiplier}x Multiplier with specialized attention`}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3 mb-8">
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white block uppercase tracking-wider">
                      Included Package Benefits:
                    </span>
                    {(language === 'am' ? pkg.featuresAm : pkg.features).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveView('register')}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-xs transition shadow-xs ${
                    pkg.recommended
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white'
                  }`}
                >
                  Choose {language === 'am' ? pkg.nameAm : pkg.name}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
