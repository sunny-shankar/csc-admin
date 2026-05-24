'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { tasksApi } from '@/lib/api';
import { DEFAULT_TASK_REWARD, TASK_DIFFICULTIES } from '@/lib/constants';
import type { TaskDifficulty } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';

const inputClass = 'w-full rounded-lg border px-3 py-2 text-sm';

export default function CreateTaskPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ward, setWard] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxVolunteers, setMaxVolunteers] = useState(20);
  const [difficulty, setDifficulty] = useState<TaskDifficulty>('EASY');
  const [rewardPoints, setRewardPoints] = useState(DEFAULT_TASK_REWARD.EASY);

  const createMutation = useMutation({
    mutationFn: () =>
      tasksApi.create({
        title,
        description: description || null,
        ward,
        startDate,
        endDate,
        maxVolunteers,
        difficulty,
        rewardPoints,
      }),
    onSuccess: (res) => {
      toast.success('Task created');
      router.push(`/tasks/${res.data.id}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onDifficultyChange = (d: TaskDifficulty) => {
    setDifficulty(d);
    setRewardPoints(DEFAULT_TASK_REWARD[d]);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/tasks"
        className="inline-flex items-center gap-2 text-sm text-[#2E86AB] hover:underline"
      >
        <ArrowLeft size={16} />
        Back to tasks
      </Link>

      <PageHeader title="Create task" description="Set up a new volunteer opportunity" />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          createMutation.mutate();
        }}
        className="space-y-4 rounded-xl bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">Title</label>
          <input
            required
            minLength={3}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
            rows={3}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Ward</label>
            <input required value={ward} onChange={(e) => setWard(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => onDifficultyChange(e.target.value as TaskDifficulty)}
              className={inputClass}
            >
              {TASK_DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Start date</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">End date</label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Max volunteers</label>
            <input
              type="number"
              min={1}
              max={500}
              value={maxVolunteers}
              onChange={(e) => setMaxVolunteers(Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Reward points</label>
            <input
              type="number"
              min={1}
              value={rewardPoints}
              onChange={(e) => setRewardPoints(Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full rounded-lg bg-[#1A3C5E] py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {createMutation.isPending ? 'Creating…' : 'Create task'}
        </button>
      </form>
    </div>
  );
}
