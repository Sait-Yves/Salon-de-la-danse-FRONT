import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Barrière rapide : sans cookie de session, on renvoie vers la connexion.
// La vérification réelle du token (et du rôle admin) est faite dans les layouts.
export function proxy(request: NextRequest) {
  if (!request.cookies.get("auth_token")?.value) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/planning/:path*", "/profile/:path*", "/admin/:path*"],
};
