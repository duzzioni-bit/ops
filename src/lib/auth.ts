import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials", 
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("🔑 Tentativa de login:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Credenciais não fornecidas");
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user) {
            console.log("❌ Usuário não encontrado:", credentials.email);
            return null;
          }

          console.log("✅ Usuário encontrado:", user.name);

          // Para desenvolvimento, aceitar qualquer senha
          const userResult = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
          
          console.log("✅ Login autorizado para:", userResult);
          return userResult;
        } catch (error) {
          console.error("💥 Erro na autenticação:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("🎫 JWT Callback - user:", user ? user.email : 'none', "token:", token.email);
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("👤 Session Callback - token:", token.email);
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      console.log("👤 Session final:", session.user);
      return session;
    },
  },
  debug: true,
};
