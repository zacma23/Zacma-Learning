import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db, testConnection, handleFirestoreError, OperationType } from '../firebase/config';
import { useAuth } from './AuthContext';
import {
  UserRole,
  Language,
  User,
  Course,
  TrainingPackage,
  TrainingSchedule,
  Batch,
  Student,
  Registration,
  PaymentTransaction,
  Receipt,
  AttendanceRecord,
  Certificate,
  NotificationItem,
  AuditLog,
  SupportTicket,
  LearningMaterial,
  InstituteSettings,
  PaymentMethod,
  TrainingMode,
  PackageCode,
  AttendanceStatus,
} from '../types/index';
import {
  initialSettings,
  initialPackages,
  initialSchedules,
  initialCourses,
  initialBatches,
  initialStudents,
  initialRegistrations,
  initialPayments,
  initialReceipts,
  initialAttendance,
  initialCertificates,
  initialNotifications,
  initialAuditLogs,
  initialSupportTickets,
  initialLearningMaterials,
} from '../data/mockData';
import { translations } from '../data/translations';
import {
  generateStudentId,
  generateRegistrationNumber,
  generateReceiptNumber,
  generateCertificateCode,
  calculateTuitionFee,
} from '../utils/rules';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: User;
  
  // Navigation / views
  activeView: string;
  setActiveView: (view: string) => void;
  selectedCourseId: string | null;
  setSelectedCourseId: (id: string | null) => void;
  selectedReceiptId: string | null;
  setSelectedReceiptId: (id: string | null) => void;
  selectedCertificateCode: string | null;
  setSelectedCertificateCode: (code: string | null) => void;

  // Auth modal control
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'signup' | 'forgot';
  setAuthModalMode: (mode: 'login' | 'signup' | 'forgot') => void;

  // Cloud database status
  dbConnected: boolean;

  // Data collections
  settings: InstituteSettings;
  updateSettings: (settings: Partial<InstituteSettings>) => Promise<void>;
  packages: TrainingPackage[];
  updatePackage: (pkg: TrainingPackage) => Promise<void>;
  schedules: TrainingSchedule[];
  addSchedule: (sch: Omit<TrainingSchedule, 'id'>) => Promise<void>;
  courses: Course[];
  addCourse: (course: Omit<Course, 'id' | 'enrolledCount'>) => Promise<void>;
  updateCourse: (course: Course) => Promise<void>;
  batches: Batch[];
  addBatch: (batch: Omit<Batch, 'id' | 'enrolledStudentIds'>) => Promise<void>;
  students: Student[];
  updateStudent: (student: Student) => Promise<void>;
  registrations: Registration[];
  
  // High-level Workflows
  registerStudentOnline: (data: {
    fullName: string;
    fullNameAm?: string;
    phone: string;
    email?: string;
    address: string;
    gradeLevel: string;
    emergencyContact?: string;
    specialRequirements?: string;
    courseId: string;
    packageId: string;
    scheduleId: string;
    mode: TrainingMode;
    discountCode?: string;
    source?: string;
  }) => Promise<{ success: boolean; registration?: Registration; student?: Student; error?: string }>;

  recordPaymentTransaction: (data: {
    registrationId: string;
    amount: number;
    method: PaymentMethod;
    transactionReference: string;
    evidenceNotes?: string;
    evidenceUrl?: string;
  }) => Promise<{ success: boolean; transaction?: PaymentTransaction; error?: string }>;

  verifyPaymentTransaction: (
    transactionId: string,
    notes?: string
  ) => Promise<{ success: boolean; receipt?: Receipt; error?: string }>;

  rejectPaymentTransaction: (transactionId: string, reason: string) => Promise<void>;
  
  refundPaymentTransaction: (transactionId: string, reason: string) => Promise<{ success: boolean; error?: string }>;

  markBatchAttendance: (
    batchId: string,
    topic: string,
    records: { studentId: string; studentName: string; status: AttendanceStatus; notes?: string }[]
  ) => Promise<void>;

  issueStudentCertificate: (
    studentId: string,
    courseId: string,
    durationText: string,
    gradeText?: string
  ) => Promise<Certificate>;

  payments: PaymentTransaction[];
  receipts: Receipt[];
  attendance: AttendanceRecord[];
  certificates: Certificate[];
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => Promise<void>;
  sendNotification: (notif: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => Promise<void>;
  auditLogs: AuditLog[];
  supportTickets: SupportTicket[];
  addSupportTicket: (subject: string, message: string) => Promise<void>;
  replySupportTicket: (ticketId: string, message: string) => Promise<void>;
  learningMaterials: LearningMaterial[];
  addLearningMaterial: (mat: Omit<LearningMaterial, 'id' | 'uploadedAt'>) => Promise<void>;

  // Reset
  resetDatabase: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, loading: authLoading } = useAuth();

  const [language, setLanguageState] = useState<Language>('en');
  const [darkMode, setDarkModeState] = useState<boolean>(false);
  const [currentRole, setCurrentRoleState] = useState<UserRole>('public');
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [selectedCertificateCode, setSelectedCertificateCode] = useState<string | null>(null);

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [dbConnected, setDbConnected] = useState<boolean>(true);

  // Firestore live state collections
  const [settings, setSettings] = useState<InstituteSettings>(initialSettings);
  const [packages, setPackages] = useState<TrainingPackage[]>(initialPackages);
  const [schedules, setSchedules] = useState<TrainingSchedule[]>(initialSchedules);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [batches, setBatches] = useState<Batch[]>(initialBatches);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [registrations, setRegistrations] = useState<Registration[]>(initialRegistrations);
  const [payments, setPayments] = useState<PaymentTransaction[]>(initialPayments);
  const [receipts, setReceipts] = useState<Receipt[]>(initialReceipts);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance);
  const [certificates, setCertificates] = useState<Certificate[]>(initialCertificates);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(initialSupportTickets);
  const [learningMaterials, setLearningMaterials] = useState<LearningMaterial[]>(initialLearningMaterials);

  // Active current user profile based on authentication state
  const currentUser: User = React.useMemo(() => {
    if (userProfile) {
      return userProfile;
    }
    return {
      id: 'usr-guest',
      name: 'Guest Visitor',
      email: 'guest@zacmaa.net',
      phone: '+251 91 000 0000',
      role: currentRole,
    };
  }, [userProfile, currentRole]);

  // Sync role with authenticated user profile
  useEffect(() => {
    if (userProfile) {
      setCurrentRoleState(userProfile.role);
      setActiveView('dashboard');
    } else {
      setCurrentRoleState('public');
    }
  }, [userProfile]);

  // Parse initial route from URL
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/student/dashboard') {
      setCurrentRoleState('student');
      setActiveView('dashboard');
    } else if (path === '/admin/dashboard') {
      setCurrentRoleState('admin');
      setActiveView('dashboard');
    } else if (path === '/accountant/dashboard') {
      setCurrentRoleState('accountant');
      setActiveView('dashboard');
    } else if (path === '/secretary/dashboard') {
      setCurrentRoleState('secretary');
      setActiveView('dashboard');
    } else if (path === '/teacher/dashboard') {
      setCurrentRoleState('teacher');
      setActiveView('dashboard');
    } else if (path === '/super-admin/dashboard') {
      setCurrentRoleState('super_admin');
      setActiveView('dashboard');
    } else if (path === '/courses') {
      setCurrentRoleState('public');
      setActiveView('courses');
    } else if (path === '/packages') {
      setCurrentRoleState('public');
      setActiveView('packages');
    } else if (path === '/schedules') {
      setCurrentRoleState('public');
      setActiveView('schedules');
    } else if (path === '/about') {
      setCurrentRoleState('public');
      setActiveView('about');
    } else if (path === '/verify') {
      setCurrentRoleState('public');
      setActiveView('verify');
    } else if (path === '/register') {
      setCurrentRoleState('public');
      setActiveView('register');
    }
  }, []);

  // Update browser history URL
  const updateRoutePath = (role: UserRole, view: string) => {
    let targetPath = '/';
    if (role === 'public') {
      if (view === 'courses') targetPath = '/courses';
      else if (view === 'packages') targetPath = '/packages';
      else if (view === 'schedules') targetPath = '/schedules';
      else if (view === 'about') targetPath = '/about';
      else if (view === 'verify') targetPath = '/verify';
      else if (view === 'register') targetPath = '/register';
      else targetPath = '/';
    } else {
      if (role === 'student') targetPath = '/student/dashboard';
      else if (role === 'admin') targetPath = '/admin/dashboard';
      else if (role === 'accountant') targetPath = '/accountant/dashboard';
      else if (role === 'secretary') targetPath = '/secretary/dashboard';
      else if (role === 'teacher') targetPath = '/teacher/dashboard';
      else if (role === 'super_admin') targetPath = '/super-admin/dashboard';
    }
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    if (role === 'public') {
      setActiveView('home');
      updateRoutePath('public', 'home');
    } else {
      setActiveView('dashboard');
      updateRoutePath(role, 'dashboard');
    }
  };

  const handleSetActiveView = (view: string) => {
    setActiveView(view);
    updateRoutePath(currentRole, view);
  };

  // Sync Dark Mode class with <html> element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const setLanguage = (lang: Language) => setLanguageState(lang);
  const setDarkMode = (dark: boolean) => setDarkModeState(dark);

  const t = (key: keyof typeof translations.en): string => {
    const langDict = translations[language] || translations.en;
    return langDict[key] || translations.en[key] || String(key);
  };

  // 1. Initialize Firestore and Seed Initial Data If Empty
  const isBootstrapped = useRef(false);

  useEffect(() => {
    if (isBootstrapped.current) return;
    isBootstrapped.current = true;

    async function initFirestore() {
      const ok = await testConnection();
      setDbConnected(ok);

      try {
        // Check if courses collection exists
        const coursesSnap = await getDocs(collection(db, 'courses'));
        if (coursesSnap.empty) {
          console.log('Seeding initial Firestore database collections for Zacma...');
          const batch = writeBatch(db);

          // Seed Settings
          const settingsRef = doc(db, 'instituteSettings', 'main');
          batch.set(settingsRef, initialSettings);

          // Seed Packages
          initialPackages.forEach((pkg) => {
            batch.set(doc(db, 'packages', pkg.id), pkg);
          });

          // Seed Schedules
          initialSchedules.forEach((sch) => {
            batch.set(doc(db, 'schedules', sch.id), sch);
          });

          // Seed Courses
          initialCourses.forEach((crs) => {
            batch.set(doc(db, 'courses', crs.id), crs);
          });

          // Seed Batches
          initialBatches.forEach((btc) => {
            batch.set(doc(db, 'batches', btc.id), btc);
          });

          // Seed Initial Students
          initialStudents.forEach((stu) => {
            batch.set(doc(db, 'students', stu.id), stu);
          });

          // Seed Initial Registrations
          initialRegistrations.forEach((reg) => {
            batch.set(doc(db, 'registrations', reg.id), reg);
          });

          // Seed Initial Payments
          initialPayments.forEach((pay) => {
            batch.set(doc(db, 'payments', pay.id), pay);
          });

          // Seed Initial Receipts
          initialReceipts.forEach((rec) => {
            batch.set(doc(db, 'receipts', rec.id), rec);
          });

          // Seed Initial Attendance
          initialAttendance.forEach((att) => {
            batch.set(doc(db, 'attendance', att.id), att);
          });

          // Seed Initial Certificates
          initialCertificates.forEach((cert) => {
            batch.set(doc(db, 'certificates', cert.id), cert);
          });

          // Seed Notifications
          initialNotifications.forEach((notif) => {
            batch.set(doc(db, 'notifications', notif.id), notif);
          });

          // Seed Learning Materials
          initialLearningMaterials.forEach((mat) => {
            batch.set(doc(db, 'learningMaterials', mat.id), mat);
          });

          await batch.commit();
          console.log('Zacma Firestore initial seed committed successfully.');
        }
      } catch (err) {
        console.warn('Firestore initial check/seed warning:', err);
      }
    }

    initFirestore();
  }, []);

  // 2. Real-time Firestore Listeners
  useEffect(() => {
    const unsubCourses = onSnapshot(collection(db, 'courses'), (snap) => {
      if (!snap.empty) {
        setCourses(snap.docs.map((d) => d.data() as Course));
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'courses'));

    const unsubPackages = onSnapshot(collection(db, 'packages'), (snap) => {
      if (!snap.empty) {
        setPackages(snap.docs.map((d) => d.data() as TrainingPackage));
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'packages'));

    const unsubSchedules = onSnapshot(collection(db, 'schedules'), (snap) => {
      if (!snap.empty) {
        setSchedules(snap.docs.map((d) => d.data() as TrainingSchedule));
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'schedules'));

    const unsubBatches = onSnapshot(collection(db, 'batches'), (snap) => {
      if (!snap.empty) {
        setBatches(snap.docs.map((d) => d.data() as Batch));
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'batches'));

    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      if (!snap.empty) {
        setStudents(snap.docs.map((d) => d.data() as Student));
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'students'));

    const unsubRegistrations = onSnapshot(collection(db, 'registrations'), (snap) => {
      if (!snap.empty) {
        setRegistrations(snap.docs.map((d) => d.data() as Registration));
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'registrations'));

    const unsubPayments = onSnapshot(collection(db, 'payments'), (snap) => {
      if (!snap.empty) {
        setPayments(snap.docs.map((d) => d.data() as PaymentTransaction));
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'payments'));

    const unsubReceipts = onSnapshot(collection(db, 'receipts'), (snap) => {
      if (!snap.empty) {
        setReceipts(snap.docs.map((d) => d.data() as Receipt));
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'receipts'));

    const unsubAttendance = onSnapshot(collection(db, 'attendance'), (snap) => {
      if (!snap.empty) {
        setAttendance(snap.docs.map((d) => d.data() as AttendanceRecord));
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'attendance'));

    const unsubCertificates = onSnapshot(collection(db, 'certificates'), (snap) => {
      if (!snap.empty) {
        setCertificates(snap.docs.map((d) => d.data() as Certificate));
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'certificates'));

    const unsubNotifications = onSnapshot(collection(db, 'notifications'), (snap) => {
      if (!snap.empty) {
        setNotifications(snap.docs.map((d) => d.data() as NotificationItem));
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'notifications'));

    const unsubSettings = onSnapshot(doc(db, 'instituteSettings', 'main'), (snap) => {
      if (snap.exists()) {
        setSettings(snap.data() as InstituteSettings);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'instituteSettings/main'));

    const unsubAudit = onSnapshot(collection(db, 'auditLogs'), (snap) => {
      if (!snap.empty) {
        setAuditLogs(snap.docs.map((d) => d.data() as AuditLog));
      }
    }, (err) => {
      // Audit logs restricted to admin, fallback gracefully if not admin
      console.warn('Audit logs permission restricted to admin role.');
    });

    const unsubTickets = onSnapshot(collection(db, 'supportTickets'), (snap) => {
      if (!snap.empty) {
        setSupportTickets(snap.docs.map((d) => d.data() as SupportTicket));
      }
    }, () => {});

    const unsubMaterials = onSnapshot(collection(db, 'learningMaterials'), (snap) => {
      if (!snap.empty) {
        setLearningMaterials(snap.docs.map((d) => d.data() as LearningMaterial));
      }
    }, () => {});

    return () => {
      unsubCourses();
      unsubPackages();
      unsubSchedules();
      unsubBatches();
      unsubStudents();
      unsubRegistrations();
      unsubPayments();
      unsubReceipts();
      unsubAttendance();
      unsubCertificates();
      unsubNotifications();
      unsubSettings();
      unsubAudit();
      unsubTickets();
      unsubMaterials();
    };
  }, []);

  // Audit Log helper that writes to Firestore
  const addAuditLog = async (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      details,
      ipAddress: '196.188.241.10',
    };
    try {
      await setDoc(doc(db, 'auditLogs', newLog.id), newLog);
    } catch (err) {
      console.warn('Failed to save audit log to Firestore:', err);
    }
  };

  const updateSettings = async (newSettings: Partial<InstituteSettings>) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    try {
      await setDoc(doc(db, 'instituteSettings', 'main'), merged, { merge: true });
      await addAuditLog('SETTINGS_UPDATED', 'Institute contact, payment, or general configuration modified');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'instituteSettings/main');
    }
  };

  const updatePackage = async (pkg: TrainingPackage) => {
    setPackages((prev) => prev.map((p) => (p.id === pkg.id ? pkg : p)));
    try {
      await setDoc(doc(db, 'packages', pkg.id), pkg);
      await addAuditLog('PACKAGE_UPDATED', `Training package ${pkg.name} parameters updated`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `packages/${pkg.id}`);
    }
  };

  const addSchedule = async (sch: Omit<TrainingSchedule, 'id'>) => {
    const newSchedule: TrainingSchedule = {
      ...sch,
      id: `sch-${Date.now()}`,
    };
    setSchedules((prev) => [...prev, newSchedule]);
    try {
      await setDoc(doc(db, 'schedules', newSchedule.id), newSchedule);
      await addAuditLog('SCHEDULE_CREATED', `New schedule ${sch.title} created`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `schedules/${newSchedule.id}`);
    }
  };

  const addCourse = async (courseData: Omit<Course, 'id' | 'enrolledCount'>) => {
    const newCourse: Course = {
      ...courseData,
      id: `crs-${Date.now()}`,
      enrolledCount: 0,
    };
    setCourses((prev) => [newCourse, ...prev]);
    try {
      await setDoc(doc(db, 'courses', newCourse.id), newCourse);
      await addAuditLog('COURSE_CREATED', `New course ${newCourse.title} (${newCourse.code}) published`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `courses/${newCourse.id}`);
    }
  };

  const updateCourse = async (updatedCourse: Course) => {
    setCourses((prev) => prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)));
    try {
      await setDoc(doc(db, 'courses', updatedCourse.id), updatedCourse);
      await addAuditLog('COURSE_UPDATED', `Course ${updatedCourse.title} modified`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `courses/${updatedCourse.id}`);
    }
  };

  const addBatch = async (batchData: Omit<Batch, 'id' | 'enrolledStudentIds'>) => {
    const newBatch: Batch = {
      ...batchData,
      id: `btc-${Date.now()}`,
      enrolledStudentIds: [],
    };
    setBatches((prev) => [...prev, newBatch]);
    try {
      await setDoc(doc(db, 'batches', newBatch.id), newBatch);
      await addAuditLog('BATCH_CREATED', `New batch ${newBatch.name} opened with capacity ${newBatch.capacity}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `batches/${newBatch.id}`);
    }
  };

  const updateStudent = async (updatedStudent: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    try {
      await setDoc(doc(db, 'students', updatedStudent.id), updatedStudent);
      await addAuditLog('STUDENT_UPDATED', `Student profile ${updatedStudent.fullName} (${updatedStudent.studentId}) updated`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `students/${updatedStudent.id}`);
    }
  };

  // High-Level: Register Student Online or On-Behalf (Persists to Firestore)
  const registerStudentOnline = async (data: {
    fullName: string;
    fullNameAm?: string;
    phone: string;
    email?: string;
    address: string;
    gradeLevel: string;
    emergencyContact?: string;
    specialRequirements?: string;
    courseId: string;
    packageId: string;
    scheduleId: string;
    mode: TrainingMode;
    discountCode?: string;
    source?: string;
  }) => {
    const selectedCourse = courses.find((c) => c.id === data.courseId);
    if (!selectedCourse) {
      return { success: false, error: 'Course not found' };
    }

    const selectedPkg = packages.find((p) => p.id === data.packageId);
    if (!selectedPkg) {
      return { success: false, error: 'Package not found' };
    }

    const selectedSch = schedules.find((s) => s.id === data.scheduleId);
    if (!selectedSch) {
      return { success: false, error: 'Schedule not found' };
    }

    // Check capacity
    if (selectedCourse.enrolledCount >= selectedCourse.capacity) {
      return { success: false, error: 'This course is at maximum capacity. Please contact registrar.' };
    }

    // Check duplicate active registration for same phone and course
    const existingActive = registrations.find(
      (r) => r.studentPhone === data.phone && r.courseId === data.courseId && r.status !== 'cancelled' && r.status !== 'rejected'
    );
    if (existingActive) {
      return {
        success: false,
        error: `A registration with this phone number already exists for this course (Reg #${existingActive.registrationNumber}).`,
      };
    }

    // Calculate tuition fee
    const feeCalc = calculateTuitionFee(
      selectedCourse.baseFee,
      selectedPkg.code as PackageCode,
      data.discountCode
    );

    // Create or find student
    let student = students.find((s) => s.phone === data.phone);
    if (!student) {
      const studentSeq = students.length + 1;
      const newStudentId = generateStudentId(studentSeq);
      student = {
        id: `stu-${Date.now()}`,
        studentId: newStudentId,
        fullName: data.fullName,
        fullNameAm: data.fullNameAm,
        email: data.email,
        phone: data.phone,
        address: data.address,
        gradeLevel: data.gradeLevel,
        emergencyContact: data.emergencyContact,
        specialRequirements: data.specialRequirements,
        registrationSource: data.source || 'Website Registration',
        registrationDate: new Date().toISOString().substring(0, 10),
        status: 'pending_payment',
      };
      setStudents((prev) => [student!, ...prev]);
      try {
        await setDoc(doc(db, 'students', student.id), student);
      } catch (err) {
        console.warn('Error saving student to Firestore:', err);
      }
    }

    const regSeq = registrations.length + 1;
    const regNumber = generateRegistrationNumber(regSeq);

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 5);

    const newRegistration: Registration = {
      id: `reg-${Date.now()}`,
      registrationNumber: regNumber,
      studentId: student.id,
      studentName: student.fullName,
      studentPhone: student.phone,
      studentEmail: student.email,
      courseId: selectedCourse.id,
      courseTitle: selectedCourse.title,
      packageId: selectedPkg.id,
      packageName: selectedPkg.name,
      scheduleId: selectedSch.id,
      scheduleTitle: selectedSch.title,
      mode: data.mode,
      totalFee: feeCalc.packageFee,
      discountAmount: feeCalc.discountAmount,
      discountCode: data.discountCode,
      amountPaid: 0,
      balanceDue: feeCalc.finalFee,
      status: 'pending_payment',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      paymentDeadline: deadline.toISOString().substring(0, 10),
    };

    setRegistrations((prev) => [newRegistration, ...prev]);

    try {
      await setDoc(doc(db, 'registrations', newRegistration.id), newRegistration);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `registrations/${newRegistration.id}`);
    }

    // In-app notification & Simulated SMS alert
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientId: student.id,
      recipientRole: 'student',
      title: 'Payment Request: Admission Confirmed',
      titleAm: 'የክፍያ ጥያቄ: ምዝገባዎ ተረጋግጧል',
      message: `Dear ${student.fullName}, your registration for ${selectedCourse.title} (${regNumber}) is accepted! Total tuition due: ${feeCalc.finalFee} ETB. Please pay via Telebirr or CBE Bank within 5 days.`,
      messageAm: `ክቡር ${student.fullName}፣ ለ${selectedCourse.titleAm || selectedCourse.title} የተደረገው ምዝገባ (${regNumber}) ተቀባይነት አግኝቷል! የሚከፈል ክፍያ: ${feeCalc.finalFee} ብር። እባክዎ በቴሌብር ወይም በሲቢኢ ባንክ በ5 ቀናት ውስጥ ይክፈሉ።`,
      channel: 'sms',
      status: 'delivered',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      read: false,
    };

    setNotifications((prev) => [notif, ...prev]);
    try {
      await setDoc(doc(db, 'notifications', notif.id), notif);
    } catch (err) {
      console.warn('Notification write warning:', err);
    }

    await addAuditLog(
      'REGISTRATION_CREATED',
      `Student ${student.fullName} registered for ${selectedCourse.title} (Reg #${regNumber}). Fee: ${feeCalc.finalFee} ETB.`
    );

    return { success: true, registration: newRegistration, student };
  };

  // High-Level: Record Payment Transaction (Persists to Firestore)
  const recordPaymentTransaction = async (data: {
    registrationId: string;
    amount: number;
    method: PaymentMethod;
    transactionReference: string;
    evidenceNotes?: string;
    evidenceUrl?: string;
  }) => {
    const reg = registrations.find((r) => r.id === data.registrationId);
    if (!reg) return { success: false, error: 'Registration not found' };

    if (data.amount <= 0) {
      return { success: false, error: 'Payment amount must be greater than 0' };
    }

    // Check duplicate transaction reference
    const duplicateRef = payments.find(
      (p) => p.transactionReference.trim().toUpperCase() === data.transactionReference.trim().toUpperCase() && p.status !== 'rejected'
    );
    if (duplicateRef) {
      return {
        success: false,
        error: `Transaction reference '${data.transactionReference}' has already been recorded in system!`,
      };
    }

    const newPayment: PaymentTransaction = {
      id: `tx-${Date.now()}`,
      registrationId: reg.id,
      studentId: reg.studentId,
      studentName: reg.studentName,
      courseTitle: reg.courseTitle,
      amount: data.amount,
      method: data.method,
      transactionReference: data.transactionReference.trim(),
      evidenceUrl: data.evidenceUrl,
      evidenceNotes: data.evidenceNotes,
      status: 'pending_verification',
      recordedBy: `${currentUser.name} (${currentUser.role})`,
      recordedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setPayments((prev) => [newPayment, ...prev]);

    try {
      await setDoc(doc(db, 'payments', newPayment.id), newPayment);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `payments/${newPayment.id}`);
    }

    await addAuditLog(
      'PAYMENT_RECORDED',
      `Payment of ${data.amount} ETB recorded via ${data.method} (TxID: ${data.transactionReference}) for ${reg.studentName}. Status: Pending Verification.`
    );

    return { success: true, transaction: newPayment };
  };

  // High-Level: Verify Payment and Issue Official Sequential Receipt (Atomic Firestore commit)
  const verifyPaymentTransaction = async (transactionId: string, notes?: string) => {
    const tx = payments.find((p) => p.id === transactionId);
    if (!tx) return { success: false, error: 'Transaction not found' };
    if (tx.status === 'verified') return { success: false, error: 'Transaction is already verified' };

    const reg = registrations.find((r) => r.id === tx.registrationId);
    if (!reg) return { success: false, error: 'Associated registration not found' };

    const student = students.find((s) => s.id === tx.studentId);

    // Generate unique sequential receipt
    const receiptSeq = receipts.length + 1;
    const receiptNum = generateReceiptNumber(receiptSeq);

    const newReceipt: Receipt = {
      id: `rec-${Date.now()}`,
      receiptNumber: receiptNum,
      paymentId: tx.id,
      registrationId: reg.id,
      studentId: student ? student.studentId : reg.studentId,
      studentName: reg.studentName,
      courseTitle: reg.courseTitle,
      packageTitle: reg.packageName,
      amount: tx.amount,
      paymentMethod: tx.method,
      transactionReference: tx.transactionReference,
      issuedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      issuedBy: `${currentUser.name} (${currentUser.role})`,
      qrCodeSignature: `ZACMA-${receiptNum}-VERIFIED-AUTH-EAT`,
      currency: settings.currency,
    };

    // Update payment record
    const updatedTx: PaymentTransaction = {
      ...tx,
      status: 'verified',
      receiptNumber: receiptNum,
      verifiedBy: `${currentUser.name} (${currentUser.role})`,
      verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      notes: notes || tx.notes,
    };

    // Recalculate registration balance
    const newAmountPaid = reg.amountPaid + tx.amount;
    const newBalanceDue = Math.max(0, reg.totalFee - reg.discountAmount - newAmountPaid);
    const newStatus = newBalanceDue === 0 ? 'paid' : 'partially_paid';

    const updatedReg: Registration = {
      ...reg,
      amountPaid: newAmountPaid,
      balanceDue: newBalanceDue,
      status: newStatus,
    };

    setReceipts((prev) => [newReceipt, ...prev]);
    setPayments((prev) => prev.map((p) => (p.id === tx.id ? updatedTx : p)));
    setRegistrations((prev) => prev.map((r) => (r.id === reg.id ? updatedReg : r)));

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'receipts', newReceipt.id), newReceipt);
      batch.set(doc(db, 'payments', tx.id), updatedTx);
      batch.set(doc(db, 'registrations', reg.id), updatedReg);

      if (student) {
        batch.update(doc(db, 'students', student.id), { status: newStatus });
      }

      // Auto-enroll if fully paid
      if (newStatus === 'paid') {
        const matchBatch = batches.find((b) => b.courseId === reg.courseId && b.status !== 'completed');
        if (matchBatch) {
          const updatedStudentIds = Array.from(new Set([...matchBatch.enrolledStudentIds, reg.studentId]));
          batch.update(doc(db, 'batches', matchBatch.id), { enrolledStudentIds: updatedStudentIds });
          const course = courses.find((c) => c.id === reg.courseId);
          if (course) {
            batch.update(doc(db, 'courses', course.id), { enrolledCount: course.enrolledCount + 1 });
          }
        }
      }

      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `receipts/${newReceipt.id}`);
    }

    // Send confirmation notification
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientId: reg.studentId,
      recipientRole: 'student',
      title: 'Payment Verified & Receipt Issued',
      titleAm: 'ክፍያዎ ተረጋግጦ ኦፊሴላዊ ደረሰኝ ተሰጥቷል',
      message: `Your payment of ${tx.amount} ETB (${tx.method}) has been verified. Official Receipt #${receiptNum} is ready for download in your student portal.`,
      messageAm: `የ${tx.amount} ብር ክፍያዎ በ${tx.method} ተረጋግጧል። ኦፊሴላዊ ደረሰኝ #${receiptNum} በተማሪ ፖርታልዎ ውስጥ ማውረድ ይችላሉ።`,
      channel: 'sms',
      status: 'delivered',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
    try {
      await setDoc(doc(db, 'notifications', notif.id), notif);
    } catch (err) {
      console.warn('Notification write warning:', err);
    }

    await addAuditLog(
      'PAYMENT_VERIFIED',
      `Payment of ${tx.amount} ETB verified for ${reg.studentName} (TxID: ${tx.transactionReference}). Issued Receipt #${receiptNum}. Status: ${newStatus}.`
    );

    return { success: true, receipt: newReceipt };
  };

  const rejectPaymentTransaction = async (transactionId: string, reason: string) => {
    const updated = payments.map((p) =>
      p.id === transactionId
        ? {
            ...p,
            status: 'rejected' as const,
            notes: `Rejected by ${currentUser.name}: ${reason}`,
          }
        : p
    );
    setPayments(updated);
    try {
      await updateDoc(doc(db, 'payments', transactionId), {
        status: 'rejected',
        notes: `Rejected by ${currentUser.name}: ${reason}`,
      });
      await addAuditLog('PAYMENT_REJECTED', `Transaction ${transactionId} rejected: ${reason}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `payments/${transactionId}`);
    }
  };

  const refundPaymentTransaction = async (transactionId: string, reason: string) => {
    const tx = payments.find((p) => p.id === transactionId);
    if (!tx) return { success: false, error: 'Transaction not found' };

    const reg = registrations.find((r) => r.id === tx.registrationId);
    let updatedReg: Registration | null = null;
    if (reg) {
      const updatedPaid = Math.max(0, reg.amountPaid - tx.amount);
      const updatedBal = reg.totalFee - reg.discountAmount - updatedPaid;
      updatedReg = {
        ...reg,
        amountPaid: updatedPaid,
        balanceDue: updatedBal,
        status: updatedPaid > 0 ? 'partially_paid' : 'pending_payment',
      };
      setRegistrations((prev) => prev.map((r) => (r.id === reg.id ? updatedReg! : r)));
    }

    setPayments((prev) =>
      prev.map((p) =>
        p.id === transactionId
          ? {
              ...p,
              status: 'refunded',
              refundReason: reason,
            }
          : p
      )
    );

    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'payments', transactionId), {
        status: 'refunded',
        refundReason: reason,
      });
      if (updatedReg) {
        batch.update(doc(db, 'registrations', updatedReg.id), {
          amountPaid: updatedReg.amountPaid,
          balanceDue: updatedReg.balanceDue,
          status: updatedReg.status,
        });
      }
      await batch.commit();
      await addAuditLog('PAYMENT_REFUNDED', `Refunded ${tx.amount} ETB on transaction ${tx.id}. Reason: ${reason}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `payments/${transactionId}`);
    }

    return { success: true };
  };

  // High-Level: Teacher Marks Batch Attendance (Firestore write)
  const markBatchAttendance = async (
    batchId: string,
    topic: string,
    records: { studentId: string; studentName: string; status: AttendanceStatus; notes?: string }[]
  ) => {
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      batchId,
      sessionDate: new Date().toISOString().substring(0, 10),
      topic,
      records,
      markedBy: currentUser.name,
      markedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setAttendance((prev) => [newRecord, ...prev]);

    try {
      await setDoc(doc(db, 'attendance', newRecord.id), newRecord);
      await addAuditLog(
        'ATTENDANCE_RECORDED',
        `Attendance marked for batch ${batchId} by ${currentUser.name}. Topic: "${topic}". Total students: ${records.length}.`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `attendance/${newRecord.id}`);
    }
  };

  // High-Level: Issue Certificate with Public Verification Code (Firestore write)
  const issueStudentCertificate = async (
    studentId: string,
    courseId: string,
    durationText: string,
    gradeText?: string
  ) => {
    const student = students.find((s) => s.id === studentId);
    const course = courses.find((c) => c.id === courseId);

    const certSeq = certificates.length + 1;
    const certNum = `CERT-ZAC-2026-${String(certSeq).padStart(4, '0')}`;
    const verifyCode = generateCertificateCode(
      student ? student.studentId : 'STU',
      course ? course.code : 'GEN',
      certSeq
    );

    const newCert: Certificate = {
      id: `cert-${Date.now()}`,
      certificateNumber: certNum,
      verificationCode: verifyCode,
      studentId: student ? student.studentId : studentId,
      studentName: student ? student.fullName : 'Certified Student',
      studentPhone: student ? student.phone : '',
      courseId: courseId,
      courseTitle: course ? course.title : 'Technology Training',
      duration: durationText,
      issueDate: new Date().toISOString().substring(0, 10),
      completionDate: new Date().toISOString().substring(0, 10),
      status: 'active',
      issuedBy: `${currentUser.name} (Director of Training)`,
      grade: gradeText || 'Pass with Distinction',
    };

    setCertificates((prev) => [newCert, ...prev]);

    try {
      await setDoc(doc(db, 'certificates', newCert.id), newCert);
      await addAuditLog(
        'CERTIFICATE_ISSUED',
        `Issued Certificate ${certNum} (Code: ${verifyCode}) to ${newCert.studentName} for ${newCert.courseTitle}.`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `certificates/${newCert.id}`);
    }

    return newCert;
  };

  const markNotificationRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.warn('Notification update warning:', err);
    }
  };

  const sendNotification = async (notif: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    try {
      await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
    } catch (err) {
      console.warn('Notification send warning:', err);
    }
  };

  const addSupportTicket = async (subject: string, message: string) => {
    const student = students.find((s) => s.id === currentUser.id) || students[0];
    const newTicket: SupportTicket = {
      id: `tkt-${Date.now()}`,
      studentId: student.id,
      studentName: student.fullName,
      studentPhone: student.phone,
      subject,
      message,
      status: 'open',
      priority: 'medium',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      replies: [],
    };
    setSupportTickets((prev) => [newTicket, ...prev]);
    try {
      await setDoc(doc(db, 'supportTickets', newTicket.id), newTicket);
      await addAuditLog('SUPPORT_TICKET_OPENED', `Student ${student.fullName} submitted ticket: "${subject}"`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `supportTickets/${newTicket.id}`);
    }
  };

  const replySupportTicket = async (ticketId: string, message: string) => {
    const replyObj = {
      id: `rep-${Date.now()}`,
      sender: currentUser.name,
      role: currentUser.role,
      message,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setSupportTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: 'in_progress',
              replies: [...t.replies, replyObj],
            }
          : t
      )
    );
    try {
      const ticket = supportTickets.find((t) => t.id === ticketId);
      if (ticket) {
        await updateDoc(doc(db, 'supportTickets', ticketId), {
          status: 'in_progress',
          replies: [...ticket.replies, replyObj],
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `supportTickets/${ticketId}`);
    }
  };

  const addLearningMaterial = async (mat: Omit<LearningMaterial, 'id' | 'uploadedAt'>) => {
    const newMat: LearningMaterial = {
      ...mat,
      id: `mat-${Date.now()}`,
      uploadedAt: new Date().toISOString().substring(0, 10),
    };
    setLearningMaterials((prev) => [newMat, ...prev]);
    try {
      await setDoc(doc(db, 'learningMaterials', newMat.id), newMat);
      await addAuditLog('MATERIAL_UPLOADED', `Learning resource "${mat.title}" uploaded`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `learningMaterials/${newMat.id}`);
    }
  };

  const resetDatabase = async () => {
    // Re-seed default collections in Firestore
    try {
      const batch = writeBatch(db);
      initialCourses.forEach((c) => batch.set(doc(db, 'courses', c.id), c));
      initialPackages.forEach((p) => batch.set(doc(db, 'packages', p.id), p));
      initialSchedules.forEach((s) => batch.set(doc(db, 'schedules', s.id), s));
      initialBatches.forEach((b) => batch.set(doc(db, 'batches', b.id), b));
      initialStudents.forEach((st) => batch.set(doc(db, 'students', st.id), st));
      initialRegistrations.forEach((r) => batch.set(doc(db, 'registrations', r.id), r));
      initialPayments.forEach((py) => batch.set(doc(db, 'payments', py.id), py));
      initialReceipts.forEach((rc) => batch.set(doc(db, 'receipts', rc.id), rc));
      initialSettings && batch.set(doc(db, 'instituteSettings', 'main'), initialSettings);
      await batch.commit();
    } catch (err) {
      console.warn('Reset database Firestore error:', err);
    }
    setSettings(initialSettings);
    setPackages(initialPackages);
    setSchedules(initialSchedules);
    setCourses(initialCourses);
    setBatches(initialBatches);
    setStudents(initialStudents);
    setRegistrations(initialRegistrations);
    setPayments(initialPayments);
    setReceipts(initialReceipts);
    setAttendance(initialAttendance);
    setCertificates(initialCertificates);
    setNotifications(initialNotifications);
    setAuditLogs(initialAuditLogs);
    setSupportTickets(initialSupportTickets);
    setLearningMaterials(initialLearningMaterials);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        darkMode,
        setDarkMode,
        currentRole,
        setCurrentRole,
        currentUser,
        activeView,
        setActiveView: handleSetActiveView,
        selectedCourseId,
        setSelectedCourseId,
        selectedReceiptId,
        setSelectedReceiptId,
        selectedCertificateCode,
        setSelectedCertificateCode,
        authModalOpen,
        setAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        dbConnected,
        settings,
        updateSettings,
        packages,
        updatePackage,
        schedules,
        addSchedule,
        courses,
        addCourse,
        updateCourse,
        batches,
        addBatch,
        students,
        updateStudent,
        registrations,
        registerStudentOnline,
        recordPaymentTransaction,
        verifyPaymentTransaction,
        rejectPaymentTransaction,
        refundPaymentTransaction,
        markBatchAttendance,
        issueStudentCertificate,
        payments,
        receipts,
        attendance,
        certificates,
        notifications,
        markNotificationRead,
        sendNotification,
        auditLogs,
        supportTickets,
        addSupportTicket,
        replySupportTicket,
        learningMaterials,
        addLearningMaterial,
        resetDatabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
