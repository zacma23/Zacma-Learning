/**
 * Pure business logic and helper functions for Zacma Technology Training Center
 */

import type { PackageCode, RegistrationStatus } from '../types/index';

/**
 * Validates and normalizes Ethiopian mobile phone numbers.
 * Supported formats:
 * - "+251911223344" -> "+251 91 122 3344"
 * - "+251711223344" -> "+251 71 122 3344"
 * - "0911223344"    -> "+251 91 122 3344"
 * - "0711223344"    -> "+251 71 122 3344"
 * - "911223344"     -> "+251 91 122 3344"
 * - "711223344"     -> "+251 71 122 3344"
 */
export function validateEthiopianPhone(rawPhone: string): {
  valid: boolean;
  normalized: string;
  error?: string;
} {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return { valid: false, normalized: '', error: 'Phone number is required' };
  }

  // Remove spaces, hyphens, parentheses
  const clean = rawPhone.replace(/[\s\-()]/g, '');

  let digitsOnly = '';

  if (clean.startsWith('+251')) {
    digitsOnly = clean.substring(4);
  } else if (clean.startsWith('251')) {
    digitsOnly = clean.substring(3);
  } else if (clean.startsWith('0')) {
    digitsOnly = clean.substring(1);
  } else {
    digitsOnly = clean;
  }

  // Digits only must start with 9 (Ethio Telecom) or 7 (Safaricom Ethiopia) and be exactly 9 digits
  if (!/^[97]\d{8}$/.test(digitsOnly)) {
    return {
      valid: false,
      normalized: clean,
      error: 'Invalid Ethiopian mobile number. Must start with 09 (Ethio Telecom) or 07 (Safaricom) followed by 8 digits.',
    };
  }

  const prefix = digitsOnly.substring(0, 2);
  const mid = digitsOnly.substring(2, 5);
  const end = digitsOnly.substring(5);

  const formatted = `+251 ${prefix} ${mid} ${end}`;
  return {
    valid: true,
    normalized: formatted,
  };
}

/**
 * Calculate course tuition fee based on package pricing and coupon discount
 */
export function calculateTuitionFee(
  baseFee: number,
  packageCode: PackageCode,
  discountCode?: string
): {
  originalFee: number;
  packageMultiplier: number;
  packageFee: number;
  discountAmount: number;
  finalFee: number;
  discountDescription?: string;
} {
  let multiplier = 1.0;
  if (packageCode === 'vip') {
    multiplier = 1.75; // 1-on-1 VIP premium training
  } else if (packageCode === 'mini_group') {
    multiplier = 1.25; // Focused 4-6 students
  } else {
    multiplier = 1.0; // Standard group
  }

  const packageFee = Math.round(baseFee * multiplier);

  let discountAmount = 0;
  let discountDescription: string | undefined;

  const codeClean = (discountCode || '').trim().toUpperCase();
  if (codeClean === 'EARLYBIRD') {
    discountAmount = Math.round(packageFee * 0.1); // 10% discount
    discountDescription = 'Early Bird 10% Discount applied';
  } else if (codeClean === 'ZACMA2026') {
    discountAmount = Math.round(packageFee * 0.15); // 15% discount
    discountDescription = 'Zacma 2026 Welcome 15% Discount applied';
  } else if (codeClean === 'STEMFEMALE') {
    discountAmount = Math.round(packageFee * 0.2); // 20% Women in Tech Scholarship
    discountDescription = 'Women in Tech 20% Scholarship applied';
  }

  const finalFee = Math.max(0, packageFee - discountAmount);

  return {
    originalFee: baseFee,
    packageMultiplier: multiplier,
    packageFee,
    discountAmount,
    finalFee,
    discountDescription,
  };
}

/**
 * Format currency in Ethiopian Birr
 */
export function formatETB(amount: number): string {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 0,
  }).format(amount).replace('ETB', 'ETB ');
}

/**
 * Generate sequential, unique student ID: e.g. ZAC-2026-0042
 */
export function generateStudentId(seqNumber: number, year = 2026): string {
  const padded = String(seqNumber).padStart(4, '0');
  return `ZAC-${year}-${padded}`;
}

/**
 * Generate unique registration reference: e.g. REG-2026-1049
 */
export function generateRegistrationNumber(seqNumber: number, year = 2026): string {
  const padded = String(seqNumber).padStart(4, '0');
  return `REG-${year}-${padded}`;
}

/**
 * Generate official receipt number: e.g. REC-2026-00384
 */
export function generateReceiptNumber(seqNumber: number, year = 2026): string {
  const padded = String(seqNumber).padStart(5, '0');
  return `REC-${year}-${padded}`;
}

/**
 * Generate certificate verification code
 */
export function generateCertificateCode(studentId: string, courseCode: string, seq: number): string {
  const base = `${studentId}-${courseCode}-${seq}`.replace(/[^A-Za-z0-9]/g, '');
  // Deterministic 12-char upper alphanumeric string
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    hash = (hash << 5) - hash + base.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `ZAC-${hex.substring(0, 4)}-${hex.substring(4, 8)}`;
}

/**
 * Calculate attendance rate percentage
 */
export function calculateAttendanceMetrics(
  records: { status: 'present' | 'absent' | 'late' | 'excused' }[]
): {
  totalSessions: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  excusedCount: number;
  attendanceRate: number; // percentage
} {
  const totalSessions = records.length;
  if (totalSessions === 0) {
    return {
      totalSessions: 0,
      presentCount: 0,
      lateCount: 0,
      absentCount: 0,
      excusedCount: 0,
      attendanceRate: 100,
    };
  }

  let presentCount = 0;
  let lateCount = 0;
  let absentCount = 0;
  let excusedCount = 0;

  for (const r of records) {
    if (r.status === 'present') presentCount++;
    else if (r.status === 'late') lateCount++;
    else if (r.status === 'excused') excusedCount++;
    else if (r.status === 'absent') absentCount++;
  }

  // Late counts as 0.75 attendance, Excused is excused from penalty
  const effectivePresent = presentCount + lateCount * 0.75 + excusedCount * 1.0;
  const attendanceRate = Math.round((effectivePresent / totalSessions) * 100);

  return {
    totalSessions,
    presentCount,
    lateCount,
    absentCount,
    excusedCount,
    attendanceRate: Math.min(100, Math.max(0, attendanceRate)),
  };
}

/**
 * Valid registration state transitions
 */
export function canTransitionRegistrationStatus(
  current: RegistrationStatus,
  next: RegistrationStatus
): boolean {
  if (current === next) return true;

  const validTransitions: Record<RegistrationStatus, RegistrationStatus[]> = {
    pending_payment: ['partially_paid', 'paid', 'rejected', 'cancelled'],
    partially_paid: ['paid', 'enrolled', 'cancelled'],
    paid: ['enrolled', 'cancelled', 'partially_paid'],
    enrolled: ['completed', 'cancelled'],
    completed: [],
    cancelled: ['pending_payment'], // Can reopen
    rejected: ['pending_payment'],
  };

  return validTransitions[current]?.includes(next) ?? false;
}
