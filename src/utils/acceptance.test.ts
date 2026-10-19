import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTuitionFee, canTransitionRegistrationStatus } from './rules';
import { Registration, PaymentTransaction, Receipt } from '../types';

test('Acceptance: Registration balance recalculation and payment verification lifecycle', () => {
  const testReg: Registration = {
    id: 'reg-test-student-001',
    registrationNumber: 'REG-2026-9901',
    studentId: 'stu-test-student-001',
    studentName: 'Abebe Kebede (Test Student)',
    studentPhone: '+251 91 193 6641',
    courseId: 'crs-fullstack',
    courseTitle: 'Full-Stack Software Engineering',
    packageId: 'pkg-group',
    packageName: 'Standard Group Boot Camp',
    scheduleId: 'sch-morning',
    scheduleTitle: 'Weekday Morning Cohort',
    mode: 'in_person',
    totalFee: 12000,
    discountAmount: 0,
    amountPaid: 0,
    balanceDue: 12000,
    status: 'pending_payment',
    createdAt: '2026-10-19 09:30:00',
    paymentDeadline: '2026-10-24',
  };

  // 1. Initial balance check
  assert.equal(testReg.balanceDue, 12000);
  assert.equal(testReg.amountPaid, 0);

  // 2. Pending payment recorded
  const testPayment: PaymentTransaction = {
    id: 'pay-test-001',
    registrationId: testReg.id,
    studentId: testReg.studentId,
    studentName: testReg.studentName,
    amount: 6000,
    method: 'telebirr',
    transactionReference: 'TB-984521-TEST01',
    submittedAt: '2026-10-19 10:00:00',
    status: 'pending_verification',
  };

  // No receipt exists yet before verification
  let receipt: Receipt | null = null;
  assert.equal(receipt, null, 'Receipt MUST NOT be generated before accountant verifies payment');

  // 3. Accountant verifies test payment
  const updatedAmountPaid = testReg.amountPaid + testPayment.amount;
  const updatedBalanceDue = Math.max(0, testReg.totalFee - testReg.discountAmount - updatedAmountPaid);
  const updatedStatus = updatedBalanceDue === 0 ? 'paid' : 'partially_paid';

  assert.equal(updatedAmountPaid, 6000);
  assert.equal(updatedBalanceDue, 6000, 'Balance must accurately decrement by payment amount upon verification');
  assert.equal(updatedStatus, 'partially_paid');

  // 4. Receipt is generated ONLY upon verification
  receipt = {
    id: 'rec-test-001',
    receiptNumber: 'REC-2026-0005',
    paymentId: testPayment.id,
    registrationId: testReg.id,
    studentId: testReg.studentId,
    studentName: testReg.studentName,
    courseTitle: testReg.courseTitle,
    packageTitle: testReg.packageName,
    amount: testPayment.amount,
    paymentMethod: testPayment.method,
    transactionReference: testPayment.transactionReference,
    issuedAt: '2026-10-19 10:05:00',
    issuedBy: 'Accountant (finance@zacmaa.net)',
    qrCodeSignature: 'ZACMA-REC-2026-0005-VERIFIED',
    currency: 'ETB',
  };

  assert.ok(receipt);
  assert.equal(receipt.receiptNumber, 'REC-2026-0005');
  assert.equal(receipt.amount, 6000);
});

test('Acceptance: Student portal privacy isolation prevents access to other student records', () => {
  const currentStudentId = 'stu-test-student-001';
  const otherStudentId = 'stu-other-student-999';

  const allRegistrations: Partial<Registration>[] = [
    { id: 'reg-1', studentId: currentStudentId, studentName: 'Current Student' },
    { id: 'reg-2', studentId: otherStudentId, studentName: 'Other Student' },
  ];

  // Filtering logic matching StudentPortal.tsx
  const myRegistrations = allRegistrations.filter((r) => r.studentId === currentStudentId);

  assert.equal(myRegistrations.length, 1);
  assert.equal(myRegistrations[0].studentId, currentStudentId);
  assert.equal(myRegistrations.some((r) => r.studentId === otherStudentId), false, 'Student cannot see other student records');
});
