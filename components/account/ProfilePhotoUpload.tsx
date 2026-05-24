'use client';

import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadProfilePhoto, validateAvatarFile } from '@/lib/avatarUpload';
import { userInitials } from '@/lib/userDisplay';
import type { UserProfile } from '@/lib/types';

interface ProfilePhotoUploadProps {
  name: string;
  photoUrl?: string | null;
  onUpdated: (profile: UserProfile) => void;
}

export function ProfilePhotoUpload({ name, photoUrl, onUpdated }: ProfilePhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const displayUrl = previewUrl ?? photoUrl ?? null;

  const handleFile = async (file: File) => {
    const err = validateAvatarFile(file);
    if (err) {
      toast.error(err);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploading(true);

    try {
      const profile = await uploadProfilePhoto(file);
      setPreviewUrl(null);
      onUpdated(profile);
      toast.success('Profile photo updated');
    } catch (e) {
      setPreviewUrl(null);
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      URL.revokeObjectURL(objectUrl);
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="relative shrink-0">
      {displayUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={displayUrl}
          alt=""
          className="h-14 w-14 rounded-full border border-[var(--border)] object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--gray-100)] text-base font-semibold text-[var(--gray-700)]">
          {userInitials(name)}
        </div>
      )}
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--gray-700)] shadow-sm transition hover:bg-[var(--gray-50)] disabled:opacity-60"
        aria-label="Change profile photo"
      >
        <Camera size={14} strokeWidth={1.75} />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      {uploading ? (
        <p className="absolute -bottom-5 left-0 whitespace-nowrap text-[11px] text-[var(--text-muted)]">
          Uploading…
        </p>
      ) : null}
    </div>
  );
}
