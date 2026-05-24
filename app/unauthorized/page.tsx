import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-8 text-center backdrop-blur-xl">
        <h1 className="text-3xl font-black">Unauthorized</h1>
        <p className="mt-3 text-white/65">You do not have access to this organization or route.</p>
        <Link className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-safety-yellow px-4 text-sm font-black text-slate-950" href="/login">
          Back to login
        </Link>
      </div>
    </main>
  );
}
