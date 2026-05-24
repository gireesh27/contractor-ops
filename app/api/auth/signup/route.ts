import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createOwnerWorkspace } from "@/lib/auth";

const signupSchema = z.object({
  organizationName: z.string().min(2),
  contractorName: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8),
  businessType: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  gstNumber: z.string().optional()
});

export async function POST(request: NextRequest) {
  const body = Object.fromEntries((await request.formData()).entries());
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  try {
    const data = await createOwnerWorkspace(parsed.data);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create workspace" }, { status: 400 });
  }
}
