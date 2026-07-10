import bcrypt from "bcryptjs";
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import db from "@/lib/db";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Kullanıcı Adı", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error("Kullanıcı adı ve şifre gereklidir.");
                }

                // Fetch the user from the database via the Prisma client in lib/db.ts
                const user = await db.user.findUnique({
                    where: { username: credentials.username },
                });

                if (!user || !user.password) {
                    throw new Error("Kullanıcı bulunamadı veya şifre ayarlanmamış.");
                }

                // Verify the password
                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    throw new Error("Geçersiz şifre.");
                }

                // Return user object, containing our custom role and id fields
                return {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.username = user.username;
            }
            // else if (token.id) { ... }
            // NOTE: Fetching the user from the database on every JWT evaluation (which happens on every useSession/getServerSession)
            // causes severe connection pool and DNS exhaustion (EAI_AGAIN errors) in production.
            // Trust the JWT payload. If you need to invalidate sessions, use session rotation or check in specific server actions.

            if (trigger === "update" && session) {
                if (session.username) token.username = session.username;
            }

            return token;
        },
        async session({ session, token }) {
            if (token.error === "UserDeleted") {
                // Clear session if user was deleted and pass error
                session.user = undefined as any;
                (session as any).error = "UserDeleted";
                return session;
            }

            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.username = token.username as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
