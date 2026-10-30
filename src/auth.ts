import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createRateLimiter } from "@/lib/rate-limit";
import { normalizeEmail } from "@/lib/validation";

// 8 failed attempts per email per 15 minutes. Per-instance on serverless, so a speed bump only.
const failedLogins = createRateLimiter(8, 15 * 60 * 1000);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = z
          .object({ email: z.string().email(), password: z.string().min(1) })
          .safeParse(credentials);
        if (!parsed.success) return null;

        const email = normalizeEmail(parsed.data.email);
        if (failedLogins.isBlocked(email)) return null;

        // Case-insensitive so accounts created before emails were normalised can still sign in.
        const user = await prisma.user.findFirst({
          where: { email: { equals: email, mode: "insensitive" } },
        });
        if (!user || !user.password) {
          failedLogins.hit(email);
          return null;
        }

        const valid = await bcrypt.compare(parsed.data.password, user.password);
        if (!valid) {
          failedLogins.hit(email);
          return null;
        }
        failedLogins.reset(email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
