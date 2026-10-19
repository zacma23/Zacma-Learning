import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateEthiopianPhone,
  calculateTuitionFee,
  generateStudentId,
  generateRegistrationNumber,
  generateReceiptNumber,
  calculateAttendanceMetrics,
  canTransitionRegistrationStatus,
} from './rules.ts';

test('validateEthiopianPhone accepts standard 09 and 07 prefixes', () => {
  const res1 = validateEthiopianPhone('0911223344');
  assert.equal(res1.valid, true);
  assert.equal(res1.normalized, '+251 91 122 3344');

  const res2 = validateEthiopianPhone('0712345678');
  assert.equal(res2.valid, true);
  assert.equal(res2.normalized, '+251 71 234 5678');

  const res3 = validateEthiopianPhone('+251912001122');
  assert.equal(res3.valid, true);
  assert.equal(res3.normalized, '+251 91 200 1122');
});

test('validateEthiopianPhone rejects invalid numbers', () => {
  const res1 = validateEthiopianPhone('12345');
  assert.equal(res1.valid, false);

  const res2 = validateEthiopianPhone('0811223344'); // invalid prefix in Ethiopia
  assert.equal(res2.valid, false);

  const res3 = validateEthiopianPhone('');
  assert.equal(res3.valid, false);
});

test('calculateTuitionFee calculates multipliers and discount codes correctly', () => {
  // Base group package
  const groupRes = calculateTuitionFee(6000, 'group');
  assert.equal(groupRes.packageFee, 6000);
  assert.equal(groupRes.finalFee, 6000);

  // VIP package (1.75x)
  const vipRes = calculateTuitionFee(6000, 'vip');
  assert.equal(vipRes.packageFee, 10500);
  assert.equal(vipRes.finalFee, 10500);

  // Mini-group (1.25x) with EARLYBIRD 10% coupon
  const miniRes = calculateTuitionFee(6000, 'mini_group', 'EARLYBIRD');
  assert.equal(miniRes.packageFee, 7500);
  assert.equal(miniRes.discountAmount, 750);
  assert.equal(miniRes.finalFee, 6750);

  // ZACMA2026 15% discount
  const discountRes = calculateTuitionFee(10000, 'group', 'ZACMA2026');
  assert.equal(discountRes.discountAmount, 1500);
  assert.equal(discountRes.finalFee, 8500);
});

test('generateStudentId and sequential identifiers format properly', () => {
  assert.equal(generateStudentId(42, 2026), 'ZAC-2026-0042');
  assert.equal(generateRegistrationNumber(104, 2026), 'REG-2026-0104');
  assert.equal(generateReceiptNumber(385, 2026), 'REC-2026-00385');
});

test('calculateAttendanceMetrics calculates percentage and breakdown', () => {
  const records: { status: 'present' | 'absent' | 'late' | 'excused' }[] = [
    { status: 'present' },
    { status: 'present' },
    { status: 'late' },
    { status: 'absent' },
  ];
  const metrics = calculateAttendanceMetrics(records);
  assert.equal(metrics.totalSessions, 4);
  assert.equal(metrics.presentCount, 2);
  assert.equal(metrics.lateCount, 1);
  assert.equal(metrics.absentCount, 1);
  // (2 + 0.75 + 0) / 4 = 2.75 / 4 = 68.75% -> 69%
  assert.equal(metrics.attendanceRate, 69);
});

test('canTransitionRegistrationStatus validates lifecycle transitions', () => {
  assert.equal(canTransitionRegistrationStatus('pending_payment', 'paid'), true);
  assert.equal(canTransitionRegistrationStatus('pending_payment', 'partially_paid'), true);
  assert.equal(canTransitionRegistrationStatus('paid', 'enrolled'), true);
  assert.equal(canTransitionRegistrationStatus('completed', 'pending_payment'), false);
});
