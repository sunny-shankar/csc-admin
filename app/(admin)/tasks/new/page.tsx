'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { tasksApi } from '@/lib/api';
import { DEFAULT_TASK_REWARD, TASK_DIFFICULTIES } from '@/lib/constants';
import type { TaskDifficulty } from '@/lib/types';
import { BackLink } from '@/components/ui/BackLink';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Input, Select, Textarea } from '@/components/ui/Input';

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
    <div className="mx-auto max-w-xl space-y-6">
      <BackLink href="/tasks">Back to tasks</BackLink>

      <Card>
        <p className="section-head">New task</p>
        <p className="mt-1 text-[12px] text-[var(--text-secondary)]">Volunteer opportunity details</p>

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
            <Field label="Ward">
              <Input required value={ward} onChange={(e) => setWard(e.target.value)} />
            </Field>
            <Field label="Difficulty">
              <Select
                value={difficulty}
                onChange={(e) => onDifficultyChange(e.target.value as TaskDifficulty)}
              >
                {TASK_DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start date">
              <Input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Field>
            <Field label="End date">
              <Input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Max volunteers">
              <Input
                type="number"
                min={1}
                max={500}
                value={maxVolunteers}
                onChange={(e) => setMaxVolunteers(Number(e.target.value))}
              />
            </Field>
            <Field label="Reward points">
              <Input
                type="number"
                min={1}
                value={rewardPoints}
                onChange={(e) => setRewardPoints(Number(e.target.value))}
              />
            </Field>
          </div>
          <Button type="submit" className="w-full" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating…' : 'Create task'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
