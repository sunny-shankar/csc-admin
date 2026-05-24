import { uploadsApi, usersApi } from '@/lib/api';
import type { UserProfile } from '@/lib/types';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 4 * 1024 * 1024;

export function validateAvatarFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return 'Photo must be JPEG, PNG, or WebP';
  }
  if (file.size > MAX_BYTES) {
    return 'Photo must be 4 MB or smaller';
  }
  return null;
}

export async function uploadProfilePhoto(file: File): Promise<UserProfile> {
  const contentType = file.type as 'image/jpeg' | 'image/png' | 'image/webp';
  const { data: presign } = await usersApi.presignProfilePhoto({
    contentType,
    fileName: file.name,
  });

  const putRes = await fetch(presign.uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': contentType },
  });

  if (!putRes.ok) {
    throw new Error('Could not upload photo. Try again.');
  }

  await uploadsApi.confirm({ key: presign.key, purpose: 'avatar' });
  const { data: profile } = await usersApi.me();
  return profile;
}
