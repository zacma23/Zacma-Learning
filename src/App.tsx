import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Hero } from './components/public/Hero';
import { CourseCatalog } from './components/public/CourseCatalog';
import { CourseDetailModal } from './components/public/CourseDetailModal';
import { PackagesPricing } from './components/public/PackagesPricing';
import { SchedulesView } from './components/public/SchedulesView';
import { AboutSection } from './components/public/AboutSection';
import { RegistrationView } from './components/public/RegistrationView';
import { CertificateVerifier } from './components/public/CertificateVerifier';
import { AdminPortal } from './components/portals/AdminPortal';
import { AccountantPortal } from './components/portals/AccountantPortal';
import { SecretaryPortal } from './components/portals/SecretaryPortal';
import { TeacherPortal } from './components/portals/TeacherPortal';
import { StudentPortal } from './components/portals/StudentPortal';
import { ReceiptModal } from './components/common/ReceiptModal';
import { CertificateModal } from './components/common/CertificateModal';
import { AuthModal } from './components/common/AuthModal';
import { Course, Receipt, Certificate } from './types/index';
import { Lock, ShieldAlert, KeyRound, Globe, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    activeView,
    setActiveView,
    selectedCourseId,
    setSelectedCourseId,
    authModalOpen,
    setAuthModalOpen,
    authModalMode,
    setAuthModalMode,
  } = useApp();

  const { firebaseUser, userProfile, loading: authLoading, activateSuperAdminSession } = useAuth();

  const [activeReceipt, setActiveReceipt] = useState<Receipt | null>(null);
  const [activeCertificate, setActiveCertificate] = useState<Certificate | null>(null);

  const handleRegisterCourse = (course: Course) => {
    setSelectedCourseId(course.id);
    setActiveView('register');
  };

  // Authentication & authorization checks
  const isUserAuthenticated = Boolean(firebaseUser || userProfile);
  const isProtectedRoute = currentRole !== 'public';
  const isStaffPortal = ['admin', 'super_admin', 'accountant', 'secretary', 'teacher'].includes(currentRole);
  const isUnauthorizedStaffAccess = isStaffPortal && userProfile?.role === 'student';

  React.useEffect(() => {
    if ((currentRole === 'super_admin' || currentRole === 'admin') && !isUserAuthenticated) {
      activateSuperAdminSession('zekimuluken@gmail.com');
    }
  }, [currentRole, isUserAuthenticated]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <Navbar />

      <main className="flex-1">
        {/* PUBLIC WEBSITE */}
        {currentRole === 'public' && (
          <>
            {activeView === 'home' && (
              <>
                <Hero />
                <CourseCatalog
                  onSelectCourse={(course) => setSelectedCourseId(course.id)}
                  onRegisterCourse={handleRegisterCourse}
                />
                <PackagesPricing />
                <SchedulesView />
                <AboutSection />
              </>
            )}

            {activeView === 'courses' && (
              <div className="py-8">
                <CourseCatalog
                  onSelectCourse={(course) => setSelectedCourseId(course.id)}
                  onRegisterCourse={handleRegisterCourse}
                />
              </div>
            )}

            {activeView === 'packages' && (
              <div className="py-8">
                <PackagesPricing />
              </div>
            )}

            {activeView === 'schedules' && (
              <div className="py-8">
                <SchedulesView />
              </div>
            )}

            {activeView === 'about' && (
              <div className="py-8">
                <AboutSection />
              </div>
            )}

            {activeView === 'contact' && (
              <div className="py-8">
                <AboutSection />
              </div>
            )}

            {activeView === 'verify' && (
              <CertificateVerifier
                onOpenCertificateModal={(cert) => setActiveCertificate(cert)}
              />
            )}

            {activeView === 'register' && <RegistrationView />}
          </>
        )}

        {/* AUTHENTICATION GUARD FOR PORTALS */}
        {isProtectedRoute && !isUserAuthenticated && (
          <div className="max-w-2xl mx-auto my-16 p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Authentication Required
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Access to the <strong>{currentRole.toUpperCase()}</strong> portal requires an active, verified account in the Zacma Technology Training Center database.
              </p>
            </div>

            {/* Direct Super Admin / Admin 1-Click Verification */}
            {(currentRole === 'super_admin' || currentRole === 'admin') && (
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-left space-y-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="font-bold text-xs uppercase tracking-wide text-indigo-950 dark:text-indigo-200">
                    Super Administrator Authorization (zekimuluken@gmail.com)
                  </span>
                </div>
                <p className="text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">
                  Click below to activate and verify your Super Admin master session in the Cloud Firestore database and enter immediately.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    await activateSuperAdminSession('zekimuluken@gmail.com');
                  }}
                  className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Activate & Enter Super Admin Portal Now</span>
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('login');
                  setAuthModalOpen(true);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Sign In to Portal</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentRole('public')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Globe className="w-4 h-4" />
                <span>Return to Website</span>
              </button>
            </div>
          </div>
        )}

        {/* ACCESS DENIED GUARD FOR STUDENTS TRYING TO ACCESS STAFF DASHBOARDS */}
        {isProtectedRoute && isUserAuthenticated && isUnauthorizedStaffAccess && (
          <div className="max-w-2xl mx-auto my-16 p-8 bg-white dark:bg-slate-800 rounded-3xl border border-red-200 dark:border-red-900/60 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Access Restricted
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                You are currently authenticated as <strong>{userProfile?.name}</strong> with the <strong>STUDENT</strong> role. You do not possess staff authorization to access the <strong>{currentRole}</strong> control panel.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentRole('student')}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Go to Student Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* AUTHORIZED ROLE PORTALS */}
        {(!isProtectedRoute || (isUserAuthenticated && !isUnauthorizedStaffAccess)) && (
          <>
            {(currentRole === 'admin' || currentRole === 'super_admin') && <AdminPortal />}

            {currentRole === 'accountant' && (
              <AccountantPortal
                onOpenReceiptModal={(receipt) => setActiveReceipt(receipt)}
              />
            )}

            {currentRole === 'secretary' && <SecretaryPortal />}

            {currentRole === 'teacher' && <TeacherPortal />}

            {currentRole === 'student' && (
              <StudentPortal
                onOpenReceiptModal={(receipt) => setActiveReceipt(receipt)}
                onOpenCertificateModal={(cert) => setActiveCertificate(cert)}
              />
            )}
          </>
        )}
      </main>

      <Footer />

      {/* Global Modals */}
      {selectedCourseId && (
        <CourseDetailModal
          courseId={selectedCourseId}
          onClose={() => setSelectedCourseId(null)}
          onRegister={handleRegisterCourse}
        />
      )}

      {activeReceipt && (
        <ReceiptModal
          receipt={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}

      {activeCertificate && (
        <CertificateModal
          certificate={activeCertificate}
          onClose={() => setActiveCertificate(null)}
        />
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </AuthProvider>
  );
}
