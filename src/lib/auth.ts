import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { log } from "./logger"

declare module "next-auth" {
  interface User {
    role?: string
    projectId?: string | null
  }
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      projectId: string | null
    }
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Usuário", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        try {
          const email = credentials?.username as string
          const pass = credentials?.password as string

          log("auth", "login attempt", email)

          const [user] = db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1)
            .all()

          if (!user) {
            log("auth", "user not found", email)
            return null
          }

          const match = await bcrypt.compare(pass, user.passwordHash)
          log("auth", "bcrypt match", match)

          if (!match) return null

          log("auth", "authenticated", { email, role: user.role, projectId: user.projectId })

          return {
            id: user.id, name: user.name, email: user.email,
            role: user.role, projectId: user.projectId,
          }
        } catch (err) {
          console.error("[auth] authorize error:", err)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.projectId = user.projectId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = (token.role as string) || "viewer"
        session.user.projectId = (token.projectId as string) || null
      }
      return session
    },
  },
  session: { strategy: "jwt" },
})
