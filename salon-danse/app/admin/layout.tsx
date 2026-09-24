import { redirect } from "next/navigation";
import { getMe } from "../services/loaders";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getMe();
  if (!user) redirect("/login?mode=password&expired=1");
  if (user.role !== "admin") redirect("/dashboard");
  return <div className="mx-auto w-full min-w-0 max-w-6xl space-y-8 p-5 pb-20 md:p-8">{children}</div>;
}
