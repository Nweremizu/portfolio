import type { Metadata } from "next";
import { login } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="w-full max-w-sm mx-auto pt-24 flex flex-col items-center">
      <h1 className="text-2xl font-medium text-foreground">Admin</h1>
      <form action={login} className="w-full flex flex-col gap-3 pt-6">
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="w-full rounded-lg bg-card px-4 py-2.5 text-foreground outline-none focus-visible:outline-2 focus-visible:outline-primary"
        />
        {params.error && (
          <p className="text-sm text-red-500">Wrong password.</p>
        )}
        <button
          type="submit"
          className="w-full rounded-lg bg-primary text-white py-2.5 font-medium transition-opacity hover:opacity-90"
        >
          Log in
        </button>
      </form>
    </div>
  );
}
