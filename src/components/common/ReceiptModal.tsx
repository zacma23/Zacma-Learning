import React from 'react';
import { Receipt } from '../../types/index';
import { formatETB } from '../../utils/rules';
import { X, Printer, CheckCircle, ShieldCheck, QrCode } from 'lucide-react';

interface ReceiptModalProps {
  receipt: Receipt;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Modal Action Bar (Hidden in Print) */}
        <div className="print:hidden p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
            Official Receipt Preview
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Receipt</span>
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

        {/* Printable Official Receipt Body */}
        <div className="p-8 sm:p-12 text-slate-900 dark:text-slate-100 space-y-6 print:p-0 print:text-black">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 dark:border-slate-100 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-blue-700 text-white font-extrabold flex items-center justify-center text-sm">
                  ZT
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight uppercase">
                    Zacma Technology Training Center
                  </h1>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Zacma Technology Training PLC • Bole Road, Addis Ababa
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                Bole Road, Mega Building 4th Floor, Addis Ababa, Ethiopia • Tel: +251 91 193 6641 / +251 91 193 6641 • Email: info@zacmaa.net
              </p>
            </div>

            <div className="text-right space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                Official Cash / Electronic Receipt
              </span>
              <div className="font-mono text-sm font-extrabold text-slate-900 dark:text-white">
                {receipt.receiptNumber}
              </div>
              <p className="text-[11px] text-slate-500 font-mono">{receipt.issuedAt} EAT</p>
            </div>
          </div>

          {/* Student & Payment Summary */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Received From:</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">{receipt.studentName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Student ID:</span>
                <span className="font-mono font-semibold">{receipt.studentId}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-right">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Payment Method:</span>
                <span className="font-bold uppercase text-slate-900 dark:text-white">{receipt.paymentMethod.replace(/_/g, ' ')}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Transaction Ref (TxID):</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{receipt.transactionReference}</span>
              </div>
            </div>
          </div>

          {/* Table of Line Items */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Description</th>
                  <th className="p-3">Package</th>
                  <th className="p-3 text-right">Amount (ETB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">
                    {receipt.courseTitle}
                    <span className="block text-[10px] text-slate-500 font-normal">
                      Tuition & Laboratory Access Fee
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{receipt.packageTitle}</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {formatETB(receipt.amount)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 dark:bg-slate-800/60 font-bold border-t border-slate-200 dark:border-slate-700">
                <tr>
                  <td colSpan={2} className="p-3 text-right uppercase text-[11px]">
                    Total Amount Received:
                  </td>
                  <td className="p-3 text-right font-mono text-sm text-blue-600 dark:text-blue-400">
                    {formatETB(receipt.amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signatures & Security Stamp */}
          <div className="pt-6 border-t border-dashed border-slate-300 dark:border-slate-700 grid grid-cols-2 items-end gap-6 text-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                <ShieldCheck className="w-4 h-4" />
                <span>ELECTRONICALLY VERIFIED</span>
              </div>
              <p className="font-mono text-[10px] text-slate-400 truncate">
                Auth Signature: {receipt.qrCodeSignature}
              </p>
              <p className="text-[10px] text-slate-500">
                Issued By: <strong>{receipt.issuedBy}</strong>
              </p>
            </div>

            <div className="text-right space-y-1">
              <div className="h-10 border-b border-slate-400 dark:border-slate-600 inline-block w-40"></div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">
                Authorized Finance Seal
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
