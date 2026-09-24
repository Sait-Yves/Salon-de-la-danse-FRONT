import { getMe } from "./services/loaders";
import { SALON } from "./services/config";
import HomeHero from "./HomeHero";

export default async function Home() {
  const user = await getMe();
  return <HomeHero loggedIn={!!user} espace={user?.role === "admin" ? "/admin" : "/dashboard"} dates={SALON.dates} lieu={SALON.lieu} />;
}
