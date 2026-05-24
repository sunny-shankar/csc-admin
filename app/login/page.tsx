'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  const [phone, setPhone] = useState('+919876543210');
  const [idToken, setIdToken] = useState('dev:admin-user:Admin User');
  const [name, setName] = useState('Admin User');
  const [loading, setLoading] = useState(false);

  if (hydrated && user) {
    router.replace('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(phone, idToken, name);
      toast.success('Signed in');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F8FA] p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#1A3C5E]">CNC Admin</h1>
          <p className="mt-1 text-sm text-zinc-500">Smart CHD · Civic & Nomination Connect</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-[#2E86AB] focus:ring-1 focus:ring-[#2E86AB]"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Firebase ID Token</label>
            <input
              value={idToken}
              onChange={(e) => setIdToken(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-[#2E86AB] focus:ring-1 focus:ring-[#2E86AB]"
              required
            />
            <p className="mt-1 text-xs text-zinc-500">
              Dev: set AUTH_DEV_BYPASS=true and use dev:uid:name. User must have role=admin in DB.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Display name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-[#2E86AB] focus:ring-1 focus:ring-[#2E86AB]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#1A3C5E] py-2.5 text-sm font-medium text-white hover:bg-[#152f4a] disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-400">
          PRD admin 2FA will be added when backend /auth/admin/* is available.
        </p>
      </div>
    </div>
  );
}
