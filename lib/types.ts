export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  phone?: string;
  ward?: string;
  role: UserRole;
  profilePhoto?: string | null;
  profilePhotoUrl?: string | null;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginatedMeta;
  error?: { code: string; message: string };
}

export type ReportStatus =
  | 'PENDING'
  | 'IN_REVIEW'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED';

export interface Report {
  id: string;
  reportCode: string;
  status: ReportStatus;
  category: string;
  subcategory?: string | null;
  latitude: number;
  longitude: number;
  address?: string | null;
  photoKey: string;
  photoUrl?: string | null;
  description?: string | null;
  pointsAwarded: number;
  createdAt: string;
  updatedAt?: string;
  submitter?: {
    id: string;
    name: string;
    ward?: string;
    phone?: string;
  };
  statusHistory?: StatusHistoryEntry[];
}

export interface StatusHistoryEntry {
  id: string;
  oldStatus: string | null;
  newStatus: string;
  note?: string | null;
  changedByName?: string;
  createdAt: string;
}

export type TaskDifficulty = 'EASY' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
export type ProofStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  ward: string;
  startDate: string;
  endDate: string;
  maxVolunteers: number;
  rewardPoints: number;
  difficulty: TaskDifficulty;
  status: TaskStatus;
  volunteerCount: number;
  slotsRemaining: number;
  createdAt: string;
  updatedAt?: string;
}

export interface TaskVolunteer {
  id: string;
  taskId?: string;
  userId?: string;
  proofStatus: ProofStatus;
  beforePhotoKey?: string | null;
  afterPhotoKey?: string | null;
  beforePhotoUrl?: string | null;
  afterPhotoUrl?: string | null;
  rejectionReason?: string | null;
  nominatedAt: string;
  user?: {
    id: string;
    name: string;
    ward?: string;
    phone?: string;
  };
}

export interface AdminUser {
  id: string;
  name: string;
  phone?: string | null;
  ward?: string | null;
  sectorNo?: string | null;
  profilePhoto?: string | null;
  profilePhotoUrl?: string | null;
  totalPoints: number;
  badgeIds?: string[];
  streakCount?: number;
  profileComplete?: boolean;
  reportCount?: number;
  isBanned: boolean;
  banReason?: string | null;
  role: UserRole;
  lastActiveAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  ward?: string;
  points: number;
  badgeIds: string[];
}

export interface LeaderboardResponse {
  month: string;
  entries: LeaderboardEntry[];
  ownRank?: LeaderboardEntry | null;
  ward?: string;
}

export interface DashboardStats {
  reports: {
    total: number;
    pending: number;
    resolved: number;
    resolvedRate: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
  };
  users: { total: number };
  tasks: { active: number };
}
