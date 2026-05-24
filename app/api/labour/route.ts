import { NextRequest } from "next/server";
import { GET as genericGET, POST as genericPOST } from "@/app/api/records/[collection]/route";

export function GET(request: NextRequest) {
  return genericGET(request, { params: Promise.resolve({ collection: "labour" }) });
}

export function POST(request: NextRequest) {
  return genericPOST(request, { params: Promise.resolve({ collection: "labour" }) });
}
