import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcrypt';
import prisma from '@/lib/db/prisma';
import { calculateTrialEndDate } from '@/lib/billing/stripe';

// Define the enums to match Prisma schema
enum UserRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  FACILITATOR = 'FACILITATOR',
  MEMBER = 'MEMBER'
}

enum UserStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

// Extend the default session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      photo?: string | null;
      role?: UserRole;
      status?: UserStatus;
      communityId?: string | null;
      stripeCustomerId?: string | null;
      stripeSubscriptionStatus?: string | null;
      trialEndsAt?: Date | null;
    }
  }
  
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    photo?: string | null;
    role?: UserRole;
    status?: UserStatus;
    communityId?: string | null;
    stripeCustomerId?: string | null;
    stripeSubscriptionStatus?: string | null;
    trialEndsAt?: Date | null;
  }
}

// Extend JWT type
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    status?: UserStatus;
    communityId?: string | null;
    stripeCustomerId?: string | null;
    stripeSubscriptionStatus?: string | null;
    trialEndsAt?: Date | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          photo: user.photo,
          role: user.role,
          status: user.status,
          communityId: user.communityId,
          stripeCustomerId: user.stripeCustomerId,
          stripeSubscriptionStatus: user.stripeSubscriptionStatus,
          trialEndsAt: user.trialEndsAt,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 15 * 60, // 15 minutes
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Initial sign in
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.communityId = user.communityId;
        token.stripeCustomerId = user.stripeCustomerId;
        token.stripeSubscriptionStatus = user.stripeSubscriptionStatus;
        token.trialEndsAt = user.trialEndsAt;
      } else {
        // On subsequent requests, fetch updated user data
        try {
          const userData = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              role: true,
              status: true,
              communityId: true,
              stripeCustomerId: true,
              stripeSubscriptionStatus: true,
              trialEndsAt: true,
            },
          });
          
          if (userData) {
            // Update token with fresh data
            token.role = userData.role;
            token.status = userData.status;
            token.communityId = userData.communityId;
            token.stripeCustomerId = userData.stripeCustomerId;
            token.stripeSubscriptionStatus = userData.stripeSubscriptionStatus;
            token.trialEndsAt = userData.trialEndsAt;
          }
        } catch (error) {
          console.error('Error refreshing user data in JWT callback', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.status = token.status;
        session.user.communityId = token.communityId;
        session.user.stripeCustomerId = token.stripeCustomerId;
        session.user.stripeSubscriptionStatus = token.stripeSubscriptionStatus;
        session.user.trialEndsAt = token.trialEndsAt;
      }
      return session;
    },
    async signIn({ user }) {
      try {
        // If this is a new user (no trialEndsAt set), initialize trial period
        if (user.id && !user.trialEndsAt) {
          const trialEndDate = calculateTrialEndDate();
          
          await prisma.user.update({
            where: { id: user.id },
            data: {
              trialEndsAt: trialEndDate
            }
          });
          
          console.log(`Trial period initialized for new user ${user.id}, ends on ${trialEndDate.toISOString()}`);
        }
        
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return true; // Still allow sign in even if trial setup fails
      }
    }
  },
}; 