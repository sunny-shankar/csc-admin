import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  type ConfirmationResult,
} from 'firebase/auth';
import { getFirebaseAuth } from './client';

export type { ConfirmationResult };

export function createRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  const auth = getFirebaseAuth();
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
  });
}

export async function sendPhoneOtp(
  phone: string,
  verifier: RecaptchaVerifier,
): Promise<ConfirmationResult> {
  const auth = getFirebaseAuth();
  return signInWithPhoneNumber(auth, phone, verifier);
}

export async function verifyPhoneOtp(
  confirmation: ConfirmationResult,
  code: string,
): Promise<string> {
  const result = await confirmation.confirm(code.trim());
  return result.user.getIdToken();
}

export async function signOutFirebase(): Promise<void> {
  try {
    const auth = getFirebaseAuth();
    if (auth.currentUser) {
      await signOut(auth);
    }
  } catch {
    /* ignore when Firebase is not initialized */
  }
}

export function clearRecaptchaVerifier(verifier: RecaptchaVerifier | null): void {
  try {
    verifier?.clear();
  } catch {
    /* ignore */
  }
}
