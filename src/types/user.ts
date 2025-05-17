// Define our own types without relying on Prisma's exported types
// This avoids issues with TypeScript not finding the Prisma types

export type User = {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  photo: string | null;
  role: 'ADMIN' | 'MODERATOR' | 'FACILITATOR' | 'MEMBER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  communityId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UserProfile = {
  id: string;
  userId: string;
  bio: string | null;
  workTitle: string | null;
  location: string | null;
  interests: string | null;
  coverImage: string | null;
};

// User with profile relation
export type UserWithProfile = User & {
  profile: UserProfile | null;
  community: { name: string } | null;
};

// Friend/Connection type
export type Friend = {
  id: string;
  name: string | null;
  photo: string | null;
  role: string;
};

// Circle type
export type Circle = {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
};

// Event type
export type Event = {
  id: string;
  title: string;
  description: string | null;
  date: Date;
  location: string | null;
  isCreator: boolean;
};

// Profile data for editing
export type ProfileData = {
  bio: string | null;
  workTitle: string | null;
  location: string | null;
  interests: string[] | null;
}; 