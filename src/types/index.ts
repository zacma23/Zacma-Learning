export type UserRole = 
  | 'super_admin' 
  | 'admin' 
  | 'accountant' 
  | 'secretary' 
  | 'teacher' 
  | 'student' 
  | 'public';

export type Language = 'en' | 'am';

export interface User {
  id: string;
  name: string;
  nameAm?: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  studentId?: string; // If student
  teacherId?: string; // If teacher
  department?: string;
}

export type TrainingMode = 'in_person' | 'online';

export type PackageCode = 'vip' | 'group' | 'mini_group';

export interface TrainingPackage {
  id: string;
  code: PackageCode;
  name: string;
  nameAm: string;
  priceMultiplier: number;
  fixedPrice?: number;
  minGroupSize: number;
  maxGroupSize: number;
  description: string;
  descriptionAm: string;
  features: string[];
  featuresAm: string[];
  recommended?: boolean;
}

export interface TrainingSchedule {
  id: string;
  title: string;
  titleAm: string;
  days: string[];
  daysAm: string[];
  timeSlot: string; // e.g. "9:00 AM - 12:00 PM EAT"
  mode: TrainingMode;
  classroom: string;
  timeZone: string; // "Africa/Addis_Ababa"
}

export interface Course {
  id: string;
  code: string;
  title: string;
  titleAm: string;
  description: string;
  descriptionAm: string;
  category: 'software' | 'data_ai' | 'networking' | 'design' | 'kids';
  durationWeeks: number;
  hoursPerWeek: number;
  baseFee: number; // in ETB
  curriculum: string[];
  curriculumAm: string[];
  learningOutcomes: string[];
  learningOutcomesAm: string[];
  assignedTeacherId: string;
  assignedTeacherName: string;
  capacity: number;
  enrolledCount: number;
  registrationDeadline: string;
  active: boolean;
  featured?: boolean;
  image: string;
}

export interface Batch {
  id: string;
  courseId: string;
  courseTitle: string;
  name: string;
  scheduleId: string;
  scheduleTitle: string;
  teacherId: string;
  teacherName: string;
  classroom: string;
  startDate: string;
  endDate: string;
  capacity: number;
  enrolledStudentIds: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  onlineMeetingUrl?: string;
}

export type RegistrationStatus = 
  | 'pending_payment' 
  | 'partially_paid' 
  | 'paid' 
  | 'enrolled' 
  | 'completed' 
  | 'cancelled'
  | 'rejected';

export interface Student {
  id: string;
  studentId: string; // e.g. ZAC-2026-0042
  fullName: string;
  fullNameAm?: string;
  email?: string;
  phone: string; // Normalized +251 9...
  address: string;
  gradeLevel: string; // e.g. "University Graduate", "High School", "Professional"
  emergencyContact?: string;
  specialRequirements?: string;
  registrationSource: string;
  registrationDate: string;
  photoUrl?: string;
  status: RegistrationStatus;
}

export interface Registration {
  id: string;
  registrationNumber: string; // REG-2026-XXXX
  studentId: string;
  studentName: string;
  studentPhone: string;
  studentEmail?: string;
  courseId: string;
  courseTitle: string;
  packageId: string;
  packageName: string;
  scheduleId: string;
  scheduleTitle: string;
  mode: TrainingMode;
  totalFee: number;
  discountAmount: number;
  discountCode?: string;
  amountPaid: number;
  balanceDue: number;
  status: RegistrationStatus;
  batchId?: string;
  createdAt: string;
  paymentDeadline: string;
  notes?: string;
}

export type PaymentMethod = 
  | 'telebirr' 
  | 'cbe_birr' 
  | 'bank_transfer_cbe' 
  | 'bank_transfer_awash' 
  | 'cash';

export type PaymentStatus = 
  | 'pending_verification' 
  | 'verified' 
  | 'rejected' 
  | 'refunded';

export interface PaymentTransaction {
  id: string;
  registrationId: string;
  studentId: string;
  studentName: string;
  courseTitle: string;
  amount: number;
  method: PaymentMethod;
  transactionReference: string;
  evidenceUrl?: string;
  evidenceNotes?: string;
  status: PaymentStatus;
  receiptNumber?: string;
  recordedBy: string;
  recordedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
  refundReason?: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string; // REC-2026-XXXXX
  paymentId: string;
  registrationId: string;
  studentId: string;
  studentName: string;
  courseTitle: string;
  packageTitle: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionReference: string;
  issuedAt: string;
  issuedBy: string;
  qrCodeSignature: string;
  currency: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  batchId: string;
  sessionDate: string;
  topic: string;
  records: {
    studentId: string;
    studentName: string;
    status: AttendanceStatus;
    notes?: string;
  }[];
  markedBy: string;
  markedAt: string;
}

export interface Certificate {
  id: string;
  certificateNumber: string; // CERT-ZAC-2026-XXXX
  verificationCode: string; // 12-char unique verification code
  studentId: string;
  studentName: string;
  studentPhone: string;
  courseId: string;
  courseTitle: string;
  duration: string;
  issueDate: string;
  completionDate: string;
  status: 'active' | 'revoked';
  issuedBy: string;
  grade?: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string; // userId or studentId or 'all'
  recipientRole?: UserRole;
  title: string;
  titleAm: string;
  message: string;
  messageAm: string;
  channel: 'sms' | 'email' | 'in_app';
  status: 'sent' | 'delivered' | 'pending' | 'failed';
  createdAt: string;
  read: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  ipAddress?: string;
}

export interface SupportTicket {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  replies: {
    id: string;
    sender: string;
    role: string;
    message: string;
    date: string;
  }[];
}

export interface LearningMaterial {
  id: string;
  courseId: string;
  batchId?: string;
  title: string;
  description: string;
  fileType: 'pdf' | 'code' | 'video' | 'link';
  fileSize?: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface InstituteSettings {
  name: string;
  nameAm: string;
  location: string;
  locationAm: string;
  website: string;
  phonePrimary: string;
  phoneSecondary: string;
  email: string;
  telebirrMerchantCode: string;
  telebirrAccountName: string;
  cbeAccount: string;
  cbeAccountName: string;
  awashAccount: string;
  awashAccountName: string;
  currency: string;
  currencySymbol: string;
  timeZone: string;
  smsGatewayEnabled: boolean;
  smsSenderId: string;
  emailProviderEnabled: boolean;
  allowStudentEvidenceUpload: boolean;
  taxRatePercent: number;
}
