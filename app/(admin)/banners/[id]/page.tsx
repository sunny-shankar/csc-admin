'use client';

import { use, useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Archive, ExternalLink, ImagePlus, RotateCcw } from 'lucide-react';
import { bannersApi } from '@/lib/api';
import { uploadBannerImage, validateBannerImageFile } from '@/lib/bannerImageUpload';
import { formatDateTime } from '@/lib/format';
import { DetailGrid } from '@/components/ui/DetailGrid';
import { BackLink } from '@/components/ui/BackLink';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function BannerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bannerQuery = useQuery({
    queryKey: ['banner', id],
    queryFn: () => bannersApi.get(id),
  });

  const banner = bannerQuery.data?.data;

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [sequence, setSequence] = useState(0);
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!banner) return;
    setTitle(banner.title);
    setUrl(banner.url);
    setSequence(banner.sequence);
    setImageKey(banner.imageKey);
    setImagePreview(banner.imageUrl ?? null);
  }, [banner]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['banner', id] });
    queryClient.invalidateQueries({ queryKey: ['banners'] });
  };

  const updateMutation = useMutation({
    mutationFn: () =>
      bannersApi.update(id, {
        title,
        url,
        sequence,
        ...(imageKey && imageKey !== banner?.imageKey ? { imageKey } : {}),
      }),
    onSuccess: () => {
      toast.success('Banner updated');
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const archiveMutation = useMutation({
    mutationFn: () => bannersApi.archive(id),
    onSuccess: () => {
      toast.success('Banner archived');
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const activateMutation = useMutation({
    mutationFn: () => bannersApi.activate(id),
    onSuccess: () => {
      toast.success('Banner activated');
      invalidate();
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
      const { key, viewUrl } = await uploadBannerImage(file, id);
      setImageKey(key);
      setImagePreview(viewUrl || URL.createObjectURL(file));
      toast.success('Image uploaded — save to apply');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (bannerQuery.isLoading) return <LoadingSpinner />;

  if (!banner) {
    return (
      <div className="space-y-4">
        <BackLink href="/banners">Back to banners</BackLink>
        <p className="text-sm text-neutral-500">Banner not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackLink href="/banners">Back to banners</BackLink>

      <PageHeader
        title={banner.title}
        description={`Sequence ${banner.sequence}`}
        action={
          banner.status === 'ACTIVE' ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => archiveMutation.mutate()}
              disabled={archiveMutation.isPending}
            >
              <Archive size={16} />
              Archive
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => activateMutation.mutate()}
              disabled={activateMutation.isPending}
            >
              <RotateCcw size={16} />
              Activate
            </Button>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <p className="section-head">Preview</p>
          <div className="mt-4">
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagePreview}
                alt={banner.title}
                className="w-full rounded-md border border-neutral-200 object-cover"
              />
            ) : (
              <p className="text-sm text-neutral-400">No image</p>
            )}
          </div>
          <div className="mt-4 border-t border-[var(--border)] pt-4">
            <DetailGrid
              rows={[
                {
                  label: 'Status',
                  value: <StatusBadge variant="taskStatus" value={banner.status} />,
                },
                {
                  label: 'Link',
                  value: (
                    <a
                      href={banner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:underline"
                    >
                      Open
                      <ExternalLink size={12} />
                    </a>
                  ),
                },
                { label: 'Created', value: formatDateTime(banner.createdAt) },
                { label: 'Updated', value: formatDateTime(banner.updatedAt) },
              ]}
            />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <p className="section-head">Edit banner</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateMutation.mutate();
            }}
            className="mt-6 space-y-4"
          >
            <Field label="Title">
              <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="URL">
              <Input
                required
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
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
            <Field label="Image">
              <div className="space-y-2">
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
                  {uploading ? 'Uploading…' : 'Replace image'}
                </Button>
              </div>
            </Field>
            <Button type="submit" disabled={updateMutation.isPending || uploading}>
              {updateMutation.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
