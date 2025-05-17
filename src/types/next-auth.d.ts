import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { UserRole, UserStatus } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      photo?: string | null;
      role?: UserRole;
      status?: UserStatus;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    photo?: string | null;
    role?: UserRole;
    status?: UserStatus;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    photo?: string | null;
    role?: UserRole;
    status?: UserStatus;
  }
} 