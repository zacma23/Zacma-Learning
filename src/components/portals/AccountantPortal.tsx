import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentTransaction, Receipt } from '../../types/index';
import { formatETB } from '../../utils/rules';
import {
  CreditCard,
  DollarSign,
  CheckCircle,
  XCircle,
  FileText,
  Printer,
  ShieldCheck,
  Search,
  Filter,
  RotateCcw,
  Plus,
  AlertCircle,
  Download,
} from 'lucide-react';

interface AccountantPortalProps {
  onOpenReceiptModal: (receipt: Receipt) => void;
}

export const AccountantPortal: React.FC<AccountantPortalProps> = ({
  onOpenReceiptModal,
}) => {
  const {
    payments,
    receipts,
    registrations,
    students,
    courses,
    recordPaymentTransaction,
    verifyPaymentTransaction,
    rejectPaymentTransaction,
    refundPaymentTransaction,
    language,
    t,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'transactions' | 'receipts' | 'record' | 'reports'>('pending');
  const [searchTx, setSearchTx] = useState('');
  const [rejectModalTx, setRejectModalTx] = useState<PaymentTransaction | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [refundModalTx, setRefundModalTx] = useState<PaymentTransaction | null>(null);
  const [refundReason, setRefundReason] = useState('');

  // Manual payment recording form
  const [selectedRegId, setSelectedRegId] = useState(registrations[0]?.id || '');
  const [paymentAmount, setPaymentAmount] = useState<number>(5000);
  const [paymentMethod, setPaymentMethod] = useState<'telebirr' | 'cbe_birr' | 'bank_transfer_cbe' | 'cash'>('telebirr');
  const [txRefInput, setTxRefInput] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [recordSuccess, setRecordSuccess] = useState(false);
  const [recordError, setRecordError] = useState<string | null>(null);

  // Financial metrics
  const pendingTransactions = payments.filter((p) => p.status === 'pending_verification');
  const verifiedTransactions = payments.filter((p) => p.status === 'verified');
  const refundedTransactions = payments.filter((p) => p.status === 'refunded');

  const totalVerifiedRevenue = verifiedTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPendingAmount = pendingTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  const totalOutstandingBalance = registrations.reduce((acc, curr) => acc + curr.balanceDue, 0);

  const handleVerifyClick = async (tx: PaymentTransaction) => {
    const res = await verifyPaymentTransaction(tx.id, 'Verified by accountant against bank statement.');
    if (res.success && res.receipt) {
      onOpenReceiptModal(res.receipt);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalTx || !rejectReason.trim()) return;
    await rejectPaymentTransaction(rejectModalTx.id, rejectReason.trim());
    setRejectModalTx(null);
    setRejectReason('');
  };

  const handleConfirmRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundModalTx || !refundReason.trim()) return;
    await refundPaymentTransaction(refundModalTx.id, refundReason.trim());
    setRefundModalTx(null);
    setRefundReason('');
  };

  const handleRecordManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecordError(null);

    if (!selectedRegId) {
      setRecordError('Please select a student registration.');
      return;
    }
    if (!txRefInput.trim()) {
      setRecordError('Please provide a unique transaction reference number (TxID).');
      return;
    }

    const res = await recordPaymentTransaction({
      registrationId: selectedRegId,
      amount: Number(paymentAmount),
      method: paymentMethod,
      transactionReference: txRefInput.trim(),
      evidenceNotes: paymentNotes.trim() || undefined,
    });

    if (!res.success) {
      setRecordError(res.error || 'Failed to record payment');
      return;
    }

    setRecordSuccess(true);
    setTxRefInput('');
    setPaymentNotes('');
    setTimeout(() => {
      setRecordSuccess(false);
      setActiveTab('pending');
    }, 2000);
  };

  return (
    <div className="py-8 bg-slate-50 dark:bg-slate-900/60 min-h-[calc(100vh-140px)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Finance & Accounts Workspace
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verify Telebirr and bank payments, issue sequential official receipts, and manage student balances.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('record')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Cash / Bank Payment</span>
          </button>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">
              Verified Institute Collections
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {formatETB(totalVerifiedRevenue)}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              {verifiedTransactions.length} Verified Transactions
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">
              Pending Verification Queue
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
              {formatETB(totalPendingAmount)}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              {pendingTransactions.length} Payments Awaiting Accountant Approval
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">
              Outstanding Student Balances
            </span>
            <span className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 mt-1 block">
              {formatETB(totalOutstandingBalance)}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              Total Uncollected Installments
            </span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            Verification Queue ({pendingTransactions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'transactions'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            All Transactions ({payments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('receipts')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'receipts'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            Issued Receipts ({receipts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('record')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'record'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            Record Payment
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'reports'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            Financial Reports
          </button>
        </div>

        {/* TAB 1: Payment Verification Queue */}
        {activeTab === 'pending' && (
          <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Payments Awaiting Verification & Receipt Issuance
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify transaction reference with Telebirr merchant portal or CBE statement before approving.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-600">
                {pendingTransactions.length} Pending
              </span>
            </div>

            {pendingTransactions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p>All submitted payment transactions have been verified and processed!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {pendingTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {tx.studentName}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 text-[10px] font-bold uppercase">
                          {tx.method.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-slate-500">{tx.courseTitle}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                        <span>TxID: <strong className="text-blue-600 dark:text-blue-400">{tx.transactionReference}</strong></span>
                        <span>Recorded by: {tx.recordedBy}</span>
                        <span>{tx.recordedAt} EAT</span>
                      </div>
                      {tx.evidenceNotes && (
                        <p className="text-[11px] text-slate-500 italic">
                          Notes: "{tx.evidenceNotes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right pr-2">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Amount</span>
                        <span className="text-base font-extrabold text-slate-900 dark:text-white">
                          {formatETB(tx.amount)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleVerifyClick(tx)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs transition"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Verify & Issue Receipt</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRejectModalTx(tx)}
                        className="p-2 rounded-xl border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition"
                        title="Reject payment"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: All Transactions */}
        {activeTab === 'transactions' && (
          <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Transaction Register & Audit History
              </h3>
              <span className="text-xs text-slate-400">{payments.length} Records</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3.5">Tx ID</th>
                    <th className="p-3.5">Student</th>
                    <th className="p-3.5">Course</th>
                    <th className="p-3.5">Method</th>
                    <th className="p-3.5">Tx Reference</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Receipt #</th>
                    <th className="p-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {payments.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                      <td className="p-3.5 font-mono text-slate-400 text-[11px]">{tx.id}</td>
                      <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                        {tx.studentName}
                      </td>
                      <td className="p-3.5 text-slate-500 truncate max-w-[160px]">{tx.courseTitle}</td>
                      <td className="p-3.5 font-mono uppercase text-[11px] text-slate-600 dark:text-slate-300">
                        {tx.method.replace(/_/g, ' ')}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {tx.transactionReference}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                        {formatETB(tx.amount)}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            tx.status === 'verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.status === 'pending_verification'
                              ? 'bg-amber-100 text-amber-800'
                              : tx.status === 'refunded'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {tx.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        {tx.receiptNumber || '—'}
                      </td>
                      <td className="p-3.5">
                        {tx.status === 'verified' && (
                          <button
                            type="button"
                            onClick={() => setRefundModalTx(tx)}
                            className="text-[11px] text-red-600 hover:underline font-semibold"
                          >
                            Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Official Receipts */}
        {activeTab === 'receipts' && (
          <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Issued Official Sequential Receipts
              </h3>
              <span className="text-xs text-slate-400">{receipts.length} Issued Receipts</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {receipts.map((rec) => (
                <div
                  key={rec.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                      {rec.receiptNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{rec.issuedAt.substring(0, 10)}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{rec.studentName}</h4>
                    <p className="text-[11px] text-slate-500">{rec.courseTitle}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      TxID: {rec.transactionReference}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {formatETB(rec.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenReceiptModal(rec)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Print Receipt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Record Manual / Walk-in Payment */}
        {activeTab === 'record' && (
          <div className="max-w-xl mx-auto rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-600" />
                <span>Record Student Payment (Cash, Bank, Telebirr)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter offline payment received at front desk or direct bank deposit.
              </p>
            </div>

            {recordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Payment recorded! Moved to verification queue.</span>
              </div>
            )}

            {recordError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{recordError}</span>
              </div>
            )}

            <form onSubmit={handleRecordManualPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Student Registration
                </label>
                <select
                  value={selectedRegId}
                  onChange={(e) => {
                    setSelectedRegId(e.target.value);
                    const match = registrations.find((r) => r.id === e.target.value);
                    if (match) setPaymentAmount(match.balanceDue);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  required
                >
                  {registrations.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.studentName} — {r.courseTitle} (Due: {formatETB(r.balanceDue)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="telebirr">Telebirr Transfer</option>
                    <option value="cbe_birr">CBE Birr</option>
                    <option value="bank_transfer_cbe">CBE Bank Branch Deposit</option>
                    <option value="cash">Cash at Institute Desk</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount Received (ETB)
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-blue-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Transaction Reference (TxID or Slip #)
                </label>
                <input
                  type="text"
                  value={txRefInput}
                  onChange={(e) => setTxRefInput(e.target.value)}
                  placeholder="e.g. TB99182312 or CASH-RECEIPT-01"
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supporting Notes
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Cash received by cashier, verified with cash counter"
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 5: Financial Reports */}
        {activeTab === 'reports' && (
          <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Course-wise Revenue Breakdown & Reconciliation
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3.5">Course Name</th>
                    <th className="p-3.5">Enrolled</th>
                    <th className="p-3.5">Base Fee</th>
                    <th className="p-3.5">Total Invoiced</th>
                    <th className="p-3.5">Collected</th>
                    <th className="p-3.5">Outstanding Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {courses.map((c) => {
                    const courseRegs = registrations.filter((r) => r.courseId === c.id);
                    const totalInvoiced = courseRegs.reduce((acc, r) => acc + (r.totalFee - r.discountAmount), 0);
                    const totalPaid = courseRegs.reduce((acc, r) => acc + r.amountPaid, 0);
                    const totalBal = courseRegs.reduce((acc, r) => acc + r.balanceDue, 0);

                    return (
                      <tr key={c.id}>
                        <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{c.title}</td>
                        <td className="p-3.5">{courseRegs.length}</td>
                        <td className="p-3.5 font-mono">{formatETB(c.baseFee)}</td>
                        <td className="p-3.5 font-mono font-semibold">{formatETB(totalInvoiced)}</td>
                        <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatETB(totalPaid)}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-red-600 dark:text-red-400">
                          {formatETB(totalBal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: Reject Reason */}
        {rejectModalTx && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-red-600">
                Reject Payment Submission
              </h3>
              <p className="text-xs text-slate-500">
                Specify reason for rejecting TxID: <strong>{rejectModalTx.transactionReference}</strong> for student {rejectModalTx.studentName}.
              </p>
              <form onSubmit={handleConfirmReject} className="space-y-3">
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. TxID does not appear on Telebirr statement or amount mismatch"
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRejectModalTx(null)}
                    className="px-4 py-2 text-xs text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Refund Reason */}
        {refundModalTx && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-purple-600">
                Process Authorized Refund
              </h3>
              <p className="text-xs text-slate-500">
                Refunding {formatETB(refundModalTx.amount)} for {refundModalTx.studentName} ({refundModalTx.transactionReference}).
              </p>
              <form onSubmit={handleConfirmRefund} className="space-y-3">
                <textarea
                  rows={3}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Schedule cancellation approved by director"
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRefundModalTx(null)}
                    className="px-4 py-2 text-xs text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Execute Refund
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
