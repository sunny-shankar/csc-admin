'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { ConfirmationResult } from 'firebase/auth';
import type { RecaptchaVerifier } from 'firebase/auth';
import { Shield, Phone, KeyRound } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import {
  clearRecaptchaVerifier,
  createRecaptchaVerifier,
  sendPhoneOtp,
  verifyPhoneOtp,
} from '@/lib/firebase/phoneAuth';
import { normalizeIndianPhone, phoneDigitsForInput } from '@/lib/phone';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

const DEV_BYPASS = process.env.NEXT_PUBLIC_AUTH_DEV_BYPASS === 'true';
const RECAPTCHA_ID = 'firebase-recaptcha';

type Step = 'phone' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  const [step, setStep] = useState<Step>('phone');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDevLogin, setShowDevLogin] = useState(DEV_BYPASS);

  const [devPhone, setDevPhone] = useState('+919876543210');
  const [devIdToken, setDevIdToken] = useState('dev:admin-user:Admin User');
  const [devName, setDevName] = useState('Admin User');

  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const normalizedPhoneRef = useRef('');

  useEffect(() => {
    return () => {
      clearRecaptchaVerifier(recaptchaRef.current);
      recaptchaRef.current = null;
    };
  }, []);

  if (hydrated && user) {
    router.replace('/dashboard');
    return null;
  }

  const resetOtpFlow = () => {
    confirmationRef.current = null;
    clearRecaptchaVerifier(recaptchaRef.current);
    recaptchaRef.current = null;
    setOtp('');
    setStep('phone');
  };

  const ensureRecaptcha = () => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = createRecaptchaVerifier(RECAPTCHA_ID);
    }
    return recaptchaRef.current;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured) {
      toast.error('Firebase is not configured in .env.local');
      return;
    }

    setLoading(true);
    try {
      const phone = normalizeIndianPhone(phoneDigits);
      normalizedPhoneRef.current = phone;
      const verifier = ensureRecaptcha();
      confirmationRef.current = await sendPhoneOtp(phone, verifier);
      setStep('otp');
      toast.success('OTP sent to your phone');
    } catch (err) {
      clearRecaptchaVerifier(recaptchaRef.current);
      recaptchaRef.current = null;
      toast.error(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationRef.current) {
      toast.error('Request a new OTP first');
      return;
    }

    setLoading(true);
    try {
      const idToken = await verifyPhoneOtp(confirmationRef.current, otp);
      await login(normalizedPhoneRef.current, idToken);
      toast.success('Signed in');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(devPhone, devIdToken, devName);
      toast.success('Signed in');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-bg flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-[#1A3C5E] via-[#1e4970] to-[#122a42] p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
            <Shield size={22} className="text-[#7ec8e3]" />
          </div>
          <div>
            <p className="text-lg font-semibold">CNC Admin</p>
            <p className="text-xs text-white/60">Smart CHD · Civic Connect</p>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Manage civic reports,
            <br />
            volunteers & community.
          </h1>
          <p className="max-w-md text-base leading-relaxed text-white/70">
            Secure admin access for Chandigarh civic operations — review reports, manage tasks,
            and track engagement across wards.
          </p>
          <div className="grid max-w-md gap-3 sm:grid-cols-2">
            {['Report moderation', 'Task management', 'User oversight', 'Leaderboards'].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-xl bg-white/5 px-4 py-3 text-sm ring-1 ring-white/10"
                >
                  {item}
                </div>
              ),
            )}
          </div>
        </div>

        <p className="text-xs text-white/40">Chandigarh Municipal Corporation · Admin Portal</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md animate-fade-in" padding="lg">
          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1A3C5E]/10 text-[#1A3C5E] lg:hidden">
              <Shield size={24} />
            </div>
            <h2 className="text-2xl font-bold text-[#1A3C5E]">Welcome back</h2>
            <p className="mt-1 text-sm text-slate-500">Sign in with your admin phone number</p>
          </div>

          {isFirebaseConfigured ? (
            step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <Field label="Mobile number" hint="Admin account must have role=admin in the database.">
                  <div className="flex overflow-hidden rounded-[0.625rem] border border-slate-200 focus-within:border-[#2E86AB] focus-within:ring-[3px] focus-within:ring-[#2E86AB]/15">
                    <span className="flex items-center bg-slate-50 px-3 text-sm font-medium text-slate-600">
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="9876543210"
                      value={phoneDigits}
                      onChange={(e) => setPhoneDigits(phoneDigitsForInput(e.target.value))}
                      maxLength={10}
                      className="w-full px-3 py-2.5 text-sm outline-none"
                      required
                    />
                  </div>
                </Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || phoneDigits.length !== 10}
                >
                  <Phone size={16} />
                  {loading ? 'Sending OTP…' : 'Send OTP'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  OTP sent to{' '}
                  <span className="font-semibold text-slate-800">{normalizedPhoneRef.current}</span>
                </p>
                <Field label="Enter OTP">
                  <Input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="tracking-[0.3em]"
                    required
                  />
                </Field>
                <Button type="submit" className="w-full" disabled={loading || otp.length < 6}>
                  <KeyRound size={16} />
                  {loading ? 'Verifying…' : 'Verify & sign in'}
                </Button>
                <button
                  type="button"
                  onClick={resetOtpFlow}
                  className="w-full text-sm font-medium text-[#2E86AB] hover:underline"
                >
                  Change phone number
                </button>
              </form>
            )
          ) : (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-100">
              Firebase env vars are missing. Add them to <code>.env.local</code> or use dev login
              below.
            </p>
          )}

          <div id={RECAPTCHA_ID} />

          {DEV_BYPASS && (
            <div className="mt-8 border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={() => setShowDevLogin((v) => !v)}
                className="text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                {showDevLogin ? 'Hide' : 'Show'} dev login
              </button>
              {showDevLogin && (
                <form onSubmit={handleDevLogin} className="mt-4 space-y-3">
                  <Input value={devPhone} onChange={(e) => setDevPhone(e.target.value)} placeholder="Phone" />
                  <Input
                    value={devIdToken}
                    onChange={(e) => setDevIdToken(e.target.value)}
                    placeholder="dev:uid:name"
                  />
                  <Input
                    value={devName}
                    onChange={(e) => setDevName(e.target.value)}
                    placeholder="Display name"
                  />
                  <Button type="submit" variant="outline" className="w-full" disabled={loading}>
                    Dev sign in
                  </Button>
                </form>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
