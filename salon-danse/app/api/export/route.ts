import { apiFile } from "../../services/api";

// Export CSV des bénévoles (admin). Les filtres de la liste sont repris.
export async function GET(request: Request) {
  const src = new URL(request.url).searchParams;
  const out = new URLSearchParams();
  for (const k of ["q", "statut_planning", "isMineur", "role"]) {
    const v = src.get(k);
    if (v) out.set(k, v);
  }
  const qs = out.toString();
  return apiFile(`/admin/export${qs ? `?${qs}` : ""}`);
}
