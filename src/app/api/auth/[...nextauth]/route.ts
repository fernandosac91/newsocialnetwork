import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcrypt';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Special case for demo: if using demo credentials, return a demo user
        if (credentials.email === 'demo@example.com' && credentials.password === 'demo123') {
          // Create a demo user if it doesn't exist
          let demoUser = await prisma.user.findUnique({
            where: { email: 'demo@example.com' },
          });

          if (!demoUser) {
            demoUser = await prisma.user.create({
              data: {
                name: 'Demo User',
                email: 'demo@example.com',
                status: 'APPROVED',
                role: 'MEMBER',
                photo: '/images/demo-avatar.png',
                profile: {
                  create: {
                    bio: 'This is a demo account for exploring the social network features.',
                    workTitle: 'Demo Explorer',
                    location: 'Internet',
                    interests: JSON.stringify(['Networking', 'Technology', 'Community']),
                  },
                },
                community: {
                  connectOrCreate: {
                    where: { name: 'Demo Community' },
                    create: {
                      name: 'Demo Community',
                      description: 'A community for demo users.',
                    },
                  },
                },
              },
            });
          }

          return {
            id: demoUser.id,
            name: demoUser.name,
            email: demoUser.email,
            photo: demoUser.photo,
            role: demoUser.role,
            status: demoUser.status,
          };
        }

        // Regular authentication flow
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const passwordMatch = await compare(credentials.password, user.hashedPassword);
        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          photo: user.photo,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.photo = user.photo;
        token.role = user.role;
        token.status = user.status;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.photo = token.photo as string | null;
        session.user.role = token.role;
        session.user.status = token.status;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 