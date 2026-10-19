import React from 'react';
import { Certificate } from '../../types/index';
import { X, Printer, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface CertificateModalProps {
  certificate: Certificate;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  certificate,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Top Control Bar */}
        <div className="print:hidden p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Official Certificate of Completion
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Certificate</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Page */}
        <div className="p-8 sm:p-14 bg-gradient-to-br from-amber-50/40 via-white to-blue-50/30 text-slate-900 print:p-8 print:bg-white">
          <div className="relative border-8 border-double border-blue-900 p-8 sm:p-12 text-center rounded-2xl shadow-inner bg-white space-y-6">
            {/* Institute Crest & Brand */}
            <div className="space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-800 text-white font-extrabold flex items-center justify-center text-xl shadow-md">
                ZT
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-widest text-slate-900 uppercase font-serif">
                Zacma Technology Training Center
              </h1>
              <p className="text-xs font-serif tracking-wider text-slate-500 uppercase">
                Addis Ababa, Ethiopia • Technology Excellence & Innovation
              </p>
            </div>

            <div className="py-2">
              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto"></div>
              <h2 className="text-base sm:text-lg font-serif italic text-slate-700 mt-2">
                Certificate of Completion
              </h2>
            </div>

            {/* Recipient */}
            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-widest">
                This is proudly presented to
              </p>
              <div className="text-2xl sm:text-4xl font-extrabold text-blue-950 font-serif tracking-tight border-b-2 border-slate-200 inline-block px-8 pb-2">
                {certificate.studentName}
              </div>
              <p className="text-[11px] font-mono text-slate-500 mt-1">
                Student ID: {certificate.studentId}
              </p>
            </div>

            {/* Course & Accomplishment */}
            <div className="max-w-2xl mx-auto space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                for successfully completing the rigorous practical curriculum and laboratory capstone assessments in
              </p>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {certificate.courseTitle}
              </h3>
              <p className="text-xs text-slate-600">
                Course Duration: <strong>{certificate.duration}</strong> • Grade: <strong>{certificate.grade || 'Pass with Distinction'}</strong>
              </p>
            </div>

            {/* Signatures & Seal */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-6 items-end text-xs">
              <div className="space-y-1">
                <div className="font-serif italic font-bold text-sm text-slate-800">
                  {certificate.issuedBy}
                </div>
                <div className="h-0.5 bg-slate-400 w-36 mx-auto"></div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">
                  Academic Director
                </p>
              </div>

              {/* Seal Stamp */}
              <div className="order-last sm:order-none col-span-2 sm:col-span-1">
                <div className="w-20 h-20 mx-auto rounded-full border-4 border-dashed border-amber-600/80 flex flex-col items-center justify-center p-1 text-center bg-amber-50/50 shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <span className="text-[8px] font-extrabold tracking-tighter text-amber-800 uppercase mt-0.5">
                    Official Seal
                  </span>
                  <span className="text-[7px] text-amber-700">Addis Ababa</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-mono text-xs font-bold text-slate-800">
                  {certificate.issueDate}
                </div>
                <div className="h-0.5 bg-slate-400 w-36 mx-auto"></div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">
                  Date of Conferral
                </p>
              </div>
            </div>

            {/* Bottom Verification Footer */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 font-mono gap-2">
              <span>Certificate No: {certificate.certificateNumber}</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-bold">
                Verification Code: {certificate.verificationCode}
              </span>
              <span>Verify at: zacmaa.net/verify</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
