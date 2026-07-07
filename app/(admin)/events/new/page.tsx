'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ImagePlus, X } from 'lucide-react';
import { eventsApi } from '@/lib/api';
import { uploadEventImage, validateEventImageFile } from '@/lib/eventImageUpload';
import { BackLink } from '@/components/ui/BackLink';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Input, Textarea } from '@/components/ui/Input';

type PendingImage = {
  key: string;
  viewUrl?: string;
  previewUrl: string;
};

export default function CreateEventPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [images, setImages] = useState<PendingImage[]>([]);
  const [uploading, setUploading] = useState(false);

  const createMutation = useMutation({
    mutationFn: () =>
      eventsApi.create({
        title,
        description: description || null,
        latitude: latitude.trim() ? Number(latitude) : null,
        longitude: longitude.trim() ? Number(longitude) : null,
        imageKeys: images.map((img) => img.key),
      }),
    onSuccess: (res) => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      toast.success('Event created');
      router.push(`/events/${res.data.id}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onFilesSelected = async (files: FileList | null) => {
    if (!files?.length) return;
    if (images.length + files.length > 10) {
      toast.error('Maximum 10 images per event');
      return;
    }

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const err = validateEventImageFile(file);
        if (err) {
          toast.error(err);
          continue;
        }
        const previewUrl = URL.createObjectURL(file);
        const { key, viewUrl } = await uploadEventImage(file);
        setImages((prev) => [...prev, { key, viewUrl, previewUrl }]);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (key: string) => {
    setImages((prev) => {
      const removed = prev.find((img) => img.key === key);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((img) => img.key !== key);
    });
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <BackLink href="/events">Back to events</BackLink>

      <Card>
        <p className="section-head">New event</p>
        <p className="mt-1 text-[12px] text-[var(--text-secondary)]">Community event details</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="mt-6 space-y-4"
        >
          <Field label="Title">
            <Input required minLength={3} value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Description">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Latitude (optional)" hint="Set with longitude for map location">
              <Input
                type="number"
                step="any"
                min={-90}
                max={90}
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="30.7333"
              />
            </Field>
            <Field label="Longitude (optional)">
              <Input
                type="number"
                step="any"
                min={-180}
                max={180}
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="76.7794"
              />
            </Field>
          </div>

          <Field label="Images" hint="Up to 10 images (JPEG, PNG, or WebP)">
            <div className="space-y-3">
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img) => (
                    <div key={img.key} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.viewUrl || img.previewUrl}
                        alt=""
                        className="h-24 w-full rounded-md border border-neutral-200 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(img.key)}
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                        aria-label="Remove image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {images.length < 10 && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={(e) => onFilesSelected(e.target.files)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus size={16} />
                    {uploading ? 'Uploading…' : 'Add images'}
                  </Button>
                </>
              )}
            </div>
          </Field>

          <Button
            type="submit"
            className="w-full"
            disabled={createMutation.isPending || uploading}
          >
            {createMutation.isPending ? 'Creating…' : 'Create event'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
