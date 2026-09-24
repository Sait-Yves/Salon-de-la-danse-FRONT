import { redirect } from "next/navigation";
import { getMe } from "../services/loaders";
import LoginForms from "./LoginForms";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ mode?: string; expired?: string }> }) {
  const user = await getMe();
  if (user) redirect(user.role === "admin" ? "/admin" : "/dashboard");
  const { mode, expired } = await searchParams;
  return (
    <div className="surface-grain flex min-h-[calc(100vh-5rem)] items-center justify-center p-4">
      <div className="animate-fade-up w-full max-w-md rounded-3xl border border-[#7A291E]/10 bg-white p-8 shadow-[0_10px_40px_-12px_rgba(62,21,15,0.25)]">
        <div className="mb-6 text-center">
          <h1 className="font-['Montserrat'] text-2xl font-extrabold text-[#333333]">Espace bénévole</h1>
          <p className="mt-1 text-sm">Salon de la Danse · 9–11 octobre 2026</p>
        </div>
        <LoginForms initialMode={mode === "password" ? "password" : "code"} expired={expired === "1"} />
      </div>
    </div>
  );
}
