import { redirect } from "next/navigation";
import { getMe } from "../services/loaders";

export default async function BenevoleLayout({ children }: { children: React.ReactNode }) {
  const user = await getMe();
  if (!user) redirect("/login?mode=password&expired=1");
  if (user.role === "admin") redirect("/admin");
  return <>{children}</>;
}
