'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { ConfirmationResult } from 'firebase/auth';
import type { RecaptchaVerifier } from 'firebase/auth';
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
import { Field, Input, InputGroup } from '@/components/ui/Input';

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

  useEffect(() => {
    if (hydrated && user) {
      router.replace('/dashboard');
    }
  }, [hydrated, user, router]);

  if (hydrated && user) {
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
      toast.error('Firebase is not configured');
      return;
    }
    setLoading(true);
    try {
      const phone = normalizeIndianPhone(phoneDigits);
      normalizedPhoneRef.current = phone;
      confirmationRef.current = await sendPhoneOtp(phone, ensureRecaptcha());
      setStep('otp');
      toast.success('OTP sent');
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
    if (!confirmationRef.current) return;
    setLoading(true);
    try {
      const idToken = await verifyPhoneOtp(confirmationRef.current, otp);
      await login(normalizedPhoneRef.current, idToken);
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
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--gray-50)] p-4">
      <div className="card w-full max-w-[380px] p-8">
        <div className="mb-6 text-center">
          <p className="text-[13px] font-semibold text-[var(--gray-900)]">CNC Admin</p>
          <p className="mt-1 text-[12px] text-[var(--text-secondary)]">Sign in to continue</p>
        </div>

        {isFirebaseConfigured ? (
          step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <Field label="Mobile number" required>
                <InputGroup prefix="+91">
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    className="input-group-field"
                    value={phoneDigits}
                    onChange={(e) => setPhoneDigits(phoneDigitsForInput(e.target.value))}
                    maxLength={10}
                    placeholder="9876543210"
                    required
                  />
                </InputGroup>
              </Field>
              <Button type="submit" className="w-full" disabled={loading || phoneDigits.length !== 10}>
                {loading ? 'Sending…' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-[12px] text-[var(--text-secondary)]">
                OTP sent to {normalizedPhoneRef.current}
              </p>
              <Field label="One-time password" required>
                <Input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="text-center text-lg tracking-[0.35em]"
                  required
                />
              </Field>
              <Button type="submit" className="w-full" disabled={loading || otp.length < 6}>
                {loading ? 'Verifying…' : 'Login'}
              </Button>
              <button
                type="button"
                onClick={resetOtpFlow}
                className="w-full text-[12px] text-[var(--text-secondary)] hover:text-[var(--gray-900)]"
              >
                Change number
              </button>
            </form>
          )
        ) : (
          <p className="text-center text-[13px] text-[var(--text-secondary)]">
            Configure Firebase in .env.local
          </p>
        )}

        <div id={RECAPTCHA_ID} />

        {DEV_BYPASS && (
          <div className="mt-6 border-t border-[var(--border)] pt-4">
            <button
              type="button"
              onClick={() => setShowDevLogin((v) => !v)}
              className="text-[11px] text-[var(--text-muted)] hover:text-[var(--gray-700)]"
            >
              {showDevLogin ? 'Hide dev login' : 'Dev login'}
            </button>
            {showDevLogin && (
              <form onSubmit={handleDevLogin} className="mt-2 space-y-2">
                <Input value={devPhone} onChange={(e) => setDevPhone(e.target.value)} />
                <Input value={devIdToken} onChange={(e) => setDevIdToken(e.target.value)} />
                <Button type="submit" variant="secondary" className="w-full" size="sm" disabled={loading}>
                  Dev sign in
                </Button>
              </form>
            )}
          </div>
        )}

        <p className="mt-6 text-center text-[11px] text-[var(--text-muted)]">
          Chandigarh Municipal Corporation
        </p>
      </div>
    </div>
  );
}
