import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Certificate } from '../../types/index';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  ExternalLink,
  Printer,
  Calendar,
  User,
  BookOpen,
} from 'lucide-react';

interface CertificateVerifierProps {
  onOpenCertificateModal?: (cert: Certificate) => void;
}

export const CertificateVerifier: React.FC<CertificateVerifierProps> = ({
  onOpenCertificateModal,
}) => {
  const { certificates, language, t } = useApp();
  const [codeInput, setCodeInput] = useState<string>('ZAC-A94F-28B1');
  const [searched, setSearched] = useState<boolean>(true);
  const [foundCert, setFoundCert] = useState<Certificate | null>(
    certificates[0] || null
  );

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = codeInput.trim().toUpperCase();
    const match = certificates.find(
      (c) =>
        c.verificationCode.toUpperCase() === clean ||
        c.certificateNumber.toUpperCase() === clean
    );
    setSearched(true);
    setFoundCert(match || null);
  };

  return (
    <div className="py-16 bg-slate-50 dark:bg-slate-900/60 min-h-[calc(100vh-140px)] transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mb-4 shadow-xs">
            <Award className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('certVerificationTitle')}
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {t('certVerificationDesc')}
          </p>
        </div>

        {/* Verification Form */}
        <form
          onSubmit={handleVerify}
          className="max-w-xl mx-auto p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder={t('enterCode')}
              className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 font-mono tracking-wider focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md transition shrink-0 whitespace-nowrap"
          >
            {t('verifyNow')}
          </button>
        </form>

        {/* Sample Codes Helper */}
        <div className="text-center text-xs text-slate-500">
          Try sample verification code:{' '}
          <button
            type="button"
            onClick={() => {
              setCodeInput('ZAC-A94F-28B1');
              setFoundCert(certificates[0] || null);
            }}
            className="font-mono text-blue-600 dark:text-blue-400 underline font-semibold ml-1"
          >
            ZAC-A94F-28B1
          </button>
        </div>

        {/* Verification Result Card */}
        {searched && (
          <div className="max-w-2xl mx-auto">
            {foundCert ? (
              <div className="rounded-3xl bg-white dark:bg-slate-800 border-2 border-emerald-500/50 shadow-2xl p-6 sm:p-8 space-y-6">
                {/* Verified Banner */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                        Verified Authentic
                      </span>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                        {foundCert.certificateNumber}
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                    ACTIVE
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[11px] mb-1">Recipient Graduate</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {foundCert.studentName}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Student ID: {foundCert.studentId}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[11px] mb-1">Course of Study</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {foundCert.courseTitle}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Duration: {foundCert.duration}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[11px] mb-1">Issue Date</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {foundCert.issueDate}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[11px] mb-1">Authorized By</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {foundCert.issuedBy}
                    </span>
                  </div>
                </div>

                {/* Accreditation Statement */}
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-4">
                  This electronic credential certifies that the graduate has completed required laboratory assignments, coding assessments, and capstone review at Zacma Technology Training Center in Addis Ababa, Ethiopia.
                </p>

                {onOpenCertificateModal && (
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onOpenCertificateModal(foundCert)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>View & Print Official Certificate</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-3xl bg-white dark:bg-slate-800 border-2 border-red-500/40 shadow-xl p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 mx-auto flex items-center justify-center">
                  <XCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('certInvalid')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  No certificate record was found matching code <code className="font-mono text-red-600 dark:text-red-400">{codeInput}</code>. Please double-check the 12-character code printed at the bottom of the certificate.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
