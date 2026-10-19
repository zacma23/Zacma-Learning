import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Award,
  Users,
  Cpu,
  Zap,
  CheckCircle2,
  Quote,
} from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { t, language, settings } = useApp();

  const testimonials = [
    {
      name: 'Yohannes Getachew',
      role: 'Full-Stack Software Engineer at Commercial Bank of Ethiopia',
      quote:
        'The hands-on Next.js and PostgreSQL training at Zacma gave me the exact production portfolio that impressed CBE hiring managers. Best decision for my tech career.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Tsion Berhanu',
      role: 'AI & Data Analyst at Telebirr / Ethio Telecom',
      quote:
        'Dr. Helen’s machine learning course connected theory with practical Ethiopian banking data. The mentors are patient and deeply knowledgeable.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Abenezer Solomon',
      role: 'Mobile Developer at Remote Fintech Startup',
      quote:
        'Learning Flutter in the Sunday intensive batch while working during weekdays allowed me to transition into global remote software engineering within 4 months.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="py-16 bg-slate-50 dark:bg-slate-900/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Mission and Lab Facilities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {language === 'am' ? 'ስለ ዛክማ ቴክኖሎጂ' : 'About Zacma Technology'}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {language === 'am'
                ? 'በተግባር የተደገፈ የኢትዮጵያ ቀዳሚ የቴክኖሎጂ ስልጠና'
                : 'Building Ethiopia’s Tech Talent Pipeline with Practical Engineering Craft'}
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {language === 'am'
                ? 'ዛክማ ቴክኖሎጂ ማሰልጠኛ ማዕከል በአዲስ አበባ በቦሌ መንገድ ሜጋ ህንፃ የሚገኝ ዘመናዊ የቴክኖሎጂ ማዕከል ሲሆን ተማሪዎችን በሶፍትዌር ኢንጂነሪንግ፣ አርቴፊሻል ኢንተለጀንስ፣ ሳይበር ደህንነት እና ሞባይል አፕሊኬሽን ያሰለጥናል።'
                : 'Founded in Addis Ababa, Zacma Technology Training Center operates on a simple premise: engineering cannot be learned through passive slides alone. Our students code real production applications from day one, mentored by active senior industry developers.'}
            </p>

            <div className="space-y-3 pt-2 text-xs text-slate-700 dark:text-slate-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Modern Computer Labs equipped with high-spec workstations and uninterruptible backup generators.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Dedicated 200Mbps optical fiber internet connection directly terminated on campus.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Curriculum aligned with international IEEE, ACM, and modern cloud architecture standards.</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <Cpu className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Hands-on Labs</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Turing Lab, Lovelace Suite, and Hopper Room outfitted for intensive coding.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <Award className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">QR-Authenticated</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tamper-proof certificates verifiable online by banks, recruiters, and embassies.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <Zap className="w-8 h-8 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Local Payments</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official integrations and merchant accounts with Telebirr, CBE Birr, and Awash.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Industry Mentors</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Active senior engineers guiding capstone projects and technical interviews.
              </p>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
              {t('testimonialsTitle')}
            </h3>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {t('testimonialsSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testi, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <Quote className="w-6 h-6 text-blue-500/40" />
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                    "{testi.quote}"
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                  <img
                    src={testi.avatar}
                    alt={testi.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-600"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{testi.name}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {testi.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
