import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Barrière rapide : sans cookie de session, on renvoie vers la connexion.
// La vérification réelle du token (et du rôle admin) est faite dans les layouts.
export function proxy(request: NextRequest) {
  if (!request.cookies.get("auth_token")?.value) {
    // On garde la page demandée (ex. scan d'un QR code de badge) pour y revenir après la connexion.
    const url = new URL("/login", request.url);
    url.searchParams.set("mode", "password");
    url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/planning/:path*", "/profile/:path*", "/admin/:path*"],
};
