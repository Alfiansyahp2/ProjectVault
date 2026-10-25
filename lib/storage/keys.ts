import { UserProfile } from '@/lib/types';

export const STORAGE_KEYS = {
  PROJECTS: 'tracker_projects_data',
  APPLICATIONS: 'tracker_applications_data',
  PROFILE: 'tracker_user_profile',
} as const;

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Kandidat Profesional',
  headline: 'Fullstack & Software Engineer',
  bio: 'Spesialis dalam pengembangan aplikasi web modern (Next.js/React), backend Python, dan solusi otomasi data.',
};
