import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/index';
import {
  GraduationCap,
  Phone,
  Mail,
  Clock,
  Globe,
  Sun,
  Moon,
  UserCheck,
  Bell,
  Menu,
  X,
  Shield,
  CreditCard,
  BookOpen,
  ClipboardList,
  User,
  LogOut,
  Sparkles,
  KeyRound,
  Database,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    language,
    setLanguage,
    t,
    darkMode,
    setDarkMode,
    currentRole,
    setCurrentRole,
    currentUser,
    activeView,
    setActiveView,
    settings,
    notifications,
    markNotificationRead,
    setAuthModalOpen,
    setAuthModalMode,
    dbConnected,
  } = useApp();

  const { firebaseUser, userProfile, logOut } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Time in Addis Ababa
  const now = new Date();
  const eatTime = now.toLocaleTimeString('en-US', {
    timeZone: 'Africa/Addis_Ababa',
    hour: '2-digit',
    minute: '2-digit',
  });

  const unreadNotifications = notifications.filter((n) => !n.read);

  const allRoles: { role: UserRole; label: string; icon: any; color: string }[] = [
    { role: 'public', label: 'Public Website', icon: Globe, color: 'text-slate-600 bg-slate-100' },
    { role: 'student', label: 'Student Portal', icon: GraduationCap, color: 'text-blue-600 bg-blue-50' },
    { role: 'teacher', label: 'Teacher / Instructor', icon: BookOpen, color: 'text-purple-600 bg-purple-50' },
    { role: 'secretary', label: 'Secretary / Registrar', icon: ClipboardList, color: 'text-emerald-600 bg-emerald-50' },
    { role: 'accountant', label: 'Accountant (Finance)', icon: CreditCard, color: 'text-amber-600 bg-amber-50' },
    { role: 'admin', label: 'Administrator', icon: Shield, color: 'text-indigo-600 bg-indigo-50' },
    { role: 'super_admin', label: 'Super Admin', icon: UserCheck, color: 'text-rose-600 bg-rose-50' },
  ];

  // Filter allowed portal switches based on authenticated role
  const allowedRoles = React.useMemo(() => {
    if (!userProfile) {
      return allRoles.filter((r) => r.role === 'public' || r.role === 'student');
    }
    if (userProfile.role === 'super_admin') {
      return allRoles;
    }
    if (userProfile.role === 'admin') {
      return allRoles.filter((r) => r.role !== 'super_admin');
    }
    return allRoles.filter((r) => r.role === 'public' || r.role === userProfile.role);
  }, [userProfile]);

  const handleOpenLogin = () => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  const handleOpenSignup = () => {
    setAuthModalMode('signup');
    setAuthModalOpen(true);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Utility Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-medium text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Bole Road, Mega Building 4th Floor, Addis Ababa
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
              <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>+251911936641 / +251911936641</span>
            </span>
            <span className="hidden lg:inline-flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
              <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>info@zacmaa.net</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {eatTime} EAT (Addis Ababa)
            </span>
            {dbConnected && (
              <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                <Database className="w-3 h-3 text-emerald-400" />
                Firebase Live
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Language Selector */}
            <div className="flex items-center rounded-md bg-slate-800 p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                  language === 'en'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('am')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                  language === 'am'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Amharic (አማርኛ)"
              >
                AM (አማርኛ)
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Role Switcher Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-900/60 hover:bg-blue-800 border border-blue-700/60 rounded-full text-blue-200 text-[11px] font-medium transition"
              >
                <UserCheck className="w-3 h-3 text-blue-400" />
                <span>{t(currentRole as any)}</span>
                <span className="text-[9px] opacity-70">▼</span>
              </button>

              {showRoleMenu && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 text-slate-800 dark:text-slate-200"
                  onMouseLeave={() => setShowRoleMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      {t('switchRole')}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {userProfile ? `Role: ${userProfile.role.toUpperCase()}` : 'Sign in to access privileged staff tools'}
                    </p>
                  </div>
                  <div className="py-1">
                    {allowedRoles.map((r) => {
                      const Icon = r.icon;
                      const isSelected = currentRole === r.role;
                      return (
                        <button
                          key={r.role}
                          type="button"
                          onClick={() => {
                            setCurrentRole(r.role);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`p-1 rounded-md ${r.color}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </span>
                            <span>{r.label}</span>
                          </div>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Brand Identity */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              setCurrentRole('public');
              setActiveView('home');
            }}
          >
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-800 text-white font-black shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <span className="text-base sm:text-lg tracking-tighter">ZT</span>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-red-600 rounded-full border-2 border-white dark:border-slate-900"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  ZACMA
                </span>
                <span className="text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-md bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 uppercase tracking-wider">
                  Technology
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Training Center • Addis Ababa, Ethiopia
              </p>
            </div>
          </div>

          {/* Navigation links for Public View */}
          {currentRole === 'public' ? (
            <nav className="hidden lg:flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              <button
                type="button"
                onClick={() => setActiveView('home')}
                className={`px-3 py-2 rounded-lg transition ${
                  activeView === 'home'
                    ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/40'
                    : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {t('home')}
              </button>
              <button
                type="button"
                onClick={() => setActiveView('courses')}
                className={`px-3 py-2 rounded-lg transition ${
                  activeView === 'courses'
                    ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/40'
                    : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {t('courses')}
              </button>
              <button
                type="button"
                onClick={() => setActiveView('schedules')}
                className={`px-3 py-2 rounded-lg transition ${
                  activeView === 'schedules'
                    ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/40'
                    : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {t('schedules')}
              </button>
              <button
                type="button"
                onClick={() => setActiveView('packages')}
                className={`px-3 py-2 rounded-lg transition ${
                  activeView === 'packages'
                    ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/40'
                    : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {t('packages')}
              </button>
              <button
                type="button"
                onClick={() => setActiveView('verify')}
                className={`px-3 py-2 rounded-lg transition flex items-center gap-1 ${
                  activeView === 'verify'
                    ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/40'
                    : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {t('verifyCertificate')}
              </button>
              <button
                type="button"
                onClick={() => setActiveView('about')}
                className={`px-3 py-2 rounded-lg transition ${
                  activeView === 'about'
                    ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/40'
                    : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {t('about')}
              </button>
            </nav>
          ) : (
            /* Portal header info */
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Active Portal: {t(currentRole as any)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Logged as: <strong className="text-slate-800 dark:text-slate-200">{currentUser.name}</strong>
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 z-50 text-slate-800 dark:text-slate-200"
                  onMouseLeave={() => setShowNotifications(false)}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="font-semibold text-sm">Notifications & SMS Alerts</span>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {unreadNotifications.length} Unread
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700 py-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 p-3 text-center">No notifications yet.</p>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-2.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer rounded-lg transition ${
                            !n.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white mb-1">
                            <span>{language === 'am' ? n.titleAm || n.title : n.title}</span>
                            <span className="text-[10px] text-slate-400">{n.channel.toUpperCase()}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {language === 'am' ? n.messageAm || n.message : n.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{n.createdAt}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Authenticated User state vs Guest state */}
            {Boolean(firebaseUser || userProfile) ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (currentRole === 'public') {
                      setCurrentRole(userProfile ? userProfile.role : 'super_admin');
                    } else {
                      setCurrentRole('public');
                    }
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 transition hover:bg-blue-100"
                >
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {currentRole === 'public' 
                      ? (userProfile?.role === 'super_admin' ? 'Super Admin Portal' : 'My Portal') 
                      : 'Public Site'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={logOut}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Sign Out of Portal"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenLogin}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition"
                >
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('register')}
                  className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition-transform active:scale-95"
                >
                  {t('registerNow')}
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Open mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-2">
          {currentRole === 'public' && (
            <div className="grid grid-cols-2 gap-2 text-sm font-medium">
              <button
                type="button"
                onClick={() => {
                  setActiveView('home');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t('home')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveView('courses');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t('courses')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveView('schedules');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t('schedules')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveView('packages');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t('packages')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveView('verify');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-600"
              >
                {t('verifyCertificate')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveView('about');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t('about')}
              </button>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            {!firebaseUser ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 rounded-xl text-center font-semibold text-xs border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenSignup();
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 rounded-xl text-center font-semibold text-xs bg-slate-800 text-white"
                >
                  Activate Account
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{userProfile?.name}</p>
                  <p className="text-[10px] text-slate-500">{userProfile?.email} ({userProfile?.role})</p>
                </div>
                <button
                  type="button"
                  onClick={logOut}
                  className="px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-semibold"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
