'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ImagePlus, X } from 'lucide-react';
import { bannersApi } from '@/lib/api';
import { uploadBannerImage, validateBannerImageFile } from '@/lib/bannerImageUpload';
import { BackLink } from '@/components/ui/BackLink';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Input';

type PendingImage = {
  key: string;
  viewUrl?: string;
  previewUrl: string;
};

export default function CreateBannerPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [sequence, setSequence] = useState(0);
  const [image, setImage] = useState<PendingImage | null>(null);
  const [uploading, setUploading] = useState(false);

  const createMutation = useMutation({
    mutationFn: () => {
      if (!image) throw new Error('Please upload a banner image');
      return bannersApi.create({
        title,
        url,
        sequence,
        imageKey: image.key,
      });
    },
    onSuccess: (res) => {
      if (image) URL.revokeObjectURL(image.previewUrl);
      toast.success('Banner created');
      router.push(`/banners/${res.data.id}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onFileSelected = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    const err = validateBannerImageFile(file);
    if (err) {
      toast.error(err);
      return;
    }

    setUploading(true);
    try {
      const previewUrl = URL.createObjectURL(file);
      const { key, viewUrl } = await uploadBannerImage(file);
      if (image) URL.revokeObjectURL(image.previewUrl);
      setImage({ key, viewUrl, previewUrl });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = () => {
    if (image) URL.revokeObjectURL(image.previewUrl);
    setImage(null);
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <BackLink href="/banners">Back to banners</BackLink>

      <Card>
        <p className="section-head">New banner</p>
        <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
          App carousel banner with image, title, link, and display order
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="mt-6 space-y-4"
        >
          <Field label="Title">
            <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="URL" hint="Link opened when the banner is tapped">
            <Input
              required
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </Field>
          <Field label="Sequence" hint="Lower numbers appear first">
            <Input
              type="number"
              min={0}
              max={9999}
              required
              value={sequence}
              onChange={(e) => setSequence(Number(e.target.value))}
            />
          </Field>

          <Field label="Image" hint="JPEG, PNG, or WebP (max 4 MB)">
            <div className="space-y-3">
              {image ? (
                <div className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.viewUrl || image.previewUrl}
                    alt=""
                    className="h-36 w-full max-w-md rounded-md border border-neutral-200 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                    aria-label="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => onFileSelected(e.target.files)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus size={16} />
                    {uploading ? 'Uploading…' : 'Upload image'}
                  </Button>
                </>
              )}
            </div>
          </Field>

          <Button
            type="submit"
            className="w-full"
            disabled={createMutation.isPending || uploading || !image}
          >
            {createMutation.isPending ? 'Creating…' : 'Create banner'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
