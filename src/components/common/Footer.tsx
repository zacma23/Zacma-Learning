import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  ShieldCheck,
  CheckCircle,
  Award,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, language, settings, setActiveView, setCurrentRole } = useApp();

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-500/20">
                <span className="text-white font-extrabold text-lg">Z</span>
                <span className="text-red-400 font-extrabold text-lg -ml-0.5">T</span>
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                ZACMA <span className="text-red-500">TECH</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'am' ? settings.nameAm : settings.name} is Ethiopia's premier technology institute preparing engineers and analysts for high-demand modern technology careers.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Accredited Tech Institute - Addis Ababa, Ethiopia</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              {t('courses')}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveView('courses')}
                  className="hover:text-blue-400 transition"
                >
                  Full-Stack Software Engineering
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveView('courses')}
                  className="hover:text-blue-400 transition"
                >
                  Data Science & Generative AI
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveView('courses')}
                  className="hover:text-blue-400 transition"
                >
                  Mobile App Development (Flutter)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveView('courses')}
                  className="hover:text-blue-400 transition"
                >
                  Cybersecurity & Network Defense
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveView('courses')}
                  className="hover:text-blue-400 transition"
                >
                  Coding for Kids & Young Teens
                </button>
              </li>
            </ul>
          </div>

          {/* Verification & Portals */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Portals & Verification
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveView('verify')}
                  className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-medium"
                >
                  <Award className="w-3.5 h-3.5" />
                  {t('verifyCertificate')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentRole('student');
                  }}
                  className="hover:text-blue-400 transition"
                >
                  Student Learning Portal
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentRole('teacher');
                  }}
                  className="hover:text-blue-400 transition"
                >
                  Instructor Class Workspace
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentRole('accountant');
                  }}
                  className="hover:text-blue-400 transition"
                >
                  Finance & Receipt Verification
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentRole('admin');
                  }}
                  className="hover:text-blue-400 transition"
                >
                  Administration Desk
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details & Official Payment Options */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Location & Accounts
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{language === 'am' ? settings.locationAm : settings.location}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{settings.phonePrimary} / {settings.phoneSecondary}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{settings.email}</span>
              </p>
              
              <div className="pt-2 border-t border-slate-800">
                <p className="text-[11px] font-semibold text-slate-300 mb-1.5">Official Payment Channels:</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-medium">
                    Telebirr: {settings.telebirrMerchantCode}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-medium">
                    CBE Birr
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] font-medium">
                    Awash Bank
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Rights */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Zacma Technology Training PLC. All rights reserved. Addis Ababa, Ethiopia.</p>
          <div className="flex items-center gap-6">
            <button type="button" onClick={() => setActiveView('about')} className="hover:text-slate-400">
              Privacy Notice
            </button>
            <button type="button" onClick={() => setActiveView('about')} className="hover:text-slate-400">
              Terms of Admission
            </button>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Timezone: Africa/Addis_Ababa</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
