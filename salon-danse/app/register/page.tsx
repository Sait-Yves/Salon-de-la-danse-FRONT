import { redirect } from "next/navigation";
import { getMe } from "../services/loaders";
import RegisterForm from "./RegisterForm";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ email?: string; code?: string }> }) {
  const user = await getMe();
  if (user) redirect(user.role === "admin" ? "/admin" : "/dashboard");
  const { email, code } = await searchParams;
  // On n'arrive ici qu'avec un e-mail et un code d'invitation.
  if (!email || !code) redirect("/login?mode=code");
  return (
    <div className="surface-grain flex min-h-[calc(100vh-5rem)] items-center justify-center p-4 py-10">
      <div className="animate-fade-up w-full max-w-lg rounded-3xl border border-[#7A291E]/10 bg-white p-8 shadow-[0_10px_40px_-12px_rgba(62,21,15,0.25)]">
        <div className="mb-6 text-center">
          <h1 className="font-['Montserrat'] text-2xl font-extrabold text-[#333333]">Créer mon compte</h1>
          <p className="mt-1 text-sm">Quelques informations pour finaliser votre inscription.</p>
        </div>
        <RegisterForm email={email} code={code} />
      </div>
    </div>
  );
}
