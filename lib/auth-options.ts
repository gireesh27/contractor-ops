// @ts-nocheck
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db/connect";
import { Organization, OrganizationMember, User } from "@/lib/db/models";
import { env } from "@/lib/env";

async function ensureGoogleUser(email: string, name?: string, image?: string) {
  await connectToDatabase();
  let user = await User.findOne({ email: email.toLowerCase(), deletedAt: null });

  if (!user) {
    const organization = await Organization.create({
      name: `${name || email.split("@")[0]}'s Organization`,
      contractorName: name || email,
      email,
      currency: "INR",
      defaultUnits: ["ft", "m", "sq.ft", "sq.m", "cubic meter", "kg", "bags", "nos"]
    });

    user = await User.create({
      name: name || email,
      email: email.toLowerCase(),
      image,
      activeOrganizationId: organization._id,
      lastLoginAt: new Date()
    });

    await OrganizationMember.create({
      organizationId: organization._id,
      userId: user._id,
      role: "Owner",
      joinedAt: new Date()
    });
  }

  const membership = await OrganizationMember.findOne({
    userId: user._id,
    organizationId: user.activeOrganizationId,
    deletedAt: null
  });

  return { user, membership };
}

export const authConfig = {
  secret: env.nextAuthSecret,
  trustHost: true,
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    GoogleProvider({
      clientId: env.googleClientId || "missing-google-client-id",
      clientSecret: env.googleClientSecret || "missing-google-client-secret"
    }),
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        await connectToDatabase();
        const user = await User.findOne({ email: String(credentials.email).toLowerCase(), deletedAt: null });
        if (!user?.passwordHash) return null;
        const isValid = await bcrypt.compare(String(credentials.password), user.passwordHash);
        if (!isValid) return null;
        const membership = await OrganizationMember.findOne({
          userId: user._id,
          organizationId: user.activeOrganizationId,
          deletedAt: null
        });
        if (!membership) return null;
        user.lastLoginAt = new Date();
        await user.save();
        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          image: user.image,
          organizationId: String(user.activeOrganizationId),
          role: membership.role
        };
      }
    })
  ],
 callbacks: {
  async jwt({ token, user, account, profile }) {
    // Google login
    if (account?.provider === "google") {
      const email = token.email || profile?.email || user?.email;

      if (!email) {
        return token;
      }

      const { user: dbUser, membership } = await ensureGoogleUser(
        String(email),
        token.name || profile?.name || user?.name,
        token.picture || user?.image || undefined
      );

      token.userId = String(dbUser._id);
      token.organizationId = String(dbUser.activeOrganizationId);
      token.role = membership?.role || "Owner";

      return token;
    }

    // Credentials login only
    if (account?.provider === "credentials" && user) {
      token.userId = user.id;
      token.organizationId = user.organizationId;
      token.role = user.role;

      return token;
    }

    return token;
  },

  async session({ session, token }) {
    if (session.user) {
      session.user.id = String(token.userId || "");
      session.user.organizationId = String(token.organizationId || "");
      session.user.role = String(token.role || "Viewer");
    }

    return session;
  }
}
} satisfies NextAuthConfig;
