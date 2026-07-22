import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { clearLoginFailures, isLoginBlocked, recordFailedLogin } from "@/lib/security/login-rate-limit";
import type { Role } from "@prisma/client";

const DUMMY_PASSWORD_HASH = "$2b$10$KyBdsdvZB24W8SgzetuVbOTMj6KDf8eBH3R0l.i.QHr9g5ggNjrfS";
const authSecret = process.env.NEXTAUTH_SECRET;

if (
  process.env.NODE_ENV === "production"
  && (!authSecret || authSecret.length < 32 || authSecret === "change-this-secret")
) {
  throw new Error("NEXTAUTH_SECRET en az 32 karakterlik benzersiz bir deger olmali");
}

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Sifre", type: "password" }
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials.password) return null;

        const email = credentials.email.trim().toLocaleLowerCase("tr-TR");
        const password = credentials.password;
        const requestHeaders = request.headers ?? {};
        if (email.length > 254 || Buffer.byteLength(password, "utf8") > 72) return null;
        if (isLoginBlocked(email, requestHeaders)) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        const isValid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);

        if (!user || !user.isActive || !isValid) {
          recordFailedLogin(email, requestHeaders);
          return null;
        }

        clearLoginFailures(email, requestHeaders);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: Role }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);
        session.user.role = token.role as Role;
      }
      return session;
    }
  }
};

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!session?.user || !userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, isActive: true }
  });
  if (!user?.isActive) return null;

  session.user = {
    ...session.user,
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  return session;
}
