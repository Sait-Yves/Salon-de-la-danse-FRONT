import { apiFile } from "../../services/api";

// GET /api/photo            -> photo du bénévole connecté
// GET /api/photo?user=12    -> photo d'un bénévole (admin)
export async function GET(request: Request) {
  const user = new URL(request.url).searchParams.get("user");
  if (user && !/^\d+$/.test(user)) return new Response("Requête invalide", { status: 400 });
  return apiFile(user ? `/admin/users/${user}/photo` : "/me/photo");
}
