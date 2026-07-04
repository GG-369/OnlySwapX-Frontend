export const SKILL_CATEGORIES = [
  'TECHNOLOGY',
  'SCIENCES',
  'HUMANITIES',
  'ART',
  'LANGUAGES',
  'BUSINESS',
  'OTHER',
  
] as const;

export const SKILL_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;

export const EXCHANGE_STATUSES = {
  PENDING: { label: 'Pending', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  ACCEPTED: { label: 'Accepted', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  REJECTED: { label: 'Rejected', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  ENDED: { label: 'Ended', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
} as const;

export const SESSION_STATUSES = {
  PROPOSED: { label: 'Proposed', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  SCHEDULED: { label: 'Scheduled', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  COMPLETED: { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
} as const;
