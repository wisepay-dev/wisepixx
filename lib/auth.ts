import NextAuth, { type NextAuthConfig } from "next-auth";
import Discord from "next-auth/providers/discord";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/sanitize";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

async function makeUniqueUsername(seed: string | null | undefined) {
  const base = slugify(seed || "wisepix-user").replace(/-/g, "_").slice(0, 18) || "wisepix_user";
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}_${crypto.randomUUID().slice(0, 5)}`;
    const exists = await prisma.user.findUnique({ where: { username: candidate }, select: { id: true } });
    if (!exists) return candidate;
  }
  return `user_${crypto.randomUUID().slice(0, 12)}`;
}

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login"
  },
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: "https://discord.com/api/oauth2/authorize?scope=identify+email"
    }),
    Credentials({
      name: "Email e senha",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        if (!user?.passwordHash) return null;

        const valid = await compare(parsed.data.password, user.passwordHash);
        if (!valid || user.bannedAt) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      if (!token.sub) return token;

      const dbUser = await prisma.user.findUnique({
        where: { id: token.sub },
        select: { id: true, username: true, roles: true, sellerLevel: true, kycStatus: true }
      });

      if (dbUser) {
        token.username = dbUser.username;
        token.roles = dbUser.roles;
        token.sellerLevel = dbUser.sellerLevel;
        token.kycStatus = dbUser.kycStatus;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.username = token.username as string | null;
        session.user.roles = token.roles as string[];
        session.user.sellerLevel = token.sellerLevel as string;
        session.user.kycStatus = token.kycStatus as string;
      }
      return session;
    }
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      const username = await makeUniqueUsername(user.name ?? user.email);
      await prisma.user.update({
        where: { id: user.id },
        data: { username }
      });
      await prisma.profile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          user: { connect: { id: user.id } },
          avatarUrl: user.image,
          displayName: user.name
        }
      });
    }
  }
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
