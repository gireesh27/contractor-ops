import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db/connect";
import { Organization, OrganizationMember, User } from "@/lib/db/models";

export async function getSession() {
  return auth();
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function createOwnerWorkspace(input: {
  organizationName: string;
  contractorName: string;
  phone?: string;
  email: string;
  password: string;
  businessType?: string;
  city?: string;
  state?: string;
  gstNumber?: string;
}) {
  const db = await connectToDatabase();
  if (!db) {
    throw new Error("MONGODB_URI is not configured.");
  }

  const existing = await User.findOne({ email: input.email.toLowerCase(), deletedAt: null });
  if (existing) {
    throw new Error("A user already exists with this email.");
  }

  const organization = await Organization.create({
    name: input.organizationName,
    contractorName: input.contractorName,
    phone: input.phone,
    email: input.email.toLowerCase(),
    businessType: input.businessType,
    city: input.city,
    state: input.state,
    gstNumber: input.gstNumber,
    currency: "INR",
    defaultUnits: ["ft", "m", "sq.ft", "sq.m", "cubic feet", "cubic meter", "kg", "tons", "bags", "nos"]
  });

  const user = await User.create({
    name: input.contractorName,
    email: input.email.toLowerCase(),
    phone: input.phone,
    passwordHash: await hashPassword(input.password),
    activeOrganizationId: organization._id
  });

  await OrganizationMember.create({
    organizationId: organization._id,
    userId: user._id,
    role: "Owner",
    joinedAt: new Date()
  });

  return { organizationId: String(organization._id), userId: String(user._id) };
}
