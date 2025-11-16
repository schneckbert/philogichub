import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import * as bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            userRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        // Check user status
        if (user.status !== 'active') {
          if (user.status === 'inactive') {
            throw new Error('Account is inactive. Please contact support.');
          }
          if (user.status === 'suspended') {
            throw new Error('Account is suspended. Please contact support.');
          }
          throw new Error('Account is not available.');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      // Load user roles and permissions
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: {
            userRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (dbUser) {
          // Check status on every token refresh
          if (dbUser.status !== 'active') {
            throw new Error('Account is no longer active');
          }

          token.roles = dbUser.userRoles.map((ur) => ur.role.name);
          
          // Collect all permissions from all roles
          const permissionsSet = new Set<string>();
          dbUser.userRoles.forEach((ur) => {
            ur.role.rolePermissions.forEach((rp) => {
              permissionsSet.add(rp.permission.key);
            });
          });
          
          token.permissions = Array.from(permissionsSet);
          
          // Check if user is superadmin
          token.isSuperadmin = token.roles.includes('superadmin');
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.roles = token.roles as string[];
        session.user.permissions = token.permissions as string[];
        session.user.isSuperadmin = token.isSuperadmin as boolean;
      }

      return session;
    },
  },
};
