import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TrainingMode, Course, TrainingPackage, TrainingSchedule } from '../../types/index';
import { validateEthiopianPhone, calculateTuitionFee, formatETB } from '../../utils/rules';
import {
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  QrCode,
  ShieldCheck,
  Sparkles,
  Phone,
  User,
  MapPin,
  GraduationCap,
  Copy,
  Check,
} from 'lucide-react';

export const RegistrationView: React.FC = () => {
  const {
    courses,
    packages,
    schedules,
    selectedCourseId,
    language,
    t,
    settings,
    registerStudentOnline,
    recordPaymentTransaction,
    setCurrentRole,
    setActiveView,
    setAuthModalOpen,
    setAuthModalMode,
  } = useApp();

  // Multi-step: 1 = Form, 2 = Payment Request & Confirmation
  const [step, setStep] = useState<number>(1);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gradeLevel, setGradeLevel] = useState('University Student / Graduate');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [registrationSource, setRegistrationSource] = useState('Website');
  const [consentGiven, setConsentGiven] = useState(true);

  // Selections
  const [courseId, setCourseId] = useState<string>(
    selectedCourseId || courses[0]?.id || ''
  );
  const [packageId, setPackageId] = useState<string>(packages[0]?.id || '');
  const [scheduleId, setScheduleId] = useState<string>(schedules[0]?.id || '');
  const [trainingMode, setTrainingMode] = useState<TrainingMode>('in_person');
  const [discountCode, setDiscountCode] = useState('');

  // UI state
  const [formError, setFormError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<any>(null);

  // Payment submission state inside confirmation
  const [paymentMethod, setPaymentMethod] = useState<'telebirr' | 'cbe_birr' | 'bank_transfer_cbe' | 'cash'>('telebirr');
  const [txRefInput, setTxRefInput] = useState('');
  const [paymentAmountInput, setPaymentAmountInput] = useState<number>(0);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const selectedCourse = courses.find((c) => c.id === courseId) || courses[0];
  const selectedPackage = packages.find((p) => p.id === packageId) || packages[0];
  const selectedSchedule = schedules.find((s) => s.id === scheduleId) || schedules[0];

  const feeCalculation = calculateTuitionFee(
    selectedCourse ? selectedCourse.baseFee : 10000,
    (selectedPackage?.code as any) || 'group',
    discountCode
  );

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate name
    if (!fullName.trim() || fullName.trim().length < 3) {
      setFormError('Please enter your full legal name.');
      return;
    }

    // Validate Ethiopian phone
    const phoneCheck = validateEthiopianPhone(phone);
    if (!phoneCheck.valid) {
      setFormError(phoneCheck.error || 'Please enter a valid Ethiopian mobile number (e.g. 0911223344 or 0712345678).');
      return;
    }

    // Validate address
    if (!address.trim()) {
      setFormError('Please enter your residential or sub-city address in Ethiopia.');
      return;
    }

    if (!consentGiven) {
      setFormError('You must agree to the institute admission terms and privacy notice.');
      return;
    }

    // Call registration workflow
    const result = await registerStudentOnline({
      fullName: fullName.trim(),
      phone: phoneCheck.normalized,
      email: email.trim() || undefined,
      address: address.trim(),
      gradeLevel,
      emergencyContact: emergencyContact.trim() || undefined,
      specialRequirements: specialRequirements.trim() || undefined,
      courseId,
      packageId,
      scheduleId,
      mode: trainingMode,
      discountCode: discountCode.trim() || undefined,
      source: registrationSource,
    });

    if (!result.success) {
      setFormError(result.error || 'Registration failed. Please check your details.');
      return;
    }

    setCreatedResult(result);
    setPaymentAmountInput(result.registration?.balanceDue || feeCalculation.finalFee);
    setStep(2);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txRefInput.trim()) {
      setFormError('Please provide your Telebirr / Bank transaction reference number.');
      return;
    }

    if (!createdResult?.registration) return;

    const res = await recordPaymentTransaction({
      registrationId: createdResult.registration.id,
      amount: Number(paymentAmountInput) || createdResult.registration.balanceDue,
      method: paymentMethod,
      transactionReference: txRefInput.trim(),
      evidenceNotes: 'Submitted by student upon registration completion.',
    });

    if (!res.success) {
      setFormError(res.error || 'Failed to submit payment details.');
      return;
    }

    setPaymentSubmitted(true);
    setFormError(null);
  };

  const copyRegRef = () => {
    if (createdResult?.registration?.registrationNumber) {
      navigator.clipboard.writeText(createdResult.registration.registrationNumber);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="py-12 bg-slate-50 dark:bg-slate-900/60 min-h-[calc(100vh-140px)] transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Step Indicator Header */}
        <div className="mb-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            {language === 'am' ? 'የተማሪ ምዝገባ ቅጽ' : 'Student Admission & Registration'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {step === 1 ? 'Complete Your Application' : 'Payment Request & Account Instructions'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            {step === 1
              ? 'Enter your student details and select your training package and schedule.'
              : 'Your registration has been created. Follow instructions below to secure your seat.'}
          </p>
        </div>

        {formError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === 1 && (
          <form
            onSubmit={handleSubmitRegistration}
            className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-6 sm:p-10 space-y-8"
          >
            {/* Section 1: Course, Package & Schedule Selection */}
            <div>
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-700">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  1. Program, Package & Schedule
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Course Selection */}
                <div className="sm:col-span-2">
                  <label htmlFor="reg-course-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="reg-course-select"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} — {formatETB(c.baseFee)} ({c.durationWeeks} Weeks)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Package Selection */}
                <div>
                  <label htmlFor="reg-package-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Training Package <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="reg-package-select"
                    value={packageId}
                    onChange={(e) => setPackageId(e.target.value)}
                    className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {packages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code === 'vip' ? 'VIP 1-on-1' : `${p.minGroupSize}-${p.maxGroupSize} students`})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Schedule Selection */}
                <div>
                  <label htmlFor="reg-schedule-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Class Schedule <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="reg-schedule-select"
                    value={scheduleId}
                    onChange={(e) => setScheduleId(e.target.value)}
                    className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {schedules.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.timeSlot})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Training Mode */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Training Delivery Mode <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTrainingMode('in_person')}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition ${
                        trainingMode === 'in_person'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      In-Person (Bole Labs)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrainingMode('online')}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition ${
                        trainingMode === 'online'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      Online Live Streaming
                    </button>
                  </div>
                </div>

                {/* Coupon Code */}
                <div>
                  <label htmlFor="reg-discount-code" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Promotional Coupon Code (Optional)
                  </label>
                  <input
                    id="reg-discount-code"
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="e.g. EARLYBIRD or ZACMA2026"
                    className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white uppercase placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  {feeCalculation.discountDescription && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">
                      ✓ {feeCalculation.discountDescription}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Personal Student Information */}
            <div>
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-700">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  2. Student Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Legal Name */}
                <div className="sm:col-span-2">
                  <label htmlFor="reg-full-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Legal Name (as should appear on official certificate) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="reg-full-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Abebe Kebede Tessema"
                    className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Ethiopian Mobile Phone */}
                <div>
                  <label htmlFor="reg-phone-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ethiopian Mobile Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="reg-phone-input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0911223344 or +251 91..."
                    className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Supports Ethio Telecom (09) and Safaricom (07)
                  </span>
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="reg-email-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    id="reg-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Physical Address */}
                <div>
                  <label htmlFor="reg-address-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Residential Address / Sub-City <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="reg-address-input"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Bole Sub-city, Woreda 03, Addis Ababa"
                    className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Education / Background */}
                <div>
                  <label htmlFor="reg-grade-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Education / Professional Background <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="reg-grade-select"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="University Student">University Student</option>
                    <option value="University Graduate">University Graduate</option>
                    <option value="Working Professional">Working Professional</option>
                    <option value="High School Complete">High School Complete</option>
                    <option value="High School Student">High School Student</option>
                  </select>
                </div>

                {/* Emergency Contact */}
                <div>
                  <label htmlFor="reg-emergency-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Emergency Contact Name & Phone (Optional)
                  </label>
                  <input
                    id="reg-emergency-input"
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="e.g. Kebede (Brother) - 0912001122"
                    className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Special Requirements */}
                <div>
                  <label htmlFor="reg-special-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Special Requirements or Lab Hardware Needs
                  </label>
                  <input
                    id="reg-special-input"
                    type="text"
                    value={specialRequirements}
                    onChange={(e) => setSpecialRequirements(e.target.value)}
                    placeholder="e.g. Need institute laptop during lab sessions"
                    className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Fee Summary Preview */}
            <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs space-y-2">
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Standard Course Tuition:</span>
                <span className="font-semibold">{formatETB(selectedCourse.baseFee)}</span>
              </div>
              {selectedPackage.priceMultiplier !== 1.0 && (
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Package Adjustment ({selectedPackage.name}):</span>
                  <span>{selectedPackage.priceMultiplier}x</span>
                </div>
              )}
              {feeCalculation.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Coupon Discount Applied:</span>
                  <span>- {formatETB(feeCalculation.discountAmount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-blue-200 dark:border-blue-800/60 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                <span>Total Amount Due Upon Admission:</span>
                <span className="text-blue-600 dark:text-blue-400 text-base">
                  {formatETB(feeCalculation.finalFee)}
                </span>
              </div>
            </div>

            {/* Consent Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>
                I agree to Zacma Technology Training Center admission rules, code of conduct, and privacy notice. I certify that submitted personal information is accurate.
              </span>
            </label>

            {/* Submit Button */}
            <div className="pt-4 flex items-center justify-end gap-4">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition transform active:scale-95"
              >
                <span>Submit Application & Generate Payment Request</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Instant Payment Request & Instructions */}
        {step === 2 && createdResult?.registration && (
          <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-6 sm:p-10 space-y-8">
            {/* Success Banner */}
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  Application Accepted — Registration Created!
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                  A unique student record has been generated for <strong>{createdResult.student?.fullName}</strong>. An admission notification has been logged to our center records.
                </p>
              </div>
            </div>

            {/* Registration Details Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Registration Ref</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                    {createdResult.registration.registrationNumber}
                  </span>
                  <button
                    type="button"
                    onClick={copyRegRef}
                    className="text-slate-400 hover:text-blue-500"
                    title="Copy Registration Number"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Student ID</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm mt-0.5 block">
                  {createdResult.student?.studentId}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Tuition Due</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-base mt-0.5 block">
                  {formatETB(createdResult.registration.balanceDue)}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Status</span>
                <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[10px] mt-1">
                  Pending Payment
                </span>
              </div>
            </div>

            {/* Official Payment Instructions */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Official Ethiopian Payment Channels</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Telebirr Channel */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 dark:text-amber-200">Telebirr Merchant</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 text-[10px] font-bold">
                      Recommended
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Pay via Telebirr App / USSD *127#:
                  </p>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 font-mono text-center font-bold text-amber-700 dark:text-amber-300 text-sm">
                    {settings.telebirrMerchantCode}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Account: {settings.telebirrAccountName}
                  </p>
                </div>

                {/* CBE Birr / Commercial Bank of Ethiopia */}
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-900 dark:text-purple-200">CBE Bank Transfer</span>
                    <span className="text-[10px] text-purple-600 font-medium">Bank</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Transfer via CBE Mobile / branch:
                  </p>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 font-mono text-center font-bold text-purple-700 dark:text-purple-300 text-sm">
                    {settings.cbeAccount}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Account: {settings.cbeAccountName}
                  </p>
                </div>

                {/* Awash Bank */}
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 dark:text-blue-200">Awash Bank</span>
                    <span className="text-[10px] text-blue-600 font-medium">Bank</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Awash Online / Mobile Banking:
                  </p>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 font-mono text-center font-bold text-blue-700 dark:text-blue-300 text-sm">
                    {settings.awashAccount}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Account: {settings.awashAccountName}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Evidence / Transaction Reference Right Now */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Submit Payment Transaction for Immediate Accountant Verification
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Already sent your payment via Telebirr or CBE? Enter your transaction reference below. Our finance office will verify the payment and issue your official sequential receipt.
              </p>

              {paymentSubmitted ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 space-y-2">
                  <p className="font-bold">✓ Payment Transaction Reference Submitted!</p>
                  <p>
                    Reference <strong>{txRefInput}</strong> recorded. Status: <em>Pending Verification</em> by Accountant Almaz Tefera. You can switch to the Accountant role in the top menu to review & approve it immediately.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRecordPayment} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="submit-payment-method" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Payment Channel
                    </label>
                    <select
                      id="submit-payment-method"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full text-xs py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="telebirr">Telebirr Transfer</option>
                      <option value="cbe_birr">CBE Birr</option>
                      <option value="bank_transfer_cbe">Commercial Bank of Ethiopia</option>
                      <option value="cash">Cash at Bole Office Desk</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="submit-payment-amount" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Amount Paid (ETB)
                    </label>
                    <input
                      id="submit-payment-amount"
                      type="number"
                      value={paymentAmountInput}
                      onChange={(e) => setPaymentAmountInput(Number(e.target.value))}
                      className="w-full text-xs py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="submit-payment-txref" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Transaction Reference (TxID)
                    </label>
                    <input
                      id="submit-payment-txref"
                      type="text"
                      value={txRefInput}
                      onChange={(e) => setTxRefInput(e.target.value)}
                      placeholder="e.g. TB99283741 or CBE-FT..."
                      className="w-full text-xs py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                      required
                    />
                  </div>

                  <div className="sm:col-span-3 flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition"
                    >
                      Submit Transaction for Verification
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Next Steps CTA */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setCreatedResult(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Register Another Student</span>
              </button>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('signup');
                    setAuthModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 font-semibold text-xs shadow-xs transition"
                >
                  Activate Student Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentRole('student');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition"
                >
                  Go to Student Portal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentRole('accountant');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-sm transition"
                >
                  Verify as Accountant
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
