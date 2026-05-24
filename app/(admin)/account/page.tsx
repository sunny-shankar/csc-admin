'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { validateName } from '@/lib/validation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { DetailGrid } from '@/components/ui/DetailGrid';
import { ProfilePhotoUpload } from '@/components/account/ProfilePhotoUpload';
import { formatDateTime } from '@/lib/format';
import type { AuthUser, UserProfile } from '@/lib/types';
import { cn } from '@/lib/cn';

function syncAuthUser(profile: UserProfile, setUser: (user: AuthUser) => void) {
  setUser({
    id: profile.id,
    name: profile.name,
    phone: profile.phone,
    ward: profile.ward,
    sectorNo: profile.sectorNo,
    role: profile.role,
    profilePhoto: profile.profilePhoto,
    profilePhotoUrl: profile.profilePhotoUrl,
    profileComplete: profile.profileComplete,
  });
}

export default function AccountPage() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const sessionUser = useAuthStore((s) => s.user);

  const [name, setName] = useState('');
  const [ward, setWard] = useState('');
  const [sectorNo, setSectorNo] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameTouched, setNameTouched] = useState(false);

  const profileQuery = useQuery({
    queryKey: ['me'],
    queryFn: () => usersApi.me(),
  });

  const profile = profileQuery.data?.data;

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setWard(profile.ward ?? '');
      setSectorNo(profile.sectorNo ?? '');
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: () =>
      usersApi.updateMe({
        name: name.trim(),
        ward: ward.trim() || null,
        sectorNo: sectorNo.trim() || null,
      }),
    onSuccess: (res) => {
      toast.success('Profile updated');
      queryClient.setQueryData(['me'], res);
      syncAuthUser(res.data, setUser);
      setNameTouched(false);
      setNameError(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handlePhotoUpdated = (updated: UserProfile) => {
    queryClient.setQueryData(['me'], { data: updated });
    syncAuthUser(updated, setUser);
  };

  if (profileQuery.isLoading) return <LoadingSpinner label="Loading profile…" />;

  if (profileQuery.isError || !profile) {
    return (
      <p className="text-[13px] text-[var(--text-secondary)]">
        Could not load your profile. Try refreshing the page.
      </p>
    );
  }

  const displayName = name.trim() || profile.name;
  const showNameError = nameTouched && nameError;

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Card>
        <div className="flex items-center gap-4 pb-1">
          <ProfilePhotoUpload
            name={displayName}
            photoUrl={profile.profilePhotoUrl}
            onUpdated={handlePhotoUpdated}
          />
          <div>
            <p className="text-[15px] font-semibold text-[var(--gray-900)]">{profile.name}</p>
            <p className="text-[13px] text-[var(--text-secondary)]">{profile.phone ?? sessionUser?.phone}</p>
            <p className="mt-0.5 text-[12px] capitalize text-[var(--text-muted)]">{profile.role} account</p>
          </div>
        </div>
      </Card>

      <Card>
        <p className="section-head">Edit profile</p>
        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setNameTouched(true);
            const err = validateName(name);
            setNameError(err);
            if (err) return;
            saveMutation.mutate();
          }}
        >
          <Field label="Full name" required error={showNameError ? nameError : null}>
            <Input
              value={name}
              onChange={(e) => {
                const next = e.target.value;
                setName(next);
                if (nameTouched) setNameError(validateName(next));
              }}
              onBlur={() => {
                setNameTouched(true);
                setNameError(validateName(name));
              }}
              required
              maxLength={255}
              autoComplete="name"
              aria-invalid={showNameError ? true : undefined}
              className={cn(showNameError && 'input-invalid')}
            />
          </Field>
          <Field label="Phone" hint="Phone is tied to your login and cannot be changed here.">
            <Input value={profile.phone ?? ''} readOnly />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ward">
              <Input value={ward} onChange={(e) => setWard(e.target.value)} maxLength={100} />
            </Field>
            <Field label="Sector">
              <Input value={sectorNo} onChange={(e) => setSectorNo(e.target.value)} maxLength={20} />
            </Field>
          </div>
          <Button type="submit" className="w-full sm:w-auto" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </Card>

      <Card>
        <p className="section-head">Account info</p>
        <div className="mt-4">
          <DetailGrid
            rows={[
              { label: 'Profile complete', value: profile.profileComplete ? 'Yes' : 'No' },
              { label: 'Total points', value: profile.totalPoints?.toLocaleString() ?? '0' },
              { label: 'Last active', value: formatDateTime(profile.lastActiveAt) },
              { label: 'Member since', value: formatDateTime(profile.createdAt) },
            ]}
          />
        </div>
      </Card>
    </div>
  );
}
