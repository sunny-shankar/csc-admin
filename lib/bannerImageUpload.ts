import { bannersApi, uploadsApi } from '@/lib/api';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 4 * 1024 * 1024;

export function validateBannerImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return 'Image must be JPEG, PNG, or WebP';
  }
  if (file.size > MAX_BYTES) {
    return 'Image must be 4 MB or smaller';
  }
  return null;
}

export async function uploadBannerImage(
  file: File,
  bannerId?: string,
): Promise<{ key: string; viewUrl?: string }> {
  const contentType = file.type as 'image/jpeg' | 'image/png' | 'image/webp';
  const { data: presign } = await bannersApi.presignImage({
    contentType,
    fileName: file.name,
    bannerId,
  });

  const putRes = await fetch(presign.uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': contentType },
  });

  if (!putRes.ok) {
    throw new Error('Could not upload image. Try again.');
  }

  const { data: confirmed } = await uploadsApi.confirm({
    key: presign.key,
    purpose: 'banner',
    ...(bannerId ? { bannerId } : {}),
  });

  return { key: confirmed.key, viewUrl: confirmed.viewUrl };
}
