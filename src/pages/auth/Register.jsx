import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { gsap } from 'gsap';
import { 
  Sprout, Eye, EyeOff, ChevronLeft, ChevronRight, Check, Bot, 
  ShieldCheck, UploadCloud, AlertCircle, RefreshCw, Sparkles, ArrowLeft,
  X, FileText, Lock
} from 'lucide-react';
import Button from '../../components/common/Button';
import LanguageSelector from '../../components/common/LanguageSelector';
import { STATES_AND_DISTRICTS } from '../../data/locations';

const STEPS = [
  'Create Account',
  'Government Proof Verification',
  'Location',
  'Registration Success'
];

export default function Register() {
  const { signUp } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [aadhaarError, setAadhaarError] = useState('');
  const [fileError, setFileError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const formRef = useRef(null);
  const heroSpeechRef = useRef(null);
  const fileInputRef = useRef(null);

  // Form State
  const [form, setForm] = useState({
    fullName: '',
    phoneOrEmail: '',
    password: '',
    confirmPassword: '',
    proofType: 'Aadhaar',
    aadhaarNumber: '', // raw digits — never logged or stored to localStorage
    proofFile: null,
    proofFileName: '',
    proofVerified: false,
    proofStatus: 'NOT_SUBMITTED', // NOT_SUBMITTED, VERIFYING, VERIFIED, FAILED
    state: 'Tamil Nadu',
    district: 'Thanjavur',
    village: '',
    pincode: ''
  });

  const [heroMessage, setHeroMessage] = useState(
    t('registerWelcomeMessage', 'Hello! I am your Hero AI. I am here to guide you through registration.')
  );

  const updateField = (field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      // If State changes, reset District to first available or empty
      if (field === 'state') {
        const districts = STATES_AND_DISTRICTS[value] || [];
        updated.district = districts[0] || '';
      }
      return updated;
    });
    setError('');
  };

  const highlightField = (fieldId, message) => {
    const el = document.getElementById(fieldId);
    if (el) {
      gsap.fromTo(el, { borderColor: '#DC2626', scale: 1.02 }, { borderColor: '#E2E8F0', scale: 1, duration: 1.5, ease: 'power2.out' });
      el.focus();
    }
    if (message) {
      setHeroMessage(message);
      if (heroSpeechRef.current) {
        gsap.fromTo(heroSpeechRef.current, { scale: 0.9, opacity: 0.5 }, { scale: 1, opacity: 1, duration: 0.3 });
      }
    }
  };

  // Step Validation
  const validateStep = () => {
    switch (step) {
      case 0: // Create Account
        if (!form.fullName.trim()) {
          highlightField('fullName', t('enterNameError', 'Please enter your Full Name.'));
          setError(t('enterNameError', 'Name is required.'));
          return false;
        }
        if (!form.phoneOrEmail.trim()) {
          highlightField('phoneOrEmail', t('enterPhoneEmailError', 'Please enter your Phone or Email.'));
          setError(t('enterPhoneEmailError', 'Phone or Email is required.'));
          return false;
        }
        if (!form.password || form.password.length < 6) {
          highlightField('password', t('passwordLengthError', 'Password must be at least 6 characters.'));
          setError(t('passwordLengthError', 'Password must be at least 6 characters.'));
          return false;
        }
        if (form.password !== form.confirmPassword) {
          highlightField('confirmPassword', t('passwordMismatchError', 'Passwords do not match.'));
          setError(t('passwordMismatchError', 'Passwords do not match.'));
          return false;
        }
        setHeroMessage(t('step1SuccessGuide', 'Great! Now verify your Government Proof.'));
        return true;

      case 1: // Government Proof Verification
        if (!form.proofType) {
          setError(t('selectProofTypeError', 'Please select a Government Proof type.'));
          return false;
        }
        if (form.proofStatus !== 'VERIFIED') {
          setError(t('proofRequiredError', 'Government proof verification is required to proceed.'));
          setHeroMessage(t('verifyProofGuide', "Click 'Verify Proof' to validate your document."));
          return false;
        }
        setHeroMessage(t('step2SuccessGuide', 'Government proof verified! Please provide your location details.'));
        return true;

      case 2: // Location
        if (!form.state) {
          highlightField('state', t('selectStateError', 'Please select your State.'));
          setError(t('selectStateError', 'State is required.'));
          return false;
        }
        if (!form.district) {
          highlightField('district', t('selectDistrictError', 'Please select your District.'));
          setError(t('selectDistrictError', 'District is required.'));
          return false;
        }
        if (!form.village.trim()) {
          highlightField('village', t('enterVillageError', 'Please enter your Village name.'));
          setError(t('enterVillageError', 'Village is required.'));
          return false;
        }
        const pincodeRegex = /^[1-9][0-9]{5}$/;
        if (!pincodeRegex.test(form.pincode.trim())) {
          highlightField('pincode', t('enterPincodeError', 'Pincode must be exactly 6 digits.'));
          setError(t('enterPincodeError', 'Pincode must be exactly 6 digits (e.g. 613001).'));
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const nextStep = async () => {
    if (validateStep()) {
      if (step === 2) {
        // Final Submission to Supabase
        await handleSubmit();
      } else {
        setStep(prev => Math.min(prev + 1, STEPS.length - 1));
      }
    }
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 0));

  // Aadhaar number handler — only digits, max 12, never logged
  const handleAadhaarChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
    setForm(prev => ({ ...prev, aadhaarNumber: digits, proofStatus: 'NOT_SUBMITTED', proofVerified: false }));
    setAadhaarError(digits.length > 0 && digits.length < 12 ? 'Aadhaar number must be exactly 12 digits.' : '');
    setError('');
  };

  // Masked display: XXXX XXXX 1234
  const maskedAadhaar = (num) => {
    if (!num || num.length < 4) return num;
    return `XXXX XXXX ${num.slice(-4)}`;
  };

  // File validation
  const handleFileSelect = (file) => {
    setFileError('');
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setFileError('Unsupported file type. Please upload JPG, PNG, or PDF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size exceeds 5 MB. Please upload a smaller file.');
      return;
    }
    setForm(prev => ({ ...prev, proofFile: file, proofFileName: file.name, proofStatus: 'NOT_SUBMITTED', proofVerified: false }));
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };

  const removeFile = () => {
    setForm(prev => ({ ...prev, proofFile: null, proofFileName: '', proofStatus: 'NOT_SUBMITTED', proofVerified: false }));
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Verify Proof enabled only when Aadhaar is 12 digits AND file uploaded
  const canVerify = form.aadhaarNumber.length === 12 && !!form.proofFile && !fileError;

  // Government Verification Flow
  const handleVerifyProof = () => {
    if (!canVerify) {
      setError('Please enter a valid 12-digit Aadhaar number and upload a document.');
      return;
    }
    setForm(prev => ({ ...prev, proofStatus: 'VERIFYING' }));
    setError('');
    // Simulated secure verification — replace with real backend call
    setTimeout(() => {
      setForm(prev => ({ ...prev, proofStatus: 'VERIFIED', proofVerified: true }));
      setHeroMessage(t('proofVerifiedSuccess', '✓ Government document verified successfully!'));
    }, 1400);
  };

  // Final Registration Submission
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const email = form.phoneOrEmail.includes('@')
        ? form.phoneOrEmail.trim()
        : `${form.phoneOrEmail.replace(/\D/g, '')}@farmer.cropdairy.in`;

      await signUp({
        email,
        password: form.password,
        fullName: form.fullName.trim(),
        phone: form.phoneOrEmail.trim(),
        village: form.village.trim(),
        district: form.district,
        state: form.state,
        pincode: form.pincode.trim(),
        government_id_verified: true,
        proof_type: form.proofType
      });

      navigate('/registration-success', { replace: true });
    } catch (err) {
      if (err.message?.includes('already registered')) {
        setError('An account with this email/phone already exists.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(formRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
    }
  }, [step]);

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors text-sm shadow-2xs";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-900 flex">
      
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 relative overflow-hidden flex-col items-center justify-between p-12 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-white blur-2xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative text-center mt-12">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/30">
            <Sprout className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Crop Dairy</h1>
          <p className="text-emerald-100 mt-3 text-sm font-medium max-w-xs mx-auto">
            Smart Procurement. Less Waiting. Better Decisions.
          </p>
        </div>

        {/* Hero AI Guidance Box */}
        <div ref={heroSpeechRef} className="relative w-full p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-left shadow-lg">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-emerald-200 flex items-center gap-1">
              Hero AI Guide <Sparkles className="w-3 h-3 text-amber-300" />
            </span>
          </div>
          <p className="text-xs text-emerald-50 leading-relaxed font-medium">
            "{heroMessage}"
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-lg">
          
          {/* Logo Mobile */}
          <div className="flex items-center gap-2.5 mb-6 lg:hidden">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white">
              <Sprout className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">Crop Dairy</span>
          </div>

          {/* Back to Portal Selection Link & Language Selector */}
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/portal"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Portal Selection
            </Link>
            <LanguageSelector />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Register Account
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs font-medium">
            Create your Crop Dairy farmer profile in 3 simple steps
          </p>

          {/* 3 Step Indicator */}
          <div className="flex items-center gap-2 mt-6 mb-6">
            {STEPS.slice(0, 3).map((s, i) => (
              <div key={i} className="flex-1 flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step ? 'bg-emerald-600 text-white' :
                  i === step ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-900/40' :
                  'bg-slate-200 dark:bg-surface-700 text-slate-500'
                }`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-[11px] font-bold truncate hidden sm:inline ${i === step ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {s}
                </span>
                {i < 2 && (
                  <div className={`flex-1 h-0.5 ${i < step ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-surface-700'}`} />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div ref={formRef} className="space-y-4">
            
            {/* STEP 0: Create Account */}
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                  <input
                    id="fullName"
                    type="text"
                    value={form.fullName}
                    onChange={e => updateField('fullName', e.target.value)}
                    placeholder="Enter your full name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone or Email *</label>
                  <input
                    id="phoneOrEmail"
                    type="text"
                    value={form.phoneOrEmail}
                    onChange={e => updateField('phoneOrEmail', e.target.value)}
                    placeholder="+91 9876543210 or farmer@example.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password *</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => updateField('password', e.target.value)}
                      placeholder="Min 6 characters"
                      className={`${inputClass} pr-10`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm Password *</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={e => updateField('confirmPassword', e.target.value)}
                    placeholder="Re-enter password"
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {/* STEP 1: Government Proof Verification */}
            {step === 1 && (
              <div className="space-y-5">

                {/* Heading + subtitle */}
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Government Proof Verification</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Verify your government identity document securely to continue registration.</p>
                </div>

                {/* 1. Select Proof Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Proof Type *</label>
                  <select
                    id="proofType"
                    value={form.proofType}
                    onChange={e => { updateField('proofType', e.target.value); setForm(prev => ({ ...prev, proofStatus: 'NOT_SUBMITTED', proofVerified: false })); }}
                    className={inputClass}
                  >
                    <option value="Aadhaar">Aadhaar Card</option>
                  </select>
                </div>

                {/* 2. Aadhaar Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Aadhaar Number *</label>
                  {form.proofStatus === 'VERIFIED' ? (
                    <div className={`${inputClass} text-slate-600 dark:text-slate-300 tracking-widest font-mono`}>
                      {maskedAadhaar(form.aadhaarNumber)}
                    </div>
                  ) : (
                    <input
                      id="aadhaarNumber"
                      type="text"
                      inputMode="numeric"
                      value={form.aadhaarNumber}
                      onChange={handleAadhaarChange}
                      placeholder="Enter 12 digit Aadhaar number"
                      maxLength={12}
                      autoComplete="off"
                      className={`${inputClass} tracking-widest font-mono ${aadhaarError ? 'border-red-400 focus:ring-red-400' : ''}`}
                    />
                  )}
                  {aadhaarError && (
                    <p className="mt-1 text-[11px] text-red-600 dark:text-red-400 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />{aadhaarError}
                    </p>
                  )}
                  {form.aadhaarNumber.length === 12 && !aadhaarError && form.proofStatus !== 'VERIFIED' && (
                    <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">✓ 12 digits entered</p>
                  )}
                </div>

                {/* 3. Document Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Upload Government Proof *</label>

                  {!form.proofFile ? (
                    <div
                      onDragEnter={e => { e.preventDefault(); setDragActive(true); }}
                      onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                      onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                        dragActive
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                          : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-surface-800 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10'
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <UploadCloud className={`w-8 h-8 mx-auto mb-2 ${ dragActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Drag and drop your Aadhaar document here</p>
                      <p className="text-xs text-slate-400 my-1.5">or</p>
                      <span className="inline-block px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-sm hover:bg-emerald-700 transition-colors">
                        Choose File
                      </span>
                      <p className="mt-3 text-[11px] text-slate-400">Supported formats: JPG, PNG, PDF &nbsp;·&nbsp; Maximum size: 5 MB</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{form.proofFileName}</span>
                        <span className="text-[11px] text-emerald-600 font-bold flex-shrink-0">✓ Uploaded</span>
                      </div>
                      {form.proofStatus !== 'VERIFIED' && (
                        <button type="button" onClick={removeFile} className="ml-2 p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    className="hidden"
                    onChange={e => handleFileSelect(e.target.files?.[0])}
                  />

                  {fileError && (
                    <p className="mt-1.5 text-[11px] text-red-600 dark:text-red-400 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />{fileError}
                    </p>
                  )}
                </div>

                {/* 4. Compact Verification Status */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-surface-700">
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block mb-0.5">Verification Status:</span>
                    {form.proofStatus === 'NOT_SUBMITTED' && !canVerify && (
                      <span className="text-xs font-bold text-slate-400">Not Submitted</span>
                    )}
                    {form.proofStatus === 'NOT_SUBMITTED' && canVerify && (
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Ready for Verification</span>
                    )}
                    {form.proofStatus === 'VERIFYING' && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying...
                      </span>
                    )}
                    {form.proofStatus === 'VERIFIED' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                        <Check className="w-3.5 h-3.5" /> Verified
                      </span>
                    )}
                    {form.proofStatus === 'FAILED' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600">
                        <AlertCircle className="w-3.5 h-3.5" /> Verification Failed
                      </span>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={handleVerifyProof}
                    disabled={!canVerify || form.proofStatus === 'VERIFIED' || form.proofStatus === 'VERIFYING'}
                    className={`text-xs px-4 py-2 flex-shrink-0 ${
                      form.proofStatus === 'VERIFIED'
                        ? 'bg-emerald-600 text-white'
                        : !canVerify || form.proofStatus === 'VERIFYING'
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                          : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800'
                    }`}
                  >
                    {form.proofStatus === 'VERIFIED' ? 'Verified ✓' : 'Verify Proof'}
                  </Button>
                </div>

                {/* 5. Security note */}
                <p className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  <Lock className="w-3 h-3 flex-shrink-0" />
                  Your government proof information is securely handled and protected.
                </p>

              </div>
            )}

            {/* STEP 2: Location Details */}
            {step === 2 && (
              <div className="space-y-4">
                {/* State Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">State *</label>
                  <select
                    id="state"
                    value={form.state}
                    onChange={e => updateField('state', e.target.value)}
                    className={inputClass}
                  >
                    {Object.keys(STATES_AND_DISTRICTS).map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                {/* Cascading District Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">District *</label>
                  <select
                    id="district"
                    value={form.district}
                    onChange={e => updateField('district', e.target.value)}
                    className={inputClass}
                  >
                    {(STATES_AND_DISTRICTS[form.state] || []).map(dt => (
                      <option key={dt} value={dt}>{dt}</option>
                    ))}
                  </select>
                </div>

                {/* Village */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Village *</label>
                  <input
                    id="village"
                    type="text"
                    value={form.village}
                    onChange={e => updateField('village', e.target.value)}
                    placeholder="Enter village name"
                    className={inputClass}
                  />
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pincode *</label>
                  <input
                    id="pincode"
                    type="text"
                    maxLength={6}
                    value={form.pincode}
                    onChange={e => updateField('pincode', e.target.value.replace(/\D/g, ''))}
                    placeholder="601301"
                    className={inputClass}
                  />
                </div>
              </div>
            )}

          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-between mt-8">
            {step > 0 ? (
              <Button variant="ghost" onClick={prevStep} className="text-xs">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            ) : (
              <div />
            )}

            <Button
              onClick={nextStep}
              loading={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 text-xs"
            >
              {step === 2 ? (
                'Submit Registration'
              ) : (
                <>Next <ChevronRight className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-bold">
              Login
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}
